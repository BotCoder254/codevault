<script>
    // @ts-nocheck
    import { Mail, ArrowLeft } from "lucide-svelte";
    import { resetPassword } from "$lib/stores/auth.js";
    import { goto } from "$app/navigation";

    let email = "";
    let loading = false;
    let success = false;
    let error = "";

    const handleSubmit = async (e) => {
        e.preventDefault();
        loading = true;
        error = "";

        const result = await resetPassword(email);

        if (result.success) {
            success = true;
        } else {
            error = result.error;
        }

        loading = false;
    };
</script>

<div class="space-y-6">
    <button
        on:click={() => goto("/auth/signin")}
        class="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
    >
        <ArrowLeft class="w-4 h-4" />
        <span>Back to sign in</span>
    </button>

    <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Reset your password
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a link to reset your
            password
        </p>
    </div>

    {#if success}
        <div
            class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
        >
            <p class="text-green-600 dark:text-green-400 text-sm">
                Password reset email sent! Check your inbox and follow the
                instructions to reset your password.
            </p>
        </div>
    {:else}
        {#if error}
            <div
                class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
                <p class="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
        {/if}

        <form on:submit={handleSubmit} class="space-y-4">
            <div class="space-y-2">
                <label
                    for="email"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    Email address
                </label>
                <div class="relative">
                    <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    >
                        <Mail class="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="email"
                        type="email"
                        bind:value={email}
                        required
                        class="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Enter your email"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
            >
                {#if loading}
                    <div
                        class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                    ></div>
                {:else}
                    Send reset email
                {/if}
            </button>
        </form>
    {/if}

    <p class="text-center text-sm text-gray-600 dark:text-gray-400">
        Remember your password?
        <a
            href="/auth/signin"
            class="font-medium text-blue-600 hover:text-blue-500"
        >
            Sign in
        </a>
    </p>
</div>
