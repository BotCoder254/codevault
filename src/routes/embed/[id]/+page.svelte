<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { db } from '$lib/firebase.js';
	import { doc, getDoc } from 'firebase/firestore';
	import MonacoEditor from '$lib/components/MonacoEditor.svelte';
	import { Code2, Copy, ExternalLink, User, Calendar, Tag } from 'lucide-svelte';
	
	let snippet = null;
	let loading = true;
	let error = null;
	let copied = false;
	
	$: snippetId = $page.params.id;
	
	onMount(async () => {
		if (snippetId) {
			await loadSnippet(snippetId);
		}
	});
	
	const loadSnippet = async (id) => {
		try {
			loading = true;
			const docRef = doc(db, 'snippets', id);
			const docSnap = await getDoc(docRef);
			
			if (docSnap.exists()) {
				const data = docSnap.data();
				// Only show public snippets
				if (data.visibility === 'public') {
					snippet = {
						id: docSnap.id,
						...data
					};
				} else {
					error = 'This snippet is not publicly available';
				}
			} else {
				error = 'Snippet not found';
			}
		} catch (err) {
			error = 'Failed to load snippet';
			console.error('Error loading snippet:', err);
		} finally {
			loading = false;
		}
	};
	
	const copyCode = async () => {
		if (snippet?.code) {
			try {
				await navigator.clipboard.writeText(snippet.code);
				copied = true;
				setTimeout(() => copied = false, 2000);
			} catch (err) {
				console.error('Failed to copy code:', err);
			}
		}
	};
	
	const formatDate = (date) => {
		if (!date) return '';
		const d = date.toDate ? date.toDate() : new Date(date);
		return d.toLocaleDateString('en-US', { 
			year: 'numeric', 
			month: 'short', 
			day: 'numeric' 
		});
	};
	
	const getLanguageColor = (language) => {
		const colors = {
			javascript: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
			typescript: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
			python: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
			java: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
			csharp: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
		};
		return colors[language] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
	};
</script>

<svelte:head>
	<title>{snippet ? `${snippet.title} - CodeVault` : 'CodeVault Embed'}</title>
	<meta name="description" content={snippet ? snippet.description : 'Code snippet from CodeVault'} />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	{#if loading}
		<div class="flex items-center justify-center min-h-screen">
			<div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
		</div>
	{:else if error}
		<div class="flex items-center justify-center min-h-screen">
			<div class="text-center">
				<Code2 class="w-16 h-16 text-gray-400 mx-auto mb-4" />
				<h1 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Snippet Not Available</h1>
				<p class="text-gray-600 dark:text-gray-400">{error}</p>
			</div>
		</div>
	{:else if snippet}
		<div class="max-w-4xl mx-auto p-4">
			<!-- Header -->
			<div class="bg-white dark:bg-gray-800 rounded-t-xl border border-gray-200 dark:border-gray-700 p-4">
				<div class="flex items-start justify-between">
					<div class="flex-1 min-w-0">
						<h1 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
							{snippet.title}
						</h1>
						{#if snippet.description}
							<p class="text-gray-600 dark:text-gray-400 mb-3">
								{snippet.description}
							</p>
						{/if}
						
						<!-- Metadata -->
						<div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
							<div class="flex items-center space-x-1">
								<User class="w-4 h-4" />
								<span>Anonymous User</span>
							</div>
							<div class="flex items-center space-x-1">
								<Calendar class="w-4 h-4" />
								<span>{formatDate(snippet.createdAt)}</span>
							</div>
							<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getLanguageColor(snippet.language)}">
								{snippet.language}
							</span>
						</div>
					</div>
					
					<!-- Actions -->
					<div class="flex items-center space-x-2 ml-4">
						<button
							on:click={copyCode}
							class="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
						>
							<Copy class="w-4 h-4" />
							<span>{copied ? 'Copied!' : 'Copy'}</span>
						</button>
						<a
							href="/"
							target="_blank"
							class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
						>
							<ExternalLink class="w-4 h-4" />
							<span>CodeVault</span>
						</a>
					</div>
				</div>
			</div>
			
			<!-- Code Editor -->
			<div class="bg-white dark:bg-gray-800 rounded-b-xl border-x border-b border-gray-200 dark:border-gray-700">
				<MonacoEditor 
					value={snippet.code} 
					language={snippet.language} 
					height="400px" 
					readonly={true}
				/>
			</div>
			
			<!-- Tags -->
			{#if snippet.tags && snippet.tags.length > 0}
				<div class="mt-4 flex flex-wrap gap-2">
					{#each snippet.tags as tag}
						<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
							<Tag class="w-3 h-3 mr-1" />
							{tag}
						</span>
					{/each}
				</div>
			{/if}
			
			<!-- Powered by -->
			<div class="mt-6 text-center">
				<a 
					href="/" 
					target="_blank"
					class="inline-flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
				>
					<Code2 class="w-4 h-4" />
					<span>Powered by CodeVault</span>
				</a>
			</div>
		</div>
	{/if}
</div>