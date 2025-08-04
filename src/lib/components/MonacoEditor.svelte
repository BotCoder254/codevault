<script>
	// @ts-nocheck
	import { onMount, onDestroy } from 'svelte';
	import { theme } from '$lib/stores/ui.js';
	import loader from '@monaco-editor/loader';
	
	export let value = '';
	export let language = 'javascript';
	export let height = '400px';
	export let readonly = false;
	
	let container;
	let editor;
	let monaco;
	
	onMount(async () => {
		monaco = await loader.init();
		
		editor = monaco.editor.create(container, {
			value,
			language,
			theme: $theme === 'dark' ? 'vs-dark' : 'vs',
			readOnly: readonly,
			minimap: { enabled: false },
			fontSize: 14,
			lineNumbers: 'on',
			roundedSelection: false,
			scrollBeyondLastLine: false,
			automaticLayout: true,
			tabSize: 2,
			insertSpaces: true,
			wordWrap: 'on',
			folding: true,
			lineDecorationsWidth: 10,
			lineNumbersMinChars: 3,
			glyphMargin: false
		});
		
		// Listen for content changes
		editor.onDidChangeModelContent(() => {
			value = editor.getValue();
		});
		
		// Update theme when it changes
		const unsubscribe = theme.subscribe(($theme) => {
			if (editor) {
				monaco.editor.setTheme($theme === 'dark' ? 'vs-dark' : 'vs');
			}
		});
		
		return () => {
			unsubscribe();
		};
	});
	
	onDestroy(() => {
		if (editor) {
			editor.dispose();
		}
	});
	
	// Update editor when props change
	$: if (editor && editor.getValue() !== value) {
		editor.setValue(value);
	}
	
	$: if (editor && language) {
		const model = editor.getModel();
		if (model) {
			monaco.editor.setModelLanguage(model, language);
		}
	}
</script>

<div bind:this={container} style="height: {height};" class="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"></div>