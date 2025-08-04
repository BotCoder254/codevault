<script>
  import { onMount } from 'svelte';
  import { Share2, Search, Filter } from 'lucide-svelte';
  import { communitySnippets, loading as communityLoading, loadCommunitySnippets } from '$lib/stores/community.js';
  import { user } from '$lib/stores/auth.js';
  import SnippetCard from '$lib/components/SnippetCard.svelte';
  
  let searchQuery = '';
  let selectedLanguage = '';
  let selectedSort = 'newest';
  let unsubscribe;
  
  // Filter snippets based on search and language
  $: filteredSnippets = $communitySnippets.filter(snippet => {
    const matchesSearch = !searchQuery || 
      snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesLanguage = !selectedLanguage || snippet.language === selectedLanguage;
    
    return matchesSearch && matchesLanguage;
  });
  
  // Sort snippets
  $: sortedSnippets = [...filteredSnippets].sort((a, b) => {
    if (selectedSort === 'newest') {
      const aDate = a.updatedAt?.toDate?.() || new Date(0);
      const bDate = b.updatedAt?.toDate?.() || new Date(0);
      return bDate - aDate;
    } else if (selectedSort === 'oldest') {
      const aDate = a.updatedAt?.toDate?.() || new Date(0);
      const bDate = b.updatedAt?.toDate?.() || new Date(0);
      return aDate - bDate;
    } else if (selectedSort === 'popular') {
      const aScore = (a.voteCount || 0) + (a.favoriteCount || 0);
      const bScore = (b.voteCount || 0) + (b.favoriteCount || 0);
      return bScore - aScore;
    }
    return 0;
  });
  
  // Get unique languages
  $: languages = [...new Set($communitySnippets.map(s => s.language))].sort();
  
  onMount(() => {
    unsubscribe = loadCommunitySnippets();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  });
  
  const handleSnippetSaved = () => {
    // Refresh the list
    if (unsubscribe) unsubscribe();
    unsubscribe = loadCommunitySnippets();
  };
</script>

<div class="container mx-auto px-4 py-8">
  <div class="mb-8">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
      <Share2 class="w-6 h-6 mr-2 text-green-600 dark:text-green-400" />
      Community Snippets
    </h1>
    <p class="text-gray-600 dark:text-gray-400 mt-2">
      Browse and use snippets shared by the community
    </p>
  </div>
  
  <!-- Search and filters -->
  <div class="mb-6 flex flex-col md:flex-row gap-4">
    <div class="relative flex-1">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search class="w-5 h-5 text-gray-400" />
      </div>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search snippets..."
        class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      />
    </div>
    
    <div class="flex gap-3">
      <div class="relative">
        <select
          bind:value={selectedLanguage}
          class="pl-4 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none"
        >
          <option value="">All Languages</option>
          {#each languages as language}
            <option value={language}>{language}</option>
          {/each}
        </select>
        <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <Filter class="w-4 h-4 text-gray-500" />
        </div>
      </div>
      
      <div class="relative">
        <select
          bind:value={selectedSort}
          class="pl-4 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="popular">Most Popular</option>
        </select>
        <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <Filter class="w-4 h-4 text-gray-500" />
        </div>
      </div>
    </div>
  </div>
  
  <!-- Snippets List -->
  {#if $communityLoading}
    <div class="flex justify-center items-center py-12">
      <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  {:else if sortedSnippets.length === 0}
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
      <Share2 class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No community snippets yet</h3>
      <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
        Be the first to add a snippet to the community!
      </p>
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-6">
      {#each sortedSnippets as snippet (snippet.id)}
        <SnippetCard {snippet} on:saved={handleSnippetSaved} />
      {/each}
    </div>
  {/if}
</div>