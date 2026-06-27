---
name: MindScribe Agent Guide
desc: Working instructions for AI agents and contributors building the MindScribe React, FastAPI, Firebase, Firestore, and Groq application.
---

# MindScribe Agent Guide

MindScribe is an AI-powered web application that turns dense text into an interactive visual mindmap. Users paste lecture notes, articles, documentation, or textbook excerpts, then receive an explorable concept map. Clicking a node opens an AI-generated explanation of that concept.

## Product Goal

Build a fast, polished study and research tool that transforms unstructured text into a saved, interactive knowledge map in under 30 seconds.

The core workflow is:

1. User signs in.
2. User pastes dense source text.
3. The frontend sends the text to the FastAPI backend.
4. The backend calls Groq to generate structured mindmap data.
5. The frontend renders the mindmap with React Flow.
6. User clicks nodes for deeper explanations.
7. Mindmaps and cached explanations are saved in Firestore.

## Current Project Shape

The repo currently has:

```txt
backend/
  venv/
    main.py

frontend/
  src/
  public/
  package.json
```

The frontend is a React/Vite app. The backend currently has a FastAPI app inside `backend/venv/main.py`. As the project grows, move application code out of the virtual environment folder and into a clearer backend app structure.

Recommended target structure:

```txt
backend/
  app/
    api/
    core/
    prompts/
    schemas/
    services/
  requirements.txt

frontend/
  src/
    components/
    features/
    services/
    types/
```

## Tech Stack

Frontend:

- React.js
- Vite
- TypeScript
- React Flow through `@xyflow/react`
- Axios for API calls
- Firebase client SDK for authentication

Backend:

- FastAPI
- Python
- Groq API for AI generation
- Firebase Admin SDK for server-side auth verification and Firestore access

Data and Auth:

- Firebase Authentication
- Cloud Firestore

## Agent Rules

- Read the existing files before changing behavior.
- Keep changes scoped to the current request.
- Preserve the main product promise: text to interactive mindmap quickly.
- Do not turn MindScribe into a generic chatbot.
- Keep AI output structured and validated.
- Never let arbitrary AI text directly control the UI.
- Never expose Groq, Firebase Admin, or other server secrets in frontend code.
- Use environment variables for secrets.
- Prefer clear service boundaries over large mixed files.
- Keep UI work consistent with the existing React/Vite app.
- Avoid storing application code inside `backend/venv` long term.

## AI Output Contract

Mindmap generation should return structured JSON, not prose.

Preferred target shape:

```json
{
  "title": "string",
  "summary": "string",
  "nodes": [
    {
      "id": "string",
      "label": "string",
      "type": "root | concept | detail | example | process | term",
      "summary": "string",
      "sourceQuote": "string optional"
    }
  ],
  "edges": [
    {
      "id": "string",
      "source": "string",
      "target": "string",
      "relationship": "string"
    }
  ]
}
```

The current frontend uses a nested node shape:

```ts
type MindMapData = {
  title: string
  nodes: {
    id: string
    label: string
    children?: Node[]
  }[]
}
```

If moving to graph edges, update the frontend and backend together.

## Backend Responsibilities

FastAPI should handle:

- Receiving source text
- Verifying Firebase ID tokens
- Calling Groq
- Validating generated mindmap JSON
- Saving mindmaps to Firestore
- Generating node explanations
- Caching node explanations
- Returning clean API responses

Suggested routes:

```txt
POST /api/mindmaps
GET /api/mindmaps
GET /api/mindmaps/{mindmap_id}
DELETE /api/mindmaps/{mindmap_id}
POST /api/mindmaps/{mindmap_id}/nodes/{node_id}/explain
```

## Frontend Responsibilities

React should handle:

- Authentication UI
- Text input and validation
- Loading and error states
- Mindmap rendering
- Node selection
- Explanation panel
- Saved mindmap library
- Export/download features when added

## Firestore Model

Suggested collections:

```txt
users/{userId}
mindmaps/{mindmapId}
mindmaps/{mindmapId}/explanations/{nodeId}
```

Mindmap documents should include:

```json
{
  "userId": "string",
  "title": "string",
  "sourceText": "string",
  "summary": "string",
  "nodes": [],
  "edges": [],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## Quality Bar

The MVP is successful when a user can paste dense text, generate a readable mindmap, click nodes for useful explanations, and return to saved maps later.

Test high-risk areas first:

- AI response parsing
- API input validation
- Auth-protected backend routes
- Firestore ownership checks
- Mindmap rendering with valid and invalid AI output
