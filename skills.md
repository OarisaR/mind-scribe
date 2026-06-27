---
name: MindScribe Skills
desc: Specialized project skills for building MindScribe's AI mindmap generation, React interface, FastAPI backend, Firebase auth, Firestore persistence, and Groq integration.
---

# MindScribe Skills

This document describes the main skills needed to build MindScribe well.

## Product Reasoning

MindScribe solves a specific problem: dense text is hard to process and remember.

The product should focus on:

- Turning long text into a structured visual map
- Making concepts easier to explore
- Saving outputs so they are not disposable
- Helping students and researchers understand material faster

Avoid drifting into:

- A generic AI chatbot
- A full document manager
- A manual diagramming tool
- A general note-taking platform

## Mindmap Generation

The AI should convert raw text into structured mindmap data.

A good generated mindmap includes:

- One central topic
- Several major branches
- Clear concept labels
- Meaningful relationships
- Short summaries per node
- A readable number of nodes

Default target:

- 15-35 nodes for the full graph format
- 3-7 major branches
- Concise labels
- No duplicate concepts

For the current nested frontend format, keep maps smaller until the graph format is introduced:

- Maximum 5 top-level nodes
- Maximum 3 children per top-level node
- Short labels that fit inside visual nodes

## Groq Prompting

Groq should be called from the backend only.

Prompts should ask for strict JSON and should include:

- The desired schema
- Node count limits
- Label length limits
- A requirement to avoid markdown
- A requirement to return JSON only
- Instructions to ground output in the source text

Node explanation prompts should include:

- Selected node label
- Selected node summary
- Parent concept if available
- Mindmap title
- Source text or relevant excerpt

Explanations should be:

- Clear
- Student-friendly
- Grounded in the source text
- Concise by default
- Easy to expand later

## FastAPI Backend

Backend skills needed:

- Route design
- Pydantic request and response models
- Firebase ID token verification
- Firestore reads and writes
- Groq API calls
- AI output validation
- Rate limiting
- Error handling

The backend is the trusted layer between the frontend, Groq, and Firestore.

Do not put API keys in React. Do not trust client-provided user IDs. Always derive identity from the verified Firebase token.

## Firebase Auth

Firebase Authentication should handle user identity.

The frontend should:

- Let users sign in
- Track auth state
- Send Firebase ID tokens to the backend

The backend should:

- Verify Firebase ID tokens
- Reject unauthenticated requests
- Use the verified user ID for Firestore access
- Prevent users from reading or deleting another user's mindmaps

The current app appears to use a password/token gate. Treat that as a temporary prototype gate, not the final authentication system.

## Firestore

Firestore should store user mindmaps and generated explanations.

Important patterns:

- Store each mindmap with a `userId`
- Include `createdAt` and `updatedAt`
- Cache generated node explanations to avoid repeated AI calls
- Keep documents reasonably sized
- Consider subcollections if maps become editable or collaborative

For the MVP, storing nodes and edges inside the mindmap document is acceptable.

## React Frontend

Frontend skills needed:

- Component architecture
- React state management
- Firebase auth integration
- API client services
- React Flow rendering
- Loading, error, and empty states
- Responsive UI

Suggested core components:

```txt
InputPage
MindMapPage
PasswordGate
MindmapCanvas
NodeExplanationPanel
MindmapLibrary
AuthGate
```

Use the existing components as the starting point, then rename or split only when the feature needs it.

## React Flow Rendering

React Flow should render generated nodes and relationships.

Important behavior:

- Root node is visually distinct
- Branches are easy to scan
- Clicking a node selects it
- Selected node opens an explanation panel
- Canvas supports zooming and panning
- Layout avoids overlapping nodes

Initial layout can be automatic. Manual node editing can come later.

## Data Validation

AI output must be validated before use.

Validation should check:

- Required top-level fields exist
- Node IDs are unique
- Labels are not empty
- Edge references point to existing nodes
- There is exactly one root node in the graph format
- Node count is within allowed limits

Invalid AI responses should trigger a clean error or a controlled retry.

## MVP Quality Bar

The MVP is successful if:

- A user can paste dense text
- A useful mindmap appears quickly
- The mindmap is visually readable
- Clicking nodes gives helpful explanations
- The generated map is saved
- The user can return to it later

The first version does not need:

- PDF upload
- Collaboration
- Manual diagram editing
- Flashcards
- Advanced export
- Multiple AI providers
