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
		<div className='bg-white rounded-lg shadow-lg p-6 mb-6'>
			<h2 className='text-2xl font-bold mb-4'>
				Welcome to Beth's Memory Book!
			</h2>
			<p className='text-gray-600 mb-4'>
				Before you start guessing, please let us know who you are. This
				helps us keep track of everyone's guesses!
			</p>
			<form onSubmit={handleSubmit}>
				<div className='space-y-4'>
					<div>
						<label
							htmlFor='name'
							className='block text-sm font-medium text-gray-700 mb-1'
						>
							Your Name
						</label>
						<input
							type='text'
							id='name'
							value={name}
							onChange={(e) => setName(e.target.value)}
							className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
							placeholder='Enter your name'
						/>
					</div>
					<div>
						<label
							htmlFor='email'
							className='block text-sm font-medium text-gray-700 mb-1'
						>
							Your Email
						</label>
						<input
							type='email'
							id='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
							placeholder='Enter your email'
						/>
					</div>
					{error && <p className='text-red-600 text-sm'>{error}</p>}
					<button
						type='submit'
						className='w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
					>
						Start Guessing
					</button>
				</div>
			</form>
		</div>
	);
}
