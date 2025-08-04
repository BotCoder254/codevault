<script>
  import { onMount } from 'svelte';
  import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import { user } from '$lib/stores/auth.js';
  import { MessageCircle, HelpCircle, Search } from 'lucide-svelte';
  import FeedbackRequestModal from '$lib/components/FeedbackRequestModal.svelte';

  let feedbackRequests = [];
  let loading = true;
  let searchQuery = '';
  let selectedSnippet = null;
  let selectedFeedbackRequests = [];
  let selectedComments = [];
  let showFeedbackModal = false;

  // Filter feedback requests based on search
  $: filteredRequests = feedbackRequests.filter(request => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      request.snippetTitle?.toLowerCase().includes(lowerQuery) ||
      request.userName?.toLowerCase().includes(lowerQuery) ||
      request.requestType?.toLowerCase().includes(lowerQuery)
    );
  });

  onMount(async () => {
    if ($user) {
      await loadFeedbackRequests();
    }
  });

  $: if ($user && !feedbackRequests.length && loading) {
    loadFeedbackRequests();
  }

  async function loadFeedbackRequests() {
    loading = true;
    try {
      // Get all public snippets
      const snippetsQuery = query(
        collection(db, 'snippets'),
        where('visibility', '==', 'public')
      );
      
      const snippetsSnapshot = await getDocs(snippetsQuery);
      const requests = [];
      
      // For each snippet, check if it has feedback requests
      for (const snippetDoc of snippetsSnapshot.docs) {
        const snippet = { id: snippetDoc.id, ...snippetDoc.data() };
        
        const feedbackQuery = query(
          collection(db, `snippets/${snippet.id}/feedbackRequests`),
          orderBy('createdAt', 'desc')
        );
        
        const feedbackSnapshot = await getDocs(feedbackQuery);
        
        if (!feedbackSnapshot.empty) {
          feedbackSnapshot.forEach(requestDoc => {
            requests.push({
              id: requestDoc.id,
              snippetId: snippet.id,
              snippetTitle: snippet.title,
              snippetAuthor: snippet.userName || snippet.userEmail,
              ...requestDoc.data()
            });
          });
        }
      }
      
      feedbackRequests = requests;
    } catch (error) {
      console.error('Error loading feedback requests:', error);
    } finally {
      loading = false;
    }
  }

  async function loadCommentsForRequest(snippetId, requestId) {
    try {
      const commentsQuery = query(
        collection(db, `snippets/${snippetId}/feedbackRequests/${requestId}/comments`),
        orderBy('createdAt', 'asc')
      );
      
      const commentsSnapshot = await getDocs(commentsQuery);
      const comments = [];
      
      commentsSnapshot.forEach(doc => {
        comments.push({
          id: doc.id,
          requestId,
          ...doc.data()
        });
      });
      
      return comments;
    } catch (error) {
      console.error('Error loading comments:', error);
      return [];
    }
  }

  async function handleViewFeedback(request) {
    try {
      // Get the full snippet details
      const snippetDocRef = doc(db, 'snippets', request.snippetId);
      const snippetDocSnap = await getDoc(snippetDocRef);
      if (snippetDocSnap.exists()) {
        selectedSnippet = { id: snippetDocSnap.id, ...snippetDocSnap.data() };
      } else {
        selectedSnippet = { 
          id: request.snippetId, 
          title: request.snippetTitle,
          code: "// Snippet content not available"
        };
      }
      
      // Get all feedback requests for this snippet
      const feedbackQuery = query(
        collection(db, `snippets/${request.snippetId}/feedbackRequests`)
      );
      const feedbackSnapshot = await getDocs(feedbackQuery);
      selectedFeedbackRequests = [];
      feedbackSnapshot.forEach(doc => {
        selectedFeedbackRequests.push({ id: doc.id, ...doc.data() });
      });
      
      // Get comments for the selected request
      selectedComments = await loadCommentsForRequest(request.snippetId, request.id);
      
      showFeedbackModal = true;
    } catch (error) {
      console.error('Error preparing feedback view:', error);
    }
  }

  function formatDate(date) {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
</script>

<div class="container mx-auto px-4 py-8">
  <div class="mb-8">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Community Feedback Requests</h1>
    <p class="text-gray-600 dark:text-gray-400 mt-2">
      Help other developers by reviewing their code and providing feedback
    </p>
  </div>
  
  <!-- Search -->
  <div class="relative mb-6">
    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Search class="w-5 h-5 text-gray-400" />
    </div>
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="Search feedback requests..."
      class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
    />
  </div>
  
  <!-- Feedback Requests List -->
  {#if loading}
    <div class="flex justify-center items-center py-12">
      <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  {:else if feedbackRequests.length === 0}
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
      <HelpCircle class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No feedback requests yet</h3>
      <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
        When users request feedback on their snippets, they will appear here.
      </p>
    </div>
  {:else}
    <div class="grid gap-4">
      {#each filteredRequests as request}
        <div 
          class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:shadow-lg p-4"
        >
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <MessageCircle class="w-4 h-4 text-purple-500" />
                <h3 class="font-medium text-gray-900 dark:text-white">
                  {request.snippetTitle}
                </h3>
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                Requested by {request.userName} on {formatDate(request.createdAt)}
              </div>
              <div class="mt-2">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                  {request.requestType || 'review'}
                </span>
              </div>
            </div>
            <button
              on:click={() => handleViewFeedback(request)}
              class="px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 rounded-lg transition-colors flex items-center gap-2 self-start"
            >
              <MessageCircle class="w-4 h-4" />
              <span>View & Respond</span>
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Feedback Modal -->
{#if showFeedbackModal && selectedSnippet}
  <FeedbackRequestModal
    snippet={selectedSnippet}
    feedbackRequests={selectedFeedbackRequests}
    comments={selectedComments}
    on:close={() => showFeedbackModal = false}
  />
{/if}