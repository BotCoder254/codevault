<script>
	// @ts-nocheck
	import { createEventDispatcher, onMount } from 'svelte';
	import { Search, Plus, X, Link as LinkIcon, Code2, Eye, Download } from 'lucide-svelte';
	import { snippets } from '$lib/stores/snippets.js';
	import { linkedComponents, loadLinkedComponents, addComponentLink, removeComponentLink, generateMergedCode } from '$lib/stores/components.js';
	import { user } from '$lib/stores/auth.js';
	import MonacoEditor from './MonacoEditor.svelte';
	import { fade, fly, scale } from 'svelte/transition';
	
	export let snippet = null;
	export let isOpen = false;
	
	const dispatch = createEventDispatcher();
	
	let searchQuery = '';
	let showPreview = false;
	let previewComponent = null;
	let mergedCode = '';
	
	// Filter available components (exclude current snippet and already linked)
	$: availableComponents = $snippets.filter(s => 
		s.id !== snippet?.id && 
		s.userId === $user?.uid &&
		!snippet?.linkedComponents?.includes(s.id) &&
		(searchQuery === '' || 
			s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
			s.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
		)
	);
	
	// Load linked components when snippet changes
	$: if (snippet?.linkedComponents) {
		loadLinkedComponents(snippet.linkedComponents);
	}
	
	// Generate merged code when components change
	$: if (snippet && $linkedComponents.length > 0) {
		mergedCode = generateMergedCode(snippet, $linkedComponents);
	}
	
	const handleClose = () => {
		dispatch('close');
		showPreview = false;
		previewComponent = null;
		searchQuery = '';
	};
	
	const handleBackdropClick = (e) => {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	};
	
	const handleAddComponent = async (component) => {
		const result = await addComponentLink(snippet.id, component.id);
		if (result.success) {
			// Reload linked components
			const updatedComponents = [...(snippet.linkedComponents || []), component.id];
			loadLinkedComponents(updatedComponents);
			dispatch('updated');
		}
	};
	
	const handleRemoveComponent = async (componentId) => {
		const result = await removeComponentLink(snippet.id, componentId);
		if (result.success) {
			// Reload linked components
			const updatedComponents = (snippet.linkedComponents || []).filter(id => id !== componentId);
			loadLinkedComponents(updatedComponents);
			dispatch('updated');
		}
	};
	
	const handlePreview = (component) => {
		previewComponent = component;
		showPreview = true;
	};
	
	const handleDownloadMerged = () => {
		if (!mergedCode) return;
		
		const blob = new Blob([mergedCode], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${snippet.title}-merged.${snippet.language}`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
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

{#if isOpen}
	<div 
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
		on:click={handleBackdropClick}
		transition:fade={{ duration: 200 }}
	>
		<div 
			class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex"
			transition:scale={{ duration: 200, start: 0.95 }}
		>
			<!-- Component Management Sidebar -->
			<div class="w-1/2 border-r border-gray-200 dark:border-gray-700 flex flex-col">
				<!-- Header -->
				<div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
						<LinkIcon class="w-5 h-5" />
						<span>Link Components</span>
					</h3>
					<button 
						on:click={handleClose}
						class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
					>
						<X class="w-4 h-4 text-gray-500" />
					</button>
				</div>
				
				<!-- Search -->
				<div class="p-4 border-b border-gray-200 dark:border-gray-700">
					<div class="relative">
						<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
						<input
							type="text"
							bind:value={searchQuery}
							placeholder="Search components..."
							class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
						/>
					</div>
				</div>
				
				<!-- Linked Components -->
				{#if $linkedComponents.length > 0}
					<div class="p-4 border-b border-gray-200 dark:border-gray-700">
						<h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Linked Components</h4>
						<div class="space-y-2">
							{#each $linkedComponents as component (component.id)}
								<div 
									class="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
									in:fly={{ x: -20, duration: 300 }}
								>
									<div class="flex items-center space-x-3 flex-1 min-w-0">
										<Code2 class="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
										<div class="min-w-0 flex-1">
											<p class="text-sm font-medium text-blue-900 dark:text-blue-100 truncate">
												{component.title}
											</p>
											<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getLanguageColor(component.language)} mt-1">
												{component.language}
											</span>
										</div>
									</div>
									<div class="flex items-center space-x-1">
										<button
											on:click={() => handlePreview(component)}
											class="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition-colors"
											title="Preview component"
										>
											<Eye class="w-4 h-4 text-blue-600 dark:text-blue-400" />
										</button>
										<button
											on:click={() => handleRemoveComponent(component.id)}
											class="p-1 hover:bg-red-200 dark:hover:bg-red-800 rounded transition-colors"
											title="Remove component"
										>
											<X class="w-4 h-4 text-red-600 dark:text-red-400" />
										</button>
									</div>
								</div>
							{/each}
						</div>
						
						{#if mergedCode}
							<button
								on:click={handleDownloadMerged}
								class="w-full mt-3 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
							>
								<Download class="w-4 h-4" />
								<span>Download Merged Code</span>
							</button>
						{/if}
					</div>
				{/if}
				
				<!-- Available Components -->
				<div class="flex-1 overflow-y-auto p-4">
					<h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Available Components</h4>
					{#if availableComponents.length > 0}
						<div class="space-y-2">
							{#each availableComponents as component (component.id)}
								<div 
									class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
									in:fly={{ x: -20, duration: 300 }}
								>
									<div class="flex items-center space-x-3 flex-1 min-w-0">
										<Code2 class="w-4 h-4 text-gray-500 flex-shrink-0" />
										<div class="min-w-0 flex-1">
											<p class="text-sm font-medium text-gray-900 dark:text-white truncate">
												{component.title}
											</p>
											{#if component.description}
												<p class="text-xs text-gray-500 dark:text-gray-400 truncate">
													{component.description}
												</p>
											{/if}
											<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getLanguageColor(component.language)} mt-1">
												{component.language}
											</span>
										</div>
									</div>
									<div class="flex items-center space-x-1">
										<button
											on:click={() => handlePreview(component)}
											class="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
											title="Preview component"
										>
											<Eye class="w-4 h-4 text-gray-500" />
										</button>
										<button
											on:click={() => handleAddComponent(component)}
											class="p-1 hover:bg-green-200 dark:hover:bg-green-800 rounded transition-colors"
											title="Add component"
										>
											<Plus class="w-4 h-4 text-green-600 dark:text-green-400" />
										</button>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="text-center py-8">
							<Code2 class="w-12 h-12 text-gray-400 mx-auto mb-3" />
							<p class="text-gray-500 dark:text-gray-400 text-sm">
								{searchQuery ? 'No components found' : 'No available components'}
							</p>
						</div>
					{/if}
				</div>
			</div>
			
			<!-- Preview Panel -->
			<div class="flex-1 flex flex-col">
				{#if showPreview && previewComponent}
					<!-- Preview Header -->
					<div class="p-4 border-b border-gray-200 dark:border-gray-700">
						<div class="flex items-center justify-between">
							<div>
								<h4 class="text-lg font-semibold text-gray-900 dark:text-white">
									{previewComponent.title}
								</h4>
								{#if previewComponent.description}
									<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
										{previewComponent.description}
									</p>
								{/if}
							</div>
							<button
								on:click={() => showPreview = false}
								class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
							>
								<X class="w-4 h-4 text-gray-500" />
							</button>
						</div>
					</div>
					
					<!-- Preview Code -->
					<div class="flex-1 p-4">
						<MonacoEditor 
							value={previewComponent.code} 
							language={previewComponent.language} 
							height="100%" 
							readonly={true}
						/>
					</div>
				{:else if mergedCode}
					<!-- Merged Code Preview -->
					<div class="p-4 border-b border-gray-200 dark:border-gray-700">
						<h4 class="text-lg font-semibold text-gray-900 dark:text-white">
							Merged Code Preview
						</h4>
						<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
							Combined code with all linked components
						</p>
					</div>
					
					<div class="flex-1 p-4">
						<MonacoEditor 
							value={mergedCode} 
							language={snippet.language} 
							height="100%" 
							readonly={true}
						/>
					</div>
				{:else}
					<!-- No Preview -->
					<div class="flex-1 flex items-center justify-center">
						<div class="text-center">
							<LinkIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
							<h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Component Linking</h4>
							<p class="text-gray-500 dark:text-gray-400 max-w-sm">
								Link reusable components to this snippet. Preview components or view the merged code.
							</p>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}