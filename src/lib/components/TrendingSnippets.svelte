<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { TrendingUp, Heart, ChevronUp, Eye, Code2 } from 'lucide-svelte';
	import { db } from '$lib/firebase.js';
	import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
	import { fade, fly } from 'svelte/transition';
	
	const trendingSnippets = writable([]);
	const loading = writable(true);
	
	onMount(() => {
		loadTrendingSnippets();
	});
	
	const loadTrendingSnippets = async () => {
		try {
			// Get public snippets and sort by engagement in memory
			const q = query(
				collection(db, 'snippets'),
				where('visibility', '==', 'public'),
				limit(50) // Get more to filter and sort in memory
			);
			
			const snapshot = await getDocs(q);
			const snippets = [];
			
			snapshot.forEach((doc) => {
				const data = doc.data();
				// Only include snippets from the last 30 days
				const thirtyDaysAgo = new Date();
				thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
				const updatedAt = data.updatedAt?.toDate() || new Date(0);
				
				if (updatedAt >= thirtyDaysAgo) {
					snippets.push({
						id: doc.id,
						...data
					});
				}
			});
			
			// Sort by engagement score (votes + favorites)
			snippets.sort((a, b) => {
				const scoreA = (a.voteCount || 0) + (a.favoriteCount || 0);
				const scoreB = (b.voteCount || 0) + (b.favoriteCount || 0);
				return scoreB - scoreA;
			});
			
			// Take top 5
			trendingSnippets.set(snippets.slice(0, 5));
			loading.set(false);
		} catch (error) {
			console.error('Error loading trending snippets:', error);
			loading.set(false);
		}
	};
	
	const getLanguageColor = (language) => {
		const colors = {
			javascript: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
			typescript: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
			python: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
			java: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
			csharp: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
			php: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
			ruby: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
			go: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
			rust: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
		};
		return colors[language] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
	};
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
	<div class="p-6 border-b border-gray-200 dark:border-gray-700">
		<div class="flex items-center space-x-2">
			<TrendingUp class="w-5 h-5 text-orange-600 dark:text-orange-400" />
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Trending This Week</h3>
		</div>
	</div>
	
	<div class="p-6">
		{#if $loading}
			<div class="space-y-4">
				{#each Array(3) as _}
					<div class="animate-pulse">
						<div class="flex items-center space-x-4">
							<div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
							<div class="flex-1 space-y-2">
								<div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
								<div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else if $trendingSnippets.length > 0}
			<div class="space-y-4">
				{#each $trendingSnippets as snippet, index (snippet.id)}
					<div 
						class="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer group"
						in:fly={{ x: -20, duration: 300, delay: index * 100 }}
					>
						<!-- Rank -->
						<div class="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
							{index + 1}
						</div>
						
						<!-- Snippet Info -->
						<div class="flex-1 min-w-0">
							<h4 class="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
								{snippet.title}
							</h4>
							<div class="flex items-center space-x-3 mt-1">
								<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getLanguageColor(snippet.language)}">
									{snippet.language}
								</span>
								<div class="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
									<div class="flex items-center space-x-1">
										<ChevronUp class="w-3 h-3" />
										<span>{snippet.voteCount || 0}</span>
									</div>
									<div class="flex items-center space-x-1">
										<Heart class="w-3 h-3" />
										<span>{snippet.favoriteCount || 0}</span>
									</div>
								</div>
							</div>
						</div>
						
						<!-- Trending Icon -->
						<div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
							<TrendingUp class="w-4 h-4 text-orange-500 animate-pulse" />
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="text-center py-8">
				<TrendingUp class="w-12 h-12 text-gray-400 mx-auto mb-3" />
				<p class="text-gray-500 dark:text-gray-400 text-sm">No trending snippets this week</p>
			</div>
		{/if}
	</div>
	
	{#if $trendingSnippets.length > 0}
		<div class="px-6 pb-6">
			<a 
				href="/dashboard/public"
				class="block w-full text-center px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all transform hover:scale-105 text-sm font-medium"
			>
				View All Public Snippets
			</a>
		</div>
	{/if}
</div>