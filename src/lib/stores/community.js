// @ts-nocheck
import { writable, derived } from 'svelte/store';
import { user } from './auth.js';
import { db } from '../firebase.js';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  arrayUnion,
  arrayRemove,
  onSnapshot
} from 'firebase/firestore';

// Store for community snippets
export const communitySnippets = writable([]);
export const loading = writable(false);

// Store for tracking which snippets are in the community
export const inCommunity = writable({});

// Function to check if a snippet is in the community
export const isInCommunity = derived(
  [inCommunity],
  ([$inCommunity]) => (snippetId) => {
    return !!$inCommunity[snippetId];
  }
);

// Function to load community snippets
export function loadCommunitySnippets() {
  loading.set(true);
  
  const q = query(
    collection(db, 'snippets'),
    where('inCommunity', '==', true)
  );
  
  return onSnapshot(q, (snapshot) => {
    const snippets = [];
    const communityMap = {};
    
    snapshot.forEach((doc) => {
      const snippet = {
        id: doc.id,
        ...doc.data()
      };
      snippets.push(snippet);
      communityMap[doc.id] = true;
    });
    
    communitySnippets.set(snippets);
    inCommunity.set(communityMap);
    loading.set(false);
  });
}

// Function to add a snippet to the community
export async function addToCommunity(snippetId, currentUser) {
  if (!currentUser) {
    return { success: false, error: 'User not authenticated' };
  }
  
  try {
    // Check if snippet exists
    const snippetRef = doc(db, 'snippets', snippetId);
    const snippetDoc = await getDoc(snippetRef);
    
    if (!snippetDoc.exists()) {
      return { success: false, error: 'Snippet not found' };
    }
    
    const snippetData = snippetDoc.data();
    
    // Check if snippet is already in community
    if (snippetData.inCommunity) {
      return { success: false, error: 'Snippet is already in the community' };
    }
    
    // Update snippet to mark it as in community
    await updateDoc(snippetRef, {
      inCommunity: true,
      addedToCommunityBy: currentUser.uid,
      addedToCommunityAt: new Date()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error adding snippet to community:', error);
    return { success: false, error: error.message };
  }
}

// Function to remove a snippet from the community
export async function removeFromCommunity(snippetId, currentUser) {
  if (!currentUser) {
    return { success: false, error: 'User not authenticated' };
  }
  
  try {
    // Check if snippet exists
    const snippetRef = doc(db, 'snippets', snippetId);
    const snippetDoc = await getDoc(snippetRef);
    
    if (!snippetDoc.exists()) {
      return { success: false, error: 'Snippet not found' };
    }
    
    const snippetData = snippetDoc.data();
    
    // Check if snippet is in community
    if (!snippetData.inCommunity) {
      return { success: false, error: 'Snippet is not in the community' };
    }
    
    // Check if user is allowed to remove (owner or the one who added it)
    if (snippetData.userId !== currentUser.uid && snippetData.addedToCommunityBy !== currentUser.uid) {
      return { success: false, error: 'Not authorized to remove this snippet from community' };
    }
    
    // Update snippet to remove from community
    await updateDoc(snippetRef, {
      inCommunity: false,
      addedToCommunityBy: null,
      addedToCommunityAt: null
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error removing snippet from community:', error);
    return { success: false, error: error.message };
  }
}