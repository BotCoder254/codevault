<script>
  import { createEventDispatcher } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { X, Lock, Eye, EyeOff } from 'lucide-svelte';
  import { verifySnippetPassword } from '$lib/stores/password.js';
  import { backgroundImage } from '$lib/stores/background.js';
  
  export let snippetId;
  export let isOpen = false;
  
  const dispatch = createEventDispatcher();
  
  let password = '';
  let showPassword = false;
  let loading = false;
  let error = '';
  
  const handleSubmit = async () => {
    if (!password) return;
    
    loading = true;
    error = '';
    
    const result = await verifySnippetPassword(snippetId, password);
    
    if (result.success) {
      dispatch('verified');
    } else {
      error = result.error || 'Invalid password';
    }
    
    loading = false;
  };
  
  const handleClose = () => {
    dispatch('close');
  };
</script>

<div 
  class="fixed inset-0 flex items-center justify-center p-4 z-50"
  transition:fade={{ duration: 200 }}
  style="background-image: url('{$backgroundImage.url}'); background-size: cover; background-position: center; backdrop-filter: blur({$backgroundImage.blur});"
>
  <div 
    class="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md"
    transition:scale={{ duration: 200, start: 0.95 }}
  >
    <!-- Header -->
    <div class="p-4 border-b border-gray-700 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-white flex items-center">
        <Lock class="w-5 h-5 mr-2 text-yellow-400" />
        Password Protected Snippet
      </h3>
      <button
        on:click={handleClose}
        class="p-1 rounded-lg hover:bg-gray-700 transition-colors"
      >
        <X class="w-5 h-5 text-gray-400" />
      </button>
    </div>
    
    <!-- Content -->
    <div class="p-6">
      {#if error}
        <div class="bg-red-900/30 text-red-300 p-3 rounded-lg mb-4">
          {error}
        </div>
      {/if}
      
      <p class="text-gray-300 mb-4">
        This snippet is password protected. Please enter the password to view it.
      </p>
      
      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div>
          <label for="password" class="block text-sm font-medium text-gray-300 mb-1">Password</label>
          <div class="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              bind:value={password}
              placeholder="Enter password"
              class="w-full pl-3 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              disabled={loading}
              autofocus
            />
            <button
              type="button"
              on:click={() => showPassword = !showPassword}
              class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-300"
            >
              {#if showPassword}
                <EyeOff class="w-4 h-4" />
              {:else}
                <Eye class="w-4 h-4" />
              {/if}
            </button>
          </div>
        </div>
        
        <div class="pt-2">
          <button
            type="submit"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors flex items-center justify-center"
            disabled={!password || loading}
          >
            {#if loading}
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            {/if}
            Unlock Snippet
          </button>
        </div>
      </form>
    </div>
  </div>
</div>