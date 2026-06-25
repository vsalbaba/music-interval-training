<script lang="ts">
	import { getIntervalTableRows, getChordTableRows } from '$lib/music/scale-degrees';
	import { getSongSnippets } from '$lib/music/songs/index';
	import { t, getNoteNames } from '$lib/i18n/translations';
	import { locale } from '$lib/i18n/locale';

	type Mode = 'intervals' | 'chords';

	let { mode = 'intervals' as Mode }: { mode?: Mode } = $props();

	let currentLocale = $derived($locale);
	let noteNames = $derived(getNoteNames(currentLocale));

	let selectedKey = $state(0);
	let playingSnippet: string | null = $state(null);
	let playingTimeout: ReturnType<typeof setTimeout> | null = null;

	let intervalRows = $derived(getIntervalTableRows(selectedKey, currentLocale));
	let chordRows = $derived(getChordTableRows(selectedKey, currentLocale));

	async function stopCurrent() {
		const { stopAll } = await import('$lib/audio/engine');
		stopAll();
		if (playingTimeout) clearTimeout(playingTimeout);
		playingSnippet = null;
	}

	async function playInterval(rootNote: string, targetNote: string, semitones: number) {
		await stopCurrent();
		const label = `interval:${rootNote}-${targetNote}`;
		playingSnippet = label;
		const rootOctave = 3;
		const targetOctave = rootOctave + Math.floor((selectedKey + semitones) / 12);
		const { playIntervalPattern } = await import('$lib/audio/engine');
		await playIntervalPattern(rootNote + rootOctave, targetNote + targetOctave);
		playingTimeout = setTimeout(() => { playingSnippet = null; }, 1400);
	}

	async function playSong(abc: string, title: string) {
		await stopCurrent();
		playingSnippet = title;
		const { playAbc } = await import('$lib/audio/abc-player');
		const duration = await playAbc(abc);
		playingTimeout = setTimeout(() => { playingSnippet = null; }, duration * 1000);
	}
</script>

<div class="flex h-full flex-col overflow-hidden">
	<!-- Key picker -->
	<div class="shrink-0 border-b border-gray-800 px-3 py-3">
		<div class="mb-1 text-xs text-gray-500 uppercase">{t(currentLocale, 'ui.infoPanel.key')}</div>
		<div class="flex flex-wrap gap-1">
			{#each noteNames as name, i}
				<button
					class="rounded px-2 py-1 text-xs font-medium transition-colors
						{selectedKey === i ? 'bg-indigo-500/60 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}"
					onclick={() => (selectedKey = i)}
				>
					{name}
				</button>
			{/each}
		</div>
	</div>

	<!-- Reference table -->
	<div class="min-h-0 flex-1 overflow-y-auto px-3 py-2">
		{#if mode === 'intervals'}
			<table class="w-full text-sm">
				<thead>
					<tr class="text-left text-xs text-gray-500 uppercase">
						<th class="pb-2 pr-2">{t(currentLocale, 'ui.infoPanel.degree')}</th>
						<th class="pb-2 pr-2">{t(currentLocale, 'ui.infoPanel.interval')}</th>
						<th class="pb-2 pr-2">{t(currentLocale, 'ui.infoPanel.notes')}</th>
						<th class="pb-2">{t(currentLocale, 'ui.infoPanel.song')}</th>
					</tr>
				</thead>
				<tbody>
					{#each intervalRows as row}
						{@const snippets = [...getSongSnippets(row.shortName, 'ascending'), ...getSongSnippets(row.shortName, 'descending')]}
						<tr class="border-t border-gray-800/50">
							<td class="py-1.5 pr-2 font-mono text-xs text-indigo-400">{row.degree}</td>
							<td class="py-1.5 pr-2 text-gray-300">{row.name}</td>
							<td class="py-1.5 pr-2 text-gray-400">
								<button
									class="inline-flex items-center gap-1 transition-colors hover:text-gray-200"
									onclick={() => playInterval(row.rootNote, row.targetNote, row.semitones)}
								>
									<span class="text-[10px] text-gray-600">{playingSnippet === `interval:${row.rootNote}-${row.targetNote}` ? '...' : '▶'}</span>
									{row.rootNote} - {row.targetNote}
								</button>
							</td>
							<td class="py-1.5">
								{#each snippets as snippet}
									<button
										class="flex items-center gap-1 text-xs transition-colors
											{playingSnippet === snippet.title
												? 'text-indigo-400'
												: 'text-gray-500 hover:text-gray-300'}"
										onclick={() => playSong(snippet.abc, snippet.title)}
									>
										<span class="text-[10px]">{playingSnippet === snippet.title ? '...' : '▶'}</span>
										{snippet.title}
									</button>
								{/each}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{:else}
			<table class="w-full text-sm">
				<thead>
					<tr class="text-left text-xs text-gray-500 uppercase">
						<th class="pb-2 pr-2">{t(currentLocale, 'ui.infoPanel.formula')}</th>
						<th class="pb-2 pr-2">{t(currentLocale, 'ui.infoPanel.chord')}</th>
						<th class="pb-2 pr-2">{t(currentLocale, 'ui.infoPanel.notes')}</th>
						<th class="pb-2">{t(currentLocale, 'ui.infoPanel.hint')}</th>
					</tr>
				</thead>
				<tbody>
					{#each chordRows as row}
						<tr class="border-t border-gray-800/50">
							<td class="py-1.5 pr-2 font-mono text-xs text-indigo-400">{row.formula}</td>
							<td class="py-1.5 pr-2 text-gray-300">{row.name}</td>
							<td class="py-1.5 pr-2 text-gray-400">{row.notes.join(' - ')}</td>
							<td class="py-1.5 text-xs text-gray-500">{row.hint}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>
