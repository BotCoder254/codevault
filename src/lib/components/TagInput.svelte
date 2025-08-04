<script>
	// @ts-nocheck
	import { createEventDispatcher, onMount } from 'svelte';
	import { Tag, X, Check } from 'lucide-svelte';
	import { getTagSuggestions, tagSuggestions } from '$lib/stores/tags.js';
	import { fade, slide } from 'svelte/transition';
	
	export let tags = [];
	export let placeholder = 'Add tags (press Enter)';
	
	const dispatch = createEventDispatcher();
	
	let tagInput = '';
	let showSuggestions = false;
	let selectedSuggestionIndex = -1;
	let inputElement;
	let suggestionsContainer;
	let newTagAnimation = '';
	
	$: {
		if (tagInput.length > 0) {
			getTagSuggestions(tagInput);
			showSuggestions = $tagSuggestions.length > 0;
		} else {
			showSuggestions = false;
		}
	}
	
	const addTag = (tagName = tagInput.trim().toLowerCase()) => {
		if (tagName && !tags.includes(tagName)) {
			tags = [...tags, tagName];
			tagInput = '';
			showSuggestions = false;
			selectedSuggestionIndex = -1;
			
			// Trigger animation for new tag
			newTagAnimation = tagName;
			setTimeout(() => {
				newTagAnimation = '';
			}, 600);
			
			dispatch('tagsChanged', tags);
		}
	};
	
	const removeTag = (tagToRemove) => {
		tags = tags.filter(tag => tag !== tagToRemove);
		dispatch('tagsChanged', tags);
	};
	
	const handleKeydown = (e) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			if (selectedSuggestionIndex >= 0 && $tagSuggestions[selectedSuggestionIndex]) {
				addTag($tagSuggestions[selectedSuggestionIndex]);
			} else {
				addTag();
			}
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, $tagSuggestions.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
		} else if (e.key === 'Escape') {
			showSuggestions = false;
			selectedSuggestionIndex = -1;
		}
	};
	
	const handleBlur = (e) => {
		// Delay hiding suggestions to allow clicking on them
		setTimeout(() => {
			if (!suggestionsContainer?.contains(document.activeElement)) {
				showSuggestions = false;
				selectedSuggestionIndex = -1;
				if (tagInput.trim()) {
					addTag();
				}
			}
		}, 150);
	};
	
	const selectSuggestion = (suggestion) => {
		addTag(suggestion);
		inputElement?.focus();
	};
	
	onMount(() => {
		return () => {
			showSuggestions = false;
		};
	});
</script>

<div class="relative">
	<!-- Tags Display -->
	<div class="flex flex-wrap gap-2 mb-2">
		{#each tags as tag}
			<span 
				class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 transition-all {newTagAnimation === tag ? 'animate-bounce' : ''}"
				class:animate-pulse={newTagAnimation === tag}
			>
				<Tag class="w-3 h-3 mr-1" />
				{tag}
				<button
					type="button"
					on:click={() => removeTag(tag)}
					class="ml-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
				>
					<X class="w-3 h-3" />
				</button>
				{#if newTagAnimation === tag}
					<div transition:fade={{ duration: 300 }}>
						<Check class="w-3 h-3 ml-1 text-green-500 animate-ping" />
					</div>
				{/if}
			</span>
		{/each}
	</div>
	
	<!-- Input Field -->
	<div class="relative">
		<input
			bind:this={inputElement}
			type="text"
			bind:value={tagInput}
			on:keydown={handleKeydown}
			on:blur={handleBlur}
			on:focus={() => {
				if (tagInput.length > 0) {
					getTagSuggestions(tagInput);
					showSuggestions = $tagSuggestions.length > 0;
				}
			}}
			class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
			{placeholder}
		/>
		
		<!-- Suggestions Dropdown -->
		{#if showSuggestions && $tagSuggestions.length > 0}
			<div 
				bind:this={suggestionsContainer}
				class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto"
				transition:slide={{ duration: 200 }}
			>
				{#each $tagSuggestions as suggestion, index}
					<button
						type="button"
						on:click={() => selectSuggestion(suggestion)}
						class="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 {selectedSuggestionIndex === index ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}"
					>
						<Tag class="w-3 h-3 text-gray-400" />
						<span>{suggestion}</span>
						{#if selectedSuggestionIndex === index}
							<div class="ml-auto">
								<div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
							</div>
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	</div>
	
	<!-- Helper Text -->
	<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
		Press Enter to add tags, use arrow keys to navigate suggestions
	</p>
</div>

<style>
	@keyframes bounce {
		0%, 20%, 53%, 80%, 100% {
			transform: translate3d(0,0,0);
		}
		40%, 43% {
			transform: translate3d(0,-8px,0);
		}
		70% {
			transform: translate3d(0,-4px,0);
		}
		90% {
			transform: translate3d(0,-2px,0);
		}
	}
	
	.animate-bounce {
		animation: bounce 0.6s ease-in-out;
	}
</style>