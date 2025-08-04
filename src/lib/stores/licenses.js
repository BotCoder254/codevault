import { writable } from 'svelte/store';
import { 
    updateDoc, 
    doc,
    getDoc
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { user } from './auth.js';

export const licenseLoading = writable(false);

// Available licenses
export const availableLicenses = [
    { 
        id: 'mit', 
        name: 'MIT License', 
        shortName: 'MIT',
        description: 'A permissive license that allows for reuse with few restrictions.',
        url: 'https://opensource.org/licenses/MIT',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    },
    { 
        id: 'apache-2.0', 
        name: 'Apache License 2.0', 
        shortName: 'Apache 2.0',
        description: 'A permissive license that also provides an express grant of patent rights.',
        url: 'https://opensource.org/licenses/Apache-2.0',
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    },
    { 
        id: 'gpl-3.0', 
        name: 'GNU General Public License v3.0', 
        shortName: 'GPL 3.0',
        description: 'A copyleft license that requires anyone who distributes your code to make the source available under the same terms.',
        url: 'https://opensource.org/licenses/GPL-3.0',
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    },
    { 
        id: 'bsd-3-clause', 
        name: 'BSD 3-Clause License', 
        shortName: 'BSD 3-Clause',
        description: 'A permissive license similar to the BSD 2-Clause License, but with a 3rd clause that prohibits others from using the name of the copyright holder or its contributors to promote derived products without written consent.',
        url: 'https://opensource.org/licenses/BSD-3-Clause',
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    },
    { 
        id: 'cc-by-4.0', 
        name: 'Creative Commons Attribution 4.0', 
        shortName: 'CC BY 4.0',
        description: 'Allows others to distribute, remix, adapt, and build upon your work, even commercially, as long as they credit you.',
        url: 'https://creativecommons.org/licenses/by/4.0/',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    },
    { 
        id: 'cc0-1.0', 
        name: 'Creative Commons Zero v1.0 Universal', 
        shortName: 'CC0 1.0',
        description: 'Waives all copyright and related rights to a work, placing it as close to the public domain as legally possible.',
        url: 'https://creativecommons.org/publicdomain/zero/1.0/',
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
];

// Function to get license by ID
export function getLicenseById(licenseId) {
    return availableLicenses.find(license => license.id === licenseId) || null;
}

// Function to update snippet license
export async function updateSnippetLicense(snippetId, licenseId, currentUser) {
    if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
    }
    
    licenseLoading.set(true);
    
    try {
        const snippetRef = doc(db, 'snippets', snippetId);
        const snippetDoc = await getDoc(snippetRef);
        
        if (!snippetDoc.exists()) {
            return { success: false, error: 'Snippet not found' };
        }
        
        const snippetData = snippetDoc.data();
        
        // Only the owner can update the license
        if (snippetData.userId !== currentUser.uid) {
            return { success: false, error: 'Not authorized to update this snippet' };
        }
        
        // Validate license ID
        if (licenseId && !getLicenseById(licenseId)) {
            return { success: false, error: 'Invalid license ID' };
        }
        
        await updateDoc(snippetRef, {
            licenseId: licenseId || null,
            updatedAt: new Date()
        });
        
        return { success: true };
    } catch (error) {
        console.error('Error updating snippet license:', error);
        return { success: false, error: error.message };
    } finally {
        licenseLoading.set(false);
    }
}