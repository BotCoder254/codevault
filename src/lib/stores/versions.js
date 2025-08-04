// @ts-nocheck
import { writable } from 'svelte/store';
import { user } from './auth.js';
import { db } from '../firebase.js';
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc,
  query, 
  orderBy, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';

export const versions = writable([]);
export const loadingVersions = writable(false);

// Save a new version when snippet is updated
export const saveVersion = async (snippetId, snippetData, changeDescription = 'Updated snippet') => {
  try {
    const currentUser = await new Promise((resolve) => {
      let userUnsubscribe;
      userUnsubscribe = user.subscribe((u) => {
        if (userUnsubscribe) userUnsubscribe();
        resolve(u);
      });
    });
    
    if (!currentUser) throw new Error('User not authenticated');
    
    const versionsRef = collection(db, 'snippets', snippetId, 'versions');
    
    const versionData = {
      title: snippetData.title,
      description: snippetData.description,
      code: snippetData.code,
      language: snippetData.language,
      tags: snippetData.tags || [],
      changeDescription,
      createdAt: serverTimestamp(),
      createdBy: currentUser.uid,
      createdByName: currentUser.displayName || 'Unknown User'
    };
    
    await addDoc(versionsRef, versionData);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Load version history for a snippet
export const loadVersionHistory = async (snippetId) => {
  try {
    loadingVersions.set(true);
    
    const versionsRef = collection(db, 'snippets', snippetId, 'versions');
    const q = query(versionsRef); // Remove orderBy to avoid index requirement
    
    const snapshot = await getDocs(q);
    const versionList = [];
    
    snapshot.forEach((doc) => {
      versionList.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      });
    });
    
    // Sort by createdAt descending in memory
    versionList.sort((a, b) => b.createdAt - a.createdAt);
    
    versions.set(versionList);
    loadingVersions.set(false);
    
    return { success: true, versions: versionList };
  } catch (error) {
    loadingVersions.set(false);
    return { success: false, error: error.message };
  }
};

// Revert snippet to a specific version
export const revertToVersion = async (snippetId, versionData) => {
  try {
    const snippetRef = doc(db, 'snippets', snippetId);
    
    // Save current version before reverting
    const currentSnippet = await getDoc(snippetRef);
    if (currentSnippet.exists()) {
      await saveVersion(snippetId, currentSnippet.data(), 'Auto-save before revert');
    }
    
    // Update snippet with version data
    await updateDoc(snippetRef, {
      title: versionData.title,
      description: versionData.description,
      code: versionData.code,
      language: versionData.language,
      tags: versionData.tags,
      updatedAt: new Date()
    });
    
    // Save revert action as new version
    await saveVersion(snippetId, versionData, `Reverted to version from ${versionData.createdAt.toLocaleDateString()}`);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};