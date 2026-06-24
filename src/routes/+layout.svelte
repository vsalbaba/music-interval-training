<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Interval Training</title>
</svelte:head>

{@render children()}
