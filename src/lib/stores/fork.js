import { writable } from 'svelte/store';
import { 
    collection, 
    addDoc, 
    doc, 
    getDoc,
    serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { user } from './auth.js';

export const forkLoading = writable(false);

export async function forkSnippet(originalSnippetId, currentUser) {
    if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
    }
    
    forkLoading.set(true);
    
    try {
        // Get the original snippet
        const originalDocRef = doc(db, 'snippets', originalSnippetId);
        const originalDoc = await getDoc(originalDocRef);
        
        if (!originalDoc.exists()) {
            return { success: false, error: 'Original snippet not found' };
        }
        
        const originalData = originalDoc.data();
        
        // Check if it's public
        if (originalData.visibility !== 'public') {
            return { success: false, error: 'Can only fork public snippets' };
        }
        
        // Create the forked snippet
        const forkedSnippetData = {
            title: `${originalData.title} (Fork)`,
            description: originalData.description || '',
            code: originalData.code,
            language: originalData.language,
            tags: originalData.tags || [],
            visibility: 'private', // Forks start as private
            userId: currentUser.uid,
            userEmail: currentUser.email,
            userName: currentUser.displayName || currentUser.email,
            forkedFrom: originalSnippetId,
            originalAuthor: originalData.userName || originalData.userEmail,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            voteCount: 0,
            favoriteCount: 0
        };
        
        const docRef = await addDoc(collection(db, 'snippets'), forkedSnippetData);
        
        return { 
            success: true, 
            id: docRef.id,
            message: 'Snippet forked successfully! You can now customize it.'
        };
        
    } catch (error) {
        console.error('Error forking snippet:', error);
        return { 
            success: false, 
            error: 'Failed to fork snippet. Please try again.' 
        };
    } finally {
        forkLoading.set(false);
    }
}

export async function getForkCount(snippetId) {
    try {
        // This would require a more complex query or a separate collection
        // For now, we'll return 0 and implement this later if needed
        return 0;
    } catch (error) {
        console.error('Error getting fork count:', error);
        return 0;
    }
}