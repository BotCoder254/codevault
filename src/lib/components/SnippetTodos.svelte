<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import { X, Plus, Check, Trash2, Edit, AlertCircle, ChevronUp, ChevronDown } from 'lucide-svelte';
  import { addTodo, updateTodo, deleteTodo, toggleTodoStatus, loadSnippetTodos, getSnippetTodos } from '$lib/stores/todos.js';
  import { user } from '$lib/stores/auth.js';

  export let snippet;
  export let isOpen = false;
  
  const dispatch = createEventDispatcher();
  
  let newTodoTitle = '';
  let newTodoDescription = '';
  let newTodoPriority = 'medium';
  let editingTodo = null;
  let submitting = false;
  let unsubscribe;
  
  // Get todos for this snippet
  $: todos = $getSnippetTodos ? $getSnippetTodos(snippet.id) : [];
  $: pendingTodos = todos.filter(todo => todo.status === 'pending');
  $: completedTodos = todos.filter(todo => todo.status === 'completed');
  $: canEdit = $user && $user.uid === snippet.userId;
  
  onMount(() => {
    // Subscribe to todos for this snippet
    unsubscribe = loadSnippetTodos(snippet.id);
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  });
  
  const priorityClasses = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
  };
  
  const priorityIcons = {
    high: ChevronUp,
    medium: null,
    low: ChevronDown
  };
  
  const handleAddTodo = async () => {
    if (!newTodoTitle.trim() || !$user) return;
    
    submitting = true;
    
    const result = await addTodo(snippet.id, {
      title: newTodoTitle,
      description: newTodoDescription,
      priority: newTodoPriority
    }, $user);
    
    if (result.success) {
      newTodoTitle = '';
      newTodoDescription = '';
      newTodoPriority = 'medium';
    } else {
      console.error('Failed to add todo:', result.error);
    }
    
    submitting = false;
  };
  
  const handleToggleTodoStatus = async (todo) => {
    const result = await toggleTodoStatus(snippet.id, todo.id, $user);
    
    if (!result.success) {
      console.error('Failed to toggle todo status:', result.error);
    }
  };
  
  const handleEditTodo = (todo) => {
    editingTodo = { ...todo };
  };
  
  const handleCancelEdit = () => {
    editingTodo = null;
  };
  
  const handleUpdateTodo = async () => {
    if (!editingTodo || !editingTodo.title.trim() || !$user) return;
    
    submitting = true;
    
    const result = await updateTodo(snippet.id, editingTodo.id, {
      title: editingTodo.title,
      description: editingTodo.description,
      priority: editingTodo.priority
    }, $user);
    
    if (result.success) {
      editingTodo = null;
    } else {
      console.error('Failed to update todo:', result.error);
    }
    
    submitting = false;
  };
  
  const handleDeleteTodo = async (todo) => {
    if (!confirm('Are you sure you want to delete this todo?')) return;
    
    const result = await deleteTodo(snippet.id, todo.id, $user);
    
    if (!result.success) {
      console.error('Failed to delete todo:', result.error);
    }
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
        Tasks for "{snippet.title}"
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
      <!-- Add Todo Form -->
      {#if canEdit}
        <div class="mb-6 bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Add New Task</h4>
          <form on:submit|preventDefault={handleAddTodo} class="space-y-3">
            <div>
              <input
                type="text"
                bind:value={newTodoTitle}
                placeholder="Task title"
                class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                disabled={submitting}
              />
            </div>
            <div>
              <textarea
                bind:value={newTodoDescription}
                placeholder="Description (optional)"
                class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none h-20"
                disabled={submitting}
              ></textarea>
            </div>
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600 dark:text-gray-400">Priority:</label>
              <div class="flex gap-2">
                <label class="inline-flex items-center">
                  <input type="radio" bind:group={newTodoPriority} value="low" class="sr-only" />
                  <span class="px-2 py-1 rounded-lg text-xs font-medium cursor-pointer {newTodoPriority === 'low' ? priorityClasses.low : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}">
                    Low
                  </span>
                </label>
                <label class="inline-flex items-center">
                  <input type="radio" bind:group={newTodoPriority} value="medium" class="sr-only" />
                  <span class="px-2 py-1 rounded-lg text-xs font-medium cursor-pointer {newTodoPriority === 'medium' ? priorityClasses.medium : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}">
                    Medium
                  </span>
                </label>
                <label class="inline-flex items-center">
                  <input type="radio" bind:group={newTodoPriority} value="high" class="sr-only" />
                  <span class="px-2 py-1 rounded-lg text-xs font-medium cursor-pointer {newTodoPriority === 'high' ? priorityClasses.high : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}">
                    High
                  </span>
                </label>
              </div>
              <div class="ml-auto">
                <button
                  type="submit"
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1"
                  disabled={!newTodoTitle.trim() || submitting}
                >
                  {#if submitting}
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {:else}
                    <Plus class="w-4 h-4" />
                  {/if}
                  Add Task
                </button>
              </div>
            </div>
          </form>
        </div>
      {/if}
      
      <!-- Pending Todos -->
      <div class="mb-6">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
          <span class="mr-2">Pending Tasks</span>
          <span class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full">{pendingTodos.length}</span>
        </h4>
        
        {#if pendingTodos.length === 0}
          <div class="text-center text-gray-500 dark:text-gray-400 py-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
            <AlertCircle class="w-6 h-6 mx-auto mb-2" />
            <p>No pending tasks</p>
          </div>
        {:else}
          <div class="space-y-3">
            {#each pendingTodos as todo (todo.id)}
              <div class="bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg p-3" transition:slide|local={{ duration: 200 }}>
                {#if editingTodo && editingTodo.id === todo.id}
                  <!-- Edit Form -->
                  <div class="space-y-3">
                    <input
                      type="text"
                      bind:value={editingTodo.title}
                      class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      disabled={submitting}
                    />
                    <textarea
                      bind:value={editingTodo.description}
                      class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none h-20"
                      disabled={submitting}
                    ></textarea>
                    <div class="flex items-center gap-2">
                      <label class="text-sm text-gray-600 dark:text-gray-400">Priority:</label>
                      <div class="flex gap-2">
                        <label class="inline-flex items-center">
                          <input type="radio" bind:group={editingTodo.priority} value="low" class="sr-only" />
                          <span class="px-2 py-1 rounded-lg text-xs font-medium cursor-pointer {editingTodo.priority === 'low' ? priorityClasses.low : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}">
                            Low
                          </span>
                        </label>
                        <label class="inline-flex items-center">
                          <input type="radio" bind:group={editingTodo.priority} value="medium" class="sr-only" />
                          <span class="px-2 py-1 rounded-lg text-xs font-medium cursor-pointer {editingTodo.priority === 'medium' ? priorityClasses.medium : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}">
                            Medium
                          </span>
                        </label>
                        <label class="inline-flex items-center">
                          <input type="radio" bind:group={editingTodo.priority} value="high" class="sr-only" />
                          <span class="px-2 py-1 rounded-lg text-xs font-medium cursor-pointer {editingTodo.priority === 'high' ? priorityClasses.high : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}">
                            High
                          </span>
                        </label>
                      </div>
                    </div>
                    <div class="flex justify-end gap-2">
                      <button
                        on:click={handleCancelEdit}
                        class="px-3 py-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        on:click={handleUpdateTodo}
                        class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                        disabled={!editingTodo.title.trim() || submitting}
                      >
                        {#if submitting}
                          <div class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {:else}
                          Save
                        {/if}
                      </button>
                    </div>
                  </div>
                {:else}
                  <!-- Todo Display -->
                  <div class="flex items-start gap-3">
                    <button
                      on:click={() => handleToggleTodoStatus(todo)}
                      class="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors mt-0.5"
                      title="Mark as completed"
                    ></button>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between gap-2">
                        <h5 class="font-medium text-gray-900 dark:text-white break-words">{todo.title}</h5>
                        <div class="flex items-center gap-1 flex-shrink-0">
                          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {priorityClasses[todo.priority]}">
                            {#if priorityIcons[todo.priority]}
                              <svelte:component this={priorityIcons[todo.priority]} class="w-3 h-3 mr-1" />
                            {/if}
                            {todo.priority}
                          </span>
                          {#if canEdit}
                            <button 
                              on:click={() => handleEditTodo(todo)}
                              class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              title="Edit task"
                            >
                              <Edit class="w-3 h-3 text-gray-500 dark:text-gray-400" />
                            </button>
                            <button 
                              on:click={() => handleDeleteTodo(todo)}
                              class="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                              title="Delete task"
                            >
                              <Trash2 class="w-3 h-3 text-red-500" />
                            </button>
                          {/if}
                        </div>
                      </div>
                      {#if todo.description}
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{todo.description}</p>
                      {/if}
                    </div>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
      
      <!-- Completed Todos -->
      {#if completedTodos.length > 0}
        <div>
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <span class="mr-2">Completed Tasks</span>
            <span class="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-0.5 rounded-full">{completedTodos.length}</span>
          </h4>
          <div class="space-y-3">
            {#each completedTodos as todo (todo.id)}
              <div class="bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg p-3 opacity-80" transition:slide|local={{ duration: 200 }}>
                <div class="flex items-start gap-3">
                  <button
                    on:click={() => handleToggleTodoStatus(todo)}
                    class="flex-shrink-0 w-5 h-5 rounded-full border-2 border-green-500 dark:border-green-400 bg-green-500 dark:bg-green-400 flex items-center justify-center mt-0.5"
                    title="Mark as pending"
                  >
                    <Check class="w-3 h-3 text-white" />
                  </button>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2">
                      <h5 class="font-medium text-gray-600 dark:text-gray-400 line-through break-words">{todo.title}</h5>
                      {#if canEdit}
                        <button 
                          on:click={() => handleDeleteTodo(todo)}
                          class="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          title="Delete task"
                        >
                          <Trash2 class="w-3 h-3 text-red-500" />
                        </button>
                      {/if}
                    </div>
                    {#if todo.description}
                      <p class="text-sm text-gray-500 dark:text-gray-500 mt-1 line-through">{todo.description}</p>
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>