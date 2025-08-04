<script>
// @ts-nocheck

	import { Mail, Lock, Github, Eye, EyeOff } from 'lucide-svelte';
	import { signIn, signInWithGoogle, signInWithGithub } from '$lib/stores/auth.js';
	import { goto } from '$app/navigation';
	
	let email = '';
	let password = '';
	let showPassword = false;
	let loading = false;
	let error = '';
	
	const handleSubmit = async (e) => {
		e.preventDefault();
		loading = true;
		error = '';
		
		const result = await signIn(email, password);
		
		if (result.success) {
			goto('/dashboard');
		} else {
			error = result.error;
		}
		
		loading = false;
	};
	
	const handleGoogleSignIn = async () => {
		loading = true;
		const result = await signInWithGoogle();
		
		if (result.success) {
			goto('/dashboard');
		} else {
			error = result.error;
		}
		
		loading = false;
	};
	
	const handleGithubSignIn = async () => {
		loading = true;
		const result = await signInWithGithub();
		
		if (result.success) {
			goto('/dashboard');
		} else {
			error = result.error;
		}
		
		loading = false;
	};
</script>

<div class="space-y-6">
	<div class="text-center space-y-2">
		<h1 class="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
		<p class="text-gray-600 dark:text-gray-400">Sign in to your CodeVault account</p>
	</div>
	
	{#if error}
		<div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
			<p class="text-red-600 dark:text-red-400 text-sm">{error}</p>
		</div>
	{/if}
	
	<!-- Social Sign In -->
	<div class="space-y-3">
		<button 
			on:click={handleGoogleSignIn}
			disabled={loading}
			class="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
		>
			<svg class="w-5 h-5" viewBox="0 0 24 24">
				<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
				<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
				<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
				<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
			</svg>
			<span>Continue with Google</span>
		</button>
		
		<button 
			on:click={handleGithubSignIn}
			disabled={loading}
			class="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
		>
			<Github class="w-5 h-5" />
			<span>Continue with GitHub</span>
		</button>
	</div>
	
	<div class="relative">
		<div class="absolute inset-0 flex items-center">
			<div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
		</div>
		<div class="relative flex justify-center text-sm">
			<span class="px-2 bg-white dark:bg-gray-900 text-gray-500">Or continue with email</span>
		</div>
	</div>
	
	<!-- Email Sign In Form -->
	<form on:submit={handleSubmit} class="space-y-4">
		<div class="space-y-2">
			<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
				Email address
			</label>
			<div class="relative">
				<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<Mail class="h-5 w-5 text-gray-400" />
				</div>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					class="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
					placeholder="Enter your email"
				/>
			</div>
		</div>
		
		<div class="space-y-2">
			<label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
				Password
			</label>
			<div class="relative">
				<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<Lock class="h-5 w-5 text-gray-400" />
				</div>
				<input
					id="password"
					type={showPassword ? 'text' : 'password'}
					bind:value={password}
					required
					class="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
					placeholder="Enter your password"
				/>
				<button
					type="button"
					on:click={() => showPassword = !showPassword}
					class="absolute inset-y-0 right-0 pr-3 flex items-center"
				>
					{#if showPassword}
						<EyeOff class="h-5 w-5 text-gray-400 hover:text-gray-600" />
					{:else}
						<Eye class="h-5 w-5 text-gray-400 hover:text-gray-600" />
					{/if}
				</button>
			</div>
		</div>
		
		<div class="flex items-center justify-between">
			<label class="flex items-center">
				<input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
				<span class="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
			</label>
			<a href="/auth/reset-password" class="text-sm text-blue-600 hover:text-blue-500">
				Forgot password?
			</a>
		</div>
		
		<button
			type="submit"
			disabled={loading}
			class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
		>
			{#if loading}
				<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
			{:else}
				Sign in
			{/if}
		</button>
	</form>
	
	<p class="text-center text-sm text-gray-600 dark:text-gray-400">
		Don't have an account?
		<a href="/auth/signup" class="font-medium text-blue-600 hover:text-blue-500">
			Sign up
		</a>
	</p>
</div>