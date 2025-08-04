<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { Heart, Search, Filter, Tag, X } from 'lucide-svelte';
	import { writable, derived } from 'svelte/store';
	import { user } from '$lib/stores/auth.js';
	import { db } from '$lib/firebase.js';
	import { collection, query, onSnapshot, doc, getDoc } from 'firebase/firestore';
	import SnippetCard from '$lib/components/SnippetCard.svelte';
	import { fade } from 'svelte/transition';
	
	const favoriteSnippets = writable([]);
	const loading = writable(true);
	const searchQuery = writable('');
	const selectedTags = writable([]);
	const selectedLanguage = writable('');
	
	let showFilters = false;
	let unsubscribe = null;
	
	// Filtered snippets based on search and filters
	const filteredSnippets = derived(
		[favoriteSnippets, searchQuery, selectedTags, selectedLanguage],
		([$favoriteSnippets, $searchQuery, $selectedTags, $selectedLanguage]) => {
			return $favoriteSnippets.filter(snippet => {
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
		}
	);
	
	// Get all unique tags from favorite snippets
	const allTags = derived(favoriteSnippets, ($favoriteSnippets) => {
		const tags = new Set();
		$favoriteSnippets.forEach(snippet => {
			snippet.tags?.forEach(tag => tags.add(tag));
		});
		return Array.from(tags).sort();
	});
	
	// Get all unique languages from favorite snippets
	const allLanguages = derived(favoriteSnippets, ($favoriteSnippets) => {
		const languages = new Set();
		$favoriteSnippets.forEach(snippet => {
			if (snippet.language) languages.add(snippet.language);
		});
		return Array.from(languages).sort();
	});
	
	onMount(() => {
		const unsubscribeUser = user.subscribe(($user) => {
			if ($user) {
				loadFavoriteSnippets($user.uid);
			} else {
				favoriteSnippets.set([]);
				loading.set(false);
			}
		});
		
		return () => {
			unsubscribeUser();
			if (unsubscribe) {
				unsubscribe();
			}
		};
	});
	
	const loadFavoriteSnippets = (userId) => {
		loading.set(true);
		
		const favoritesRef = collection(db, 'users', userId, 'favorites');
		
		unsubscribe = onSnapshot(favoritesRef, async (snapshot) => {
			const snippets = [];
			
			// Get all favorite snippet IDs
			const favoriteIds = [];
			snapshot.forEach((doc) => {
				favoriteIds.push(doc.id);
			});
			
			// Fetch the actual snippet data
			for (const snippetId of favoriteIds) {
				try {
					const snippetDoc = await getDoc(doc(db, 'snippets', snippetId));
					if (snippetDoc.exists()) {
						snippets.push({
							id: snippetDoc.id,
							...snippetDoc.data()
						});
					}
				} catch (error) {
					console.error('Error fetching snippet:', error);
				}
			}
			
			// Sort by most recently favorited
			snippets.sort((a, b) => new Date(b.updatedAt?.toDate?.() || b.updatedAt) - new Date(a.updatedAt?.toDate?.() || a.updatedAt));
			
			favoriteSnippets.set(snippets);
			loading.set(false);
		});
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
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
				<Heart class="w-6 h-6 text-red-600 fill-current" />
				<span>Favorite Snippets</span>
			</h1>
			<p class="text-gray-600 dark:text-gray-400">Your bookmarked code snippets</p>
		</div>
		
		<!-- Stats -->
		<div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
			<div class="flex items-center space-x-3">
				<div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
					<Heart class="w-5 h-5 text-red-600 dark:text-red-400 fill-current" />
				</div>
				<div>
					<p class="text-sm text-gray-600 dark:text-gray-400">Total Favorites</p>
					<p class="text-xl font-bold text-gray-900 dark:text-white">{$favoriteSnippets.length}</p>
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
					placeholder="Search favorite snippets..."
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
						<label for="language-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Language
						</label>
						<select
							id="language-filter"
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
						<label for="tags-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Tags
						</label>
						<div id="tags-filter" class="flex flex-wrap gap-2 max-h-32 overflow-y-auto" role="group" aria-labelledby="tags-filter"></div>
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
		{/if}
	</div>
	
	<!-- Loading State -->
	{#if $loading}
		<div class="flex items-center justify-center py-12">
			<div class="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
		</div>
	{:else}
		<!-- Snippets Grid -->
		{#if $filteredSnippets.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each $filteredSnippets as snippet (snippet.id)}
					<SnippetCard 
						{snippet} 
						on:edit={(e) => console.log('Edit snippet:', e.detail)}
						on:view={(e) => console.log('View snippet:', e.detail)}
					/>
				{/each}
			</div>
		{:else}
			<!-- Empty State -->
			<div class="text-center py-12">
				<div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
					<Heart class="w-8 h-8 text-gray-400" />
				</div>
				<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
					{hasActiveFilters() ? 'No favorites found' : 'No favorites yet'}
				</h3>
				<p class="text-gray-600 dark:text-gray-400 mb-6">
					{hasActiveFilters() 
						? 'Try adjusting your search or filters' 
						: 'Start favoriting snippets to see them here'
					}
				</p>
				{#if !hasActiveFilters()}
					<a 
						href="/dashboard/public"
						class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all space-x-2"
					>
						<Heart class="w-5 h-5" />
						<span>Explore Public Snippets</span>
					</a>
				{/if}
			</div>
		{/if}
	{/if}
</div>