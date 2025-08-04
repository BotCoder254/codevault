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
export async function addFeedbackComment(snippetId, requestId, comment, currentUser, parentCommentId = null) {
    if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
    }
    
    try {
        const commentData = {
            userId: currentUser.uid,
            userName: currentUser.displayName || currentUser.email,
            userEmail: currentUser.email,
            text: comment,
            createdAt: serverTimestamp(),
            parentCommentId: parentCommentId, // For threaded comments
            edited: false
        };
        
        const docRef = await addDoc(
            collection(db, `snippets/${snippetId}/feedbackRequests/${requestId}/comments`),
            commentData
        );
        
        return { success: true, commentId: docRef.id };
    } catch (error) {
        console.error('Error adding feedback comment:', error);
        return { success: false, error: error.message };
    }
}

// Function to edit a comment
export async function editFeedbackComment(snippetId, requestId, commentId, newText, currentUser) {
    if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
    }
    
    try {
        const commentRef = doc(db, `snippets/${snippetId}/feedbackRequests/${requestId}/comments/${commentId}`);
        const commentDoc = await getDoc(commentRef);
        
        if (!commentDoc.exists()) {
            return { success: false, error: 'Comment not found' };
        }
        
        const commentData = commentDoc.data();
        
        // Only the comment author can edit it
        if (commentData.userId !== currentUser.uid) {
            return { success: false, error: 'Not authorized to edit this comment' };
        }
        
        await updateDoc(commentRef, {
            text: newText,
            edited: true,
            updatedAt: serverTimestamp()
        });
        
        return { success: true };
    } catch (error) {
        console.error('Error editing feedback comment:', error);
        return { success: false, error: error.message };
    }
}

// Function to delete a comment
export async function deleteFeedbackComment(snippetId, requestId, commentId, currentUser) {
    if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
    }
    
    try {
        const commentRef = doc(db, `snippets/${snippetId}/feedbackRequests/${requestId}/comments/${commentId}`);
        const commentDoc = await getDoc(commentRef);
        
        if (!commentDoc.exists()) {
            return { success: false, error: 'Comment not found' };
        }
        
        const commentData = commentDoc.data();
        
        // Only the comment author can delete it
        if (commentData.userId !== currentUser.uid) {
            return { success: false, error: 'Not authorized to delete this comment' };
        }
        
        await deleteDoc(commentRef);
        
        return { success: true };
    } catch (error) {
        console.error('Error deleting feedback comment:', error);
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