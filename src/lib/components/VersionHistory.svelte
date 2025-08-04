<script>
	// @ts-nocheck
	import { createEventDispatcher, onMount } from 'svelte';
	import { X, Clock, User, RotateCcw, Eye, GitBranch } from 'lucide-svelte';
	import { versions, loadingVersions, loadVersionHistory, revertToVersion } from '$lib/stores/versions.js';
	import MonacoEditor from './MonacoEditor.svelte';
	import { fade, fly, scale } from 'svelte/transition';
	
	export let isOpen = false;
	export let snippet = null;
	
	const dispatch = createEventDispatcher();
	
	let selectedVersion = null;
	let showDiff = false;
	let reverting = false;
	
	$: if (isOpen && snippet) {
		loadVersionHistory(snippet.id);
	}
	
	const handleClose = () => {
		dispatch('close');
		selectedVersion = null;
		showDiff = false;
	};
	
	const handleBackdropClick = (e) => {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	};
	
	const handleViewVersion = (version) => {
		selectedVersion = version;
		showDiff = false;
	};
	
	const handleShowDiff = (version) => {
		selectedVersion = version;
		showDiff = true;
	};
	
	const handleRevert = async (version) => {
		if (!confirm(`Are you sure you want to revert to this version from ${version.createdAt.toLocaleDateString()}?`)) {
			return;
		}
		
		reverting = true;
		
		const result = await revertToVersion(snippet.id, version);
		
		if (result.success) {
			dispatch('reverted');
			handleClose();
		} else {
			alert('Failed to revert: ' + result.error);
		}
		
		reverting = false;
	};
	
	const formatDate = (date) => {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	};
	
	const getTimeDiff = (date) => {
		const now = new Date();
		const diff = now - date;
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);
		
		if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
		if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
		if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
		return 'Just now';
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
			<!-- Version List Sidebar -->
			<div class="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
				<!-- Header -->
				<div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
						<GitBranch class="w-5 h-5" />
						<span>Version History</span>
					</h3>
					<button 
						on:click={handleClose}
						class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
					>
						<X class="w-4 h-4 text-gray-500" />
					</button>
				</div>
				
				<!-- Version List -->
				<div class="flex-1 overflow-y-auto p-4">
					{#if $loadingVersions}
						<div class="space-y-3">
							{#each Array(5) as _}
								<div class="animate-pulse">
									<div class="flex items-center space-x-3">
										<div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
										<div class="flex-1 space-y-2">
											<div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
											<div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{:else if $versions.length > 0}
						<!-- Current Version -->
						<div class="mb-4">
							<div 
								class="p-3 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
								on:click={() => handleViewVersion({ ...snippet, createdAt: new Date(), changeDescription: 'Current version', createdByName: 'You' })}
							>
								<div class="flex items-center space-x-3">
									<div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
										<Clock class="w-4 h-4 text-white" />
									</div>
									<div class="flex-1 min-w-0">
										<p class="text-sm font-medium text-blue-900 dark:text-blue-100">Current Version</p>
										<p class="text-xs text-blue-600 dark:text-blue-300">Active now</p>
									</div>
								</div>
							</div>
						</div>
						
						<!-- Version Timeline -->
						<div class="relative">
							<!-- Timeline Line -->
							<div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
							
							<div class="space-y-4">
								{#each $versions as version, index (version.id)}
									<div 
										class="relative flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all {selectedVersion?.id === version.id ? 'bg-gray-100 dark:bg-gray-700 ring-2 ring-blue-500' : ''}"
										on:click={() => handleViewVersion(version)}
										in:fly={{ x: -20, duration: 300, delay: index * 50 }}
									>
										<!-- Timeline Dot -->
										<div class="absolute left-4 w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full transform -translate-x-1/2"></div>
										
										<!-- Version Info -->
										<div class="ml-6 flex-1 min-w-0">
											<div class="flex items-center justify-between">
												<p class="text-sm font-medium text-gray-900 dark:text-white truncate">
													{version.changeDescription}
												</p>
												<div class="flex items-center space-x-1">
													<button
														on:click|stopPropagation={() => handleShowDiff(version)}
														class="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
														title="View diff"
													>
														<Eye class="w-3 h-3 text-gray-500" />
													</button>
													<button
														on:click|stopPropagation={() => handleRevert(version)}
														disabled={reverting}
														class="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors disabled:opacity-50"
														title="Revert to this version"
													>
														<RotateCcw class="w-3 h-3 text-gray-500" />
													</button>
												</div>
											</div>
											<div class="flex items-center space-x-2 mt-1">
												<User class="w-3 h-3 text-gray-400" />
												<span class="text-xs text-gray-500 dark:text-gray-400">{version.createdByName}</span>
												<span class="text-xs text-gray-400">•</span>
												<span class="text-xs text-gray-500 dark:text-gray-400">{getTimeDiff(version.createdAt)}</span>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{:else}
						<div class="text-center py-8">
							<GitBranch class="w-12 h-12 text-gray-400 mx-auto mb-3" />
							<p class="text-gray-500 dark:text-gray-400 text-sm">No version history available</p>
						</div>
					{/if}
				</div>
			</div>
			
			<!-- Version Content -->
			<div class="flex-1 flex flex-col">
				{#if selectedVersion}
					<!-- Version Header -->
					<div class="p-4 border-b border-gray-200 dark:border-gray-700">
						<div class="flex items-center justify-between">
							<div>
								<h4 class="text-lg font-semibold text-gray-900 dark:text-white">
									{selectedVersion.title}
								</h4>
								<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
									{selectedVersion.changeDescription} • {formatDate(selectedVersion.createdAt)}
								</p>
							</div>
							<div class="flex items-center space-x-2">
								<button
									on:click={() => showDiff = !showDiff}
									class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
								>
									{showDiff ? 'View Code' : 'Show Diff'}
								</button>
								{#if selectedVersion.id}
									<button
										on:click={() => handleRevert(selectedVersion)}
										disabled={reverting}
										class="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-1"
									>
										{#if reverting}
											<div class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
										{:else}
											<RotateCcw class="w-3 h-3" />
										{/if}
										<span>Revert</span>
									</button>
								{/if}
							</div>
						</div>
					</div>
					
					<!-- Code Editor -->
					<div class="flex-1 p-4">
						{#if showDiff && snippet}
							<!-- Diff View -->
							<div class="grid grid-cols-2 gap-4 h-full">
								<div>
									<h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Version</h5>
									<MonacoEditor 
										value={snippet.code} 
										language={snippet.language} 
										height="100%" 
										readonly={true}
									/>
								</div>
								<div>
									<h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selected Version</h5>
									<MonacoEditor 
										value={selectedVersion.code} 
										language={selectedVersion.language} 
										height="100%" 
										readonly={true}
									/>
								</div>
							</div>
						{:else}
							<!-- Single View -->
							<MonacoEditor 
								value={selectedVersion.code} 
								language={selectedVersion.language} 
								height="100%" 
								readonly={true}
							/>
						{/if}
					</div>
				{:else}
					<!-- No Version Selected -->
					<div class="flex-1 flex items-center justify-center">
						<div class="text-center">
							<GitBranch class="w-16 h-16 text-gray-400 mx-auto mb-4" />
							<h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a Version</h4>
							<p class="text-gray-500 dark:text-gray-400">Choose a version from the timeline to view its content</p>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}