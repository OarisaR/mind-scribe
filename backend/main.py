from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
import os
import json
import re

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

# ── Firebase Admin init ──
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
cred = credentials.Certificate(os.path.join(BASE_DIR, "service-account.json"))
firebase_admin.initialize_app(cred)

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def verify_token(request: Request) -> str:
    id_token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not id_token:
        raise HTTPException(status_code=401, detail="Missing auth token.")
    try:
        decoded = firebase_auth.verify_id_token(id_token)
        return decoded["uid"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

class TextInput(BaseModel):
    text: str

class NodeInput(BaseModel):
    node: str
    context: str

class RelationInput(BaseModel):
    node_a: str
    node_b: str
    context: str

class QuizInput(BaseModel):
    node: str
    context: str

def clean_json_response(raw: str) -> str:
    """Aggressively strip markdown and extra text from AI response."""
    # Remove markdown code blocks
    raw = re.sub(r'```[a-zA-Z]*\n?', '', raw)
    raw = raw.replace('```', '')
    # Find first { and last }
    start = raw.find('{')
    end = raw.rfind('}')
    if start == -1 or end == -1 or end <= start:
        raise ValueError("No JSON object found in response")
    return raw[start:end+1]

def validate_mindmap(data: dict) -> dict:
    """Ensure required fields exist and structure is valid."""
    if "title" not in data or "nodes" not in data:
        raise ValueError("Missing required fields: title or nodes")
    if not isinstance(data["nodes"], list):
        raise ValueError("nodes must be a list")
    for i, node in enumerate(data["nodes"]):
        if "id" not in node or "label" not in node:
            raise ValueError(f"Node {i} missing id or label")
        # Ensure children is a list
        if "children" not in node:
            node["children"] = []
        # Strip type/importance if they cause issues — your frontend doesn't use them yet
        node.pop("type", None)
        node.pop("importance", None)
        for child in node.get("children", []):
            child.pop("type", None)
            child.pop("importance", None)
    return data

@app.get("/")
def root():
    return {"status": "MindScribe API is running"}

@app.post("/generate-mindmap")
@limiter.limit("10/hour")
async def generate_mindmap(request: Request, body: TextInput):
    verify_token(request)

    if len(body.text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Text too short. Paste at least a paragraph.")
    if len(body.text) > 5000:
        raise HTTPException(status_code=400, detail="Text too long. Max 5000 characters.")

    # Simpler prompt — less chance of AI hallucinating invalid JSON
    prompt = f"""You are an expert knowledge architect.
Given the following text, extract a structured concept map.
Return ONLY a valid JSON object with this exact structure, no markdown, no explanation:

{{
  "title": "main topic in 2-4 words",
  "nodes": [
    {{
      "id": "1",
      "label": "concept name in 2-4 words",
      "children": [
        {{"id": "1-1", "label": "sub-concept in 2-4 words"}},
        {{"id": "1-2", "label": "sub-concept in 2-4 words"}}
      ]
    }}
  ]
}}

Rules:
- Maximum 5 top-level nodes
- Maximum 3 children per node
- Labels must be short (2-5 words max)
- ids must be strings like "1", "2", "1-1", "1-2"
- Return ONLY the JSON, nothing else before or after

Text:
{body.text}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000,
            temperature=0.3,
        )
        raw = response.choices[0].message.content.strip()
        cleaned = clean_json_response(raw)
        mindmap = json.loads(cleaned)
        validated = validate_mindmap(mindmap)
        return validated
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"AI returned invalid JSON. Try again. ({str(e)})")
    except ValueError as e:
        raise HTTPException(status_code=500, detail=f"Invalid mindmap structure. Try again. ({str(e)})")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate mindmap. Try again. ({str(e)})")

@app.post("/explain-node")
@limiter.limit("30/hour")
async def explain_node(request: Request, body: NodeInput):
    verify_token(request)

    prompt = f"""You are a helpful tutor. Explain the concept "{body.node}" in simple, clear terms based on this context:

{body.context[:1500]}

Keep your explanation to 4-5 sentences maximum. Be simple and direct. No bullet points."""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=200,
        temperature=0.5,
    )
    return {"explanation": response.choices[0].message.content.strip()}

@app.post("/relate-nodes")
@limiter.limit("20/hour")
async def relate_nodes(request: Request, body: RelationInput):
    verify_token(request)

    prompt = f"""You are a helpful tutor. Explain the relationship between "{body.node_a}" and "{body.node_b}" based on this context:

{body.context[:1500]}

In 2-3 sentences, explain how these two concepts connect, interact, or depend on each other. Be specific and direct. No bullet points."""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=200,
        temperature=0.5,
    )
    return {"relationship": response.choices[0].message.content.strip()}

@app.post("/quiz-node")
@limiter.limit("20/hour")
async def quiz_node(request: Request, body: QuizInput):
    verify_token(request)

    prompt = f"""You are a quiz generator. Based on this context, generate one multiple choice question to test understanding of "{body.node}".

Context:
{body.context[:1500]}

Return ONLY valid JSON, no markdown:
{{
  "question": "the question text",
  "options": ["A) option one", "B) option two", "C) option three", "D) option four"],
  "correct": "A) option one",
  "explanation": "one sentence explaining why this is correct"
}}

Rules:
- Question must be answerable from the context
- Make wrong answers plausible, not obviously wrong
- Return ONLY the JSON"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0.5,
        )
        raw = response.choices[0].message.content.strip()
        cleaned = clean_json_response(raw)
        quiz = json.loads(cleaned)
        # Validate required fields
        if "question" not in quiz or "options" not in quiz or "correct" not in quiz:
            raise ValueError("Missing required quiz fields")
        return quiz
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to generate quiz. Try again.")