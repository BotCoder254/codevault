<script>
	// @ts-nocheck
	import { createEventDispatcher } from 'svelte';
	import { Edit, Trash2, Copy, Eye, Globe, Lock, Users, Tag, Heart, ChevronUp, ChevronDown, GitBranch, Link as LinkIcon, Bookmark, Code, HelpCircle, MessageCircle, CheckSquare, FileText, Share2, Key } from 'lucide-svelte';
	import { deleteSnippet } from '$lib/stores/snippets.js';
	import { voteSnippet, favoriteSnippet, getUserVote, isUserFavorite } from '$lib/stores/voting.js';
	import { toggleBookmark, isBookmarked } from '$lib/stores/bookmarks.js';
	import { bookmarks } from '$lib/stores/bookmarks.js';
	import { forkSnippet } from '$lib/stores/fork.js';
	import { toggleFeedbackRequest, hasFeedbackRequest } from '$lib/stores/feedback.js';
	import { getSnippetTodos } from '$lib/stores/todos.js';
	import { getLicenseById } from '$lib/stores/licenses.js';
	import { addToCommunity, removeFromCommunity, isInCommunity } from '$lib/stores/community.js';
	import { generateShareLink } from '$lib/stores/password.js';
	import { user } from '$lib/stores/auth.js';
	import { fade, scale } from 'svelte/transition';
	import SnippetTodos from './SnippetTodos.svelte';
	import LicenseSelector from './LicenseSelector.svelte';
	import ViewFeedbackRequests from './ViewFeedbackRequests.svelte';
	
	export let snippet;
	
	const dispatch = createEventDispatcher();
	
	let showDeleteConfirm = false;
	let deleting = false;
	let voting = false;
	let favoriting = false;
	let bookmarking = false;
	let forking = false;
let requestingFeedback = false;
	let showTodosModal = false;
	let showLicenseModal = false;
	let showFeedbackModal = false;
	let voteAnimation = '';
	let favoriteAnimation = '';
	let bookmarkAnimation = '';
	let voteCountAnimation = '';
	let addingToCommunity = false;
	let removingFromCommunity = false;
	let copyingShareLink = false;

// Check if this snippet has a feedback request
$: hasFeedback = $hasFeedbackRequest ? $hasFeedbackRequest(snippet.id) : false;

// Get todos for this snippet
$: todos = $getSnippetTodos ? $getSnippetTodos(snippet.id) : [];
$: pendingTodos = todos.filter(todo => todo.status === 'pending');

// Get license info
$: license = snippet.licenseId ? getLicenseById(snippet.licenseId) : null;

// Check if snippet is in community
$: inCommunity = $isInCommunity ? $isInCommunity(snippet.id) : false;
	
	$: userVote = $getUserVote(snippet.id);
	$: isFavorited = $isUserFavorite(snippet.id);
	$: isSnippetBookmarked = isBookmarked(snippet.id, $bookmarks);
	$: canInteract = $user && $user.uid !== snippet.userId;
	
	const visibilityIcons = {
		private: Lock,
		public: Globe,
		team: Users
	};
	
	const visibilityColors = {
		private: 'text-gray-500',
		public: 'text-green-500',
		team: 'text-blue-500'
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
	
	let copying = false;
	const copyToClipboard = async () => {
		try {
			copying = true;
			await navigator.clipboard.writeText(snippet.code);
			// Add visual feedback
			setTimeout(() => {
				copying = false;
			}, 1000);
		} catch (err) {
			console.error('Failed to copy:', err);
			copying = false;
		}
	};
	
	const handleEdit = () => {
		dispatch('edit', snippet);
	};
	
	const handleView = () => {
		dispatch('view', snippet);
	};
	
	const handleVersionHistory = () => {
		dispatch('versions', snippet);
	};
	
	const handleComponentLink = () => {
		dispatch('components', snippet);
	};
	
	const handleEmbed = () => {
		dispatch('embed', snippet);
	};
	
	const handleDelete = async () => {
		deleting = true;
		const result = await deleteSnippet(snippet.id);
		
		if (result.success) {
			showDeleteConfirm = false;
		} else {
			console.error('Failed to delete snippet:', result.error);
		}
		deleting = false;
	};
	
	const handleVote = async (value) => {
		if (!canInteract || voting) return;
		
		voting = true;
		voteAnimation = 'bounce';
		voteCountAnimation = 'animate-count';
		
		const result = await voteSnippet(snippet.id, value);
		
		if (!result.success) {
			console.error('Failed to vote:', result.error);
		}
		
		setTimeout(() => {
			voteAnimation = '';
			voteCountAnimation = '';
			voting = false;
		}, 600);
	};
	
	const handleFavorite = async () => {
		if (!canInteract || favoriting) return;
		
		favoriting = true;
		favoriteAnimation = isFavorited ? 'heartbreak' : 'heartbeat';
		
		const result = await favoriteSnippet(snippet.id, !isFavorited);
		
		if (!result.success) {
			console.error('Failed to favorite:', result.error);
		}
		
		setTimeout(() => {
			favoriteAnimation = '';
			favoriting = false;
		}, 600);
	};
	
	const handleBookmark = async () => {
		if (!$user || bookmarking) return;
		
		bookmarking = true;
		bookmarkAnimation = isSnippetBookmarked ? 'bookmarkRemove' : 'bookmarkAdd';
		
		await toggleBookmark(snippet.id, $user);
		
		setTimeout(() => {
			bookmarkAnimation = '';
			bookmarking = false;
		}, 600);
	};
	
	const handleFork = async () => {
		if (!$user || forking) return;
		
		forking = true;
		const result = await forkSnippet(snippet.id, $user);
		
		if (result.success) {
			dispatch('fork', { original: snippet, forked: result });
		} else {
			console.error('Failed to fork snippet:', result.error);
			// You could show a toast notification here
		}
		
		forking = false;
	};
	
	const handleFeedbackRequest = async () => {
		if (!$user || requestingFeedback) return;
		
		requestingFeedback = true;
		const result = await toggleFeedbackRequest(snippet.id, $user);
		
		if (!result.success) {
			console.error('Failed to toggle feedback request:', result.error);
		}
		
		requestingFeedback = false;
	};
	
	const handleViewFeedback = () => {
		showFeedbackModal = true;
	};
	
	const handleCloseFeedback = () => {
		showFeedbackModal = false;
	};
	
	const handleShowTodos = () => {
		showTodosModal = true;
	};
	
	const handleCloseTodos = () => {
		showTodosModal = false;
	};
	
	const handleShowLicense = () => {
		showLicenseModal = true;
	};
	
	const handleCloseLicense = () => {
		showLicenseModal = false;
	};
	
	const handleToggleCommunity = async () => {
		if (!$user) return;
		
		if (inCommunity) {
			removingFromCommunity = true;
			const result = await removeFromCommunity(snippet.id, $user);
			
			if (!result.success) {
				console.error('Failed to remove from community:', result.error);
			}
			
			removingFromCommunity = false;
		} else {
			addingToCommunity = true;
			const result = await addToCommunity(snippet.id, $user);
			
			if (!result.success) {
				console.error('Failed to add to community:', result.error);
			}
			
			addingToCommunity = false;
		}
	};
	
	const handleCopyShareLink = async () => {
		if (!snippet) return;
		
		try {
			const shareLink = generateShareLink(snippet.id);
			await navigator.clipboard.writeText(shareLink);
			copyingShareLink = true;
			setTimeout(() => {
				copyingShareLink = false;
			}, 2000);
		} catch (error) {
			console.error('Failed to copy share link:', error);
		}
	};
	
	const getLanguageColor = (language) => {
		const colors = {
			javascript: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
			typescript: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
			python: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
			java: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
			csharp: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
			php: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
			ruby: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
			go: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
			rust: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
			swift: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
			kotlin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
			dart: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
			html: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
			css: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
			scss: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
		};
		return colors[language] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
	};
</script>

<div 
	class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:shadow-lg group w-full cursor-pointer"
	transition:fade={{ duration: 200 }}
	on:click={handleView}
	on:keydown={(e) => e.key === 'Enter' && handleView()}
	role="button"
	tabindex="0"
>
	<!-- Header -->
	<div class="p-4 border-b border-gray-200 dark:border-gray-700 overflow-hidden">
		<div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
			<div class="flex-1 min-w-0">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
					{snippet.title}
				</h3>
				{#if snippet.description}
					<p class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
						{snippet.description}
					</p>
				{/if}
				
				<!-- Fork information -->
				{#if snippet.forkedFrom}
					<div class="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
						<GitBranch class="w-3 h-3 mr-1" />
						<span>Forked from {snippet.originalAuthor || 'original'}</span>
					</div>
				{/if}
				
				<!-- Feedback Request Badge -->
				{#if hasFeedback}
					<div class="flex items-center mt-1 text-xs text-purple-600 dark:text-purple-400">
						<MessageCircle class="w-3 h-3 mr-1" />
						<span>Feedback requested</span>
					</div>
				{/if}
			</div>
			
			<div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
				<!-- Visibility and Stats -->
				<div class="flex items-center space-x-2 sm:space-x-3 flex-wrap">
					<svelte:component 
						this={visibilityIcons[snippet.visibility]} 
						class="w-4 h-4 {visibilityColors[snippet.visibility]}" 
					/>
					
					<!-- Voting and Favorite buttons (always visible for public snippets) -->
					{#if snippet.visibility === 'public'}
						<div class="flex items-center space-x-2 sm:space-x-3">
							<!-- Vote Section -->
							<div class="flex flex-col items-center space-y-1">
								{#if canInteract}
									<button
										on:click|stopPropagation={() => handleVote(userVote === 1 ? 0 : 1)}
										disabled={voting}
										class="p-1 rounded-lg transition-all {userVote === 1 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'} {voteAnimation === 'bounce' ? 'animate-bounce' : ''}"
										title="Upvote snippet"
									>
										<ChevronUp class="w-4 h-4" />
									</button>
								{/if}
								<span class="text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[1rem] text-center {voteCountAnimation}">
									{snippet.voteCount || 0}
								</span>
								{#if canInteract}
									<button
										on:click|stopPropagation={() => handleVote(userVote === -1 ? 0 : -1)}
										disabled={voting}
										class="p-1 rounded-lg transition-all {userVote === -1 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'} {voteAnimation === 'bounce' ? 'animate-bounce' : ''}"
										title="Downvote snippet"
									>
										<ChevronDown class="w-4 h-4" />
									</button>
								{/if}
							</div>
							
							<!-- Favorite Section -->
							<div class="flex items-center space-x-1">
								{#if canInteract}
									<button
										on:click|stopPropagation={handleFavorite}
										disabled={favoriting}
										class="p-1.5 rounded-lg transition-all {isFavorited ? 'text-red-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'} {favoriteAnimation === 'heartbeat' ? 'animate-heartbeat' : favoriteAnimation === 'heartbreak' ? 'animate-heartbreak' : ''}"
										title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
									>
										<Heart class="w-4 h-4 {isFavorited ? 'fill-current' : ''}" />
									</button>
								{/if}
								<span class="text-xs text-gray-500 dark:text-gray-400 min-w-[1rem] text-center">
									{snippet.favoriteCount || 0}
								</span>
							</div>
						</div>
					{/if}
				</div>
				
				<!-- Action buttons - Always visible on mobile, hover on desktop -->
				<div class="flex flex-wrap items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity w-full sm:w-auto justify-end">
					<!-- Bookmark button (always visible when user is logged in) -->
					{#if $user}
						<button
							on:click|stopPropagation={handleBookmark}
							disabled={bookmarking}
							class="p-1.5 rounded-lg transition-all {isSnippetBookmarked ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'} {bookmarkAnimation === 'bookmarkAdd' ? 'animate-pulse' : bookmarkAnimation === 'bookmarkRemove' ? 'animate-bounce' : ''}"
							title={isSnippetBookmarked ? 'Remove bookmark' : 'Bookmark snippet'}
						>
							<Bookmark class="w-4 h-4 {isSnippetBookmarked ? 'fill-current' : ''}" />
						</button>
					{/if}
					
					<!-- Fork button for public snippets (not owned by current user) -->
					{#if snippet.visibility === 'public' && $user && $user.uid !== snippet.userId}
						<button
							on:click|stopPropagation={handleFork}
							disabled={forking}
							class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center"
							title="Fork snippet"
						>
							<GitBranch class="w-4 h-4 text-gray-500" />
							{#if forking}
								<div class="ml-1 w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
							{/if}
						</button>
					{/if}
					
					<button
							on:click|stopPropagation={handleView}
							class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
							title="View snippet"
						>
						<Eye class="w-4 h-4 text-gray-500" />
					</button>
					<button
						on:click|stopPropagation={copyToClipboard}
						class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors {copying ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : ''}"
						title="Copy code"
						disabled={copying}
					>
						<Copy class="w-4 h-4 {copying ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}" />
					</button>
					
					<!-- Embed button for public snippets -->
					{#if snippet.visibility === 'public'}
						<button
							on:click|stopPropagation={handleEmbed}
							class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
							title="Generate embed code"
						>
							<Code class="w-4 h-4 text-gray-500" />
						</button>
					{/if}
					
					<!-- Request Feedback button for public snippets -->
					{#if snippet.visibility === 'public' && $user}
						<button
							on:click|stopPropagation={handleFeedbackRequest}
							disabled={requestingFeedback}
							class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors {hasFeedback ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : ''}"
							title={hasFeedback ? "Cancel feedback request" : "Request feedback"}
						>
													{#if hasFeedback}
							<MessageCircle class="w-4 h-4 {hasFeedback ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'}" />
						{:else}
							<HelpCircle class="w-4 h-4 text-gray-500" />
							{/if}
							{#if requestingFeedback}
								<div class="ml-1 w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
							{/if}
						</button>
					{/if}
					
					<!-- Tasks button -->
					<button
						on:click|stopPropagation={handleShowTodos}
						class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors {pendingTodos.length > 0 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}"
						title="Manage tasks"
					>
						<CheckSquare class="w-4 h-4 {pendingTodos.length > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}" />
					</button>
					
					<!-- License button (owner only) -->
					{#if $user && $user.uid === snippet.userId}
						<button
							on:click|stopPropagation={handleShowLicense}
							class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors {license ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : ''}"
							title="Set license"
						>
							<FileText class="w-4 h-4 {license ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}" />
						</button>
					{/if}
					
					<!-- View feedback button -->
					{#if hasFeedback}
						<button
							on:click|stopPropagation={handleViewFeedback}
							class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
							title="View feedback"
						>
							<MessageCircle class="w-4 h-4 text-purple-600 dark:text-purple-400" />
						</button>
					{/if}
					
					<!-- Share Link button (for password protected snippets) -->
					{#if snippet.isPasswordProtected}
						<button
							on:click|stopPropagation={handleCopyShareLink}
							class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors {copyingShareLink ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : ''}"
							title="Copy share link"
						>
							<LinkIcon class="w-4 h-4 {copyingShareLink ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}" />
						</button>
					{/if}
					
					<!-- Community button for public snippets -->
					{#if snippet.visibility === 'public' && $user}
						<button
							on:click|stopPropagation={handleToggleCommunity}
							disabled={addingToCommunity || removingFromCommunity}
							class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors {inCommunity ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : ''}"
							title={inCommunity ? "Remove from community" : "Add to community"}
						>
							<Share2 class="w-4 h-4 {inCommunity ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}" />
							{#if addingToCommunity || removingFromCommunity}
								<div class="ml-1 w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
							{/if}
						</button>
					{/if}
					
					<!-- Owner-only buttons -->
					{#if $user && $user.uid === snippet.userId}
						<button
							on:click|stopPropagation={handleVersionHistory}
							class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
							title="Version history"
						>
							<GitBranch class="w-4 h-4 text-gray-500" />
						</button>
						<button
							on:click|stopPropagation={handleComponentLink}
							class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
							title="Link components"
						>
							<LinkIcon class="w-4 h-4 text-gray-500" />
						</button>
						<button
							on:click|stopPropagation={handleEdit}
							class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
							title="Edit snippet"
						>
							<Edit class="w-4 h-4 text-gray-500" />
						</button>
						<button
							on:click|stopPropagation={() => showDeleteConfirm = true}
							class="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
							title="Delete snippet"
						>
							<Trash2 class="w-4 h-4 text-red-500" />
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>
	
	<!-- Code Preview -->
	<div class="p-4">
		<div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 overflow-hidden">
			<pre class="text-sm text-gray-800 dark:text-gray-200 font-mono line-clamp-4 whitespace-pre-wrap">{snippet.code}</pre>
		</div>
	</div>
	
	<!-- Footer -->
	<div class="px-4 pb-4">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
			<div class="flex flex-wrap items-center gap-2 mb-2 sm:mb-0">
				<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getLanguageColor(snippet.language)}">
					{snippet.language}
				</span>
				
				<!-- License Badge -->
				{#if license}
					<button 
						on:click|stopPropagation={handleShowLicense}
						class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-pointer {license.color}"
						title="View license details"
					>
						<FileText class="w-3 h-3 mr-1" />
						{license.shortName}
					</button>
				{/if}
				
				<!-- Community Badge -->
				{#if inCommunity}
					<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
						<Share2 class="w-3 h-3 mr-1" />
						Community
					</span>
				{/if}
				
				<!-- Password Protection Badge -->
				{#if snippet.isPasswordProtected}
					<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
						<Key class="w-3 h-3 mr-1" />
						Password Protected
					</span>
				{/if}
				
				<!-- Todo Count Badge -->
				{#if pendingTodos.length > 0}
					<button 
						on:click|stopPropagation={handleShowTodos}
						class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-pointer bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
						title="View tasks"
					>
						<CheckSquare class="w-3 h-3 mr-1" />
						{pendingTodos.length} {pendingTodos.length === 1 ? 'task' : 'tasks'}
					</button>
				{/if}
				
				{#if snippet.tags && snippet.tags.length > 0}
					<div class="flex flex-wrap items-center gap-1">
						{#each snippet.tags.slice(0, 3) as tag}
							<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
								<Tag class="w-3 h-3 mr-1" />
								{tag}
							</span>
						{/each}
						{#if snippet.tags.length > 3}
							<span class="text-xs text-gray-500">+{snippet.tags.length - 3} more</span>
						{/if}
					</div>
				{/if}
			</div>
			
			<span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
				{formatDate(snippet.updatedAt)}
			</span>
		</div>
	</div>
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm}
	<div 
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
		transition:fade={{ duration: 200 }}
	>
		<div 
			class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md"
			transition:scale={{ duration: 200, start: 0.95 }}
		>
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
				Delete Snippet
			</h3>
			<p class="text-gray-600 dark:text-gray-400 mb-6">
				Are you sure you want to delete "{snippet.title}"? This action cannot be undone.
			</p>
			
			<div class="flex justify-end space-x-3">
				<button
					on:click={() => showDeleteConfirm = false}
					class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
				>
					Cancel
				</button>
				<button
					on:click={handleDelete}
					disabled={deleting}
					class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-all flex items-center space-x-2"
				>
					{#if deleting}
						<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
					{:else}
						<Trash2 class="w-4 h-4" />
					{/if}
					<span>Delete</span>
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Todo Modal -->
{#if showTodosModal}
	<SnippetTodos
		{snippet}
		on:close={handleCloseTodos}
	/>
{/if}

<!-- License Modal -->
{#if showLicenseModal}
	<LicenseSelector
		{snippet}
		on:close={handleCloseLicense}
	/>
{/if}

<!-- Feedback Modal -->
{#if showFeedbackModal}
	<ViewFeedbackRequests
		{snippet}
	/>
{/if}

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	
	.line-clamp-4 {
		display: -webkit-box;
		-webkit-line-clamp: 4;
		line-clamp: 4;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	
	@keyframes heartbeat {
		0% { transform: scale(1); }
		25% { transform: scale(1.2); }
		50% { transform: scale(1); }
		75% { transform: scale(1.1); }
		100% { transform: scale(1); }
	}
	
	@keyframes heartbreak {
		0% { transform: scale(1); }
		25% { transform: scale(0.8); }
		50% { transform: scale(1.1); }
		75% { transform: scale(0.9); }
		100% { transform: scale(1); }
	}
	
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
	
	.animate-heartbeat {
		animation: heartbeat 0.6s ease-in-out;
	}
	
	.animate-heartbreak {
		animation: heartbreak 0.6s ease-in-out;
	}
	
	@keyframes countChange {
		0% { transform: scale(1); }
		50% { transform: scale(1.35); }
		100% { transform: scale(1); }
	}
	
	.animate-count {
		animation: countChange 0.6s ease-in-out;
		color: #3b82f6;
	}
</style>