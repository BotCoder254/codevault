<script>
  import { onMount } from 'svelte';
  import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import { user } from '$lib/stores/auth.js';
  import { fade, slide } from 'svelte/transition';
  import { MessageCircle, HelpCircle } from 'lucide-svelte';
  import FeedbackRequestModal from './FeedbackRequestModal.svelte';

  export let snippet;
  
  let feedbackRequests = [];
  let comments = [];
  let loading = true;
  let showFeedbackModal = false;
  
  onMount(async () => {
    await loadFeedbackRequests();
  });
  
  async function loadFeedbackRequests() {
    loading = true;
    try {
      // Get feedback requests for this snippet
      const requestsQuery = query(
        collection(db, `snippets/${snippet.id}/feedbackRequests`),
        orderBy('createdAt', 'desc')
      );
      
      const requestsSnapshot = await getDocs(requestsQuery);
      const requests = [];
      
      requestsSnapshot.forEach(doc => {
        requests.push({
          id: doc.id,
          snippetId: snippet.id,
          ...doc.data()
        });
      });
      
      feedbackRequests = requests;
      
      // Load comments for each request
      const allComments = [];
      for (const request of requests) {
        const commentsQuery = query(
          collection(db, `snippets/${snippet.id}/feedbackRequests/${request.id}/comments`),
          orderBy('createdAt', 'asc')
        );
        
        const commentsSnapshot = await getDocs(commentsQuery);
        
        commentsSnapshot.forEach(doc => {
          allComments.push({
            id: doc.id,
            requestId: request.id,
            ...doc.data()
          });
        });
      }
      
      comments = allComments;
    } catch (error) {
      console.error('Error loading feedback requests:', error);
    } finally {
      loading = false;
    }
  }
  
  function handleViewFeedback() {
    showFeedbackModal = true;
  }
  
  function handleCloseFeedback() {
    showFeedbackModal = false;
  }
</script>

<div>
  {#if loading}
    <div class="flex justify-center items-center py-4">
      <div class="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  {:else if feedbackRequests.length === 0}
    <div class="text-center text-gray-500 dark:text-gray-400 py-4">
      <HelpCircle class="w-6 h-6 mx-auto mb-2" />
      <p>No feedback requests yet</p>
    </div>
  {:else}
    <button
      on:click={handleViewFeedback}
      class="w-full flex items-center justify-between px-4 py-3 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-800/50 text-purple-700 dark:text-purple-300 rounded-lg transition-colors"
      transition:slide|local={{ duration: 200 }}
    >
      <div class="flex items-center gap-2">
        <MessageCircle class="w-5 h-5" />
        <span class="font-medium">{feedbackRequests.length} Feedback {feedbackRequests.length === 1 ? 'Request' : 'Requests'}</span>
      </div>
      <span class="text-sm">{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</span>
    </button>
  {/if}
</div>

{#if showFeedbackModal}
  <FeedbackRequestModal
    {snippet}
    {feedbackRequests}
    {comments}
    on:close={handleCloseFeedback}
  />
{/if}