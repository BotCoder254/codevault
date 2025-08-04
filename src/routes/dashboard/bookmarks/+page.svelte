<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { Bookmark, Search, Filter } from 'lucide-svelte';
	import SnippetCard from '$lib/components/SnippetCard.svelte';
	import SnippetModal from '$lib/components/SnippetModal.svelte';
	import VersionHistory from '$lib/components/VersionHistory.svelte';
	import ComponentLinker from '$lib/components/ComponentLinker.svelte';
	import EmbedGenerator from '$lib/components/EmbedGenerator.svelte';
	import { bookmarks } from '$lib/stores/bookmarks.js';
	import { snippets } from '$lib/stores/snippets.js';
	import { user } from '$lib/stores/auth.js';
	import { fade } from 'svelte/transition';
	
	let searchTerm = '';
	let selectedLanguage = '';
	let selectedSnippet = null;
	let showModal = false;
	let showVersionHistory = false;
	let showComponentLinker = false;
	let showEmbedGenerator = false;
	let modalMode = 'view';
	
	$: bookmarkedSnippets = $bookmarks
		.map(bookmark => $snippets.find(snippet => snippet.id === bookmark.snippetId))
		.filter(snippet => snippet) // Remove undefined snippets
		.filter(snippet => {
			const matchesSearch = !searchTerm || 
				snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				snippet.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				snippet.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
			
			const matchesLanguage = !selectedLanguage || snippet.language === selectedLanguage;
			
			return matchesSearch && matchesLanguage;
		});
	
	$: availableLanguages = [...new Set($bookmarks
		.map(bookmark => $snippets.find(snippet => snippet.id === bookmark.snippetId))
		.filter(snippet => snippet)
		.map(snippet => snippet.language)
	)].sort();
	
	const handleView = (event) => {
		selectedSnippet = event.detail;
		modalMode = 'view';
		showModal = true;
	};
	
	const handleEdit = (event) => {
		selectedSnippet = event.detail;
		modalMode = 'edit';
		showModal = true;
	};
	
	const handleVersionHistory = (event) => {
		selectedSnippet = event.detail;
		showVersionHistory = true;
	};
	
	const handleComponentLink = (event) => {
		selectedSnippet = event.detail;
		showComponentLinker = true;
	};
	
	const closeModal = () => {
		showModal = false;
		showVersionHistory = false;
		showComponentLinker = false;
		showEmbedGenerator = false;
		selectedSnippet = null;
	};
</script>

<svelte:head>
	<title>Bookmarks - ServeMe</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center space-x-3">
			<div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
				<Bookmark class="w-6 h-6 text-blue-600 dark:text-blue-400" />
			</div>
			<div>
				<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
					Bookmarked Snippets
				</h1>
				<p class="text-gray-600 dark:text-gray-400">
					{$bookmarks.length} bookmarked snippet{$bookmarks.length !== 1 ? 's' : ''}
				</p>
			</div>
		</div>
	</div>
	
	<!-- Search and Filters -->
	<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
		<div class="flex flex-col sm:flex-row gap-4">
			<!-- Search -->
			<div class="flex-1 relative">
				<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
				<input
					type="text"
					bind:value={searchTerm}
					placeholder="Search bookmarked snippets..."
					class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
				/>
			</div>
			
			<!-- Language Filter -->
			<div class="relative">
				<Filter class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
				<select
					bind:value={selectedLanguage}
					class="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none min-w-[150px]"
				>
					<option value="">All Languages</option>
					{#each availableLanguages as language}
						<option value={language}>{language}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>
	
	<!-- Bookmarked Snippets -->
	{#if bookmarkedSnippets.length > 0}
		<div class="grid gap-4">
			{#each bookmarkedSnippets as snippet (snippet.id)}
				<div transition:fade={{ duration: 200 }}>
					<SnippetCard 
						{snippet}
						on:view={handleView}
						on:edit={handleEdit}
						on:versions={handleVersionHistory}
						on:components={handleComponentLink}
						on:embed={(e) => { selectedSnippet = e.detail; showEmbedGenerator = true; }}
						on:fork={(e) => console.log('Forked snippet:', e.detail)}
					/>
				</div>
			{/each}
		</div>
	{:else if $bookmarks.length === 0}
		<!-- Empty State -->
		<div class="text-center py-12">
			<div class="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
				<Bookmark class="w-12 h-12 text-gray-400" />
			</div>
			<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
				No bookmarks yet
			</h3>
			<p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
				Start bookmarking snippets you find useful. Click the bookmark icon on any snippet to save it here.
			</p>
		</div>
	{:else}
		<!-- No Results -->
		<div class="text-center py-12">
			<div class="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
				<Search class="w-12 h-12 text-gray-400" />
			</div>
			<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
				No matching bookmarks
			</h3>
			<p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
				Try adjusting your search terms or filters to find what you're looking for.
			</p>
			<button
				on:click={() => { searchTerm = ''; selectedLanguage = ''; }}
				class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
			>
				Clear Filters
			</button>
		</div>
	{/if}
</div>

<!-- Modals -->
{#if showModal && selectedSnippet}
	<SnippetModal
		snippet={selectedSnippet}
		mode={modalMode}
		on:close={closeModal}
	/>
{/if}

{#if showVersionHistory && selectedSnippet}
	<VersionHistory
		snippet={selectedSnippet}
		on:close={closeModal}
	/>
{/if}

{#if showComponentLinker && selectedSnippet}
	<ComponentLinker
		snippet={selectedSnippet}
		on:close={closeModal}
	/>
{/if}

{#if showEmbedGenerator && selectedSnippet}
	<EmbedGenerator
		isOpen={showEmbedGenerator}
		snippet={selectedSnippet}
		on:close={closeModal}
	/>
{/if}