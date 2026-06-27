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
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
cred = credentials.Certificate(os.path.join(BASE_DIR, "service-account.json"))
load_dotenv()


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)


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

# ── Auth: verify Firebase ID token sent from frontend ──
def verify_token(request: Request) -> str:
    """Returns the uid if the token is valid, raises 401 otherwise."""
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

@app.get("/")
def root():
    return {"status": "MindScribe API is running"}

@app.post("/generate-mindmap")
@limiter.limit("10/hour")
async def generate_mindmap(request: Request, body: TextInput):
    verify_token(request)   # replaces verify_secret()

    if len(body.text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Text too short. Paste at least a paragraph.")
    if len(body.text) > 3000:
        raise HTTPException(status_code=400, detail="Text too long. Max 3000 characters.")

    prompt = f"""You are an expert at extracting and structuring knowledge.
Given the following text, extract the key concepts and their relationships.
Return ONLY a valid JSON object with this exact structure, no markdown, no explanation:
{{
  "title": "main topic in 2-4 words",
  "nodes": [
    {{
      "id": "1",
      "label": "concept name in 2-4 words",
      "children": [
        {{ "id": "1-1", "label": "sub-concept in 2-4 words" }},
        {{ "id": "1-2", "label": "sub-concept in 2-4 words" }}
      ]
    }}
  ]
}}
Rules:
- Maximum 5 top-level nodes
- Maximum 3 children per node
- Labels must be short (2-5 words max)
- Return ONLY the JSON, nothing else

Text:
{body.text}"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1000,
        temperature=0.3,
    )

    raw = response.choices[0].message.content.strip()
    try:
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        mindmap = json.loads(raw.strip())
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to parse mindmap. Try again.")

    return mindmap


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