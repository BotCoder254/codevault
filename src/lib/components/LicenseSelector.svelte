<script>
  import { createEventDispatcher } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import { X, ExternalLink } from 'lucide-svelte';
  import { availableLicenses, updateSnippetLicense, licenseLoading } from '$lib/stores/licenses.js';
  import { user } from '$lib/stores/auth.js';

  export let snippet;
  export let isOpen = false;
  
  const dispatch = createEventDispatcher();
  
  let selectedLicenseId = snippet.licenseId || '';
  let submitting = false;
  
  const handleSaveLicense = async () => {
    if (!$user) return;
    
    submitting = true;
    
    const result = await updateSnippetLicense(
      snippet.id,
      selectedLicenseId,
      $user
    );
    
    if (result.success) {
      close();
    } else {
      console.error('Failed to update license:', result.error);
    }
    
    submitting = false;
  };
  
  const close = () => {
    dispatch('close');
  };
</script>

<div 
  class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
  transition:fade={{ duration: 200 }}
>
  <div 
    class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
    transition:slide={{ duration: 300, axis: 'y' }}
  >
    <!-- Header -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        Choose License for "{snippet.title}"
      </h3>
      <button
        on:click={close}
        class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <X class="w-5 h-5 text-gray-500" />
      </button>
    </div>
    
    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4">
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Choosing a license helps others understand how they can use, modify, and share your code.
      </p>
      
      <div class="space-y-3">
        <!-- No License Option -->
        <label class="block">
          <input 
            type="radio" 
            bind:group={selectedLicenseId} 
            value="" 
            class="sr-only" 
          />
          <div class="p-4 border-2 rounded-lg cursor-pointer transition-all {selectedLicenseId === '' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}">
            <div class="flex items-center justify-between">
              <h4 class="font-medium text-gray-900 dark:text-white">No License (All Rights Reserved)</h4>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              You retain all rights and do not permit distribution, reproduction, or derivative works. Others cannot legally use, modify, or share your code.
            </p>
          </div>
        </label>
        
        <!-- License Options -->
        {#each availableLicenses as license}
          <label class="block">
            <input 
              type="radio" 
              bind:group={selectedLicenseId} 
              value={license.id} 
              class="sr-only" 
            />
            <div class="p-4 border-2 rounded-lg cursor-pointer transition-all {selectedLicenseId === license.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <h4 class="font-medium text-gray-900 dark:text-white">{license.name}</h4>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {license.color}">
                    {license.shortName}
                  </span>
                </div>
                <a 
                  href={license.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  <span class="text-xs">Learn more</span>
                  <ExternalLink class="w-3 h-3" />
                </a>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {license.description}
              </p>
            </div>
          </label>
        {/each}
      </div>
    </div>
    
    <!-- Footer -->
    <div class="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
      <button
        on:click={close}
        class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors mr-2"
      >
        Cancel
      </button>
      <button
        on:click={handleSaveLicense}
        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
        disabled={submitting}
      >
        {#if submitting || $licenseLoading}
          <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        {/if}
        <span>Apply License</span>
      </button>
    </div>
  </div>
</div>