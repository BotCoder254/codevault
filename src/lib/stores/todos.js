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

export const snippetTodos = writable([]);
export const todoLoading = writable(false);

// Derived store to get todos for a specific snippet
export const getSnippetTodos = derived(
    [snippetTodos],
    ([$snippetTodos]) => (snippetId) => {
        return $snippetTodos.filter(todo => todo.snippetId === snippetId);
    }
);

// Function to load todos for a specific snippet
export function loadSnippetTodos(snippetId) {
    todoLoading.set(true);
    
    // Use a simpler query to avoid index issues
    const q = query(
        collection(db, `snippets/${snippetId}/todos`)
    );
    
    return onSnapshot(q, (snapshot) => {
        const todos = [];
        snapshot.forEach((doc) => {
            todos.push({
                id: doc.id,
                snippetId,
                ...doc.data()
            });
        });
        
        snippetTodos.set(todos);
        todoLoading.set(false);
    });
}

// Function to add a todo to a snippet
export async function addTodo(snippetId, todoData, currentUser) {
    if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
    }
    
    todoLoading.set(true);
    
    try {
        const newTodo = {
            title: todoData.title,
            description: todoData.description || '',
            priority: todoData.priority || 'medium',
            status: 'pending',
            userId: currentUser.uid,
            userName: currentUser.displayName || currentUser.email,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        
        const docRef = await addDoc(
            collection(db, `snippets/${snippetId}/todos`),
            newTodo
        );
        
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error adding todo:', error);
        return { success: false, error: error.message };
    } finally {
        todoLoading.set(false);
    }
}

// Function to update a todo
export async function updateTodo(snippetId, todoId, updates, currentUser) {
    if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
    }
    
    todoLoading.set(true);
    
    try {
        const todoRef = doc(db, `snippets/${snippetId}/todos/${todoId}`);
        const todoDoc = await getDoc(todoRef);
        
        if (!todoDoc.exists()) {
            return { success: false, error: 'Todo not found' };
        }
        
        const todoData = todoDoc.data();
        
        // Only the owner can update todos
        if (todoData.userId !== currentUser.uid && snippetId.userId !== currentUser.uid) {
            return { success: false, error: 'Not authorized to update this todo' };
        }
        
        await updateDoc(todoRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
        
        return { success: true };
    } catch (error) {
        console.error('Error updating todo:', error);
        return { success: false, error: error.message };
    } finally {
        todoLoading.set(false);
    }
}

// Function to toggle todo status
export async function toggleTodoStatus(snippetId, todoId, currentUser) {
    if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
    }
    
    todoLoading.set(true);
    
    try {
        const todoRef = doc(db, `snippets/${snippetId}/todos/${todoId}`);
        const todoDoc = await getDoc(todoRef);
        
        if (!todoDoc.exists()) {
            return { success: false, error: 'Todo not found' };
        }
        
        const todoData = todoDoc.data();
        const newStatus = todoData.status === 'completed' ? 'pending' : 'completed';
        
        await updateDoc(todoRef, {
            status: newStatus,
            updatedAt: serverTimestamp()
        });
        
        return { success: true, status: newStatus };
    } catch (error) {
        console.error('Error toggling todo status:', error);
        return { success: false, error: error.message };
    } finally {
        todoLoading.set(false);
    }
}

// Function to delete a todo
export async function deleteTodo(snippetId, todoId, currentUser) {
    if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
    }
    
    todoLoading.set(true);
    
    try {
        const todoRef = doc(db, `snippets/${snippetId}/todos/${todoId}`);
        const todoDoc = await getDoc(todoRef);
        
        if (!todoDoc.exists()) {
            return { success: false, error: 'Todo not found' };
        }
        
        const todoData = todoDoc.data();
        
        // Only the owner can delete todos
        if (todoData.userId !== currentUser.uid && snippetId.userId !== currentUser.uid) {
            return { success: false, error: 'Not authorized to delete this todo' };
        }
        
        await deleteDoc(todoRef);
        
        return { success: true };
    } catch (error) {
        console.error('Error deleting todo:', error);
        return { success: false, error: error.message };
    } finally {
        todoLoading.set(false);
    }
}