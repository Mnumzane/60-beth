export interface MemoryResponse {
	timestamp: string;
	email: string;
	memory: string;
	image: string;
	name: string;
	exclude: boolean;
	showImage: boolean;
}

export interface GuessSubmission {
	memoryId: string; // We'll use timestamp as a unique identifier
	guessedName: string;
	actualName: string;
	isCorrect: boolean;
	timestamp: string;
	guesserName: string;
	guesserEmail: string;
}
