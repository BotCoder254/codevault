<script>
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { fade, scale, slide } from 'svelte/transition';
  import { X, Send, MessageCircle, Edit, Trash2, CornerDownRight, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-svelte';
  import { backgroundImage } from '$lib/stores/background.js';
  import { addFeedbackComment, editFeedbackComment, deleteFeedbackComment } from '$lib/stores/feedback.js';
  import { user } from '$lib/stores/auth.js';

  export let snippet;
  export let feedbackRequests = [];
  export let comments = [];
  
  const dispatch = createEventDispatcher();
  
  let newComment = '';
  let editingComment = null;
  let editText = '';
  let submitting = false;
  let selectedRequestId = '';
  let replyingToComment = null;
  let commentsContainer;
  let currentPage = 1;
  let commentsPerPage = 10;
  let loadingMoreComments = false;
  let hasMoreComments = true;
  
  $: selectedRequest = feedbackRequests.find(r => r.id === selectedRequestId);
  
  // Organize comments into threads
  $: filteredComments = comments
    .filter(c => c.requestId === selectedRequestId)
    .sort((a, b) => {
      const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return aDate - bDate; // Oldest first
    });
    
  // Group comments by parent
  $: threadedComments = filteredComments.reduce((acc, comment) => {
    if (!comment.parentCommentId) {
      // This is a root comment
      if (!acc[comment.id]) {
        acc[comment.id] = { ...comment, replies: [] };
      } else {
        acc[comment.id] = { ...comment, replies: acc[comment.id].replies };
      }
    } else {
      // This is a reply
      if (!acc[comment.parentCommentId]) {
        acc[comment.parentCommentId] = { replies: [comment] };
      } else {
        acc[comment.parentCommentId].replies.push(comment);
      }
    }
    return acc;
  }, {});
  
  // Convert to array for display
  $: rootComments = Object.values(threadedComments)
    .filter(comment => !comment.parentCommentId);
    
  // Pagination
  $: totalPages = Math.ceil(rootComments.length / commentsPerPage);
  $: paginatedComments = rootComments.slice(
    (currentPage - 1) * commentsPerPage,
    currentPage * commentsPerPage
  );
  
  // Select the first request by default if available
  $: {
    if (feedbackRequests.length > 0 && !selectedRequestId) {
      selectedRequestId = feedbackRequests[0].id;
    }
  }
  
  // Scroll to bottom when new comments are added
  $: if (filteredComments.length && commentsContainer) {
    scrollToBottom();
  }
  
  onMount(() => {
    if (commentsContainer) {
      scrollToBottom();
    }
  });
  
  async function scrollToBottom() {
    await tick();
    if (commentsContainer) {
      commentsContainer.scrollTop = commentsContainer.scrollHeight;
    }
  }
  
  function handleScroll(event) {
    if (!hasMoreComments || loadingMoreComments) return;
    
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    
    // If user scrolled near the top (20px threshold)
    if (scrollTop < 20 && currentPage < totalPages) {
      loadMoreComments();
    }
  }
  
  async function loadMoreComments() {
    if (currentPage >= totalPages || loadingMoreComments) return;
    
    loadingMoreComments = true;
    
    // Remember the current scroll position and height
    const scrollPosition = commentsContainer.scrollTop;
    const oldScrollHeight = commentsContainer.scrollHeight;
    
    // Load more comments
    currentPage++;
    
    // Wait for DOM to update
    await tick();
    
    // Adjust scroll position to maintain relative position
    const newScrollHeight = commentsContainer.scrollHeight;
    const heightDifference = newScrollHeight - oldScrollHeight;
    commentsContainer.scrollTop = scrollPosition + heightDifference;
    
    loadingMoreComments = false;
  }
  
  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !$user || !selectedRequestId) return;
    
    submitting = true;
    
    const result = await addFeedbackComment(
      snippet.id,
      selectedRequestId,
      newComment,
      $user,
      replyingToComment?.id || null
    );
    
    if (result.success) {
      newComment = '';
      replyingToComment = null;
      // Add to page will happen via real-time updates
    } else {
      console.error('Failed to submit comment:', result.error);
    }
    
    submitting = false;
  };
  
  const handleEditComment = (comment) => {
    editingComment = comment;
    editText = comment.text;
  };
  
  const handleCancelEdit = () => {
    editingComment = null;
    editText = '';
  };
  
  const handleSaveEdit = async () => {
    if (!editText.trim() || !$user || !selectedRequestId || !editingComment) return;
    
    submitting = true;
    
    const result = await editFeedbackComment(
      snippet.id,
      selectedRequestId,
      editingComment.id,
      editText,
      $user
    );
    
    if (result.success) {
      editingComment = null;
      editText = '';
    } else {
      console.error('Failed to edit comment:', result.error);
    }
    
    submitting = false;
  };
  
  const handleDeleteComment = async (comment) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    const result = await deleteFeedbackComment(
      snippet.id,
      selectedRequestId,
      comment.id,
      $user
    );
    
    if (!result.success) {
      console.error('Failed to delete comment:', result.error);
    }
  };
  
  const handleReplyToComment = (comment) => {
    replyingToComment = comment;
    // Focus the comment input
    setTimeout(() => {
      document.getElementById('comment-input').focus();
    }, 100);
  };
  
  const handleCancelReply = () => {
    replyingToComment = null;
  };
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      currentPage++;
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      currentPage--;
    }
  };
  
  const close = () => {
    dispatch('close');
  };
</script>

<div 
  class="fixed inset-0 flex items-center justify-center p-4 z-50"
  transition:fade={{ duration: 200 }}
  style="background-image: url('{$backgroundImage.url}'); background-size: cover; background-position: center; backdrop-filter: blur({$backgroundImage.blur});"
>
  <div 
    class="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
    transition:scale={{ duration: 200, start: 0.95 }}
  >
    <!-- Header -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        Feedback Requests for "{snippet.title}"
      </h3>
      <button
        on:click={close}
        class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <X class="w-5 h-5 text-gray-500" />
      </button>
    </div>
    
    <!-- Content -->
    <div class="flex flex-col md:flex-row flex-1 overflow-hidden">
      <!-- Requests List -->
      <div class="w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        {#if feedbackRequests.length === 0}
          <div class="p-4 text-center text-gray-500 dark:text-gray-400">
            No feedback requests yet.
          </div>
        {:else}
          {#each feedbackRequests as request}
            <button
              class="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors border-b border-gray-200 dark:border-gray-700 {selectedRequestId === request.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}"
              on:click={() => selectedRequestId = request.id}
            >
              <div class="flex items-center gap-2">
                <MessageCircle class="w-4 h-4 text-purple-500" />
                <span class="font-medium">{request.userName}</span>
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatDate(request.createdAt)}
              </div>
              <div class="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full inline-block mt-2">
                {request.requestType || 'review'}
              </div>
            </button>
          {/each}
        {/if}
      </div>
      
      <!-- Comments Section -->
      <div class="flex-1 flex flex-col overflow-hidden">
        {#if selectedRequest}
          <!-- Comments List -->
          <div class="flex-1 p-4 overflow-y-auto" bind:this={commentsContainer} on:scroll={handleScroll}>
            {#if filteredComments.length === 0}
              <div class="text-center py-8 flex flex-col items-center">
                <AlertCircle class="w-12 h-12 text-gray-400 mb-2" />
                <p class="text-gray-300 text-lg font-medium">No comments yet</p>
                <p class="text-gray-400 mt-1">Be the first to respond!</p>
              </div>
            {:else}
              <!-- Loading indicator -->
              {#if loadingMoreComments}
                <div class="flex justify-center py-4">
                  <div class="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              {/if}
              
              <!-- Root Comments -->
              {#each paginatedComments as comment}
                <div class="mb-6" transition:slide|local={{ duration: 200 }}>
                  <!-- Comment -->
                  <div class="{comment.userId === $user?.uid ? 'ml-8' : 'mr-8'}">
                    <div class="flex items-center justify-between mb-1">
                      <div class="flex items-center gap-2">
                        <span class="font-medium text-sm">{comment.userName}</span>
                        <span class="text-xs text-gray-500 dark:text-gray-400">{formatDate(comment.createdAt)}</span>
                        {#if comment.edited}
                          <span class="text-xs text-gray-500 dark:text-gray-400 italic">(edited)</span>
                        {/if}
                      </div>
                      
                      {#if comment.userId === $user?.uid}
                        <div class="flex gap-1">
                          <button 
                            on:click={() => handleEditComment(comment)}
                            class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            title="Edit comment"
                          >
                            <Edit class="w-3 h-3 text-gray-500 dark:text-gray-400" />
                          </button>
                          <button 
                            on:click={() => handleDeleteComment(comment)}
                            class="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            title="Delete comment"
                          >
                            <Trash2 class="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      {/if}
                    </div>
                    
                    {#if editingComment?.id === comment.id}
                      <!-- Edit Form -->
                      <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                        <textarea
                          bind:value={editText}
                          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none min-h-[80px]"
                          disabled={submitting}
                        ></textarea>
                        <div class="flex justify-end gap-2 mt-2">
                          <button
                            on:click={handleCancelEdit}
                            class="px-3 py-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            on:click={handleSaveEdit}
                            class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                            disabled={!editText.trim() || submitting}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    {:else}
                      <!-- Comment Text -->
                      <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                        {comment.text}
                      </div>
                      
                      <!-- Reply Button -->
                      <button
                        on:click={() => handleReplyToComment(comment)}
                        class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <CornerDownRight class="w-3 h-3" />
                        Reply
                      </button>
                    {/if}
                  </div>
                  
                  <!-- Replies -->
                  {#if comment.replies && comment.replies.length > 0}
                    <div class="ml-8 mt-3 space-y-3 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                      {#each comment.replies as reply}
                        <div transition:slide|local={{ duration: 200 }}>
                          <div class="flex items-center justify-between mb-1">
                            <div class="flex items-center gap-2">
                              <span class="font-medium text-sm">{reply.userName}</span>
                              <span class="text-xs text-gray-500 dark:text-gray-400">{formatDate(reply.createdAt)}</span>
                              {#if reply.edited}
                                <span class="text-xs text-gray-500 dark:text-gray-400 italic">(edited)</span>
                              {/if}
                            </div>
                            
                            {#if reply.userId === $user?.uid}
                              <div class="flex gap-1">
                                <button 
                                  on:click={() => handleEditComment(reply)}
                                  class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                  title="Edit reply"
                                >
                                  <Edit class="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                </button>
                                <button 
                                  on:click={() => handleDeleteComment(reply)}
                                  class="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                  title="Delete reply"
                                >
                                  <Trash2 class="w-3 h-3 text-red-500" />
                                </button>
                              </div>
                            {/if}
                          </div>
                          
                          {#if editingComment?.id === reply.id}
                            <!-- Edit Form -->
                            <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                              <textarea
                                bind:value={editText}
                                class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none min-h-[80px]"
                                disabled={submitting}
                              ></textarea>
                              <div class="flex justify-end gap-2 mt-2">
                                <button
                                  on:click={handleCancelEdit}
                                  class="px-3 py-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  on:click={handleSaveEdit}
                                  class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                                  disabled={!editText.trim() || submitting}
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          {:else}
                            <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                              {reply.text}
                            </div>
                          {/if}
                        </div>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/each}
            {/if}
          </div>
          
          <!-- Comment Input -->
          {#if $user}
            <div class="p-4 border-t border-gray-200 dark:border-gray-700">
              {#if replyingToComment}
                <div class="mb-2 p-2 bg-gray-50 dark:bg-gray-750 rounded-lg flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <CornerDownRight class="w-4 h-4 text-gray-500" />
                    <span class="text-sm text-gray-600 dark:text-gray-400">Replying to <span class="font-medium">{replyingToComment.userName}</span></span>
                  </div>
                  <button 
                    on:click={handleCancelReply}
                    class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="Cancel reply"
                  >
                    <X class="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              {/if}
              
              <form on:submit|preventDefault={handleSubmitComment} class="flex gap-2">
                <input
                  id="comment-input"
                  type="text"
                  bind:value={newComment}
                  placeholder={replyingToComment ? `Reply to ${replyingToComment.userName}...` : "Type your comment..."}
                  class="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  disabled={submitting}
                />
                <button
                  type="submit"
                  class="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1"
                  disabled={!newComment.trim() || submitting}
                >
                  {#if submitting}
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {:else}
                    <Send class="w-4 h-4" />
                  {/if}
                  {replyingToComment ? 'Reply' : 'Send'}
                </button>
              </form>
            </div>
          {:else}
            <div class="p-4 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
              Please sign in to comment.
            </div>
          {/if}
        {:else}
          <div class="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Select a feedback request to view comments.
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>