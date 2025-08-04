<script>
	import { Code2 } from 'lucide-svelte';
	import { toggleTheme, theme } from '$lib/stores/ui.js';
	
	let { children } = $props();
</script>

<div class="min-h-screen grid lg:grid-cols-2">
	<!-- Left side - Image -->
	<div class="hidden lg:block relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700">
		<div class="absolute inset-0 bg-black/20"></div>
		<img 
			src="https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
			alt="Developer workspace"
			class="w-full h-full object-cover"
		/>
		<div class="absolute inset-0 flex items-center justify-center">
			<div class="text-center text-white space-y-6 max-w-md px-8">
				<div class="flex items-center justify-center space-x-3">
					<div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
						<Code2 class="w-7 h-7 text-white" />
					</div>
					<span class="text-3xl font-bold">CodeVault</span>
				</div>
				<h2 class="text-2xl font-semibold">Organize your code snippets like a pro</h2>
				<p class="text-blue-100 leading-relaxed">
					Join thousands of developers who trust CodeVault to manage, share, and discover amazing code snippets.
				</p>
			</div>
		</div>
	</div>
	
	<!-- Right side - Form -->
	<div class="flex items-center justify-center p-8 bg-white dark:bg-gray-900">
		<div class="w-full max-w-md space-y-8">
			<!-- Mobile logo -->
			<div class="lg:hidden text-center">
				<div class="flex items-center justify-center space-x-2 mb-2">
					<div class="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
						<Code2 class="w-5 h-5 text-white" />
					</div>
					<span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
						CodeVault
					</span>
				</div>
			</div>
			
			<!-- Theme toggle -->
			<div class="flex justify-end">
				<button 
					onclick={toggleTheme}
					class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
				>
					{#if $theme === 'light'}
						🌙
					{:else}
						☀️
					{/if}
				</button>
			</div>
			
			{@render children?.()}
		</div>
	</div>
</div>