// @ts-nocheck
import { writable, derived } from 'svelte/store';
import { db } from '../firebase.js';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  increment,
  updateDoc,
  where
} from 'firebase/firestore';

export const globalTags = writable([]);
export const tagSuggestions = writable([]);

let tagsUnsubscribe = null;

// Load global tags on initialization
const loadGlobalTags = () => {
  // Get all tags and sort in memory to avoid index requirement
  const q = query(
    collection(db, 'meta', 'tags', 'list'),
    limit(100)
  );

  tagsUnsubscribe = onSnapshot(q, (snapshot) => {
    const tags = [];
    snapshot.forEach((doc) => {
      tags.push({
        name: doc.id,
        ...doc.data()
      });
    });

    // Sort by usage count in memory
    tags.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));

    globalTags.set(tags);
  });
};

// Initialize tags loading
loadGlobalTags();

// Get tag suggestions based on input
export const getTagSuggestions = (input) => {
  if (!input || input.length < 1) {
    tagSuggestions.set([]);
    return;
  }

  const currentTags = globalTags.subscribe((tags) => {
    const filtered = tags
      .filter(tag =>
        tag.name.toLowerCase().includes(input.toLowerCase()) &&
        tag.name.toLowerCase() !== input.toLowerCase()
      )
      .slice(0, 8)
      .map(tag => tag.name);

    tagSuggestions.set(filtered);
  });

  // Cleanup subscription
  setTimeout(() => currentTags(), 0);
};

// Add or increment tag usage
export const addTagUsage = async (tagName) => {
  try {
    const tagRef = doc(db, 'meta', 'tags', 'list', tagName.toLowerCase());
    const tagDoc = await getDoc(tagRef);

    if (tagDoc.exists()) {
      // Increment usage count
      await updateDoc(tagRef, {
        usageCount: increment(1),
        lastUsed: new Date()
      });
    } else {
      // Create new tag
      await setDoc(tagRef, {
        usageCount: 1,
        createdAt: new Date(),
        lastUsed: new Date()
      });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Batch add multiple tags
export const addMultipleTagsUsage = async (tags) => {
  try {
    const promises = tags.map(tag => addTagUsage(tag));
    await Promise.all(promises);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get popular tags
export const getPopularTags = derived(
  [globalTags],
  ([$globalTags]) => $globalTags.slice(0, 20).map(tag => tag.name)
);

// Cleanup function
export const cleanup = () => {
  if (tagsUnsubscribe) {
    tagsUnsubscribe();
    tagsUnsubscribe = null;
  }
};