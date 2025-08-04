<script>
	// @ts-nocheck
	import { createEventDispatcher } from 'svelte';
	import { X, Save, Tag, Globe, Lock, Users } from 'lucide-svelte';
	import MonacoEditor from './MonacoEditor.svelte';
	import TagInput from './TagInput.svelte';
	import { createSnippet, updateSnippet } from '$lib/stores/snippets.js';
	import { addMultipleTagsUsage } from '$lib/stores/tags.js';
	import { saveVersion } from '$lib/stores/versions.js';
	import { fade, scale } from 'svelte/transition';
	
	export let isOpen = false;
	export let snippet = null; // null for create, object for edit
	
	const dispatch = createEventDispatcher();
	
	let title = '';
	let description = '';
	let code = '';
	let language = 'javascript';
	let tags = [];
	let visibility = 'private';
	let loading = false;
	let error = '';
	
	const languages = [
		'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'c',
		'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'dart', 'html',
		'css', 'scss', 'json', 'xml', 'yaml', 'markdown', 'sql', 'shell'
	];
	
	const visibilityOptions = [
		{ value: 'private', label: 'Private', icon: Lock, description: 'Only you can see this' },
		{ value: 'public', label: 'Public', icon: Globe, description: 'Anyone can see this' },
		{ value: 'team', label: 'Team', icon: Users, description: 'Your team can see this' }
	];
	
	// Initialize form when snippet changes
	$: if (snippet) {
		title = snippet.title || '';
		description = snippet.description || '';
		code = snippet.code || '';
		language = snippet.language || 'javascript';
		tags = snippet.tags || [];
		visibility = snippet.visibility || 'private';
	} else {
		// Reset form for new snippet
		title = '';
		description = '';
		code = '';
		language = 'javascript';
		tags = [];
		visibility = 'private';
	}
	
	const handleTagsChanged = (event) => {
		tags = event.detail;
	};
	
	const handleSubmit = async (e) => {
		e.preventDefault();
		loading = true;
		error = '';
		
		const snippetData = {
			title,
			description,
			code,
			language,
			tags,
			visibility
		};
		
		let result;
		if (snippet) {
			// Save version before updating
			await saveVersion(snippet.id, snippet, 'Manual edit');
			result = await updateSnippet(snippet.id, snippetData);
		} else {
			result = await createSnippet(snippetData);
		}
		
		if (result.success) {
			// Update tag usage counts
			if (tags.length > 0) {
				await addMultipleTagsUsage(tags);
			}
			
			// Save initial version for new snippets
			if (!snippet && result.id) {
				await saveVersion(result.id, snippetData, 'Initial version');
			}
			
			dispatch('close');
			dispatch('saved');
		} else {
			error = result.error;
		}
		
		loading = false;
	};
	
	const handleClose = () => {
		dispatch('close');
	};
	
	const handleBackdropClick = (e) => {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	};
</script>

{#if isOpen}
	<div 
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
		on:click={handleBackdropClick}
		transition:fade={{ duration: 200 }}
	>
		<div 
			class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
			transition:scale={{ duration: 200, start: 0.95 }}
		>
			<!-- Header -->
			<div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
					{snippet ? 'Edit Snippet' : 'Create New Snippet'}
				</h2>
				<button 
					on:click={handleClose}
					class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
				>
					<X class="w-5 h-5 text-gray-500" />
				</button>
			</div>
			
			<!-- Content -->
			<div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
				{#if error}
					<div class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
						<p class="text-red-600 dark:text-red-400 text-sm">{error}</p>
					</div>
				{/if}
				
				<form on:submit={handleSubmit} class="space-y-6">
					<!-- Title and Language -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Title
							</label>
							<input
								id="title"
								type="text"
								bind:value={title}
								required
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
								placeholder="Enter snippet title"
							/>
						</div>
						
						<div>
							<label for="language" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Language
							</label>
							<select
								id="language"
								bind:value={language}
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
							>
								{#each languages as lang}
									<option value={lang}>{lang}</option>
								{/each}
							</select>
						</div>
					</div>
					
					<!-- Description -->
					<div>
						<label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Description
						</label>
						<textarea
							id="description"
							bind:value={description}
							rows="3"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
							placeholder="Describe what this snippet does"
						></textarea>
					</div>
					
					<!-- Tags -->
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Tags
						</label>
						<TagInput bind:tags on:tagsChanged={handleTagsChanged} />
					</div>
					
					<!-- Visibility -->
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Visibility
						</label>
						<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
							{#each visibilityOptions as option}
								<label class="relative">
									<input
										type="radio"
										bind:group={visibility}
										value={option.value}
										class="sr-only"
									/>
									<div class="p-3 border-2 rounded-lg cursor-pointer transition-all {visibility === option.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}">
										<div class="flex items-center space-x-2">
											<svelte:component this={option.icon} class="w-4 h-4 text-gray-600 dark:text-gray-400" />
											<span class="font-medium text-gray-900 dark:text-white">{option.label}</span>
										</div>
										<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{option.description}</p>
									</div>
								</label>
							{/each}
						</div>
					</div>
					
					<!-- Code Editor -->
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Code
						</label>
						<MonacoEditor bind:value={code} {language} height="300px" />
					</div>
					
					<!-- Actions -->
					<div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
						<button
							type="button"
							on:click={handleClose}
							class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading}
							class="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all flex items-center space-x-2"
						>
							{#if loading}
								<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
							{:else}
								<Save class="w-4 h-4" />
							{/if}
							<span>{snippet ? 'Update' : 'Create'} Snippet</span>
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}