<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { db } from '$lib/firebase.js';
	import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
	import { User, MapPin, Link as LinkIcon, Github, Twitter, Code2, Heart, ChevronUp, Tag, Calendar } from 'lucide-svelte';
	import SnippetCard from '$lib/components/SnippetCard.svelte';
	import { fade, fly } from 'svelte/transition';
	
	let userProfile = null;
	let userSnippets = [];
	let loading = true;
	let error = null;
	let stats = {
		totalSnippets: 0,
		totalVotes: 0,
		totalFavorites: 0,
		topTags: [],
		languagesUsed: []
	};
	
	$: username = $page.params.username;
	
	onMount(async () => {
		if (username) {
			await loadUserProfile(username);
		}
	});
	
	const loadUserProfile = async (username) => {
		try {
			loading = true;
			
			// Find user by username
			const usersQuery = query(
				collection(db, 'users'),
				where('username', '==', username.toLowerCase())
			);
			
			const usersSnapshot = await getDocs(usersQuery);
			
			if (usersSnapshot.empty) {
				error = 'User not found';
				return;
			}
			
			const userDoc = usersSnapshot.docs[0];
			const userData = userDoc.data();
			
			// Check if profile is public
			const profileQuery = query(
				collection(db, 'profiles'),
				where('userId', '==', userDoc.id)
			);
			
			const profileSnapshot = await getDocs(profileQuery);
			let profileData = {};
			
			if (!profileSnapshot.empty) {
				profileData = profileSnapshot.docs[0].data();
				if (profileData.publicProfile === false) {
					error = 'This profile is private';
					return;
				}
			}
			
			userProfile = {
				...userData,
				...profileData,
				uid: userDoc.id
			};
			
			// Load user's public snippets
			await loadUserSnippets(userDoc.id);
			
		} catch (err) {
			error = 'Failed to load profile';
			console.error('Error loading profile:', err);
		} finally {
			loading = false;
		}
	};
	
	const loadUserSnippets = async (userId) => {
		try {
			const snippetsQuery = query(
				collection(db, 'snippets'),
				where('userId', '==', userId),
				where('visibility', '==', 'public')
			);
			
			const snapshot = await getDocs(snippetsQuery);
			const snippets = [];
			
			snapshot.forEach((doc) => {
				snippets.push({
					id: doc.id,
					...doc.data()
				});
			});
			
			// Sort by updatedAt descending
			snippets.sort((a, b) => {
				const aDate = a.updatedAt?.toDate?.() || new Date(0);
				const bDate = b.updatedAt?.toDate?.() || new Date(0);
				return bDate - aDate;
			});
			
			userSnippets = snippets;
			calculateStats(snippets);
			
		} catch (err) {
			console.error('Error loading snippets:', err);
		}
	};
	
	const calculateStats = (snippets) => {
		const totalVotes = snippets.reduce((sum, s) => sum + (s.voteCount || 0), 0);
		const totalFavorites = snippets.reduce((sum, s) => sum + (s.favoriteCount || 0), 0);
		
		// Calculate top tags
		const tagCounts = {};
		const languageCounts = {};
		
		snippets.forEach(snippet => {
			if (snippet.tags) {
				snippet.tags.forEach(tag => {
					tagCounts[tag] = (tagCounts[tag] || 0) + 1;
				});
			}
			
			if (snippet.language) {
				languageCounts[snippet.language] = (languageCounts[snippet.language] || 0) + 1;
			}
		});
		
		const topTags = Object.entries(tagCounts)
			.sort(([,a], [,b]) => b - a)
			.slice(0, 10)
			.map(([tag, count]) => ({ tag, count }));
			
		const languagesUsed = Object.entries(languageCounts)
			.sort(([,a], [,b]) => b - a)
			.map(([language, count]) => ({ language, count }));
		
		stats = {
			totalSnippets: snippets.length,
			totalVotes,
			totalFavorites,
			topTags,
			languagesUsed
		};
	};
	
	const formatDate = (date) => {
		if (!date) return '';
		const d = date.toDate ? date.toDate() : new Date(date);
		return d.toLocaleDateString('en-US', { 
			year: 'numeric', 
			month: 'long'
		});
	};
</script>

<svelte:head>
	<title>{userProfile ? `${userProfile.displayName} (@${username}) - CodeVault` : 'User Profile - CodeVault'}</title>
	<meta name="description" content={userProfile ? `${userProfile.displayName}'s code snippets and profile on CodeVault` : 'User profile on CodeVault'} />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	{#if loading}
		<div class="flex items-center justify-center min-h-screen">
			<div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
		</div>
	{:else if error}
		<div class="flex items-center justify-center min-h-screen">
			<div class="text-center">
				<User class="w-16 h-16 text-gray-400 mx-auto mb-4" />
				<h1 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Profile Not Available</h1>
				<p class="text-gray-600 dark:text-gray-400">{error}</p>
			</div>
		</div>
	{:else if userProfile}
		<div class="max-w-6xl mx-auto p-6">
			<!-- Profile Header -->
			<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 mb-6" transition:fade={{ duration: 300 }}>
				<div class="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
					<!-- Avatar -->
					<div class="flex-shrink-0">
						{#if userProfile.photoURL}
							<img 
								src={userProfile.photoURL} 
								alt={userProfile.displayName}
								class="w-24 h-24 rounded-full border-4 border-gray-200 dark:border-gray-600"
							/>
						{:else}
							<div class="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center border-4 border-gray-200 dark:border-gray-600">
								<User class="w-12 h-12 text-white" />
							</div>
						{/if}
					</div>
					
					<!-- Profile Info -->
					<div class="flex-1 min-w-0">
						<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
							{userProfile.displayName || 'Anonymous User'}
						</h1>
						<p class="text-lg text-gray-600 dark:text-gray-400 mb-4">@{username}</p>
						
						{#if userProfile.bio}
							<p class="text-gray-700 dark:text-gray-300 mb-4">{userProfile.bio}</p>
						{/if}
						
						<!-- Links and Info -->
						<div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
							{#if userProfile.location}
								<div class="flex items-center space-x-1">
									<MapPin class="w-4 h-4" />
									<span>{userProfile.location}</span>
								</div>
							{/if}
							
							{#if userProfile.website}
								<a 
									href={userProfile.website} 
									target="_blank" 
									class="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
								>
									<LinkIcon class="w-4 h-4" />
									<span>Website</span>
								</a>
							{/if}
							
							{#if userProfile.githubUsername}
								<a 
									href="https://github.com/{userProfile.githubUsername}" 
									target="_blank" 
									class="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
								>
									<Github class="w-4 h-4" />
									<span>GitHub</span>
								</a>
							{/if}
							
							{#if userProfile.twitterUsername}
								<a 
									href="https://twitter.com/{userProfile.twitterUsername}" 
									target="_blank" 
									class="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
								>
									<Twitter class="w-4 h-4" />
									<span>Twitter</span>
								</a>
							{/if}
							
							{#if userProfile.createdAt}
								<div class="flex items-center space-x-1">
									<Calendar class="w-4 h-4" />
									<span>Joined {formatDate(userProfile.createdAt)}</span>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
			
			<!-- Stats Cards -->
			<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700" transition:fly={{ y: 20, duration: 400, delay: 100 }}>
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Public Snippets</p>
							<p class="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSnippets}</p>
						</div>
						<div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
							<Code2 class="w-6 h-6 text-blue-600 dark:text-blue-400" />
						</div>
					</div>
				</div>
				
				<div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700" transition:fly={{ y: 20, duration: 400, delay: 200 }}>
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Votes</p>
							<p class="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalVotes}</p>
						</div>
						<div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
							<ChevronUp class="w-6 h-6 text-green-600 dark:text-green-400" />
						</div>
					</div>
				</div>
				
				<div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700" transition:fly={{ y: 20, duration: 400, delay: 300 }}>
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Favorites</p>
							<p class="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalFavorites}</p>
						</div>
						<div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
							<Heart class="w-6 h-6 text-red-600 dark:text-red-400" />
						</div>
					</div>
				</div>
				
				<div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700" transition:fly={{ y: 20, duration: 400, delay: 400 }}>
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Languages</p>
							<p class="text-2xl font-bold text-gray-900 dark:text-white">{stats.languagesUsed.length}</p>
						</div>
						<div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
							<Tag class="w-6 h-6 text-purple-600 dark:text-purple-400" />
						</div>
					</div>
				</div>
			</div>
			
			<!-- Content Grid -->
			<div class="grid lg:grid-cols-3 gap-8">
				<!-- Snippets -->
				<div class="lg:col-span-2">
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Public Snippets</h2>
					
					{#if userSnippets.length > 0}
						<div class="grid gap-6">
							{#each userSnippets as snippet, index (snippet.id)}
								<div transition:fly={{ y: 20, duration: 400, delay: index * 50 }}>
									<SnippetCard 
										{snippet} 
										on:view={(e) => console.log('View snippet:', e.detail)}
									/>
								</div>
							{/each}
						</div>
					{:else}
						<div class="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
							<Code2 class="w-12 h-12 text-gray-400 mx-auto mb-3" />
							<p class="text-gray-500 dark:text-gray-400">No public snippets yet</p>
						</div>
					{/if}
				</div>
				
				<!-- Sidebar -->
				<div class="space-y-6">
					<!-- Top Tags -->
					{#if stats.topTags.length > 0}
						<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
							<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Tags</h3>
							<div class="flex flex-wrap gap-2">
								{#each stats.topTags as { tag, count }}
									<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
										{tag} ({count})
									</span>
								{/each}
							</div>
						</div>
					{/if}
					
					<!-- Languages -->
					{#if stats.languagesUsed.length > 0}
						<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
							<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Languages Used</h3>
							<div class="space-y-2">
								{#each stats.languagesUsed as { language, count }}
									<div class="flex items-center justify-between">
										<span class="text-gray-700 dark:text-gray-300">{language}</span>
										<span class="text-sm text-gray-500 dark:text-gray-400">{count} snippet{count !== 1 ? 's' : ''}</span>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>