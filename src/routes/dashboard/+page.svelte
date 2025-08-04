<script>
    // @ts-nocheck
    import {
        Code2,
        BookOpen,
        Heart,
        Tag,
        TrendingUp,
        Star,
        Plus,
    } from "lucide-svelte";
    import { user } from "$lib/stores/auth.js";
    import { snippets, allTags, allLanguages } from "$lib/stores/snippets.js";
    import TrendingSnippets from "$lib/components/TrendingSnippets.svelte";
    import { goto } from "$app/navigation";

    // Computed stats
    $: totalSnippets = $snippets.length;
    $: publicSnippets = $snippets.filter(
        (s) => s.visibility === "public",
    ).length;
    $: privateSnippets = $snippets.filter(
        (s) => s.visibility === "private",
    ).length;
    $: totalFavorites = $snippets.reduce((sum, s) => sum + (s.favoriteCount || 0), 0);
    $: totalVotes = $snippets.reduce((sum, s) => sum + (s.voteCount || 0), 0);
    $: recentSnippets = $snippets.slice(0, 5);
    $: mostUsedLanguage = $allLanguages[0] || "JavaScript";

    const handleCreateSnippet = () => {
        goto("/dashboard/snippets");
    };
</script>

<div class="space-y-6">
    <!-- Welcome Section -->
    <div
        class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6"
    >
        <div class="flex items-center justify-between">
            <div>
                <h2
                    class="text-2xl font-bold text-gray-900 dark:text-white mb-2"
                >
                    Welcome back, {$user?.displayName || "Developer"}! 👋
                </h2>
                <p class="text-gray-600 dark:text-gray-300">
                    Ready to organize some code today?
                </p>
            </div>
            <div class="hidden md:block">
                <img
                    src="https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
                    alt="Coding illustration"
                    class="w-24 h-24 rounded-lg object-cover"
                />
            </div>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
            class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
            <div class="flex items-center justify-between">
                <div>
                    <p
                        class="text-sm font-medium text-gray-600 dark:text-gray-400"
                    >
                        Total Snippets
                    </p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">
                        {totalSnippets}
                    </p>
                </div>
                <div
                    class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"
                >
                    <Code2 class="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
            </div>
            <div class="mt-4 flex items-center text-sm">
                <TrendingUp class="w-4 h-4 text-green-500 mr-1" />
                <span class="text-green-600 dark:text-green-400">+12%</span>
                <span class="text-gray-500 dark:text-gray-400 ml-1"
                    >from last month</span
                >
            </div>
        </div>

        <div
            class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
            <div class="flex items-center justify-between">
                <div>
                    <p
                        class="text-sm font-medium text-gray-600 dark:text-gray-400"
                    >
                        Favorites
                    </p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">
                        {totalFavorites}
                    </p>
                </div>
                <div
                    class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center"
                >
                    <Heart class="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
            </div>
            <div class="mt-4 flex items-center text-sm">
                <TrendingUp class="w-4 h-4 text-green-500 mr-1" />
                <span class="text-green-600 dark:text-green-400">+3</span>
                <span class="text-gray-500 dark:text-gray-400 ml-1"
                    >this week</span
                >
            </div>
        </div>

        <div
            class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
            <div class="flex items-center justify-between">
                <div>
                    <p
                        class="text-sm font-medium text-gray-600 dark:text-gray-400"
                    >
                        Tags Used
                    </p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">
                        {$allTags.length}
                    </p>
                </div>
                <div
                    class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center"
                >
                    <Tag class="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
            </div>
            <div class="mt-4 flex items-center text-sm">
                <span class="text-gray-500 dark:text-gray-400"
                    >Most used:
                </span>
                <span class="text-gray-900 dark:text-white ml-1 font-medium"
                    >{mostUsedLanguage}</span
                >
            </div>
        </div>

        <div
            class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
            <div class="flex items-center justify-between">
                <div>
                    <p
                        class="text-sm font-medium text-gray-600 dark:text-gray-400"
                    >
                        Public Snippets
                    </p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">
                        {publicSnippets}
                    </p>
                </div>
                <div
                    class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center"
                >
                    <BookOpen
                        class="w-6 h-6 text-green-600 dark:text-green-400"
                    />
                </div>
            </div>
            <div class="mt-4 flex items-center text-sm">
                <Star class="w-4 h-4 text-yellow-500 mr-1" />
                <span class="text-gray-500 dark:text-gray-400"
                    >45 total stars</span
                >
            </div>
        </div>
    </div>

    <!-- Recent Activity & Trending -->
    <div class="grid lg:grid-cols-3 gap-6">
        <!-- Recent Snippets -->
        <div
            class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
        >
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Snippets
                </h3>
            </div>
            <div class="p-6 space-y-4">
                {#if recentSnippets.length > 0}
                    {#each recentSnippets as snippet}
                        <div
                            class="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                            on:click={() => goto("/dashboard/snippets")}
                        >
                            <div
                                class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center"
                            >
                                <Code2 class="w-5 h-5 text-white" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <p
                                    class="text-sm font-medium text-gray-900 dark:text-white truncate"
                                >
                                    {snippet.title}
                                </p>
                                <div class="flex items-center space-x-2 mt-1">
                                    <span
                                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                    >
                                        {snippet.language}
                                    </span>
                                    <span
                                        class="text-xs text-gray-500 dark:text-gray-400"
                                    >
                                        {snippet.updatedAt
                                            ?.toDate?.()
                                            ?.toLocaleDateString() ||
                                            "Recently"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    {/each}
                {:else}
                    <div class="text-center py-8">
                        <Code2 class="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p class="text-gray-500 dark:text-gray-400 text-sm">
                            No snippets yet
                        </p>
                        <button
                            on:click={handleCreateSnippet}
                            class="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            Create your first snippet
                        </button>
                    </div>
                {/if}
            </div>
        </div>

        <!-- Trending Snippets -->
        <TrendingSnippets />

        <!-- Popular Tags -->
        <div
            class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
        >
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Popular Tags
                </h3>
            </div>
            <div class="p-6">
                <div class="flex flex-wrap gap-2">
                    {#if $allTags.length > 0}
                        {#each $allTags.slice(0, 10) as tag}
                            <span
                                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                            >
                                {tag}
                            </span>
                        {/each}
                    {:else}
                        <p class="text-gray-500 dark:text-gray-400 text-sm">
                            No tags yet. Create some snippets to see popular
                            tags here.
                        </p>
                    {/if}
                </div>
            </div>
        </div>
    </div>

    <!-- Quick Actions -->
    <div
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
    >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
                on:click={handleCreateSnippet}
                class="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
            >
                <div
                    class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                >
                    <Plus class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div class="text-left">
                    <p class="font-medium text-gray-900 dark:text-white">
                        Create Snippet
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        Add a new code snippet
                    </p>
                </div>
            </button>

            <button
                class="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
            >
                <div
                    class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                >
                    <BookOpen
                        class="w-5 h-5 text-purple-600 dark:text-purple-400"
                    />
                </div>
                <div class="text-left">
                    <p class="font-medium text-gray-900 dark:text-white">
                        Browse Public
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        Explore community snippets
                    </p>
                </div>
            </button>

            <button
                class="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
            >
                <div
                    class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                >
                    <Tag class="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div class="text-left">
                    <p class="font-medium text-gray-900 dark:text-white">
                        Organize Tags
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        Manage your tags
                    </p>
                </div>
            </button>
        </div>
    </div>
</div>
