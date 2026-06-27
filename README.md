# MindScribe

MindScribe is an AI-powered study and research tool that turns dense walls of text into interactive visual mindmaps. Students and researchers can paste lecture notes, article excerpts, research material, or documentation, generate a structured concept map, and click any node to receive a short AI-powered explanation.

The project is currently a working prototype with a React/Vite frontend and a FastAPI backend. The frontend renders generated maps with React Flow and exports maps as PNG images. The backend receives text, asks an AI model to return structured JSON, validates basic input limits, and serves node explanations.

## Problem Statement

Students and researchers often face long, dense blocks of information that are hard to process, organize, and retain. Existing tools usually fall into two categories:

- Manual mindmap tools, which require users to build diagrams by hand.
- Disposable AI chats, where users paste text, receive an answer, and lose the result as a durable learning artifact.

MindScribe bridges that gap by converting unstructured text into a visual, explorable knowledge map.

## Solution Overview

MindScribe lets users:

1. Unlock the prototype with a password gate.
2. Paste dense text into the input page.
3. Generate a structured AI mindmap.
4. Explore the mindmap visually.
5. Click any concept node for a short explanation.
6. Export the map as a PNG.

The intended long-term direction is to add Firebase Authentication, Firestore persistence, and Groq-backed AI generation.

## Current Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Flow through `@xyflow/react`
- Axios for backend requests
- `html-to-image` for PNG export
- Oxlint for linting

### Backend

- FastAPI
- Pydantic
- SlowAPI for rate limiting
- Python dotenv for environment variables
- OpenAI-compatible client usage in the current prototype

### Planned Stack Direction

- Firebase Authentication
- Cloud Firestore
- Groq as the AI provider
- Server-side auth verification with Firebase Admin SDK

## Project Structure

```txt
MindScribe/
  README.md
  agent.md
  skills.md

  backend/
    venv/
      .env
      .gitignore
      main.py
      pyvenv.cfg
      Include/
      Lib/
      Scripts/
      __pycache__/

  frontend/
    .gitignore
    .oxlintrc.json
    index.html
    package.json
    package-lock.json
    README.md
    tailwind.config.js
    tsconfig.json
    tsconfig.app.json
    tsconfig.node.json
    vite.config.ts

    public/
      favicon.svg
      icons.svg

    src/
      App.tsx
      App.css
      index.css
      main.tsx

      assets/
        hero.png
        react.svg
        vite.svg

      components/
        InputPage.tsx
        MindMapPage.tsx
        NodePanel.tsx
        PasswordGate.tsx

    dist/
      Generated production build output

    node_modules/
      Installed frontend dependencies
```

## Important Structure Note

The backend application currently lives inside `backend/venv/main.py`. That works for a prototype, but it is not the ideal long-term structure because virtual environment folders are usually treated as disposable dependency folders.

Recommended future backend shape:

```txt
backend/
  app/
    main.py
    api/
    core/
    prompts/
    schemas/
    services/
  requirements.txt
  .env.example
```

## Application Flow

The main frontend flow is controlled by `frontend/src/App.tsx`.

```txt
PasswordGate
  -> InputPage
    -> MindMapPage
      -> NodePanel
```

### `PasswordGate.tsx`

Shows the protected access screen. The current prototype password is checked client-side:

```txt
mindscribe2026
```

This is suitable for a hackathon prototype, not production. In the planned version, this should be replaced with Firebase Authentication.

### `InputPage.tsx`

The main text-entry experience. It allows users to paste source material and submit it to the backend.

Current behavior:

- Requires at least 50 characters.
- Allows up to 3000 characters.
- Sends text to `POST /generate-mindmap`.
- Uses `X-App-Token` as a simple prototype auth header.
- Displays loading and error states.

### `MindMapPage.tsx`

Renders the generated map using React Flow.

Current behavior:

- Converts nested mindmap JSON into React Flow nodes and edges.
- Places the root node in the center.
- Places top-level concepts in a circle around the root.
- Places child concepts further outward.
- Lets users drag/pan/zoom through React Flow.
- Lets users export the `.react-flow` canvas as `mindscribe-map.png`.
- Opens the explanation panel when a node is clicked.

### `NodePanel.tsx`

The right-side concept explanation panel.

Current behavior:

- Shows the selected concept name.
- Requests an explanation from `POST /explain-node`.
- Shows a compact loading indicator.
- Displays the AI explanation.
- Can be closed by the user.

## Frontend Data Model

The current generated mindmap shape is nested:

```ts
export interface MindMapData {
  title: string
  nodes: Node[]
}

export interface Node {
  id: string
  label: string
  children?: Node[]
}
```

Expected backend response example:

```json
{
  "title": "Photosynthesis",
  "nodes": [
    {
      "id": "1",
      "label": "Light Reactions",
      "children": [
        {
          "id": "1-1",
          "label": "Chlorophyll"
        }
      ]
    }
  ]
}
```

## Backend API

The FastAPI backend is currently in:

```txt
backend/venv/main.py
```

### `GET /`

Health/status route.

Response:

```json
{
  "status": "MindScribe API is running"
}
```

### `POST /generate-mindmap`

Generates a mindmap from pasted text.

Headers:

```txt
X-App-Token: mindscribe2026
```

Body:

```json
{
  "text": "Long source text..."
}
```

Validation:

- Rejects text shorter than 50 characters.
- Rejects text longer than 3000 characters.
- Rate limited to 10 requests per hour.

Expected response:

```json
{
  "title": "main topic",
  "nodes": [
    {
      "id": "1",
      "label": "concept",
      "children": [
        {
          "id": "1-1",
          "label": "sub concept"
        }
      ]
    }
  ]
}
```

### `POST /explain-node`

Explains a selected mindmap node.

Headers:

```txt
X-App-Token: mindscribe2026
```

Body:

```json
{
  "node": "Selected concept",
  "context": "Original pasted source text..."
}
```

Validation:

- Rate limited to 30 requests per hour.
- Uses only the first 1500 characters of context in the explanation prompt.

Response:

```json
{
  "explanation": "Short explanation text."
}
```

## Environment Variables

The current backend expects:

```txt
OPENAI_API_KEY=
APP_SECRET=
```

`APP_SECRET` must match the frontend prototype token:

```txt
mindscribe2026
```

The frontend uses:

```txt
VITE_API_URL=http://localhost:8000
```

If `VITE_API_URL` is not provided, the frontend falls back to:

```txt
http://localhost:8000
```

## Running Locally

### Backend

From the current backend folder:

```bash
cd backend/venv
Scripts\activate
uvicorn main:app --reload
```

The backend should be available at:

```txt
http://localhost:8000
```

### Frontend

From the frontend folder:

```bash
cd frontend
npm install
npm run dev
```

The frontend should be available at the Vite local URL, usually:

```txt
http://localhost:5173
```

## Frontend Scripts

Available scripts in `frontend/package.json`:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

### `npm run dev`

Starts the Vite development server.

### `npm run build`

Runs TypeScript build checks and creates a production build in `frontend/dist`.

### `npm run lint`

Runs Oxlint.

### `npm run preview`

Serves the production build locally.

## CSS and Visual Theme

MindScribe currently uses a bold academic-brutalist visual style.

### Color Palette

```txt
Cream background: #F5F2EB
Primary navy:     #1A1A2E
Accent orange:   #E8531D
Surface white:   #FFFFFF
Black border:    #000000
Success green:   #4ADE80
```

### Typography

Fonts are imported in `frontend/src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@600;700;800&display=swap');
```

Usage:

- `Space Grotesk` for headings, labels, buttons, and bold interface elements.
- `DM Sans` for body copy, textareas, explanations, and supporting text.

### Shape Language

The UI intentionally uses square corners:

```css
* {
  border-radius: 0px !important;
}
```

This supports the sharp, printed-poster, hackathon-prototype feel.

### Borders and Shadows

Common visual rules:

```txt
Border:       2px solid #000
Main shadow:  4px 4px 0px #000
Large shadow: 6px 6px 0px #000
Small shadow: 2px 2px 0px #000
```

Buttons use a pressed hover effect:

```txt
Normal: box-shadow 4px 4px 0px #000
Hover:  translate(2px, 2px), box-shadow 2px 2px 0px #000
Active: translate(4px, 4px), no shadow
```

### Current Styling Approach

Some global CSS helpers exist in `frontend/src/index.css`:

```txt
brutal-btn
brutal-btn-secondary
brutal-card
brutal-input
```

However, `MindMapPage.tsx` and `NodePanel.tsx` currently use inline styles because Tailwind utilities were not applying reliably in the Vite build. The production build reports warnings for unknown `@tailwind` rules, which means Tailwind is configured but not fully processed by the current toolchain.

### Tailwind Theme Config

`frontend/tailwind.config.js` defines:

```txt
colors.cream = #F5F2EB
colors.navy = #1A1A2E
colors.accent = #E8531D
colors.black = #000000

fontFamily.sans = DM Sans
fontFamily.display = Space Grotesk

boxShadow.brutal = 4px 4px 0px #000000
boxShadow.brutal-lg = 6px 6px 0px #000000
boxShadow.brutal-sm = 2px 2px 0px #000000
```

If Tailwind is repaired later, these utilities can replace some inline styling.

## Mindmap Rendering Details

The map is generated in `MindMapPage.tsx` by `buildNodesAndEdges`.

Layout:

- Root node is placed near the center.
- Top-level nodes are distributed around the root using circular coordinates.
- Child nodes are positioned outward from their parent.

Node styling:

- Root node: navy background, cream text, heavy shadow.
- Top-level nodes: orange background, white text.
- Child nodes: white background, navy text.

React Flow features currently used:

- `ReactFlow`
- `Background`
- `Controls`
- `useNodesState`
- `useEdgesState`
- `fitView`

## AI Prompting Behavior

### Mindmap Generation Prompt

The backend asks the model to:

- Extract key concepts and relationships.
- Return only JSON.
- Use a specific nested JSON structure.
- Keep labels short.
- Limit the map to 5 top-level nodes.
- Limit each top-level node to 3 children.

### Node Explanation Prompt

The backend asks the model to:

- Explain one concept.
- Use the original source text as context.
- Keep the explanation to 2-3 sentences.
- Avoid bullet points.

## Current Limitations

- Authentication is a prototype password gate, not production auth.
- The frontend secret token is hardcoded for prototype use.
- Mindmaps are not persisted yet.
- Firebase Auth and Firestore are not wired in yet.
- Tailwind utilities are not currently working correctly in the build.
- Backend app code is inside the virtual environment folder.
- The current mindmap shape is nested, not a full graph schema with edge metadata.
- Source text is limited to 3000 characters.
- Node explanations use only the first 1500 characters of source context.

## Recommended Next Steps

1. Move backend app code out of `backend/venv`.
2. Add a `requirements.txt` file.
3. Replace the prototype password gate with Firebase Authentication.
4. Replace `X-App-Token` auth with Firebase ID token verification.
5. Add Firestore persistence for generated maps.
6. Switch the backend AI provider fully to Groq.
7. Decide whether to keep nested nodes or move to a graph format with `nodes` and `edges`.
8. Fix Tailwind processing or continue standardizing around inline/component styles.
9. Add loading, empty, and error polish across every API interaction.
10. Add tests for AI JSON parsing and API validation.

## Documentation Files

The project also includes:

```txt
agent.md
skills.md
```

`agent.md` documents working rules and architecture expectations for AI agents or contributors.

`skills.md` documents the specialized capabilities needed to build MindScribe well, including mindmap generation, Groq prompting, Firebase Auth, Firestore, React Flow rendering, and data validation.

## Product Vision

MindScribe should feel like a focused learning tool, not a generic chatbot. The key product promise is:

```txt
Paste dense text.
Generate a visual concept map.
Click concepts to understand them.
Keep the result as a useful study artifact.
```

