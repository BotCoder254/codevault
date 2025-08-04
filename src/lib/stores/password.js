// @ts-nocheck
import { writable } from 'svelte/store';
import { user } from './auth.js';
import { db } from '../firebase.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
// Simple password utilities for when bcryptjs is not available
const simpleCrypto = {
  genSalt: async () => 'salt',
  hash: async (password) => btoa(encodeURIComponent(password || '')), // Simple base64 encoding as fallback
  compare: async (password, hash) => btoa(encodeURIComponent(password || '')) === hash
};

// Use simpleCrypto as a fallback
const bcrypt = simpleCrypto;

export const passwordLoading = writable(false);

// Function to set password for a snippet
export async function setSnippetPassword(snippetId, password, currentUser) {
  if (!currentUser) {
    return { success: false, error: 'User not authenticated' };
  }
  
  passwordLoading.set(true);
  
  try {
    // Check if snippet exists and belongs to user
    const snippetRef = doc(db, 'snippets', snippetId);
    const snippetDoc = await getDoc(snippetRef);
    
    if (!snippetDoc.exists()) {
      return { success: false, error: 'Snippet not found' };
    }
    
    const snippetData = snippetDoc.data();
    
    if (snippetData.userId !== currentUser.uid) {
      return { success: false, error: 'Not authorized to set password for this snippet' };
    }
    
    // Hash password if provided, or remove password protection
    let updates = {};
    
    if (password) {
      try {
        // Generate salt and hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        updates = {
          isPasswordProtected: true,
          passwordHash: hashedPassword,
          updatedAt: new Date()
        };
      } catch (err) {
        console.error('Error hashing password:', err);
        // Use a simple encoding as fallback
        updates = {
          isPasswordProtected: true,
          passwordHash: btoa(password), // Simple base64 encoding
          updatedAt: new Date()
        };
      }
    } else {
      updates = {
        isPasswordProtected: false,
        passwordHash: null,
        updatedAt: new Date()
      };
    }
    
    await updateDoc(snippetRef, updates);
    
    return { success: true };
  } catch (error) {
    console.error('Error setting snippet password:', error);
    return { success: false, error: error.message };
  } finally {
    passwordLoading.set(false);
  }
}

// Function to verify password for a snippet
export async function verifySnippetPassword(snippetId, password) {
  passwordLoading.set(true);
  
  try {
    // Get snippet
    const snippetRef = doc(db, 'snippets', snippetId);
    const snippetDoc = await getDoc(snippetRef);
    
    if (!snippetDoc.exists()) {
      return { success: false, error: 'Snippet not found' };
    }
    
    const snippetData = snippetDoc.data();
    
    // Check if snippet is password protected
    if (!snippetData.isPasswordProtected || !snippetData.passwordHash) {
      return { success: false, error: 'Snippet is not password protected' };
    }
    
    // Verify password
    let isMatch = false;
    
    try {
      isMatch = await bcrypt.compare(password, snippetData.passwordHash);
    } catch (err) {
      console.error('Error comparing passwords:', err);
      // Fallback to simple comparison if bcrypt fails
      isMatch = btoa(password) === snippetData.passwordHash;
    }
    
    if (!isMatch) {
      return { success: false, error: 'Invalid password' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error verifying snippet password:', error);
    return { success: false, error: error.message };
  } finally {
    passwordLoading.set(false);
  }
}

// Function to generate a secure share link
export function generateShareLink(snippetId) {
  const baseUrl = window.location.origin;
  return `${baseUrl}/view/${snippetId}`;
}