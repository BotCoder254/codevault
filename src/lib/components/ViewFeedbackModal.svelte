<script>
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { fade, scale, slide } from 'svelte/transition';
  import { X, Send, MessageCircle, Edit, Trash2, CornerDownRight } from 'lucide-svelte';
  import { addFeedbackComment, editFeedbackComment, deleteFeedbackComment } from '$lib/stores/feedback.js';
  import { user } from '$lib/stores/auth.js';
  import FeedbackRequestModal from './FeedbackRequestModal.svelte';

  export let snippet;
  export let feedbackRequests = [];
  export let comments = [];
  
  const dispatch = createEventDispatcher();
  
  let showFeedbackModal = false;
  
  function handleViewFeedback() {
    showFeedbackModal = true;
  }
  
  function handleCloseFeedback() {
    showFeedbackModal = false;
  }
</script>

<div>
  <button
    on:click={handleViewFeedback}
    class="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-800/50 text-purple-700 dark:text-purple-300 rounded-lg transition-colors"
  >
    <MessageCircle class="w-4 h-4" />
    <span>View & Respond to Feedback</span>
  </button>
</div>

{#if showFeedbackModal}
  <FeedbackRequestModal
    {snippet}
    {feedbackRequests}
    {comments}
    on:close={handleCloseFeedback}
  />
{/if}