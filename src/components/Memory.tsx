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
	console.log('++memory', memory);

	// Define mappings for all form fields
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

	// Generic function to get value from any mapped field
	const getFieldValue = (
		fieldType: keyof typeof fieldMappings,
		defaultValue: any = ''
	) => {
		for (const possibleKey of fieldMappings[fieldType]) {
			if (memory[possibleKey] !== undefined) {
				return memory[possibleKey];
			}
		}
		return defaultValue;
	};

	// Use the mapping functions for specific fields
	const getMemoryText = () =>
		getFieldValue('memory', 'No memory text available');
	const getAuthorName = () => getFieldValue('name', 'Anonymous');
	const getExcludeStatus = () => {
		const value = getFieldValue('exclude', '');
		// Handle various forms of "yes"/"true" values
		return (
			value === true ||
			value === 'true' ||
			value === 'yes' ||
			value === 'Yes' ||
			value === 'TRUE' ||
			value === '1'
		);
	};

	// Get image URL with Google Drive handling
	const getImageUrls = () => {
		const imageValue = getFieldValue('image', '');
		if (!imageValue) return [];
		// Split by commas or newlines and filter out empty strings
		const urls = imageValue
			.split(/[,\n]/)
			.map((url) => url.trim())
			.filter(Boolean);
		return urls.map((url) => getGoogleDriveImageUrl(url)).filter(Boolean);
	};

	const [guess, setGuess] = useState('');
	const hasGuessed = revealed || Boolean(currentGuess);
	const [isCorrect, setIsCorrect] = useState(false);
	const [imageError, setImageError] = useState(false);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [imageDimensions, setImageDimensions] = useState<
		Array<{ width: number; height: number }>
	>([]);
	const [containerHeight, setContainerHeight] = useState<number>(0);

	// Update container height when images load
	const handleImageLoad = (
		event: React.SyntheticEvent<HTMLImageElement>,
		index: number
	) => {
		const img = event.target as HTMLImageElement;
		setImageDimensions((prev) => {
			const newDimensions = [...prev];
			newDimensions[index] = {
				width: img.naturalWidth,
				height: img.naturalHeight,
			};

			// Update container height to match the tallest image's proportional height
			const maxHeight = Math.max(
				...newDimensions
					.filter(Boolean)
					.map((dim) => (dim.height / dim.width) * img.width)
			);
			setContainerHeight(maxHeight || 0);

			return newDimensions;
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!guess.trim() || isSubmitting) return;

		// Simple fuzzy matching - convert to lowercase and remove spaces
		const normalizedGuess = guess.toLowerCase().replace(/\s+/g, '');
		const normalizedActual = getAuthorName()
			?.toLowerCase()
			.replace(/\s+/g, '');
		const correct = normalizedGuess === normalizedActual;

		setIsCorrect(correct);
		onGuessSubmit(guess);
	};

	const getGoogleDriveImageUrl = (url: string | undefined) => {
		try {
			// Check if URL is defined
			if (!url) return '';

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

	// Use the mapped values
	const imageUrls = getImageUrls();

	// Make sure we're using the mapped name value in the component
	const authorName = getAuthorName();
	console.log('Author name:', authorName); // Debug log

	const nextImage = () => {
		setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
	};

	const prevImage = () => {
		setCurrentImageIndex(
			(prev) => (prev - 1 + imageUrls.length) % imageUrls.length
		);
	};

	return (
		<div className='bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100'>
			<div className='prose max-w-none p-6'>
				<div className='flex justify-between items-start gap-4'>
					<p className='text-gray-900 text-lg leading-relaxed flex-1 font-medium'>
						{getMemoryText()}
					</p>
					{(hasGuessed || revealed) && (
						<button
							onClick={() => onCollapse(!isCollapsed)}
							className='ml-4 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200'
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
					<div className='mt-4 flex items-center gap-2'>
						<span
							className={`${
								isCorrect ? 'text-green-600' : 'text-red-600'
							} font-medium text-lg`}
						>
							{isCorrect ? '✓' : '✗'}
						</span>
						<span className='text-gray-900 font-medium'>
							Guessed: {guess}
						</span>
					</div>
				)}

				{((revealed && !isCollapsed) ||
					(hasGuessed && !isCollapsed) ||
					memory.showImage) && (
					<div className='mt-6'>
						{imageUrls.length > 0 && (
							<div className='relative'>
								<div
									className='relative w-full rounded-lg overflow-hidden bg-gray-50'
									style={{
										height: containerHeight
											? `${containerHeight}px`
											: 'auto',
									}}
								>
									<div className='absolute inset-0 flex items-center justify-center'>
										<Image
											src={imageUrls[currentImageIndex]}
											alt={`Memory image ${
												currentImageIndex + 1
											}`}
											width={800}
											height={800}
											className='w-full h-auto object-contain'
											onError={() => setImageError(true)}
											onLoadingComplete={(img) =>
												handleImageLoad(
													{
														target: img,
													} as React.SyntheticEvent<HTMLImageElement>,
													currentImageIndex
												)
											}
											sizes='(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw'
											priority={false}
											loading='lazy'
										/>
									</div>
								</div>
								{imageUrls.length > 1 && (
									<>
										<button
											onClick={prevImage}
											className='absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500'
											aria-label='Previous image'
										>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												className='h-6 w-6'
												fill='none'
												viewBox='0 0 24 24'
												stroke='currentColor'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2.5}
													d='M15 19l-7-7 7-7'
												/>
											</svg>
										</button>
										<button
											onClick={nextImage}
											className='absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500'
											aria-label='Next image'
										>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												className='h-6 w-6'
												fill='none'
												viewBox='0 0 24 24'
												stroke='currentColor'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2.5}
													d='M9 5l7 7-7 7'
												/>
											</svg>
										</button>
										<div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 items-center bg-white/90 px-3 py-2 rounded-full shadow-lg'>
											{imageUrls.map((_, index) => (
												<button
													key={index}
													onClick={() =>
														setCurrentImageIndex(
															index
														)
													}
													className={`w-2 h-2 rounded-full transition-all duration-200 ${
														index ===
														currentImageIndex
															? 'bg-blue-600 w-4'
															: 'bg-gray-400 hover:bg-gray-600'
													}`}
													aria-label={`Go to image ${
														index + 1
													}`}
												/>
											))}
										</div>
									</>
								)}
							</div>
						)}
						{hasGuessed || revealed ? (
							<div className='mt-6 space-y-2 p-4 bg-gray-50 rounded-lg'>
								{hasGuessed && (
									<p className='font-semibold text-gray-900'>
										Your guess: {guess}
									</p>
								)}
								<p className='font-semibold text-gray-900'>
									Written by: {authorName}
								</p>
								{hasGuessed && (
									<p
										className={`${
											isCorrect
												? 'text-green-600'
												: 'text-red-600'
										} font-medium text-lg`}
									>
										{isCorrect
											? '✓ Correct guess!'
											: '✗ Not quite right!'}
									</p>
								)}
							</div>
						) : null}
					</div>
				)}

				{!hasGuessed && !revealed && (
					<form onSubmit={handleSubmit} className='mt-6'>
						<div className='flex gap-3'>
							<input
								type='text'
								value={guess}
								onChange={(e) => setGuess(e.target.value)}
								placeholder='Guess who wrote this...'
								className='flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500'
								disabled={isSubmitting}
							/>
							<button
								type='submit'
								className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
								disabled={isSubmitting || !guess.trim()}
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
