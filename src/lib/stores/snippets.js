// @ts-nocheck
import { writable, derived } from 'svelte/store';
import { user } from './auth.js';
import { db } from '../firebase.js';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';

export const snippets = writable([]);
export const loading = writable(false);
export const searchQuery = writable('');
export const selectedTags = writable([]);
export const selectedLanguage = writable('');

// Filtered snippets based on search and filters
export const filteredSnippets = derived(
  [snippets, searchQuery, selectedTags, selectedLanguage],
  ([$snippets, $searchQuery, $selectedTags, $selectedLanguage]) => {
    return $snippets.filter(snippet => {
      const matchesSearch = !$searchQuery ||
        snippet.title.toLowerCase().includes($searchQuery.toLowerCase()) ||
        snippet.description.toLowerCase().includes($searchQuery.toLowerCase()) ||
        snippet.code.toLowerCase().includes($searchQuery.toLowerCase());

      const matchesTags = $selectedTags.length === 0 ||
        $selectedTags.every(tag => snippet.tags.includes(tag));

      const matchesLanguage = !$selectedLanguage ||
        snippet.language === $selectedLanguage;

      return matchesSearch && matchesTags && matchesLanguage;
    });
  }
);

// Get all unique tags from snippets
export const allTags = derived(snippets, ($snippets) => {
  const tags = new Set();
  $snippets.forEach(snippet => {
    snippet.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
});

// Get all unique languages from snippets
export const allLanguages = derived(snippets, ($snippets) => {
  const languages = new Set();
  $snippets.forEach(snippet => {
    if (snippet.language) languages.add(snippet.language);
  });
  return Array.from(languages).sort();
});

let unsubscribe = null;

// Function to load user snippets
const loadUserSnippets = (userId) => {
  loading.set(true);

  // Use only where clause, sort in memory to avoid composite index
  const q = query(
    collection(db, 'snippets'),
    where('userId', '==', userId)
  );

  // Real-time listener
  unsubscribe = onSnapshot(q, (snapshot) => {
    const userSnippets = [];
    snapshot.forEach((doc) => {
      userSnippets.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort in memory by updatedAt descending
    userSnippets.sort((a, b) => {
      const aDate = a.updatedAt?.toDate?.() || new Date(0);
      const bDate = b.updatedAt?.toDate?.() || new Date(0);
      return bDate - aDate;
    });
    
    snippets.set(userSnippets);
    loading.set(false);
  });
};

// Subscribe to user changes and load snippets
user.subscribe(($user) => {
  if ($user) {
    loadUserSnippets($user.uid);
  } else {
    snippets.set([]);
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  }
});

export const createSnippet = async (snippetData) => {
  try {
    const currentUser = await new Promise((resolve) => {
      let userUnsubscribe;
      userUnsubscribe = user.subscribe((u) => {
        if (userUnsubscribe) userUnsubscribe();
        resolve(u);
      });
    });

    if (!currentUser) throw new Error('User not authenticated');

    const snippet = {
      ...snippetData,
      userId: currentUser.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
      voteCount: 0,
      favoriteCount: 0
    };

    const docRef = await addDoc(collection(db, 'snippets'), snippet);
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateSnippet = async (snippetId, updates) => {
  try {
    const snippetRef = doc(db, 'snippets', snippetId);
    await updateDoc(snippetRef, {
      ...updates,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteSnippet = async (snippetId) => {
  try {
    await deleteDoc(doc(db, 'snippets', snippetId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getSnippet = async (snippetId) => {
  try {
    const docRef = doc(db, 'snippets', snippetId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        snippet: { id: docSnap.id, ...docSnap.data() }
      };
    } else {
      return { success: false, error: 'Snippet not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};