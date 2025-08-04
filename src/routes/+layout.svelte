<script>
	import "../app.css";
	import { theme } from '$lib/stores/ui.js';
	import { onMount } from 'svelte';
	
	let { children } = $props();
	
	onMount(() => {
		// Initialize theme on mount
		if ($theme === 'dark') {
			document.documentElement.classList.add('dark');
		}
	});
</script>

<svelte:head>
	<title>CodeVault - Modern Code Snippets Manager</title>
	<meta name="description" content="Organize, share, and discover code snippets with CodeVault" />
</svelte:head>

<div class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
	{@render children?.()}
</div>
