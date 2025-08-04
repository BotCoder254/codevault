<script>
    // @ts-nocheck
    import { onMount } from "svelte";
    import {
        User,
        Settings,
        Code2,
        Heart,
        ChevronUp,
        Tag,
        Globe,
        Lock,
        Camera,
        Save,
        Edit,
        Github,
        Twitter,
        MapPin,
        Link as LinkIcon,
        Palette,
        Monitor,
    } from "lucide-svelte";
    import {
        user,
        updateProfile as updateAuthProfile,
    } from "$lib/stores/auth.js";
    import {
        profileData,
        profileStats,
        updateProfile,
    } from "$lib/stores/profile.js";
    import { theme, toggleTheme } from "$lib/stores/ui.js";
    import { fade, fly, scale } from "svelte/transition";

    let activeTab = "overview";
    let editing = false;
    let saving = false;
    let profileForm = {
        displayName: "",
        bio: "",
        website: "",
        location: "",
        githubUsername: "",
        twitterUsername: "",
    };
    let settingsForm = {
        editorTheme: "vs-dark",
        preferredLanguage: "javascript",
        publicProfile: true,
    };

    // Initialize form data
    $: if ($user) {
        profileForm = {
            displayName: $user.displayName || "",
            bio: $profileData.bio || "",
            website: $profileData.website || "",
            location: $profileData.location || "",
            githubUsername: $profileData.githubUsername || "",
            twitterUsername: $profileData.twitterUsername || "",
        };

        settingsForm = {
            editorTheme: $profileData.editorTheme || "vs-dark",
            preferredLanguage: $profileData.preferredLanguage || "javascript",
            publicProfile: $profileData.publicProfile !== false,
        };
    }

    const handleSaveProfile = async () => {
        saving = true;

        // Update auth profile
        if (profileForm.displayName !== $user.displayName) {
            await updateAuthProfile({ displayName: profileForm.displayName });
        }

        // Update profile data
        const result = await updateProfile({
            bio: profileForm.bio,
            website: profileForm.website,
            location: profileForm.location,
            githubUsername: profileForm.githubUsername,
            twitterUsername: profileForm.twitterUsername,
            ...settingsForm,
        });

        if (result.success) {
            editing = false;
        }

        saving = false;
    };

    const statCards = [
        {
            label: "Total Snippets",
            value: $profileStats.totalSnippets,
            icon: Code2,
            color: "blue",
            gradient: "from-blue-500 to-blue-600",
        },
        {
            label: "Public Snippets",
            value: $profileStats.publicSnippets,
            icon: Globe,
            color: "green",
            gradient: "from-green-500 to-green-600",
        },
        {
            label: "Total Votes",
            value: $profileStats.totalVotes,
            icon: ChevronUp,
            color: "purple",
            gradient: "from-purple-500 to-purple-600",
        },
        {
            label: "Total Favorites",
            value: $profileStats.totalFavorites,
            icon: Heart,
            color: "red",
            gradient: "from-red-500 to-red-600",
        },
        {
            label: "Languages Used",
            value: $profileStats.languagesUsed,
            icon: Code2,
            color: "indigo",
            gradient: "from-indigo-500 to-indigo-600",
        },
        {
            label: "Tags Created",
            value: $profileStats.tagsUsed,
            icon: Tag,
            color: "pink",
            gradient: "from-pink-500 to-pink-600",
        },
    ];

    const tabs = [
        { id: "overview", label: "Overview", icon: User },
        { id: "profile", label: "Profile", icon: Edit },
        { id: "settings", label: "Settings", icon: Settings },
    ];
</script>

<div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <div>
            <h1
                class="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2"
            >
                <User class="w-6 h-6 text-blue-600" />
                <span>Profile Dashboard</span>
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
                Manage your profile and view your statistics
            </p>
        </div>
    </div>

    <!-- Profile Header Card -->
    <div
        class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white"
    >
        <div class="flex items-center space-x-6">
            <!-- Profile Picture -->
            <div class="relative group">
                {#if $user?.photoURL}
                    <img
                        src={$user.photoURL}
                        alt={$user.displayName}
                        class="w-20 h-20 rounded-full border-4 border-white/20"
                    />
                {:else}
                    <div
                        class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/20"
                    >
                        <User class="w-10 h-10 text-white" />
                    </div>
                {/if}
                <button
                    class="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Camera class="w-6 h-6 text-white" />
                </button>
            </div>

            <!-- Profile Info -->
            <div class="flex-1">
                <h2 class="text-2xl font-bold">
                    {$user?.displayName || "Anonymous User"}
                </h2>
                <p class="text-blue-100 mb-2">{$user?.email}</p>
                {#if $profileData.bio}
                    <p class="text-white/90">{$profileData.bio}</p>
                {/if}
                <div class="flex items-center space-x-4 mt-3">
                    {#if $profileData.location}
                        <div class="flex items-center space-x-1 text-blue-100">
                            <MapPin class="w-4 h-4" />
                            <span class="text-sm">{$profileData.location}</span>
                        </div>
                    {/if}
                    {#if $profileData.website}
                        <div class="flex items-center space-x-1 text-blue-100">
                            <LinkIcon class="w-4 h-4" />
                            <a
                                href={$profileData.website}
                                target="_blank"
                                class="text-sm hover:text-white transition-colors"
                            >
                                Website
                            </a>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="flex space-x-8">
            {#each tabs as tab}
                <button
                    on:click={() => (activeTab = tab.id)}
                    class="flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors {activeTab ===
                    tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}"
                >
                    <svelte:component this={tab.icon} class="w-4 h-4" />
                    <span>{tab.label}</span>
                </button>
            {/each}
        </nav>
    </div>

    <!-- Tab Content -->
    {#if activeTab === "overview"}
        <!-- Statistics Grid -->
        <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            transition:fade={{ duration: 300 }}
        >
            {#each statCards as stat, index}
                <div
                    class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all transform hover:scale-105"
                    in:fly={{ y: 20, duration: 400, delay: index * 100 }}
                >
                    <div class="flex items-center justify-between">
                        <div>
                            <p
                                class="text-sm font-medium text-gray-600 dark:text-gray-400"
                            >
                                {stat.label}
                            </p>
                            <p
                                class="text-3xl font-bold text-gray-900 dark:text-white mt-1"
                            >
                                {stat.value}
                            </p>
                        </div>
                        <div
                            class="w-12 h-12 bg-gradient-to-r {stat.gradient} rounded-lg flex items-center justify-center"
                        >
                            <svelte:component
                                this={stat.icon}
                                class="w-6 h-6 text-white"
                            />
                        </div>
                    </div>
                </div>
            {/each}
        </div>

        <!-- Activity Chart Placeholder -->
        <div
            class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
            <h3
                class="text-lg font-semibold text-gray-900 dark:text-white mb-4"
            >
                Activity Overview
            </h3>
            <div
                class="h-64 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center"
            >
                <p class="text-gray-500 dark:text-gray-400">
                    Activity chart coming soon
                </p>
            </div>
        </div>
    {:else if activeTab === "profile"}
        <!-- Profile Edit Form -->
        <div
            class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
            transition:fade={{ duration: 300 }}
        >
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Profile Information
                </h3>
                {#if !editing}
                    <button
                        on:click={() => (editing = true)}
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                        <Edit class="w-4 h-4" />
                        <span>Edit Profile</span>
                    </button>
                {/if}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Display Name -->
                <div>
                    <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Display Name
                    </label>
                    <input
                        type="text"
                        bind:value={profileForm.displayName}
                        disabled={!editing}
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
                    />
                </div>

                <!-- Location -->
                <div>
                    <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Location
                    </label>
                    <input
                        type="text"
                        bind:value={profileForm.location}
                        disabled={!editing}
                        placeholder="City, Country"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
                    />
                </div>

                <!-- Website -->
                <div>
                    <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Website
                    </label>
                    <input
                        type="url"
                        bind:value={profileForm.website}
                        disabled={!editing}
                        placeholder="https://yourwebsite.com"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
                    />
                </div>

                <!-- GitHub Username -->
                <div>
                    <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        GitHub Username
                    </label>
                    <div class="relative">
                        <div
                            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                        >
                            <Github class="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            bind:value={profileForm.githubUsername}
                            disabled={!editing}
                            placeholder="username"
                            class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
                        />
                    </div>
                </div>
            </div>

            <!-- Bio -->
            <div class="mt-6">
                <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                    Bio
                </label>
                <textarea
                    bind:value={profileForm.bio}
                    disabled={!editing}
                    rows="4"
                    placeholder="Tell us about yourself..."
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 resize-none"
                ></textarea>
            </div>

            {#if editing}
                <div
                    class="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                >
                    <button
                        on:click={() => (editing = false)}
                        class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        on:click={handleSaveProfile}
                        disabled={saving}
                        class="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all flex items-center space-x-2"
                    >
                        {#if saving}
                            <div
                                class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                            ></div>
                        {:else}
                            <Save class="w-4 h-4" />
                        {/if}
                        <span>Save Changes</span>
                    </button>
                </div>
            {/if}
        </div>
    {:else if activeTab === "settings"}
        <!-- Settings Form -->
        <div class="space-y-6" transition:fade={{ duration: 300 }}>
            <!-- Appearance Settings -->
            <div
                class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
            >
                <h3
                    class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2"
                >
                    <Palette class="w-5 h-5" />
                    <span>Appearance</span>
                </h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Theme -->
                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                            Theme
                        </label>
                        <button
                            on:click={toggleTheme}
                            class="w-full flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div class="flex items-center space-x-3">
                                <Monitor class="w-5 h-5 text-gray-500" />
                                <span class="text-gray-900 dark:text-white">
                                    {$theme === "light"
                                        ? "Light Mode"
                                        : "Dark Mode"}
                                </span>
                            </div>
                            <div
                                class="w-6 h-6 rounded-full bg-gradient-to-r {$theme ===
                                'light'
                                    ? 'from-yellow-400 to-orange-400'
                                    : 'from-blue-600 to-purple-600'}"
                            ></div>
                        </button>
                    </div>

                    <!-- Editor Theme -->
                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                            Editor Theme
                        </label>
                        <select
                            bind:value={settingsForm.editorTheme}
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="vs">Light</option>
                            <option value="vs-dark">Dark</option>
                            <option value="hc-black">High Contrast</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Privacy Settings -->
            <div
                class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
            >
                <h3
                    class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2"
                >
                    <Lock class="w-5 h-5" />
                    <span>Privacy</span>
                </h3>

                <div class="space-y-4">
                    <label class="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            bind:checked={settingsForm.publicProfile}
                            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                            <span
                                class="text-gray-900 dark:text-white font-medium"
                                >Public Profile</span
                            >
                            <p class="text-sm text-gray-500 dark:text-gray-400">
                                Allow others to view your profile and public
                                snippets
                            </p>
                        </div>
                    </label>
                </div>
            </div>

            <!-- Save Settings -->
            <div class="flex justify-end">
                <button
                    on:click={handleSaveProfile}
                    disabled={saving}
                    class="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all flex items-center space-x-2"
                >
                    {#if saving}
                        <div
                            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                        ></div>
                    {:else}
                        <Save class="w-4 h-4" />
                    {/if}
                    <span>Save Settings</span>
                </button>
            </div>
        </div>
    {/if}
</div>
