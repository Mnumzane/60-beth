'use client';

import { useState } from 'react';

interface UserIdentificationProps {
	onSubmit: (name: string, email: string) => void;
}

export default function UserIdentification({
	onSubmit,
}: UserIdentificationProps) {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!name.trim()) {
			setError('Please enter your name');
			return;
		}

		if (!email.trim() || !email.includes('@')) {
			setError('Please enter a valid email address');
			return;
		}

		onSubmit(name.trim(), email.trim());
	};

	return (
		<div className='bg-white rounded-xl shadow-lg p-8'>
			<h2 className='text-3xl font-bold mb-6 text-gray-900'>
				Welcome to Beth's Memory Book!
			</h2>
			<p className='text-gray-700 text-lg mb-8 leading-relaxed'>
				Before you start guessing, please let us know who you are. This
				helps us keep track of everyone's guesses!
			</p>
			<form onSubmit={handleSubmit}>
				<div className='space-y-6'>
					<div>
						<label
							htmlFor='name'
							className='block text-base font-medium text-gray-800 mb-2'
						>
							Your Name
						</label>
						<input
							type='text'
							id='name'
							value={name}
							onChange={(e) => setName(e.target.value)}
							className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500'
							placeholder='Enter your name'
						/>
					</div>
					<div>
						<label
							htmlFor='email'
							className='block text-base font-medium text-gray-800 mb-2'
						>
							Your Email
						</label>
						<input
							type='email'
							id='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500'
							placeholder='Enter your email'
						/>
					</div>
					{error && (
						<p className='text-red-600 font-medium text-sm'>
							{error}
						</p>
					)}
					<button
						type='submit'
						className='w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
						disabled={!name.trim() || !email.trim()}
					>
						Start Guessing
					</button>
				</div>
			</form>
		</div>
	);
}
