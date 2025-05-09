'use client';

import { useState, useEffect } from 'react';
import { MemoryResponse } from '@/types/memory';
import Memory from '@/components/Memory';
import UserIdentification from '@/components/UserIdentification';

const GOOGLE_SCRIPT_URL =
	'https://script.google.com/macros/s/AKfycbyQduHA7Nn21Wbasf5P3tZ8s1SUZedHwsstX30if9_6n047OZRID_2XN0xBq79A3CtbvQ/exec';
const USER_INFO_KEY = 'beth-memory-book-user';

interface UserInfo {
	name: string;
	email: string;
}

interface UserGuess {
	memoryId: string;
	guessedName: string;
	actualName: string;
	isCorrect: boolean;
	timestamp: string;
}

interface GuessMap {
	[memoryId: string]: string;
}

// Define field mappings (you can move this to a utility file if used in multiple places)
const fieldMappings = {
	memory: [
		'What is one of your fondest memories of Beth? Where and when did this memory occur? Try not to give away details about who you are in your response!',
		'memory',
		'text',
		'content',
	],
	image: [
		"Share a picture, drawing, or other image that you'd like to include with your memory.",
		'image',
		'picture',
		'photo',
	],
	name: ["What's your name?", 'name', 'author', 'writer'],
	exclude: ['exclude', 'Exclude'],
	timestamp: ['Timestamp', 'timestamp', 'date', 'time'],
	email: ['Email Address', 'email', 'emailAddress'],
	showImage: ['Show Image?', 'showImage', 'showImageBeforeGuess'],
};

// Helper function to get value from any mapped field
const getFieldValue = (
	obj: Record<string, any>,
	fieldType: keyof typeof fieldMappings,
	defaultValue: string = ''
) => {
	for (const possibleKey of fieldMappings[fieldType]) {
		if (obj[possibleKey] !== undefined) {
			return obj[possibleKey];
		}
	}
	return defaultValue;
};

export default function Home() {
	const [memories, setMemories] = useState<MemoryResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [expandAll, setExpandAll] = useState(true);
	const [revealAll, setRevealAll] = useState(false);
	const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
	const [submitting, setSubmitting] = useState<string | null>(null);
	const [guessedMemories, setGuessedMemories] = useState<Set<string>>(
		new Set()
	);
	const [collapsedMemories, setCollapsedMemories] = useState<Set<string>>(
		new Set()
	);
	const [currentGuesses, setCurrentGuesses] = useState<GuessMap>({});

	// Load user info from URL params or local storage on mount
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const urlName = params.get('name');
		const urlEmail = params.get('email');

		if (urlName && urlEmail) {
			// Decode and sanitize URL parameters
			const decodedName = decodeURIComponent(urlName).trim();
			const decodedEmail = decodeURIComponent(urlEmail).trim();

			if (decodedName && decodedEmail.includes('@')) {
				const newUserInfo = { name: decodedName, email: decodedEmail };
				setUserInfo(newUserInfo);
				localStorage.setItem(
					USER_INFO_KEY,
					JSON.stringify(newUserInfo)
				);
				return;
			}
		}

		// Fall back to local storage if no valid URL params
		const savedUserInfo = localStorage.getItem(USER_INFO_KEY);
		if (savedUserInfo) {
			try {
				const parsed = JSON.parse(savedUserInfo);
				console.log('Loaded user info from storage:', parsed);
				setUserInfo(parsed);
			} catch (err) {
				console.error('Error parsing saved user info:', err);
			}
		}
	}, []);

	// Load existing guesses when user info changes
	// Commenting out for now due to CORS issues
	/*useEffect(() => {
		if (userInfo?.email) {
			fetchExistingGuesses(userInfo.email);
		}
	}, [userInfo?.email]);*/

	useEffect(() => {
		fetchMemories();
	}, []);

	const fetchMemories = async () => {
		try {
			console.log('Fetching memories from:', GOOGLE_SCRIPT_URL);
			const response = await fetch(GOOGLE_SCRIPT_URL);
			if (!response.ok) {
				throw new Error('Failed to fetch memories');
			}
			const rawData = await response.json();
			console.log('Received raw memories:', rawData);

			// Normalize the data
			const normalizedData = rawData.map((item: any) => ({
				memory: getFieldValue(
					item,
					'memory',
					'No memory text available'
				),
				name: getFieldValue(item, 'name', 'Anonymous'),
				image: getFieldValue(item, 'image', ''),
				exclude: (() => {
					const excludeValue = getFieldValue(item, 'exclude', '');
					return (
						excludeValue === true ||
						excludeValue === 'true' ||
						excludeValue === 'yes' ||
						excludeValue === 'Yes' ||
						excludeValue === 'TRUE' ||
						excludeValue === '1'
					);
				})(),
				showImage: (() => {
					const showImageValue = getFieldValue(item, 'showImage', '');
					return (
						showImageValue === true ||
						showImageValue === 'true' ||
						showImageValue === 'yes' ||
						showImageValue === 'Yes' ||
						showImageValue === 'TRUE' ||
						showImageValue === '1'
					);
				})(),
				timestamp: getFieldValue(item, 'timestamp', ''),
				email: getFieldValue(item, 'email', ''),
				// Preserve the original data for debugging if needed
				_original: item,
			}));

			console.log('Normalized memories:', normalizedData);

			// Filter out excluded responses
			const filteredMemories = normalizedData.filter(
				(memory: MemoryResponse) => !memory.exclude
			);
			console.log('Filtered memories:', filteredMemories);

			// Shuffle the memories using Fisher-Yates algorithm
			const shuffledMemories = [...filteredMemories];
			for (let i = shuffledMemories.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[shuffledMemories[i], shuffledMemories[j]] = [
					shuffledMemories[j],
					shuffledMemories[i],
				];
			}

			setMemories(shuffledMemories);
		} catch (err) {
			console.error('Error fetching memories:', err);
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setLoading(false);
		}
	};

	// Commenting out for now due to CORS issues
	/*const fetchExistingGuesses = async (email: string) => {
		try {
			console.log('Fetching existing guesses for:', email);
			const response = await fetch(
				`${GOOGLE_SCRIPT_URL}?path=guesses&email=${encodeURIComponent(
					email
				)}`
			);
			if (!response.ok) {
				throw new Error('Failed to fetch guesses');
			}
			const guesses: UserGuess[] = await response.json();
			console.log('Received guesses:', guesses);

			// Update guessed memories set
			setGuessedMemories(new Set(guesses.map((guess) => guess.memoryId)));

			// Store the actual guesses
			const guessMap: GuessMap = {};
			guesses.forEach((guess) => {
				guessMap[guess.memoryId] = guess.guessedName;
			});
			setCurrentGuesses(guessMap);

			// Expand all guessed memories initially
			setCollapsedMemories(new Set());
			setExpandAll(true);
		} catch (err) {
			console.error('Error fetching guesses:', err);
			// Don't show error to user, just silently fail
			// They can still play without their previous guesses
		}
	};*/

	const handleGuessSubmit = async (memoryId: string, guess: string) => {
		try {
			const memory = memories.find((m) => m.timestamp === memoryId);
			if (!memory || !userInfo) return;

			setSubmitting(memoryId);
			console.log('Submitting guess for memory:', memoryId);

			const submission = {
				memoryId,
				guessedName: guess,
				actualName: memory.name,
				isCorrect:
					guess.toLowerCase().replace(/\s+/g, '') ===
					memory.name.toLowerCase().replace(/\s+/g, ''),
				timestamp: new Date().toISOString(),
				guesserName: userInfo.name,
				guesserEmail: userInfo.email,
			};

			console.log('Submission data:', submission);

			// Use no-cors mode since it works with curl
			const response = await fetch(GOOGLE_SCRIPT_URL, {
				method: 'POST',
				mode: 'no-cors',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(submission),
			});

			console.log('Response:', response);

			// Since we're using no-cors, we won't get a readable response
			// Handle the state update optimistically
			console.log('Guess submitted successfully');
			setGuessedMemories((prev) => {
				const newSet = new Set(prev);
				newSet.add(memoryId);
				console.log('Updated guessed memories:', Array.from(newSet));
				return newSet;
			});

			// Store the current guess
			setCurrentGuesses((prev) => ({
				...prev,
				[memoryId]: guess,
			}));

			// Automatically expand the memory when guessed
			setCollapsedMemories((prev) => {
				const newSet = new Set(prev);
				newSet.delete(memoryId);
				return newSet;
			});
		} catch (err) {
			console.error('Error submitting guess:', err);
			alert('Failed to submit guess. Please try again.');
		} finally {
			setSubmitting(null);
		}
	};

	const handleMemoryCollapse = (memoryId: string, isCollapsed: boolean) => {
		setCollapsedMemories((prev) => {
			const newSet = new Set(prev);
			if (isCollapsed) {
				newSet.add(memoryId);
			} else {
				newSet.delete(memoryId);
			}
			return newSet;
		});
	};

	const handleExpandAllClick = () => {
		setExpandAll(!expandAll);
		if (expandAll) {
			// If we're collapsing all, add all guessed memories to collapsed set
			setCollapsedMemories(new Set(guessedMemories));
		} else {
			// If we're expanding all, clear the collapsed set
			setCollapsedMemories(new Set());
		}
	};

	const showExpandAllButton = guessedMemories.size > 0;

	const handleUserIdentification = (name: string, email: string) => {
		const newUserInfo = { name, email };
		console.log('Saving user info:', newUserInfo);
		localStorage.setItem(USER_INFO_KEY, JSON.stringify(newUserInfo));
		setUserInfo(newUserInfo);

		// Update URL with user info
		const params = new URLSearchParams(window.location.search);
		params.set('name', encodeURIComponent(name));
		params.set('email', encodeURIComponent(email));
		const newUrl = `${window.location.pathname}?${params.toString()}`;
		window.history.pushState({}, '', newUrl);
	};

	const handleLogout = () => {
		localStorage.removeItem(USER_INFO_KEY);
		setUserInfo(null);
		// Remove user info from URL
		const params = new URLSearchParams(window.location.search);
		params.delete('name');
		params.delete('email');
		const newUrl = window.location.pathname;
		window.history.pushState({}, '', newUrl);
	};

	if (loading) {
		return (
			<div className='min-h-screen bg-gray-100 p-8'>
				<div className='max-w-4xl mx-auto'>
					<div className='text-center text-gray-800 text-lg'>
						Loading memories...
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='min-h-screen bg-gray-100 p-8'>
				<div className='max-w-4xl mx-auto'>
					<div className='text-center text-red-600 font-medium'>
						Error: {error}
					</div>
				</div>
			</div>
		);
	}

	if (!userInfo) {
		return (
			<div className='min-h-screen bg-gray-100 p-8'>
				<div className='max-w-4xl mx-auto'>
					<UserIdentification onSubmit={handleUserIdentification} />
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-[#EBF1FB] p-4 md:p-8'>
			<div className='max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8'>
				<div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8'>
					<h1 className='text-3xl md:text-4xl font-bold text-gray-900'>
						Beth&apos;s Memory Book
					</h1>
					<div className='flex items-center gap-4'>
						<div className='text-gray-800 font-medium'>
							Playing as: {userInfo.name}
						</div>
						<button
							onClick={handleLogout}
							className='text-sm text-blue-600 hover:text-blue-700 font-medium'
						>
							(Switch Player)
						</button>
					</div>
				</div>
				<div className='mb-6 flex flex-wrap gap-4 justify-end'>
					<button
						onClick={() => {
							setCollapsedMemories(new Set());
							setRevealAll(!revealAll);
						}}
						className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-colors duration-200'
					>
						{revealAll ? 'Hide All' : 'Expand All'}
					</button>
					{showExpandAllButton && (
						<button
							onClick={handleExpandAllClick}
							className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-colors duration-200'
						>
							{!expandAll ? 'Expand Guessed' : 'Collapse Guessed'}
						</button>
					)}
				</div>
				<div className='space-y-8'>
					{memories.map((memory) => (
						<Memory
							key={memory.timestamp}
							memory={memory}
							onGuessSubmit={(guess: string) =>
								handleGuessSubmit(memory.timestamp, guess)
							}
							revealed={revealAll}
							isSubmitting={submitting === memory.timestamp}
							isCollapsed={collapsedMemories.has(
								memory.timestamp
							)}
							onCollapse={(isCollapsed) =>
								handleMemoryCollapse(
									memory.timestamp,
									isCollapsed
								)
							}
							currentGuess={currentGuesses[memory.timestamp]}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
