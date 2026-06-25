<script lang="ts">
	import { getFretboardNote, noteToString } from '$lib/music/notes';
	import { getNoteNames, getStringLabels } from '$lib/i18n/translations';
	import { locale } from '$lib/i18n/locale';

	let noteNames = $derived(getNoteNames($locale));
	let stringLabels = $derived(getStringLabels($locale));

	interface HighlightedNote {
		midi: number;
		role: 'root' | 'interval' | 'ghost';
		stringIndex?: number;
		fret?: number;
	}

	interface MutedString {
		stringIndex: number;
	}

	let { highlights = [], mutedStrings = [], activeNoteMidi = null as number | null }: { highlights?: HighlightedNote[]; mutedStrings?: MutedString[]; activeNoteMidi?: number | null } = $props();

	const STRING_COUNT = 6;
	const FRET_COUNT = 12;
	const FRET_MARKERS = [3, 5, 7, 9];
	const DOUBLE_MARKER = 12;

	function getHighlight(stringIndex: number, fret: number, midi: number): 'root' | 'interval' | 'ghost' | null {
		const exactMatch = highlights.find(
			(h) => h.stringIndex !== undefined && h.stringIndex === stringIndex && h.fret === fret
		);
		if (exactMatch) return exactMatch.role;

		const midiMatch = highlights.find((h) => h.stringIndex === undefined && h.midi === midi);
		return midiMatch ? midiMatch.role : null;
	}

	function isMuted(stringIndex: number): boolean {
		return mutedStrings.some((m) => m.stringIndex === stringIndex);
	}

	async function handleClick(stringIndex: number, fret: number) {
		const note = getFretboardNote(stringIndex, fret);
		const { playNote } = await import('$lib/audio/engine');
		playNote(noteToString(note));
	}
</script>

<div class="w-full select-none px-4 py-3">
	<!-- Fret numbers -->
	<div class="mb-1 flex">
		<div class="w-10 shrink-0"></div>
		<div class="flex flex-1">
			{#each { length: FRET_COUNT + 1 } as _, fret}
				<div class="flex-1 text-center text-xs text-gray-500">
					{fret === 0 ? '' : fret}
				</div>
			{/each}
		</div>
	</div>

	<!-- Strings -->
	<div class="relative">
		{#each { length: STRING_COUNT } as _, stringIndex}
			{@const displayIndex = STRING_COUNT - 1 - stringIndex}
			<div class="flex items-center" style="height: 40px;">
				<!-- String label -->
				<div class="w-10 shrink-0 text-center text-sm font-bold text-gray-400">
					{stringLabels[displayIndex]}
				</div>

				<!-- Frets -->
				<div class="flex flex-1">
					{#each { length: FRET_COUNT + 1 } as _, fret}
						{@const note = getFretboardNote(displayIndex, fret)}
						{@const highlight = getHighlight(displayIndex, fret, note.midi)}
						{@const muted = isMuted(displayIndex) && fret === 0}
						<button
							class="group relative flex flex-1 cursor-pointer items-center justify-center
								{fret === 0 ? 'border-r-4 border-r-gray-300' : 'border-r border-r-gray-600'}
								hover:bg-gray-700/50"
							onclick={() => handleClick(displayIndex, fret)}
						>
							<!-- String line -->
							<div class="absolute inset-x-0 top-1/2 h-px -translate-y-1/2
								{displayIndex < 3 ? 'bg-gray-400' : 'bg-gray-500'}"
								style="height: {1 + (5 - displayIndex) * 0.4}px;"
							></div>

							{#if muted}
								<!-- Muted string X marker -->
								<div class="relative z-10 text-sm font-bold text-gray-500">X</div>
							{:else}
								<!-- Note dot -->
								{@const isActive = highlight !== null && highlight !== 'ghost' && activeNoteMidi !== null && note.midi === activeNoteMidi}
								<div
									class="relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all
										{highlight === 'root'
											? 'bg-amber-500 text-black'
											: highlight === 'interval'
												? 'bg-sky-500 text-black'
												: highlight === 'ghost'
													? 'bg-gray-600/40 text-gray-400 border border-gray-500'
													: 'bg-transparent text-transparent group-hover:bg-gray-600 group-hover:text-gray-200'}
										{isActive ? 'ring-2 ring-yellow-300 ring-offset-1 ring-offset-gray-900' : ''}"
								>
									{noteNames[note.midi % 12]}
								</div>
							{/if}
						</button>
					{/each}
				</div>
			</div>
		{/each}

		<!-- Fret markers -->
		<div class="pointer-events-none absolute inset-0 flex">
			<div class="w-10 shrink-0"></div>
			<div class="flex flex-1">
				{#each { length: FRET_COUNT + 1 } as _, fret}
					<div class="flex flex-1 items-center justify-center">
						{#if FRET_MARKERS.includes(fret)}
							<div class="h-2 w-2 rounded-full bg-gray-600"></div>
						{:else if fret === DOUBLE_MARKER}
							<div class="flex flex-col gap-8">
								<div class="h-2 w-2 rounded-full bg-gray-600"></div>
								<div class="h-2 w-2 rounded-full bg-gray-600"></div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
