# Beth's Memory Book

A web application that allows friends and family to share memories about Beth and play a guessing game to identify who shared each memory.

## Overview

This application provides an interactive way to:

-   View memories shared by Beth's friends and family
-   Guess who wrote each memory
-   See images associated with memories
-   Track your progress through the memories
-   Share your session with others via URL

## Features

-   **Memory Display**: Each memory is displayed as a card with text and an optional image
-   **Guessing Game**: Users can guess who wrote each memory
-   **Session Management**: Users can save their progress and share their session via URL
-   **Responsive Design**: Works on desktop and mobile devices
-   **Image Support**: Displays images from Google Drive links
-   **Progress Tracking**: Shows which memories you've already guessed
-   **Expand/Collapse**: Easily manage viewed memories with expand/collapse functionality

## Technical Stack

-   Next.js 14
-   React 18
-   TypeScript
-   Tailwind CSS
-   Google Apps Script (backend)

## Local Development Setup

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd beth-memory-book
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Start the development server**
    ```bash
    npm run dev
    ```
    This will start the server on http://localhost:1313

## Environment Configuration

The application connects to a Google Apps Script backend. The URL is configured in `src/app/page.tsx`. To set up your own backend:

1. Create a new Google Apps Script project
2. Copy the contents of `google-script.js` into your project
3. Deploy as a web app with:
    - Execute as: "User accessing the web app"
    - Who has access: "Anyone"
4. Update `GOOGLE_SCRIPT_URL` in `src/app/page.tsx` with your deployment URL

## Data Structure

### Memory Format

```typescript
interface MemoryResponse {
	timestamp: string;
	email: string;
	memory: string;
	image: string;
	name: string;
	exclude: boolean;
}
```

### Guess Format

```typescript
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

## Usage

1. **First Visit**

    - Enter your name and email
    - This information is saved locally and used to track your guesses

2. **Playing the Game**

    - Read each memory
    - Make a guess about who wrote it
    - See immediate feedback on whether your guess was correct
    - View the associated image after guessing

3. **Managing Progress**

    - Use the "Expand/Collapse" buttons to manage viewed memories
    - Use "Expand All" or "Collapse All" to manage all guessed memories at once

4. **Sharing Your Session**
    - Your session URL includes your name and email
    - Share this URL with others to let them start from where you left off

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Known Limitations

-   Due to CORS restrictions, the guesses history feature is currently disabled
-   Image loading depends on Google Drive public access settings
-   Session data is stored locally and not synchronized across devices

## License

This project is private and not licensed for public use.
