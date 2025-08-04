// @ts-nocheck
import { writable } from 'svelte/store';

// Store for background image
export const backgroundImage = writable({
  url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29kZXxlbnwwfHwwfHx8MA%3D%3D&w=1920&q=80',
  opacity: 0.7,
  blur: '8px'
});

// Background image options
export const backgroundOptions = [
  {
    id: 'code',
    name: 'Code',
    url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29kZXxlbnwwfHwwfHx8MA%3D%3D&w=1920&q=80'
  },
  {
    id: 'dark-code',
    name: 'Dark Code',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y29kZXxlbnwwfHwwfHx8MA%3D%3D&w=1920&q=80'
  },
  {
    id: 'abstract',
    name: 'Abstract',
    url: 'https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGNvZGV8ZW58MHx8MHx8fDA%3D&w=1920&q=80'
  },
  {
    id: 'night',
    name: 'Night Sky',
    url: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bmlnaHQlMjBza3l8ZW58MHx8MHx8fDA%3D&w=1920&q=80'
  },
  {
    id: 'mountains',
    name: 'Mountains',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW91bnRhaW5zfGVufDB8fDB8fHww&w=1920&q=80'
  }
];

// Set background image
export function setBackground(id) {
  const option = backgroundOptions.find(opt => opt.id === id);
  if (option) {
    backgroundImage.update(bg => ({ ...bg, url: option.url }));
  }
}

// Set background opacity
export function setBackgroundOpacity(opacity) {
  backgroundImage.update(bg => ({ ...bg, opacity }));
}

// Set background blur
export function setBackgroundBlur(blur) {
  backgroundImage.update(bg => ({ ...bg, blur }));
}