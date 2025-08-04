import { writable } from 'svelte/store';
import { 
    collection, 
    doc, 
    addDoc, 
    deleteDoc, 
    query, 
    where, 
    onSnapshot,
    getDocs
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { user } from './auth.js';

export const bookmarks = writable([]);
export const bookmarkLoading = writable(false);

let userUnsubscribe = null;

// Subscribe to user changes
user.subscribe((currentUser) => {
    if (userUnsubscribe) {
        userUnsubscribe();
        userUnsubscribe = null;
    }
    
    if (currentUser) {
        subscribeToBookmarks(currentUser.uid);
    } else {
        bookmarks.set([]);
    }
});

function subscribeToBookmarks(userId) {
    const q = query(
        collection(db, 'bookmarks'),
        where('userId', '==', userId)
    );
    
    userUnsubscribe = onSnapshot(q, (snapshot) => {
        const bookmarkList = [];
        snapshot.forEach((doc) => {
            bookmarkList.push({
                id: doc.id,
                ...doc.data()
            });
        });
        bookmarks.set(bookmarkList);
    });
}

export async function toggleBookmark(snippetId, currentUser) {
    if (!currentUser) return;
    
    bookmarkLoading.set(true);
    
    try {
        // Check if already bookmarked
        const q = query(
            collection(db, 'bookmarks'),
            where('userId', '==', currentUser.uid),
            where('snippetId', '==', snippetId)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            // Add bookmark
            await addDoc(collection(db, 'bookmarks'), {
                userId: currentUser.uid,
                snippetId: snippetId,
                createdAt: new Date()
            });
        } else {
            // Remove bookmark
            querySnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });
        }
    } catch (error) {
        console.error('Error toggling bookmark:', error);
    } finally {
        bookmarkLoading.set(false);
    }
}

export function isBookmarked(snippetId, bookmarkList) {
    return bookmarkList.some(bookmark => bookmark.snippetId === snippetId);
}