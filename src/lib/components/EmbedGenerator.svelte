<script>
	// @ts-nocheck
	import { createEventDispatcher } from 'svelte';
	import { X, Copy, Code, ExternalLink } from 'lucide-svelte';
	import { fade, scale } from 'svelte/transition';
	
	export let isOpen = false;
	export let snippet = null;
	
	const dispatch = createEventDispatcher();
	
	let embedWidth = '100%';
	let embedHeight = '500px';
	let showBorder = true;
	let copied = false;
	
	$: embedUrl = snippet ? `${window.location.origin}/embed/${snippet.id}` : '';
	$: embedCode = `<iframe 
  src="${embedUrl}" 
  width="${embedWidth}" 
  height="${embedHeight}"${showBorder ? '' : ' frameborder="0"'}
  style="border: ${showBorder ? '1px solid #e5e7eb' : 'none'}; border-radius: 8px;"
  title="${snippet?.title || 'Code Snippet'}"
></iframe>`;
	
	const handleClose = () => {
		dispatch('close');
	};
	
	const handleBackdropClick = (e) => {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	};
	
	const copyEmbedCode = async () => {
		try {
			await navigator.clipboard.writeText(embedCode);
			copied = true;
			setTimeout(() => copied = false, 2000);
		} catch (err) {
			console.error('Failed to copy embed code:', err);
		}
	};
	
	const openPreview = () => {
		window.open(embedUrl, '_blank');
	};
</script>

{#if isOpen && snippet}
	<div 
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
		on:click={handleBackdropClick}
		transition:fade={{ duration: 200 }}
	>
		<div 
			class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
			transition:scale={{ duration: 200, start: 0.95 }}
		>
			<!-- Header -->
			<div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
					<Code class="w-5 h-5" />
					<span>Embed Snippet</span>
				</h2>
				<button 
					on:click={handleClose}
					class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
				>
					<X class="w-5 h-5 text-gray-500" />
				</button>
			</div>
			
			<!-- Content -->
			<div class="p-6 space-y-6">
				<!-- Snippet Info -->
				<div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
					<h3 class="font-medium text-gray-900 dark:text-white mb-1">{snippet.title}</h3>
					{#if snippet.description}
						<p class="text-sm text-gray-600 dark:text-gray-400">{snippet.description}</p>
					{/if}
				</div>
				
				<!-- Embed Options -->
				<div class="space-y-4">
					<h3 class="text-lg font-medium text-gray-900 dark:text-white">Embed Options</h3>
					
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="width" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Width
							</label>
							<input
								id="width"
								type="text"
								bind:value={embedWidth}
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
								placeholder="100%"
							/>
						</div>
						
						<div>
							<label for="height" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Height
							</label>
							<input
								id="height"
								type="text"
								bind:value={embedHeight}
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
								placeholder="500px"
							/>
						</div>
					</div>
					
					<label class="flex items-center space-x-2">
						<input
							type="checkbox"
							bind:checked={showBorder}
							class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
						/>
						<span class="text-sm text-gray-700 dark:text-gray-300">Show border</span>
					</label>
				</div>
				
				<!-- Embed Code -->
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<h3 class="text-lg font-medium text-gray-900 dark:text-white">Embed Code</h3>
						<div class="flex items-center space-x-2">
							<button
								on:click={openPreview}
								class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-1"
							>
								<ExternalLink class="w-3 h-3" />
								<span>Preview</span>
							</button>
							<button
								on:click={copyEmbedCode}
								class="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
							>
								<Copy class="w-3 h-3" />
								<span>{copied ? 'Copied!' : 'Copy'}</span>
							</button>
						</div>
					</div>
					
					<textarea
						readonly
						value={embedCode}
						class="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none"
					></textarea>
				</div>
				
				<!-- Direct Link -->
				<div class="space-y-2">
					<h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Direct Link</h3>
					<div class="flex items-center space-x-2">
						<input
							readonly
							value={embedUrl}
							class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
						/>
						<button
							on:click={() => navigator.clipboard.writeText(embedUrl)}
							class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
						>
							<Copy class="w-4 h-4" />
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}