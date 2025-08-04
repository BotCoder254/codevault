// @ts-nocheck
import { writable } from 'svelte/store';
import { user } from './auth.js';
import { db } from '../firebase.js';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';

export const exportProgress = writable(0);
export const importProgress = writable(0);
export const isExporting = writable(false);
export const isImporting = writable(false);

// Export snippets to JSON
export const exportSnippets = async () => {
  try {
    isExporting.set(true);
    exportProgress.set(0);
    
    const currentUser = await new Promise((resolve) => {
      let userUnsubscribe;
      userUnsubscribe = user.subscribe((u) => {
        if (userUnsubscribe) userUnsubscribe();
        resolve(u);
      });
    });
    
    if (!currentUser) throw new Error('User not authenticated');
    
    exportProgress.set(25);
    
    // Fetch user's snippets
    const q = query(
      collection(db, 'snippets'),
      where('userId', '==', currentUser.uid)
    );
    
    const snapshot = await getDocs(q);
    exportProgress.set(50);
    
    const snippets = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      snippets.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        code: data.code,
        language: data.language,
        tags: data.tags || [],
        visibility: data.visibility,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      });
    });
    
    exportProgress.set(75);
    
    // Create export data
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user: {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        email: currentUser.email
      },
      snippets: snippets,
      totalCount: snippets.length
    };
    
    exportProgress.set(90);
    
    // Create and download file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codevault-snippets-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    exportProgress.set(100);
    
    // Reset after animation
    setTimeout(() => {
      exportProgress.set(0);
      isExporting.set(false);
    }, 1000);
    
    return { success: true, count: snippets.length };
  } catch (error) {
    isExporting.set(false);
    exportProgress.set(0);
    return { success: false, error: error.message };
  }
};

// Import snippets from JSON
export const importSnippets = async (file) => {
  try {
    isImporting.set(true);
    importProgress.set(0);
    
    const currentUser = await new Promise((resolve) => {
      let userUnsubscribe;
      userUnsubscribe = user.subscribe((u) => {
        if (userUnsubscribe) userUnsubscribe();
        resolve(u);
      });
    });
    
    if (!currentUser) throw new Error('User not authenticated');
    
    importProgress.set(10);
    
    // Read file
    const text = await file.text();
    const data = JSON.parse(text);
    
    importProgress.set(20);
    
    // Validate format
    if (!data.snippets || !Array.isArray(data.snippets)) {
      throw new Error('Invalid file format: snippets array not found');
    }
    
    importProgress.set(30);
    
    // Prepare batch write
    const batch = writeBatch(db);
    const snippetsToImport = data.snippets.filter(snippet => 
      snippet.title && snippet.code && snippet.language
    );
    
    importProgress.set(40);
    
    // Add snippets to batch
    snippetsToImport.forEach((snippet, index) => {
      const snippetRef = doc(collection(db, 'snippets'));
      batch.set(snippetRef, {
        title: snippet.title,
        description: snippet.description || '',
        code: snippet.code,
        language: snippet.language,
        tags: snippet.tags || [],
        visibility: snippet.visibility || 'private',
        userId: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        voteCount: 0,
        favoriteCount: 0
      });
      
      // Update progress
      const progress = 40 + (index / snippetsToImport.length) * 50;
      importProgress.set(progress);
    });
    
    importProgress.set(90);
    
    // Commit batch
    await batch.commit();
    
    importProgress.set(100);
    
    // Reset after animation
    setTimeout(() => {
      importProgress.set(0);
      isImporting.set(false);
    }, 1000);
    
    return { 
      success: true, 
      imported: snippetsToImport.length,
      skipped: data.snippets.length - snippetsToImport.length
    };
  } catch (error) {
    isImporting.set(false);
    importProgress.set(0);
    return { success: false, error: error.message };
  }
};

// GitHub Gist integration (placeholder for OAuth implementation)
export const syncWithGist = async () => {
  // This would require GitHub OAuth setup
  // For now, return a placeholder
  return { 
    success: false, 
    error: 'GitHub Gist integration requires OAuth setup' 
  };
};