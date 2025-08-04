import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Sidebar state
export const sidebarCollapsed = writable(false);

// Dark mode
const defaultTheme = 'light';
const initialTheme = browser ? localStorage.getItem('theme') ?? defaultTheme : defaultTheme;
export const theme = writable(initialTheme);

// Update theme in localStorage and document
theme.subscribe((value) => {
  if (browser) {
    localStorage.setItem('theme', value);
    if (value === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
});

// Persist sidebar state
if (browser) {
  const savedSidebarState = localStorage.getItem('sidebarCollapsed');
  if (savedSidebarState !== null) {
    sidebarCollapsed.set(JSON.parse(savedSidebarState));
  }
}

sidebarCollapsed.subscribe((value) => {
  if (browser) {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(value));
  }
});

export const toggleTheme = () => {
  theme.update(t => t === 'light' ? 'dark' : 'light');
};

export const toggleSidebar = () => {
  sidebarCollapsed.update(collapsed => !collapsed);
};