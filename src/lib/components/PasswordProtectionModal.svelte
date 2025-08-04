<script>
  import { createEventDispatcher } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { X, Lock, Copy, Check, Key } from 'lucide-svelte';
  import { setSnippetPassword, generateShareLink } from '$lib/stores/password.js';
  import { user } from '$lib/stores/auth.js';
  
  export let snippet;
  export let isOpen = false;
  
  const dispatch = createEventDispatcher();
  
  let password = '';
  let confirmPassword = '';
  let showPassword = false;
  let loading = false;
  let error = '';
  let success = '';
  let copied = false;
  let shareLink = '';
  
  $: if (snippet) {
    shareLink = generateShareLink(snippet.id);
  }
  
  $: passwordsMatch = password === confirmPassword;
  $: canSave = password.length >= 6 && passwordsMatch;
  
  const handleSubmit = async () => {
    if (!canSave) return;
    
    loading = true;
    error = '';
    success = '';
    
    const result = await setSnippetPassword(snippet.id, password, $user);
    
    if (result.success) {
      success = 'Password protection enabled successfully!';
      snippet = { ...snippet, isPasswordProtected: true };
    } else {
      error = result.error || 'Failed to set password';
    }
    
    loading = false;
  };
  
  const handleRemovePassword = async () => {
    if (!confirm('Are you sure you want to remove password protection?')) return;
    
    loading = true;
    error = '';
    success = '';
    
    const result = await setSnippetPassword(snippet.id, null, $user);
    
    if (result.success) {
      success = 'Password protection removed successfully!';
      password = '';
      confirmPassword = '';
      snippet = { ...snippet, isPasswordProtected: false };
    } else {
      error = result.error || 'Failed to remove password';
    }
    
    loading = false;
  };
  
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 2000);
  };
  
  const handleClose = () => {
    dispatch('close');
  };
</script>

<div 
  class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
  transition:fade={{ duration: 200 }}
  style="backdrop-filter: blur(5px);"
>
  <div 
    class="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md"
    transition:scale={{ duration: 200, start: 0.95 }}
  >
    <!-- Header -->
    <div class="p-4 border-b border-gray-700 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-white flex items-center">
        <Lock class="w-5 h-5 mr-2 text-blue-400" />
        Password Protection
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
      
      {#if success}
        <div class="bg-green-900/30 text-green-300 p-3 rounded-lg mb-4">
          {success}
        </div>
      {/if}
      
      <p class="text-gray-300 mb-4">
        {#if snippet?.isPasswordProtected}
          This snippet is currently password protected. You can change the password or remove protection.
        {:else}
          Add a password to protect your snippet. Only people with the password will be able to view it.
        {/if}
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
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              disabled={loading}
            />
            <button
              type="button"
              on:click={() => showPassword = !showPassword}
              class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-300"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {#if password && password.length < 6}
            <p class="mt-1 text-sm text-red-400">Password must be at least 6 characters</p>
          {/if}
        </div>
        
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            bind:value={confirmPassword}
            placeholder="Confirm password"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            disabled={loading}
          />
          {#if confirmPassword && !passwordsMatch}
            <p class="mt-1 text-sm text-red-400">Passwords do not match</p>
          {/if}
        </div>
        
        <div class="pt-2">
          {#if snippet?.isPasswordProtected}
            <div class="flex space-x-3">
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors flex-1 flex items-center justify-center"
                disabled={!canSave || loading}
              >
                {#if loading}
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {/if}
                Update Password
              </button>
              
              <button
                type="button"
                on:click={handleRemovePassword}
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors flex items-center justify-center"
                disabled={loading}
              >
                {#if loading}
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {/if}
                Remove
              </button>
            </div>
          {:else}
            <button
              type="submit"
              class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors flex items-center justify-center"
              disabled={!canSave || loading}
            >
              {#if loading}
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {/if}
              Enable Password Protection
            </button>
          {/if}
        </div>
      </form>
      
      {#if snippet?.isPasswordProtected}
        <div class="mt-6 pt-4 border-t border-gray-700">
          <h4 class="text-sm font-medium text-gray-300 mb-2 flex items-center">
            <Key class="w-4 h-4 mr-1 text-blue-400" />
            Share Link
          </h4>
          <div class="flex">
            <input
              type="text"
              value={shareLink}
              readonly
              class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <button
              on:click={copyShareLink}
              class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg transition-colors flex items-center"
              title="Copy to clipboard"
            >
              {#if copied}
                <Check class="w-5 h-5" />
              {:else}
                <Copy class="w-5 h-5" />
              {/if}
            </button>
          </div>
          <p class="mt-2 text-sm text-gray-400">
            Share this link with others. They will need to enter the password to view the snippet.
          </p>
        </div>
      {/if}
    </div>
  </div>
</div>