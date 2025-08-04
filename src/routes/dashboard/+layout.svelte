<script>
    // @ts-nocheck
    import {
        Code2,
        Home,
        BookOpen,
        Heart,
        Bookmark,
        Tag,
        Settings,
        User,
        Search,
        Plus,
        Menu,
        LogOut,
        Moon,
        Sun,
    } from "lucide-svelte";
    import {
        sidebarCollapsed,
        toggleSidebar,
        theme,
        toggleTheme,
    } from "$lib/stores/ui.js";
    import { user, logout } from "$lib/stores/auth.js";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { slide } from "svelte/transition";

    let { children } = $props();

    const navItems = [
        {
            icon: Home,
            label: "Dashboard",
            route: "/dashboard",
            tooltip: "Dashboard",
        },
        {
            icon: BookOpen,
            label: "My Snippets",
            route: "/dashboard/snippets",
            tooltip: "My Snippets",
        },
        {
            icon: Search,
            label: "Public Snippets",
            route: "/dashboard/public",
            tooltip: "Public Snippets",
        },
        {
            icon: Heart,
            label: "Favorites",
            route: "/dashboard/favorites",
            tooltip: "Favorites",
        },
        {
            icon: Bookmark,
            label: "Bookmarks",
            route: "/dashboard/bookmarks",
            tooltip: "Bookmarks",
        },
        {
            icon: User,
            label: "Profile",
            route: "/dashboard/profile",
            tooltip: "Profile",
        },
        {
            icon: Settings,
            label: "Settings",
            route: "/dashboard/settings",
            tooltip: "Settings",
        },
    ];

    const handleLogout = async () => {
        await logout();
        goto("/");
    };

    const isActive = (route) => $page.url.pathname === route;
</script>

<div class="flex h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar -->
    <aside
        class={`
		${$sidebarCollapsed ? "w-16" : "w-64"} 
		bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
		flex flex-col transition-all duration-300 ease-in-out
	`}
    >
        <!-- Logo & Toggle -->
        <div
            class="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 {$sidebarCollapsed
                ? 'justify-center'
                : 'justify-between'}"
        >
            {#if !$sidebarCollapsed}
                <div
                    class="flex items-center space-x-2 overflow-hidden"
                    transition:slide={{ duration: 200, axis: "x" }}
                >
                    <div
                        class="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0"
                    >
                        <Code2 class="w-5 h-5 text-white" />
                    </div>
                    <span
                        class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap"
                    >
                        CodeVault
                    </span>
                </div>
                <button
                    on:click={toggleSidebar}
                    class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                    title="Collapse Sidebar"
                >
                    <Menu class="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
            {:else}
                <div class="flex flex-col items-center space-y-2">
                    <div
                        class="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"
                    >
                        <Code2 class="w-5 h-5 text-white" />
                    </div>
                    <button
                        on:click={toggleSidebar}
                        class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Expand Sidebar"
                    >
                        <Menu
                            class="w-4 h-4 text-gray-600 dark:text-gray-400"
                        />
                    </button>
                </div>
            {/if}
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-4 space-y-1">
            {#each navItems as item}
                <a
                    href={item.route}
                    class={`
						flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 relative group
						${
                            isActive(item.route)
                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }
						${$sidebarCollapsed ? "justify-center" : "space-x-3"}
					`}
                    title={$sidebarCollapsed ? item.tooltip : ""}
                >
                    <!-- Active indicator for collapsed state -->
                    {#if isActive(item.route) && $sidebarCollapsed}
                        <div
                            class="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full"
                        ></div>
                    {/if}

                    <item.icon class="w-5 h-5 flex-shrink-0" />

                    {#if !$sidebarCollapsed}
                        <span
                            class="font-medium overflow-hidden whitespace-nowrap"
                            transition:slide={{ duration: 200, axis: "x" }}
                        >
                            {item.label}
                        </span>
                    {/if}

                    <!-- Tooltip for collapsed state -->
                    {#if $sidebarCollapsed}
                        <div
                            class="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50"
                        >
                            {item.tooltip}
                        </div>
                    {/if}
                </a>
            {/each}
        </nav>

        <!-- User Profile & Actions -->
        <div
            class="p-4 border-t border-gray-200 dark:border-gray-700 space-y-1"
        >
            <!-- Theme Toggle -->
            <button
                on:click={toggleTheme}
                class={`
					flex items-center px-3 py-2.5 rounded-lg transition-colors w-full group relative
					text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
					${$sidebarCollapsed ? "justify-center" : "space-x-3"}
				`}
                title={$sidebarCollapsed
                    ? $theme === "light"
                        ? "Dark Mode"
                        : "Light Mode"
                    : ""}
            >
                {#if $theme === "light"}
                    <Moon class="w-5 h-5 flex-shrink-0" />
                {:else}
                    <Sun class="w-5 h-5 flex-shrink-0" />
                {/if}
                {#if !$sidebarCollapsed}
                    <span
                        class="font-medium overflow-hidden whitespace-nowrap"
                        transition:slide={{ duration: 200, axis: "x" }}
                    >
                        {$theme === "light" ? "Dark Mode" : "Light Mode"}
                    </span>
                {:else}
                    <!-- Tooltip for collapsed state -->
                    <div
                        class="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50"
                    >
                        {$theme === "light" ? "Dark Mode" : "Light Mode"}
                    </div>
                {/if}
            </button>

            <!-- User Profile -->
            {#if $user}
                <div
                    class={`
					flex items-center px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 group relative
					${$sidebarCollapsed ? "justify-center" : "space-x-3"}
				`}
                >
                    {#if $user.photoURL}
                        <img
                            src={$user.photoURL}
                            alt={$user.displayName}
                            class="w-8 h-8 rounded-full flex-shrink-0"
                        />
                    {:else}
                        <div
                            class="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0"
                        >
                            <User class="w-4 h-4 text-white" />
                        </div>
                    {/if}

                    {#if !$sidebarCollapsed}
                        <div
                            class="flex-1 min-w-0 overflow-hidden"
                            transition:slide={{ duration: 200, axis: "x" }}
                        >
                            <p
                                class="text-sm font-medium text-gray-900 dark:text-white truncate"
                            >
                                {$user.displayName || "User"}
                            </p>
                            <p
                                class="text-xs text-gray-500 dark:text-gray-400 truncate"
                            >
                                {$user.email}
                            </p>
                        </div>
                    {:else}
                        <!-- Tooltip for collapsed state -->
                        <div
                            class="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50"
                        >
                            <div class="text-xs font-medium">
                                {$user.displayName || "User"}
                            </div>
                            <div class="text-xs opacity-75">{$user.email}</div>
                        </div>
                    {/if}
                </div>
            {/if}

            <!-- Logout -->
            <button
                on:click={handleLogout}
                class={`
					flex items-center px-3 py-2.5 rounded-lg transition-colors w-full group relative
					text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
					${$sidebarCollapsed ? "justify-center" : "space-x-3"}
				`}
                title={$sidebarCollapsed ? "Logout" : ""}
            >
                <LogOut class="w-5 h-5 flex-shrink-0" />
                {#if !$sidebarCollapsed}
                    <span
                        class="font-medium overflow-hidden whitespace-nowrap"
                        transition:slide={{ duration: 200, axis: "x" }}
                    >
                        Logout
                    </span>
                {:else}
                    <!-- Tooltip for collapsed state -->
                    <div
                        class="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50"
                    >
                        Logout
                    </div>
                {/if}
            </button>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-hidden">
        <!-- Top Bar -->
        <header
            class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4"
        >
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <h1
                        class="text-2xl font-bold text-gray-900 dark:text-white"
                    >
                        {#if $page.url.pathname === "/dashboard"}
                            Dashboard
                        {:else if $page.url.pathname === "/dashboard/snippets"}
                            My Snippets
                        {:else if $page.url.pathname === "/dashboard/public"}
                            Public Snippets
                        {:else if $page.url.pathname === "/dashboard/favorites"}
                            Favorites
                        {:else if $page.url.pathname === "/dashboard/bookmarks"}
                            Bookmarks
                        {:else if $page.url.pathname === "/dashboard/profile"}
                            Profile
                        {:else if $page.url.pathname === "/dashboard/tags"}
                            Tags
                        {:else if $page.url.pathname === "/dashboard/explore"}
                            Explore
                        {:else if $page.url.pathname === "/dashboard/settings"}
                            Settings
                        {:else}
                            CodeVault
                        {/if}
                    </h1>
                </div>

                <div class="flex items-center space-x-4">
                    <!-- Search -->
                    <div class="relative">
                        <Search
                            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Search snippets..."
                            class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 w-64"
                        />
                    </div>

                    <!-- New Snippet Button -->
                    <button
                        class="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                    >
                        <Plus class="w-4 h-4" />
                        <span>New Snippet</span>
                    </button>
                </div>
            </div>
        </header>

        <!-- Page Content -->
        <div class="flex-1 overflow-auto p-6">
            {@render children?.()}
        </div>
    </main>
</div>
