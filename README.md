# MindScribe

Transform dense text into interactive, AI-powered mind maps.

MindScribe helps students and lifelong learners understand complex study material by converting plain text into structured visual mind maps. Instead of reading long walls of text, users can explore concepts visually, understand relationships between ideas, test their knowledge, and track learning progress — all in one place.

---

## Features

**AI Mind Map Generation**
Convert lecture notes, articles, research papers, or any block of text into a structured visual mind map.

**Concept Explanations**
Click any node to receive an AI-generated explanation grounded in the original context.

**Relationship Analysis**
Understand how a child concept connects to its parent concept within the map.

**Quiz Generation**
Generate multiple-choice questions for any concept and receive instant feedback.

**Learning Progress Tracking**
Track visited concepts with a visual progress indicator and persistent learning history.

**Comprehension Ratings**
Mark each concept as understood, fuzzy, or not yet grasped. Ratings are color-coded on the mind map and saved automatically.

**Persistent Storage**
Mind maps, visited nodes, and comprehension ratings are stored securely in Cloud Firestore.

**Export as PNG**
Download your completed mind map as an image.

**Authentication**
Supports Google Sign-In and email/password authentication via Firebase.

---

## How It Works

1. Paste your study material (up to 5,000 characters).
2. The AI extracts and structures key concepts.
3. An interactive mind map is generated.
4. Explore concepts by clicking nodes.
5. Deepen understanding with AI explanations and relationship analysis.
6. Test yourself with AI-generated quizzes.
7. Track comprehension visually across the map.
8. Export your completed mind map as a PNG.

---

## Tech Stack

| Layer          | Technology                    |
| -------------- | ----------------------------- |
| Frontend       | React 19 + TypeScript + Vite  |
| Visualization  | React Flow (@xyflow/react)    |
| Backend        | FastAPI + Python 3.11         |
| AI             | OpenAI GPT-4o-mini            |
| Authentication | Firebase Authentication       |
| Database       | Cloud Firestore               |
| Rate Limiting  | SlowAPI                       |
| Export         | html-to-image                 |

---

## Architecture

```
                    +------------------+
                    |     React App    |
                    |   (Vite + TS)    |
                    +---------+--------+
                              |
                              v
                    +------------------+
                    |     FastAPI      |
                    |  Python Backend  |
                    +---------+--------+
                              |
               +--------------+--------------+
               |                             |
               v                             v
       +---------------+             +---------------+
       |   OpenAI API  |             | Firebase Auth |
       +---------------+             +---------------+
                                             |
                                             v
                                     +---------------+
                                     | Cloud Firestore|
                                     +---------------+
```

---

## API Endpoints

All endpoints require a Firebase ID token passed as a Bearer token in the Authorization header.

| Method | Endpoint            | Description                    | Rate Limit |
| ------ | ------------------- | ------------------------------ | ---------- |
| POST   | `/generate-mindmap` | Generate a structured mind map | 10/hour    |
| POST   | `/explain-node`     | Explain a concept              | 30/hour    |
| POST   | `/relate-nodes`     | Explain concept relationships  | 20/hour    |
| POST   | `/quiz-node`        | Generate multiple-choice quiz  | 20/hour    |

---

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- A Firebase project with Authentication and Firestore enabled
- An OpenAI API key

### Clone the Repository

```bash
git clone https://github.com/yourusername/MindScribe.git
cd MindScribe
```

### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend` folder:

```env
OPENAI_API_KEY=your_openai_api_key
FIREBASE_SERVICE_ACCOUNT=your_firebase_service_account_json
```

Start the server:

```bash
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder:

```env
VITE_API_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Start the development server:

```bash
npm run dev
```

---

## Environment Variables

### Backend

| Variable                   | Description                        |
| -------------------------- | ---------------------------------- |
| `OPENAI_API_KEY`           | OpenAI API key                     |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase service account JSON      |

### Frontend

| Variable                          | Description              |
| --------------------------------- | ------------------------ |
| `VITE_API_URL`                    | Backend URL              |
| `VITE_FIREBASE_API_KEY`           | Firebase API key         |
| `VITE_FIREBASE_AUTH_DOMAIN`       | Firebase auth domain     |
| `VITE_FIREBASE_PROJECT_ID`        | Firebase project ID      |
| `VITE_FIREBASE_STORAGE_BUCKET`    | Firebase storage bucket  |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID`            | Firebase app ID          |

---

## Project Structure

```
MindScribe
├── backend
│   ├── main.py
│   ├── requirements.txt
│   └── .env
└── frontend
    ├── src
    │   ├── components
    │   ├── hooks
    │   ├── firebase.ts
    │   └── App.tsx
    ├── package.json
    └── .env
```

---

## Design

| Purpose    | Value     |
| ---------- | --------- |
| Background | `#F5F2EB` |
| Primary    | `#1A1A2E` |
| Accent     | `#E8531D` |
| Surface    | `#FFFFFF` |
| Success    | `#4ADE80` |

Typography: **Space Grotesk** for headings, **DM Sans** for body text. The UI follows a brutalist aesthetic with hard borders and offset shadows.

---

## Roadmap

- PDF upload with automatic text extraction
- AI-generated study summaries
- Focus mode for distraction-free learning
- Revision list for difficult concepts
- Flashcard export (Anki-compatible)
- Collaborative mind maps
- Mobile application

---

## Contributing

Contributions, feature suggestions, and bug reports are welcome. To contribute, fork the repository, create a new branch, commit your changes, and open a pull request.

