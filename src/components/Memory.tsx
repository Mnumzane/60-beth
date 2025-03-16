'use client';

import { useState, useEffect } from 'react';
import { MemoryResponse } from '@/types/memory';
import Image from 'next/image';

interface MemoryProps {
	memory: MemoryResponse;
	onGuessSubmit: (guess: string) => void;
	revealed: boolean;
	isSubmitting: boolean;
	isCollapsed: boolean;
	onCollapse: (isCollapsed: boolean) => void;
	currentGuess?: string;
}

export default function Memory({
	memory,
	onGuessSubmit,
	revealed,
	isSubmitting,
	isCollapsed,
	onCollapse,
	currentGuess,
}: MemoryProps) {
	const [guess, setGuess] = useState('');
	const [hasGuessed, setHasGuessed] = useState(false);
	const [isCorrect, setIsCorrect] = useState(false);
	const [imageError, setImageError] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!guess.trim() || isSubmitting) return;

		// Simple fuzzy matching - convert to lowercase and remove spaces
		const normalizedGuess = guess.toLowerCase().replace(/\s+/g, '');
		const normalizedActual = memory.name.toLowerCase().replace(/\s+/g, '');
		const correct = normalizedGuess === normalizedActual;

		setIsCorrect(correct);
		setHasGuessed(true);
		onGuessSubmit(guess);
	};

	const getGoogleDriveImageUrl = (url: string) => {
		try {
			// Handle different Google Drive URL formats
			const idMatch = url.match(/[-\w]{25,}/);
			const fileId = idMatch ? idMatch[0] : '';
			return fileId
				? `https://lh3.googleusercontent.com/d/${fileId}=w800`
				: '';
		} catch (error) {
			console.error('Error parsing Google Drive URL:', error);
			return '';
		}
	};

	const directImageUrl = getGoogleDriveImageUrl(memory.image);

	return (
		<div className='bg-white rounded-lg shadow-lg p-6 mb-6'>
			<div className='prose max-w-none'>
				<div className='flex justify-between items-start mb-4'>
					<p className='text-gray-800 flex-1'>{memory.memory}</p>
					{hasGuessed && (
						<button
							onClick={() => onCollapse(!isCollapsed)}
							className='ml-4 text-blue-600 hover:text-blue-700 font-medium'
							aria-label={
								isCollapsed
									? 'Expand memory'
									: 'Collapse memory'
							}
						>
							{isCollapsed ? 'Expand' : 'Collapse'}
						</button>
					)}
				</div>

				{hasGuessed && isCollapsed && (
					<div className='mt-2 flex items-center gap-2'>
						<span
							className={`${
								isCorrect ? 'text-green-600' : 'text-red-600'
							} font-medium`}
						>
							{isCorrect ? '✓' : '✗'}
						</span>
						<span className='text-gray-800'>Guessed: {guess}</span>
					</div>
				)}

				{((revealed && !hasGuessed) ||
					(hasGuessed && !isCollapsed)) && (
					<div className='mt-4'>
						<div className='relative w-full aspect-[4/3] max-h-[600px] min-h-[300px]'>
							{directImageUrl ? (
								<Image
									src={directImageUrl}
									alt='Memory image'
									fill
									className='object-contain'
									onError={() => setImageError(true)}
									sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
									priority={false}
									loading='lazy'
								/>
							) : (
								<div className='absolute inset-0 flex items-center justify-center bg-gray-50'>
									<div className='text-gray-500 flex flex-col items-center'>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											className='h-12 w-12 mb-2'
											fill='none'
											viewBox='0 0 24 24'
											stroke='currentColor'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
											/>
										</svg>
										<span className='font-medium'>
											No image available
										</span>
									</div>
								</div>
							)}
						</div>
						{hasGuessed ? (
							<div className='mt-4 space-y-1'>
								<p className='font-semibold text-gray-900'>
									Your guess: {guess}
								</p>
								<p className='font-semibold text-gray-900'>
									Shared by: {memory.name}
								</p>
								<p
									className={`${
										isCorrect
											? 'text-green-600'
											: 'text-red-600'
									} font-medium`}
								>
									{isCorrect
										? '✓ Correct guess!'
										: '✗ Not quite right!'}
								</p>
							</div>
						) : (
							<p className='mt-4 font-semibold text-gray-900'>
								Shared by: {memory.name}
							</p>
						)}
					</div>
				)}

				{!hasGuessed && !revealed && (
					<form onSubmit={handleSubmit} className='mt-4'>
						<div className='flex gap-2'>
							<input
								type='text'
								value={guess}
								onChange={(e) => setGuess(e.target.value)}
								placeholder='Guess who wrote this...'
								className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800'
								disabled={isSubmitting}
							/>
							<button
								type='submit'
								className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${
									isSubmitting
										? 'opacity-50 cursor-not-allowed'
										: ''
								}`}
								disabled={isSubmitting}
							>
								{isSubmitting
									? 'Submitting...'
									: 'Submit Guess'}
							</button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
