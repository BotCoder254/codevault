<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { db } from '$lib/firebase.js';
  import { doc, getDoc } from 'firebase/firestore';
  import { user } from '$lib/stores/auth.js';
  import { verifySnippetPassword } from '$lib/stores/password.js';
  import { backgroundImage } from '$lib/stores/background.js';
  import { Copy, Lock, Eye, Check } from 'lucide-svelte';
  import PasswordEntryModal from '$lib/components/PasswordEntryModal.svelte';
  import MonacoEditor from '$lib/components/MonacoEditor.svelte';
  
  let snippet = null;
  let loading = true;
  let error = null;
  let showPasswordModal = false;
  let passwordVerified = false;
  let copying = false;
  
  onMount(async () => {
    const snippetId = $page.params.id;
    
    try {
      const snippetRef = doc(db, 'snippets', snippetId);
      const snippetDoc = await getDoc(snippetRef);
      
      if (!snippetDoc.exists()) {
        error = 'Snippet not found';
        loading = false;
        return;
      }
      
      const snippetData = {
        id: snippetDoc.id,
        ...snippetDoc.data()
      };
      
      snippet = snippetData;
      
      // Check if snippet is password protected
      if (snippet.isPasswordProtected) {
        showPasswordModal = true;
      } else {
        passwordVerified = true;
      }
      
      loading = false;
    } catch (err) {
      console.error('Error loading snippet:', err);
      error = 'Failed to load snippet';
      loading = false;
    }
  });
  
  const handlePasswordVerified = () => {
    passwordVerified = true;
    showPasswordModal = false;
  };
  
  const handleCopyCode = async () => {
    if (!snippet?.code) return;
    
    try {
      await navigator.clipboard.writeText(snippet.code);
      copying = true;
      setTimeout(() => {
        copying = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };
  
  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
</script>

<div 
  class="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4"
  style="background-image: url('{$backgroundImage.url}'); background-size: cover; background-position: center; backdrop-filter: blur({$backgroundImage.blur});"
>
  <div class="w-full max-w-4xl">
    {#if loading}
      <div class="flex justify-center items-center py-12">
        <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    {:else if error}
      <div class="bg-gray-800 rounded-xl p-8 text-center">
        <div class="text-red-400 text-xl font-medium mb-2">{error}</div>
        <p class="text-gray-400">The snippet you're looking for might have been removed or is not accessible.</p>
      </div>
    {:else if snippet}
      <div class="bg-gray-800 rounded-xl shadow-xl overflow-hidden">
        <!-- Header -->
        <div class="p-6 border-b border-gray-700">
          <div class="flex items-center justify-between">
            <h1 class="text-xl font-semibold text-white">{snippet.title}</h1>
            
            {#if snippet.isPasswordProtected && passwordVerified}
              <div class="flex items-center text-yellow-400">
                <Lock class="w-4 h-4 mr-1" />
                <span class="text-sm">Password Protected</span>
              </div>
            {/if}
          </div>
          
          {#if snippet.description}
            <p class="mt-2 text-gray-300">{snippet.description}</p>
          {/if}
          
          <div class="mt-4 flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300">
              {snippet.language}
            </span>
            
            {#if snippet.createdAt}
              <span class="text-xs text-gray-400">
                Created {formatDate(snippet.createdAt)}
              </span>
            {/if}
          </div>
        </div>
        
        <!-- Content -->
        {#if passwordVerified}
          <div class="p-6">
            <div class="relative">
              <div class="absolute top-2 right-2 z-10">
                <button
                  on:click={handleCopyCode}
                  class="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-1"
                  title="Copy code"
                >
                  {#if copying}
                    <Check class="w-4 h-4 text-green-400" />
                    <span class="text-sm text-green-400">Copied!</span>
                  {:else}
                    <Copy class="w-4 h-4 text-gray-300" />
                    <span class="text-sm text-gray-300">Copy</span>
                  {/if}
                </button>
              </div>
              
              <div class="rounded-lg overflow-hidden border border-gray-700">
                <MonacoEditor value={snippet.code} language={snippet.language} height="400px" readOnly={true} />
              </div>
            </div>
          </div>
        {:else}
          <div class="p-12 text-center">
            <Lock class="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 class="text-xl font-medium text-white mb-2">Password Protected Snippet</h2>
            <p class="text-gray-400 max-w-md mx-auto">
              This snippet is password protected. Please enter the password to view it.
            </p>
            <button
              on:click={() => showPasswordModal = true}
              class="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              <Eye class="w-4 h-4" />
              Enter Password
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

{#if showPasswordModal && snippet}
  <PasswordEntryModal
    snippetId={snippet.id}
    isOpen={showPasswordModal}
    on:verified={handlePasswordVerified}
    on:close={() => showPasswordModal = false}
  />
{/if}