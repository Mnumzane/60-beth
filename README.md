# Beth's Memory Book

A web app for sharing and guessing memories about Beth.

## Features

-   View memories with optional images
-   Guess who wrote each memory
-   Track guessed memories
-   Responsive design

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start dev server:

```bash
npm run dev
```

Server runs at http://localhost:1313

## Backend Setup

1. Create a Google Apps Script project
2. Deploy as web app (Execute as: User accessing, Access: Anyone)
3. Update `GOOGLE_SCRIPT_URL` in `src/app/page.tsx`

## Data Types

```typescript
interface MemoryResponse {
	timestamp: string;
	email: string;
	memory: string;
	image: string;
	name: string;
	exclude: boolean;
}

interface GuessSubmission {
	memoryId: string;
	guessedName: string;
	actualName: string;
	isCorrect: boolean;
	timestamp: string;
	guesserName: string;
	guesserEmail: string;
}
```

## Known Issues

-   CORS restrictions affect guesses history
-   Image loading requires public Google Drive access
