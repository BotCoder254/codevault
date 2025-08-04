<script>
	// @ts-nocheck
	import { createEventDispatcher } from 'svelte';
	import { X, Download, Upload, FileText, Github, CheckCircle, AlertCircle } from 'lucide-svelte';
	import { exportSnippets, importSnippets, exportProgress, importProgress, isExporting, isImporting } from '$lib/stores/importExport.js';
	import { fade, scale, fly } from 'svelte/transition';
	
	export let isOpen = false;
	export let activeTab = 'export'; // 'export' or 'import'
	
	const dispatch = createEventDispatcher();
	
	let fileInput;
	let dragOver = false;
	let result = null;
	let error = null;
	
	const handleClose = () => {
		dispatch('close');
		result = null;
		error = null;
	};
	
	const handleBackdropClick = (e) => {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	};
	
	const handleExport = async () => {
		error = null;
		result = null;
		
		const exportResult = await exportSnippets();
		
		if (exportResult.success) {
			result = {
				type: 'export',
				message: `Successfully exported ${exportResult.count} snippets!`,
				count: exportResult.count
			};
		} else {
			error = exportResult.error;
		}
	};
	
	const handleFileSelect = (e) => {
		const file = e.target.files[0];
		if (file) {
			handleImport(file);
		}
	};
	
	const handleDrop = (e) => {
		e.preventDefault();
		dragOver = false;
		
		const file = e.dataTransfer.files[0];
		if (file && file.type === 'application/json') {
			handleImport(file);
		} else {
			error = 'Please drop a valid JSON file';
		}
	};
	
	const handleImport = async (file) => {
		error = null;
		result = null;
		
		const importResult = await importSnippets(file);
		
		if (importResult.success) {
			result = {
				type: 'import',
				message: `Successfully imported ${importResult.imported} snippets!`,
				imported: importResult.imported,
				skipped: importResult.skipped
			};
		} else {
			error = importResult.error;
		}
	};
	
	const handleDragOver = (e) => {
		e.preventDefault();
		dragOver = true;
	};
	
	const handleDragLeave = (e) => {
		e.preventDefault();
		dragOver = false;
	};
</script>

{#if isOpen}
	<div 
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
		on:click={handleBackdropClick}
		transition:fade={{ duration: 200 }}
	>
		<div 
			class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
			transition:scale={{ duration: 200, start: 0.95 }}
		>
			<!-- Header -->
			<div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
					Import & Export Snippets
				</h2>
				<button 
					on:click={handleClose}
					class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
				>
					<X class="w-5 h-5 text-gray-500" />
				</button>
			</div>
			
			<!-- Tabs -->
			<div class="flex border-b border-gray-200 dark:border-gray-700">
				<button
					on:click={() => { activeTab = 'export'; result = null; error = null; }}
					class="flex-1 px-6 py-3 text-sm font-medium transition-colors {activeTab === 'export' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
				>
					<div class="flex items-center justify-center space-x-2">
						<Download class="w-4 h-4" />
						<span>Export</span>
					</div>
				</button>
				<button
					on:click={() => { activeTab = 'import'; result = null; error = null; }}
					class="flex-1 px-6 py-3 text-sm font-medium transition-colors {activeTab === 'import' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
				>
					<div class="flex items-center justify-center space-x-2">
						<Upload class="w-4 h-4" />
						<span>Import</span>
					</div>
				</button>
			</div>
			
			<!-- Content -->
			<div class="p-6">
				{#if activeTab === 'export'}
					<!-- Export Tab -->
					<div class="space-y-6">
						<div class="text-center">
							<div class="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 {$isExporting ? 'animate-pulse' : ''}">
								<Download class="w-8 h-8 text-blue-600 dark:text-blue-400 {$isExporting ? 'animate-bounce' : ''}" />
							</div>
							<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
								Export Your Snippets
							</h3>
							<p class="text-gray-600 dark:text-gray-400">
								Download all your snippets as a JSON file for backup or sharing
							</p>
						</div>
						
						{#if $isExporting}
							<!-- Export Progress -->
							<div class="space-y-3" transition:fly={{ y: 20, duration: 300 }}>
								<div class="flex items-center justify-between text-sm">
									<span class="text-gray-600 dark:text-gray-400">Exporting snippets...</span>
									<span class="text-blue-600 dark:text-blue-400 font-medium">{Math.round($exportProgress)}%</span>
								</div>
								<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
									<div 
										class="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
										style="width: {$exportProgress}%"
									></div>
								</div>
							</div>
						{:else}
							<!-- Export Button -->
							<button
								on:click={handleExport}
								class="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105"
							>
								<FileText class="w-5 h-5" />
								<span class="font-medium">Export as JSON</span>
							</button>
						{/if}
						
						<!-- GitHub Gist Option (Placeholder) -->
						<div class="border-t border-gray-200 dark:border-gray-700 pt-6">
							<button
								disabled
								class="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed"
							>
								<Github class="w-5 h-5" />
								<span class="font-medium">Sync with GitHub Gist (Coming Soon)</span>
							</button>
						</div>
					</div>
				{:else}
					<!-- Import Tab -->
					<div class="space-y-6">
						<div class="text-center">
							<div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 {$isImporting ? 'animate-pulse' : ''}">
								<Upload class="w-8 h-8 text-green-600 dark:text-green-400 {$isImporting ? 'animate-bounce' : ''}" />
							</div>
							<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
								Import Snippets
							</h3>
							<p class="text-gray-600 dark:text-gray-400">
								Upload a JSON file to import snippets into your collection
							</p>
						</div>
						
						{#if $isImporting}
							<!-- Import Progress -->
							<div class="space-y-3" transition:fly={{ y: 20, duration: 300 }}>
								<div class="flex items-center justify-between text-sm">
									<span class="text-gray-600 dark:text-gray-400">Importing snippets...</span>
									<span class="text-green-600 dark:text-green-400 font-medium">{Math.round($importProgress)}%</span>
								</div>
								<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
									<div 
										class="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full transition-all duration-300 ease-out"
										style="width: {$importProgress}%"
									></div>
								</div>
							</div>
						{:else}
							<!-- File Drop Zone -->
							<div
								class="border-2 border-dashed rounded-lg p-8 text-center transition-all {dragOver ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}"
								on:drop={handleDrop}
								on:dragover={handleDragOver}
								on:dragleave={handleDragLeave}
							>
								<FileText class="w-12 h-12 text-gray-400 mx-auto mb-4 {dragOver ? 'animate-bounce' : ''}" />
								<p class="text-gray-600 dark:text-gray-400 mb-4">
									Drag and drop your JSON file here, or click to browse
								</p>
								<input
									bind:this={fileInput}
									type="file"
									accept=".json"
									on:change={handleFileSelect}
									class="hidden"
								/>
								<button
									on:click={() => fileInput?.click()}
									class="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:scale-105"
								>
									Choose File
								</button>
							</div>
						{/if}
					</div>
				{/if}
				
				<!-- Results -->
				{#if result}
					<div class="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg" transition:fly={{ y: 20, duration: 300 }}>
						<div class="flex items-center space-x-3">
							<CheckCircle class="w-5 h-5 text-green-600 dark:text-green-400 animate-pulse" />
							<div>
								<p class="text-green-800 dark:text-green-300 font-medium">
									{result.message}
								</p>
								{#if result.type === 'import' && result.skipped > 0}
									<p class="text-green-600 dark:text-green-400 text-sm mt-1">
										{result.skipped} snippets were skipped due to missing required fields
									</p>
								{/if}
							</div>
						</div>
					</div>
				{/if}
				
				<!-- Errors -->
				{#if error}
					<div class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg" transition:fly={{ y: 20, duration: 300 }}>
						<div class="flex items-center space-x-3">
							<AlertCircle class="w-5 h-5 text-red-600 dark:text-red-400" />
							<p class="text-red-800 dark:text-red-300 font-medium">
								{error}
							</p>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}