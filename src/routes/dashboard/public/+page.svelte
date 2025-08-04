<script>
	// @ts-nocheck
	import { onMount, onDestroy } from 'svelte';
	import { Globe, TrendingUp, Heart, ChevronUp, Search, Filter, Tag, X, Code, Users, Star, CheckCircle } from 'lucide-svelte';
	import { writable, derived } from 'svelte/store';
	import { db } from '$lib/firebase.js';
	import { collection, query, where, orderBy, limit, onSnapshot, startAfter, getDocs } from 'firebase/firestore';
	import SnippetCard from '$lib/components/SnippetCard.svelte';
	import EmbedGenerator from '$lib/components/EmbedGenerator.svelte';
	import { fade, fly, scale } from 'svelte/transition';
	
	const publicSnippets = writable([]);
	const loading = writable(true);
	const loadingMore = writable(false);
	const searchQuery = writable('');
	const selectedTags = writable([]);
	const selectedLanguage = writable('');
	const selectedCategory = writable('all');
	const sortBy = writable('recent'); // 'recent', 'popular', 'votes', 'trending'
	
	let showFilters = false;
	let showEmbedGenerator = false;
	let embedSnippet = null;
	let unsubscribe = null;
	let lastDoc = null;
	let hasMore = true;
	let scrollContainer;
	
	const categories = [
		{ id: 'all', label: 'All Snippets', icon: Globe },
		{ id: 'trending', label: 'Trending', icon: TrendingUp },
		{ id: 'popular', label: 'Most Popular', icon: Heart },
		{ id: 'recent', label: 'Recently Added', icon: Star },
		{ id: 'top-voted', label: 'Top Voted', icon: ChevronUp }
	];
	
	// Filtered snippets based on search and filters
	const filteredSnippets = derived(
		[publicSnippets, searchQuery, selectedTags, selectedLanguage, sortBy],
		([$publicSnippets, $searchQuery, $selectedTags, $selectedLanguage, $sortBy]) => {
			let filtered = $publicSnippets.filter(snippet => {
				const matchesSearch = !$searchQuery || 
					snippet.title.toLowerCase().includes($searchQuery.toLowerCase()) ||
					snippet.description.toLowerCase().includes($searchQuery.toLowerCase()) ||
					snippet.code.toLowerCase().includes($searchQuery.toLowerCase());
				
				const matchesTags = $selectedTags.length === 0 || 
					$selectedTags.every(tag => snippet.tags?.includes(tag));
				
				const matchesLanguage = !$selectedLanguage || 
					snippet.language === $selectedLanguage;
				
				return matchesSearch && matchesTags && matchesLanguage;
			});
			
			// Sort results
			if ($sortBy === 'popular') {
				filtered.sort((a, b) => (b.favoriteCount || 0) - (a.favoriteCount || 0));
			} else if ($sortBy === 'votes') {
				filtered.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
			} else {
				filtered.sort((a, b) => new Date(b.updatedAt?.toDate?.() || b.updatedAt) - new Date(a.updatedAt?.toDate?.() || a.updatedAt));
			}
			
			return filtered;
		}
	);
	
	// Get all unique tags from public snippets
	const allTags = derived(publicSnippets, ($publicSnippets) => {
		const tags = new Set();
		$publicSnippets.forEach(snippet => {
			snippet.tags?.forEach(tag => tags.add(tag));
		});
		return Array.from(tags).sort();
	});
	
	// Get all unique languages from public snippets
	const allLanguages = derived(publicSnippets, ($publicSnippets) => {
		const languages = new Set();
		$publicSnippets.forEach(snippet => {
			if (snippet.language) languages.add(snippet.language);
		});
		return Array.from(languages).sort();
	});
	
	onMount(() => {
		loadPublicSnippets();
		
		return () => {
			if (unsubscribe) {
				unsubscribe();
			}
		};
	});
	
	onDestroy(() => {
		if (unsubscribe) {
			unsubscribe();
		}
	});
	
	const loadPublicSnippets = (reset = true) => {
		loading.set(true);
		
		// All sorting will be done in memory
		
		// Use only where clause to avoid composite index, sort in memory
		let q = query(
			collection(db, 'snippets'),
			where('visibility', '==', 'public'),
			limit(50) // Get more to sort in memory
		);
		
		if (reset) {
			unsubscribe = onSnapshot(q, (snapshot) => {
				const snippets = [];
				snapshot.forEach((doc) => {
					snippets.push({
						id: doc.id,
						...doc.data()
					});
				});
				
				// Sort in memory based on selected criteria
				snippets.sort((a, b) => {
					if ($sortBy === 'popular') {
						return (b.favoriteCount || 0) - (a.favoriteCount || 0);
					} else if ($sortBy === 'votes') {
						return (b.voteCount || 0) - (a.voteCount || 0);
					} else if ($sortBy === 'trending') {
						// Trending: combination of recent activity and engagement
						const aScore = (a.voteCount || 0) + (a.favoriteCount || 0);
						const bScore = (b.voteCount || 0) + (b.favoriteCount || 0);
						const aDate = a.updatedAt?.toDate?.() || new Date(0);
						const bDate = b.updatedAt?.toDate?.() || new Date(0);
						
						// Weight recent items higher
						const now = new Date();
						const aDaysOld = (now - aDate) / (1000 * 60 * 60 * 24);
						const bDaysOld = (now - bDate) / (1000 * 60 * 60 * 24);
						
						const aWeightedScore = aScore / (1 + aDaysOld * 0.1);
						const bWeightedScore = bScore / (1 + bDaysOld * 0.1);
						
						return bWeightedScore - aWeightedScore;
					} else {
						// Recent: sort by updatedAt
						const aDate = a.updatedAt?.toDate?.() || new Date(0);
						const bDate = b.updatedAt?.toDate?.() || new Date(0);
						return bDate - aDate;
					}
				});
				
				// Take first 12 for display
				const displaySnippets = snippets.slice(0, 12);
				hasMore = snippets.length > 12;
				
				publicSnippets.set(displaySnippets);
				loading.set(false);
			});
		}
	};
	
	// Removed infinite scroll since we load all snippets at once
	
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
		return $searchQuery || $selectedTags.length > 0 || $selectedLanguage || $selectedCategory !== 'all';
	};
	
	const handleCategoryChange = (categoryId) => {
		selectedCategory.set(categoryId);
		
		// Update sort based on category
		if (categoryId === 'trending') {
			sortBy.set('trending');
		} else if (categoryId === 'popular') {
			sortBy.set('popular');
		} else if (categoryId === 'top-voted') {
			sortBy.set('votes');
		} else if (categoryId === 'recent') {
			sortBy.set('recent');
		}
		
		loadPublicSnippets(true);
	};
	
	// Watch for sort changes
	$: if ($sortBy) {
		loadPublicSnippets(true);
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
				<Globe class="w-6 h-6 text-blue-600" />
				<span>Public Snippets</span>
			</h1>
			<p class="text-gray-600 dark:text-gray-400">Discover and learn from the community</p>
		</div>
		
		<!-- Sort Options -->
		<div class="flex items-center space-x-3">
			<select
				bind:value={$sortBy}
				on:change={() => loadPublicSnippets(true)}
				class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
			>
				<option value="recent">Most Recent</option>
				<option value="trending">Trending</option>
				<option value="popular">Most Popular</option>
				<option value="votes">Most Voted</option>
			</select>
		</div>
	</div>
	
	<!-- Categories -->
	<div class="flex flex-wrap gap-3">
		{#each categories as category}
			<button
				on:click={() => handleCategoryChange(category.id)}
				class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all transform hover:scale-105 {$selectedCategory === category.id ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'}"
			>
				<svelte:component this={category.icon} class="w-4 h-4" />
				<span class="font-medium">{category.label}</span>
			</button>
		{/each}
	</div>
	
	<!-- Stats Cards -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
		<div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
			<div class="flex items-center space-x-3">
				<div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
					<Globe class="w-5 h-5 text-blue-600 dark:text-blue-400" />
				</div>
				<div>
					<p class="text-sm text-gray-600 dark:text-gray-400">Total Public</p>
					<p class="text-xl font-bold text-gray-900 dark:text-white">{$publicSnippets.length}</p>
				</div>
			</div>
		</div>
		
		<div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
			<div class="flex items-center space-x-3">
				<div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
					<Heart class="w-5 h-5 text-red-600 dark:text-red-400" />
				</div>
				<div>
					<p class="text-sm text-gray-600 dark:text-gray-400">Total Favorites</p>
					<p class="text-xl font-bold text-gray-900 dark:text-white">
						{$publicSnippets.reduce((sum, s) => sum + (s.favoriteCount || 0), 0)}
					</p>
				</div>
			</div>
		</div>
		
		<div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
			<div class="flex items-center space-x-3">
				<div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
					<ChevronUp class="w-5 h-5 text-green-600 dark:text-green-400" />
				</div>
				<div>
					<p class="text-sm text-gray-600 dark:text-gray-400">Total Votes</p>
					<p class="text-xl font-bold text-gray-900 dark:text-white">
						{$publicSnippets.reduce((sum, s) => sum + (s.voteCount || 0), 0)}
					</p>
				</div>
			</div>
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
					placeholder="Search public snippets..."
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
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{#each $filteredSnippets as snippet, index (snippet.id)}
					<div 
						class="transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
						style="animation-delay: {index * 50}ms"
						in:fly={{ y: 20, duration: 400, delay: index * 50 }}
					>
						<SnippetCard 
							{snippet} 
							on:view={(e) => console.log('View snippet:', e.detail)}
							on:embed={(e) => { embedSnippet = e.detail; showEmbedGenerator = true; }}
						/>
					</div>
				{/each}
			</div>
			
			<!-- All snippets loaded at once, no pagination needed -->
		{:else}
			<!-- Empty State -->
			<div class="text-center py-12">
				<div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
					<Globe class="w-8 h-8 text-gray-400" />
				</div>
				<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
					{hasActiveFilters() ? 'No snippets found' : 'No public snippets yet'}
				</h3>
				<p class="text-gray-600 dark:text-gray-400 mb-6">
					{hasActiveFilters() 
						? 'Try adjusting your search or filters' 
						: 'Be the first to share a public snippet with the community'
					}
				</p>
			</div>
		{/if}
	{/if}
</div>

<!-- Embed Generator Modal -->
<EmbedGenerator 
	isOpen={showEmbedGenerator}
	snippet={embedSnippet}
	on:close={() => { showEmbedGenerator = false; embedSnippet = null; }}
/>