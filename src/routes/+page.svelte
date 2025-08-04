<script>
    import {
        Code2,
        Zap,
        Shield,
        Users,
        ArrowRight,
        Github,
        Star,
        BookOpen,
    } from "lucide-svelte";
    import { toggleTheme, theme } from "$lib/stores/ui.js";
    import { goto } from "$app/navigation";
</script>

<!-- Hero Section -->
<section
    class="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"
>
    <div class="absolute inset-0 bg-grid-pattern opacity-5"></div>

    <!-- Navigation -->
    <nav class="relative z-10 px-6 py-4">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <div class="flex items-center space-x-2">
                <div
                    class="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"
                >
                    <Code2 class="w-5 h-5 text-white" />
                </div>
                <span
                    class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                >
                    CodeVault
                </span>
            </div>

            <div class="flex items-center space-x-4">
                <button
                    on:click={toggleTheme}
                    class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    {#if $theme === "light"}
                        🌙
                    {:else}
                        ☀️
                    {/if}
                </button>
                <button
                    on:click={() => goto("/auth/signin")}
                    class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    Sign In
                </button>
                <button
                    on:click={() => goto("/auth/signup")}
                    class="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                    Get Started
                </button>
            </div>
        </div>
    </nav>

    <!-- Hero Content -->
    <div class="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
            <div class="space-y-8">
                <div class="space-y-4">
                    <h1 class="text-5xl lg:text-6xl font-bold leading-tight">
                        Your Code,
                        <span
                            class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                        >
                            Organized
                        </span>
                    </h1>
                    <p
                        class="text-xl text-gray-600 dark:text-gray-300 leading-relaxed"
                    >
                        Store, organize, and share your code snippets with the
                        world. Built for developers who value clean code and
                        seamless collaboration.
                    </p>
                </div>

                <div class="flex flex-col sm:flex-row gap-4">
                    <button
                        on:click={() => goto("/auth/signup")}
                        class="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 font-semibold"
                    >
                        <span>Start Building</span>
                        <ArrowRight class="w-5 h-5" />
                    </button>
                    <button
                        class="px-8 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 transition-colors flex items-center justify-center space-x-2 font-semibold"
                    >
                        <Github class="w-5 h-5" />
                        <span>View on GitHub</span>
                    </button>
                </div>

                <div
                    class="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400"
                >
                    <div class="flex items-center space-x-1">
                        <Star class="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>1.2k stars</span>
                    </div>
                    <div class="flex items-center space-x-1">
                        <Users class="w-4 h-4" />
                        <span>500+ developers</span>
                    </div>
                    <div class="flex items-center space-x-1">
                        <BookOpen class="w-4 h-4" />
                        <span>10k+ snippets</span>
                    </div>
                </div>
            </div>

            <div class="relative">
                <div
                    class="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl"
                ></div>
                <img
                    src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                    alt="Code editor interface"
                    class="relative z-10 w-full rounded-2xl shadow-2xl"
                />
            </div>
        </div>
    </div>
</section>

<!-- Features Section -->
<section class="py-20 bg-white dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-6">
        <div class="text-center space-y-4 mb-16">
            <h2 class="text-4xl font-bold">Why Choose CodeVault?</h2>
            <p
                class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
                Everything you need to manage your code snippets efficiently
            </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
            <div
                class="group p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all hover:shadow-lg"
            >
                <div
                    class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                >
                    <Code2 class="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 class="text-xl font-semibold mb-4">Smart Organization</h3>
                <p class="text-gray-600 dark:text-gray-300">
                    Organize your snippets with tags, categories, and powerful
                    search. Find what you need instantly.
                </p>
            </div>

            <div
                class="group p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all hover:shadow-lg"
            >
                <div
                    class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                >
                    <Zap class="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 class="text-xl font-semibold mb-4">Lightning Fast</h3>
                <p class="text-gray-600 dark:text-gray-300">
                    Built with modern web technologies for blazing fast
                    performance and smooth user experience.
                </p>
            </div>

            <div
                class="group p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all hover:shadow-lg"
            >
                <div
                    class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                >
                    <Shield
                        class="w-6 h-6 text-green-600 dark:text-green-400"
                    />
                </div>
                <h3 class="text-xl font-semibold mb-4">Secure & Private</h3>
                <p class="text-gray-600 dark:text-gray-300">
                    Your code is secure with Firebase authentication and
                    granular privacy controls.
                </p>
            </div>
        </div>
    </div>
</section>

<!-- CTA Section -->
<section class="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
    <div class="max-w-4xl mx-auto text-center px-6">
        <h2 class="text-4xl font-bold text-white mb-6">
            Ready to organize your code?
        </h2>
        <p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who trust CodeVault to manage their
            code snippets.
        </p>
        <button
            on:click={() => goto("/auth/signup")}
            class="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all transform hover:scale-105 font-semibold text-lg"
        >
            Get Started for Free
        </button>
    </div>
</section>

<style>
    .bg-grid-pattern {
        background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px);
        background-size: 20px 20px;
    }
</style>
