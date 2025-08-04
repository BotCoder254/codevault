import { writable, derived } from 'svelte/store';
import { 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDoc, 
    getDocs,
    query, 
    where, 
    orderBy, 
    onSnapshot,
    serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { user } from './auth.js';

export const feedbackRequests = writable([]);
export const feedbackLoading = writable(false);

// Initialize with empty array
feedbackRequests.set([]);

// Derived store to check if a snippet has a feedback request
export const hasFeedbackRequest = derived(
    [feedbackRequests],
    ([$feedbackRequests]) => (snippetId) => {
        return $feedbackRequests.some(request => request.snippetId === snippetId);
    }
);

// Function to toggle a feedback request for a snippet
export async function toggleFeedbackRequest(snippetId, currentUser, requestType = 'review') {
    if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
    }
    
    feedbackLoading.set(true);
    
    try {
        // Check if a request already exists
        const q = query(
            collection(db, `snippets/${snippetId}/feedbackRequests`),
            where('userId', '==', currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            // Create a new feedback request
            await addDoc(collection(db, `snippets/${snippetId}/feedbackRequests`), {
                userId: currentUser.uid,
                userName: currentUser.displayName || currentUser.email,
                userEmail: currentUser.email,
                requestType: requestType, // 'review' or 'help'
                status: 'open',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            
            return { success: true, action: 'created' };
        } else {
            // Remove the feedback request
            const docToDelete = querySnapshot.docs[0];
            await deleteDoc(docToDelete.ref);
            return { success: true, action: 'removed' };
        }
    } catch (error) {
        console.error('Error toggling feedback request:', error);
        return { success: false, error: error.message };
    } finally {
        feedbackLoading.set(false);
    }
}

// Function to add a comment to a feedback request
export async function addFeedbackComment(snippetId, requestId, comment, currentUser) {
    if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
    }
    
    try {
        const commentData = {
            userId: currentUser.uid,
            userName: currentUser.displayName || currentUser.email,
            userEmail: currentUser.email,
            text: comment,
            createdAt: serverTimestamp()
        };
        
        await addDoc(
            collection(db, `snippets/${snippetId}/feedbackRequests/${requestId}/comments`),
            commentData
        );
        
        return { success: true };
    } catch (error) {
        console.error('Error adding feedback comment:', error);
        return { success: false, error: error.message };
    }
}

// Function to load feedback requests for a specific snippet
export function loadSnippetFeedbackRequests(snippetId) {
    feedbackLoading.set(true);
    
    const q = query(
        collection(db, `snippets/${snippetId}/feedbackRequests`),
        orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
        const requests = [];
        snapshot.forEach((doc) => {
            requests.push({
                id: doc.id,
                snippetId: snippetId,
                ...doc.data()
            });
        });
        
        feedbackRequests.set(requests);
        feedbackLoading.set(false);
    });
}

// Function to check if the current user has requested feedback for a snippet
export async function hasUserRequestedFeedback(snippetId, currentUser) {
    if (!currentUser) return false;
    
    try {
        const q = query(
            collection(db, `snippets/${snippetId}/feedbackRequests`),
            where('userId', '==', currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error('Error checking feedback request:', error);
        return false;
    }
}