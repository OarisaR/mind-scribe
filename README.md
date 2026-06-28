<div align="center">

# MindScribe

**Transform dense text into interactive, AI-powered mind maps.**

Transform your lecture notes, research papers, and textbook chapters into visual concept maps you can explore, quiz yourself on, and track your understanding of — all in one place.

[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python_3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Firestore](https://img.shields.io/badge/Firestore-FF6F00?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com/products/firestore)

**[Live Demo](https://mindscribe-2026o.web.app)** · **[Report a Bug](https://github.com/yourusername/MindScribe/issues)**

</div>

---

## Preview

![MindScribe Mind Map](https://i.imgur.com/tbDWz8U.png)

---

## Features

**AI Mind Map Generation**
Paste any block of text and get a structured visual concept map in seconds, powered by GPT-4o-mini.

**Concept Explanations**
Click any node to receive an AI-generated explanation grounded in the original text.

**Relationship Analysis**
Select two nodes to understand how those concepts connect and depend on each other.

**Quiz Generation**
Generate multiple-choice questions for any concept and receive instant feedback.

**Comprehension Ratings**
Mark each concept as understood, fuzzy, or not yet grasped. Ratings are colour-coded on the map and saved automatically.

**Learning Progress Tracking**
Track visited concepts with a visual progress indicator and persistent history across sessions.

**Persistent Storage**
Mind maps, visited nodes, and comprehension ratings are stored securely in Cloud Firestore.

**Export as PNG**
Download your completed mind map as an image.

**Authentication**
Google Sign-In and email/password authentication via Firebase.

---

## How It Works

```
Paste text  →  AI extracts concepts  →  Interactive mind map
     ↓                                         ↓
  Up to 5,000 characters            Click nodes to explore
                                         ↓
                              Explain · Relate · Quiz
                                         ↓
                              Progress saved to Firestore
```

---

## Tech Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Frontend       | React 19 + TypeScript + Vite        |
| Visualization  | React Flow (@xyflow/react)          |
| Backend        | FastAPI + Python 3.11               |
| AI             | OpenAI GPT-4o-mini                  |
| Authentication | Firebase Authentication             |
| Database       | Cloud Firestore                     |
| Rate Limiting  | SlowAPI                             |
| Export         | html-to-image                       |
| Frontend Host  | Firebase Hosting                    |
| Backend Host   | Render                              |

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
                                     +----------------+
                                     | Cloud Firestore |
                                     +----------------+
```

---

## API Endpoints

All endpoints require `Authorization: Bearer <firebase_id_token>`.

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

| Variable                   | Description                   |
| -------------------------- | ----------------------------- |
| `OPENAI_API_KEY`           | OpenAI API key                |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase service account JSON |

### Frontend

| Variable                             | Description                  |
| ------------------------------------ | ---------------------------- |
| `VITE_API_URL`                       | Backend URL                  |
| `VITE_FIREBASE_API_KEY`              | Firebase API key             |
| `VITE_FIREBASE_AUTH_DOMAIN`          | Firebase auth domain         |
| `VITE_FIREBASE_PROJECT_ID`           | Firebase project ID          |
| `VITE_FIREBASE_STORAGE_BUCKET`       | Firebase storage bucket      |
| `VITE_FIREBASE_MESSAGING_SENDER_ID`  | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID`               | Firebase app ID              |

---

## Project Structure

```
MindScribe
├── backend
│   ├── main.py
│   ├── requirements.txt
│   ├── Procfile
│   └── .env
└── frontend
    ├── src
    │   ├── components
    │   │   ├── AuthPage.tsx
    │   │   ├── InputPage.tsx
    │   │   ├── MindMapPage.tsx
    │   │   ├── NodePanel.tsx
    │   │   └── PasswordGate.tsx
    │   ├── hooks
    │   │   └── useMaps.ts
    │   ├── firebase.ts
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── .env
```

---

## Roadmap

- PDF upload with automatic text extraction
- AI-generated study summaries
- Flashcard export (Anki-compatible)
- Collaborative mind maps
- Mobile application

---

## Contributing

Contributions, feature suggestions, and bug reports are welcome. Fork the repository, create a new branch, commit your changes, and open a pull request.

---

## License

This project is licensed under the MIT License.

---

<div align="center">
Built to make learning more visual, interactive, and engaging.
</div>
