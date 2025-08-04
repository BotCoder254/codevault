<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { Plus, Search, Filter, Tag, X, Download, Upload } from 'lucide-svelte';
	import { 
		filteredSnippets, 
		loading, 
		searchQuery, 
		selectedTags, 
		selectedLanguage,
		allTags,
		allLanguages
	} from '$lib/stores/snippets.js';
	import SnippetCard from '$lib/components/SnippetCard.svelte';
	import SnippetModal from '$lib/components/SnippetModal.svelte';
	import MonacoEditor from '$lib/components/MonacoEditor.svelte';
	import ImportExportModal from '$lib/components/ImportExportModal.svelte';
	import VersionHistory from '$lib/components/VersionHistory.svelte';
	import ComponentLinker from '$lib/components/ComponentLinker.svelte';
	import EmbedGenerator from '$lib/components/EmbedGenerator.svelte';
	import { fade } from 'svelte/transition';
	
	let showCreateModal = false;
	let showViewModal = false;
	let showImportExportModal = false;
	let showVersionHistory = false;
	let showComponentLinker = false;
	let showEmbedGenerator = false;
	let editingSnippet = null;
	let viewingSnippet = null;
	let versionSnippet = null;
	let componentSnippet = null;
	let embedSnippet = null;
	let showFilters = false;
	let importExportTab = 'export';
	
	const handleCreateSnippet = () => {
		editingSnippet = null;
		showCreateModal = true;
	};
	
	const handleEditSnippet = (event) => {
		editingSnippet = event.detail;
		showCreateModal = true;
	};
	
	const handleViewSnippet = (event) => {
		viewingSnippet = event.detail;
		showViewModal = true;
	};
	
	const handleVersionHistory = (event) => {
		versionSnippet = event.detail;
		showVersionHistory = true;
	};
	
	const handleComponentLink = (event) => {
		componentSnippet = event.detail;
		showComponentLinker = true;
	};
	
	const handleEmbed = (event) => {
		embedSnippet = event.detail;
		showEmbedGenerator = true;
	};
	
	const handleModalClose = () => {
		showCreateModal = false;
		showViewModal = false;
		showEmbedGenerator = false;
		editingSnippet = null;
		viewingSnippet = null;
		embedSnippet = null;
	};
	
	const handleVersionClose = () => {
		showVersionHistory = false;
		versionSnippet = null;
	};
	
	const handleComponentClose = () => {
		showComponentLinker = false;
		componentSnippet = null;
	};
	
	const handleEmbedClose = () => {
		showEmbedGenerator = false;
		embedSnippet = null;
	};
	
	const handleImportExportClose = () => {
		showImportExportModal = false;
	};
	
	const handleExport = () => {
		importExportTab = 'export';
		showImportExportModal = true;
	};
	
	const handleImport = () => {
		importExportTab = 'import';
		showImportExportModal = true;
	};
	
	const toggleTag = (tag) => {
		if ($selectedTags.includes(tag)) {
			selectedTags.update(tags => tags.filter(t => t !== tag));
		} else {
			selectedTags.update(tags => [...tags, tag]);
		}
	};
	
	const clearFilters = () => {
		searchQuery.set('');
		selectedTags.set([]);
		selectedLanguage.set('');
	};
	
	const hasActiveFilters = () => {
		return $searchQuery || $selectedTags.length > 0 || $selectedLanguage;
	};
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Code Snippets</h1>
			<p class="text-gray-600 dark:text-gray-400">Organize and manage your code snippets</p>
		</div>
		<div class="flex items-center space-x-3">
			<!-- Import/Export Buttons -->
			<div class="flex items-center space-x-2">
				<button 
					on:click={handleImport}
					class="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center space-x-2"
					title="Import snippets"
				>
					<Upload class="w-4 h-4" />
					<span class="hidden sm:inline">Import</span>
				</button>
				<button 
					on:click={handleExport}
					class="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center space-x-2"
					title="Export snippets"
				>
					<Download class="w-4 h-4" />
					<span class="hidden sm:inline">Export</span>
				</button>
			</div>
			
			<!-- New Snippet Button -->
			<button 
				on:click={handleCreateSnippet}
				class="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-2"
			>
				<Plus class="w-4 h-4" />
				<span>New Snippet</span>
			</button>
		</div>
	</div>
	
	<!-- Search and Filters -->
	<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
		<div class="flex flex-col md:flex-row gap-4">
			<div class="flex-1 relative">
				<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
				<input
					type="text"
					bind:value={$searchQuery}
					placeholder="Search snippets..."
					class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
				/>
			</div>
			<div class="flex gap-2">
				<button 
					on:click={() => showFilters = !showFilters}
					class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 {showFilters ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' : ''}"
				>
					<Filter class="w-4 h-4" />
					<span>Filter</span>
				</button>
				{#if hasActiveFilters()}
					<button 
						on:click={clearFilters}
						class="px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors flex items-center space-x-2"
					>
						<X class="w-4 h-4" />
						<span>Clear</span>
					</button>
				{/if}
			</div>
		</div>
		
		<!-- Filter Panel -->
		{#if showFilters}
			<div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700" transition:fade={{ duration: 200 }}>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<!-- Language Filter -->
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Language
						</label>
						<select
							bind:value={$selectedLanguage}
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
						>
							<option value="">All languages</option>
							{#each $allLanguages as language}
								<option value={language}>{language}</option>
							{/each}
						</select>
					</div>
					
					<!-- Tags Filter -->
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Tags
						</label>
						<div class="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
							{#each $allTags as tag}
								<button
									on:click={() => toggleTag(tag)}
									class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors {$selectedTags.includes(tag) ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
								>
									<Tag class="w-3 h-3 mr-1" />
									{tag}
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
	
	<!-- Loading State -->
	{#if $loading}
		<div class="flex items-center justify-center py-12">
			<div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
		</div>
	{:else}
		<!-- Snippets Grid -->
		{#if $filteredSnippets.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each $filteredSnippets as snippet (snippet.id)}
					<SnippetCard 
						{snippet} 
						on:edit={handleEditSnippet}
						on:view={handleViewSnippet}
						on:versions={handleVersionHistory}
						on:components={handleComponentLink}
						on:embed={handleEmbed}
					/>
				{/each}
			</div>
		{:else}
			<!-- Empty State -->
			<div class="text-center py-12">
				<div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
					<Plus class="w-8 h-8 text-gray-400" />
				</div>
				<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
					{hasActiveFilters() ? 'No snippets found' : 'No snippets yet'}
				</h3>
				<p class="text-gray-600 dark:text-gray-400 mb-6">
					{hasActiveFilters() 
						? 'Try adjusting your search or filters' 
						: 'Create your first code snippet to get started'
					}
				</p>
				{#if !hasActiveFilters()}
					<button 
						on:click={handleCreateSnippet}
						class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-2 mx-auto"
					>
						<Plus class="w-5 h-5" />
						<span>Create Your First Snippet</span>
					</button>
				{/if}
			</div>
		{/if}
	{/if}
</div>

<!-- Create/Edit Modal -->
<SnippetModal 
	isOpen={showCreateModal}
	snippet={editingSnippet}
	on:close={handleModalClose}
	on:saved={handleModalClose}
/>

<!-- View Modal -->
{#if showViewModal && viewingSnippet}
	<div 
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
		on:click={(e) => e.target === e.currentTarget && (showViewModal = false)}
		transition:fade={{ duration: 200 }}
	>
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
			<!-- Header -->
			<div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
				<div>
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
						{viewingSnippet.title}
					</h2>
					{#if viewingSnippet.description}
						<p class="text-gray-600 dark:text-gray-400 mt-1">
							{viewingSnippet.description}
						</p>
					{/if}
				</div>
				<button 
					on:click={() => showViewModal = false}
					class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
				>
					<X class="w-5 h-5 text-gray-500" />
				</button>
			</div>
			
			<!-- Content -->
			<div class="p-6">
				<MonacoEditor 
					value={viewingSnippet.code} 
					language={viewingSnippet.language} 
					height="400px" 
					readonly={true}
				/>
				
				<!-- Tags and Info -->
				{#if viewingSnippet.tags && viewingSnippet.tags.length > 0}
					<div class="mt-4 flex flex-wrap gap-2">
						{#each viewingSnippet.tags as tag}
							<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
								<Tag class="w-3 h-3 mr-1" />
								{tag}
							</span>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<!-- Import/Export Modal -->
<ImportExportModal 
	isOpen={showImportExportModal}
	activeTab={importExportTab}
	on:close={handleImportExportClose}
/>

<!-- Version History Modal -->
<VersionHistory 
	isOpen={showVersionHistory}
	snippet={versionSnippet}
	on:close={handleVersionClose}
	on:reverted={handleModalClose}
/>

<!-- Component Linker Modal -->
<ComponentLinker 
	isOpen={showComponentLinker}
	snippet={componentSnippet}
	on:close={handleComponentClose}
	on:updated={handleModalClose}
/>

<!-- Embed Generator Modal -->
<EmbedGenerator 
	isOpen={showEmbedGenerator}
	snippet={embedSnippet}
	on:close={handleEmbedClose}
/>