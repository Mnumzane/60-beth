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

export default function Home() {
	const [memories, setMemories] = useState<MemoryResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [expandAll, setExpandAll] = useState(true);
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
			const data = await response.json();
			console.log('Received memories:', data);

			// Filter out excluded responses
			const filteredMemories = data.filter(
				(memory: MemoryResponse) => !memory.exclude
			);
			console.log('Filtered memories:', filteredMemories);
			setMemories(filteredMemories);
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
		<div className='min-h-screen bg-gray-100 p-8'>
			<div className='max-w-4xl mx-auto'>
				<div className='flex justify-between items-center mb-8'>
					<h1 className='text-4xl font-bold text-gray-900'>
						Beth's Memory Book
					</h1>
					<div className='flex items-center gap-4'>
						<div className='text-gray-800 font-medium'>
							Playing as: {userInfo.name}
						</div>
						<button
							onClick={handleLogout}
							className='text-sm text-gray-700 hover:text-gray-900 font-medium'
						>
							(Switch Player)
						</button>
					</div>
				</div>
				{showExpandAllButton && (
					<div className='mb-4 flex justify-end'>
						<button
							onClick={handleExpandAllClick}
							className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium'
						>
							{!expandAll
								? 'Expand All Guessed Memories'
								: 'Collapse All Guessed Memories'}
						</button>
					</div>
				)}
				<div className='space-y-6'>
					{memories.map((memory) => (
						<Memory
							key={memory.timestamp}
							memory={memory}
							onGuessSubmit={(guess: string) =>
								handleGuessSubmit(memory.timestamp, guess)
							}
							revealed={false}
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
