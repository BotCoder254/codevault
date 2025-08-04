import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { user } from '$lib/stores/auth.js';

export function load() {
  const currentUser = get(user);
  
  if (!currentUser) {
    throw redirect(302, '/auth/signin');
  }
  
  return {};
}