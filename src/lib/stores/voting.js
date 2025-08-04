// @ts-nocheck
import { writable, derived } from 'svelte/store';
import { user } from './auth.js';
import { db } from '../firebase.js';
import {
    doc,
    setDoc,
    deleteDoc,
    getDoc,
    collection,
    query,
    where,
    onSnapshot,
    increment,
    updateDoc,
    writeBatch
} from 'firebase/firestore';

export const userVotes = writable({});
export const userFavorites = writable({});
export const snippetVoteCounts = writable({});

let votesUnsubscribe = null;
let favoritesUnsubscribe = null;

// Define the functions before using them
const loadUserVotes = (userId) => {
    // Query all votes across all snippets for this user using collectionGroup
    const q = query(
        collection(db, 'snippets'),
        where('visibility', '==', 'public')
    );

    votesUnsubscribe = onSnapshot(q, async (snapshot) => {
        const votes = {};
        const promises = [];
        
        snapshot.forEach((snippetDoc) => {
            const snippetId = snippetDoc.id;
            const voteRef = doc(db, `snippets/${snippetId}/votes/${userId}`);
            promises.push(
                getDoc(voteRef).then(voteDoc => {
                    if (voteDoc.exists()) {
                        votes[snippetId] = voteDoc.data().value;
                    }
                })
            );
        });
        
        await Promise.all(promises);
        userVotes.set(votes);
    });
};

const loadUserFavorites = (userId) => {
    const favoritesRef = collection(db, 'users', userId, 'favorites');

    favoritesUnsubscribe = onSnapshot(favoritesRef, (snapshot) => {
        const favorites = {};
        snapshot.forEach((doc) => {
            favorites[doc.id] = true;
        });
        userFavorites.set(favorites);
    });
};

// Subscribe to user changes and load their votes/favorites
user.subscribe(($user) => {
    if ($user) {
        loadUserVotes($user.uid);
        loadUserFavorites($user.uid);
    } else {
        userVotes.set({});
        userFavorites.set({});
        if (votesUnsubscribe) {
            votesUnsubscribe();
            votesUnsubscribe = null;
        }
        if (favoritesUnsubscribe) {
            favoritesUnsubscribe();
            favoritesUnsubscribe = null;
        }
    }
});

export const voteSnippet = async (snippetId, value) => {
    try {
        const currentUser = await new Promise((resolve) => {
            let userUnsubscribe;
            userUnsubscribe = user.subscribe((u) => {
                if (userUnsubscribe) userUnsubscribe();
                resolve(u);
            });
        });

        if (!currentUser) throw new Error('User not authenticated');

        const batch = writeBatch(db);
        // Use subcollection for votes
        const voteRef = doc(db, `snippets/${snippetId}/votes/${currentUser.uid}`);
        const snippetRef = doc(db, 'snippets', snippetId);

        // Get current vote
        const currentVoteDoc = await getDoc(voteRef);
        const currentVote = currentVoteDoc.exists() ? currentVoteDoc.data().value : 0;

        if (value === currentVote) {
            // Remove vote
            batch.delete(voteRef);
            batch.update(snippetRef, {
                voteCount: increment(-currentVote)
            });
        } else {
            // Add or update vote
            batch.set(voteRef, {
                userId: currentUser.uid,
                snippetId,
                value,
                createdAt: new Date()
            });

            const increment_value = value - currentVote;
            batch.update(snippetRef, {
                voteCount: increment(increment_value)
            });
        }

        await batch.commit();
        return { success: true };
    } catch (error) {
        console.error('Error voting on snippet:', error);
        return { success: false, error: error.message };
    }
};

export const favoriteSnippet = async (snippetId, isFavorite) => {
    try {
        const currentUser = await new Promise((resolve) => {
            let userUnsubscribe;
            userUnsubscribe = user.subscribe((u) => {
                if (userUnsubscribe) userUnsubscribe();
                resolve(u);
            });
        });

        if (!currentUser) throw new Error('User not authenticated');

        const favoriteRef = doc(db, 'users', currentUser.uid, 'favorites', snippetId);
        const snippetRef = doc(db, 'snippets', snippetId);

        const batch = writeBatch(db);

        if (isFavorite) {
            batch.set(favoriteRef, {
                snippetId,
                createdAt: new Date()
            });
            batch.update(snippetRef, {
                favoriteCount: increment(1)
            });
        } else {
            batch.delete(favoriteRef);
            batch.update(snippetRef, {
                favoriteCount: increment(-1)
            });
        }

        await batch.commit();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Helper to check if user has voted on a snippet
export const getUserVote = derived(
    [userVotes],
    ([$userVotes]) => (snippetId) => $userVotes[snippetId] || 0
);

// Helper to check if user has favorited a snippet
export const isUserFavorite = derived(
    [userFavorites],
    ([$userFavorites]) => (snippetId) => !!$userFavorites[snippetId]
);