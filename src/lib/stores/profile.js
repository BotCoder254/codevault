// @ts-nocheck
import { writable, derived } from 'svelte/store';
import { user } from './auth.js';
import { snippets } from './snippets.js';
import { db } from '../firebase.js';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';

export const profileData = writable({
  bio: '',
  website: '',
  location: '',
  githubUsername: '',
  twitterUsername: '',
  editorTheme: 'vs-dark',
  preferredLanguage: 'javascript',
  publicProfile: true
});

export const profileStats = derived(
  [snippets, user],
  ([$snippets, $user]) => {
    if (!$user || !$snippets) return {
      totalSnippets: 0,
      publicSnippets: 0,
      privateSnippets: 0,
      totalVotes: 0,
      totalFavorites: 0,
      languagesUsed: 0,
      tagsUsed: 0
    };

    const publicSnippets = $snippets.filter(s => s.visibility === 'public');
    const privateSnippets = $snippets.filter(s => s.visibility === 'private');
    const totalVotes = $snippets.reduce((sum, s) => sum + (s.voteCount || 0), 0);
    const totalFavorites = $snippets.reduce((sum, s) => sum + (s.favoriteCount || 0), 0);
    
    const languages = new Set($snippets.map(s => s.language));
    const tags = new Set($snippets.flatMap(s => s.tags || []));

    return {
      totalSnippets: $snippets.length,
      publicSnippets: publicSnippets.length,
      privateSnippets: privateSnippets.length,
      totalVotes,
      totalFavorites,
      languagesUsed: languages.size,
      tagsUsed: tags.size
    };
  }
);

// Load user profile data
user.subscribe(async ($user) => {
  if ($user) {
    try {
      const profileDoc = await getDoc(doc(db, 'profiles', $user.uid));
      if (profileDoc.exists()) {
        profileData.set({ ...profileDoc.data() });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }
});

export const updateProfile = async (updates) => {
  try {
    const currentUser = await new Promise((resolve) => {
      let userUnsubscribe;
      userUnsubscribe = user.subscribe((u) => {
        if (userUnsubscribe) userUnsubscribe();
        resolve(u);
      });
    });
    
    if (!currentUser) throw new Error('User not authenticated');
    
    const profileRef = doc(db, 'profiles', currentUser.uid);
    await setDoc(profileRef, {
      ...updates,
      updatedAt: new Date()
    }, { merge: true });
    
    profileData.update(current => ({ ...current, ...updates }));
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};