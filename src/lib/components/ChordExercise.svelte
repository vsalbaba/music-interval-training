<script lang="ts">
	import { onMount } from 'svelte';
	import { CHORD_GROUPS, type ChordQuality, type ChordGroup } from '$lib/music/chords';
	import { generateChordQuestion, getChordVoicingNotes, generateOpenChordOptions, chordLabel, FAMILY_ROOT_NAMES, type ChordQuestion, type OpenChordOption } from '$lib/exercise/chord-exercise';
	import { midiToNote, noteToString } from '$lib/music/notes';
	import { recordAnswer } from '$lib/stats/store';
	import { locale } from '$lib/i18n/locale';
	import { t, getChordName } from '$lib/i18n/translations';
	import type { HighlightedNote, MutedString } from '$lib/types/fretboard';

	let {
		audioEngine,
		highlights = $bindable([]),
		mutedStrings = $bindable([]),
		activeNoteMidi = $bindable(null)
	}: {
		audioEngine: typeof import('$lib/audio/engine') | null;
		highlights?: HighlightedNote[];
		mutedStrings?: MutedString[];
		activeNoteMidi?: number | null;
	} = $props();

	let currentLocale = $derived($locale);

	let difficulty: ChordGroup = $state('triads');
	let currentDiff = $derived(CHORD_GROUPS.find((d) => d.key === difficulty)!);
	let openOnly = $state(false);

	let question: ChordQuestion | null = $state(null);
	let selectedAnswer: ChordQuality | null = $state(null);
	let selectedOpenAnswer: string | null = $state(null);
	let openOptions: OpenChordOption[] = $state([]);
	let isCorrect: boolean | null = $state(null);
	let score = $state({ correct: 0, total: 0 });
	let isPlaying = $state(false);
	let previewHighlights: HighlightedNote[] | null = $state(null);
	let internalActiveNoteMidi: number | null = $state(null);
	let activeNoteTimers: ReturnType<typeof setTimeout>[] = [];

	$effect(() => {
		if (previewHighlights) {
			highlights = previewHighlights;
		} else if (question && (selectedAnswer !== null || selectedOpenAnswer !== null)) {
			const result: HighlightedNote[] = [];
			const playedSet = new Set(question.playedNotes.map((n) => `${n.stringIndex}-${n.fret}`));

			for (const note of question.playedNotes) {
				result.push({
					midi: note.midi,
					role: note.isRoot ? 'root' : 'interval',
					stringIndex: note.stringIndex,
					fret: note.fret
				});
			}

			for (const stringNote of question.voicing.strings) {
				if (stringNote === null) continue;
				const key = `${stringNote.stringIndex}-${stringNote.fret}`;
				if (!playedSet.has(key)) {
					result.push({
						midi: stringNote.midi,
						role: 'ghost',
						stringIndex: stringNote.stringIndex,
						fret: stringNote.fret
					});
				}
			}

			highlights = result;
		} else {
			highlights = [];
		}
	});

	$effect(() => {
		if (question && (selectedAnswer !== null || selectedOpenAnswer !== null)) {
			mutedStrings = question.voicing.strings
				.map((s, i) => (s === null ? { stringIndex: i } : null))
				.filter((m): m is MutedString => m !== null);
		} else {
			mutedStrings = [];
		}
	});

	$effect(() => {
		activeNoteMidi = internalActiveNoteMidi;
	});

	let hasAnswered = $derived(selectedAnswer !== null || selectedOpenAnswer !== null);

	let correctAnswerName = $derived.by(() => {
		if (!question) return '';
		if (openOnly) return chordLabel(FAMILY_ROOT_NAMES[question.shape.family], question.quality.shortName);
		return getChordName(currentLocale, question.quality.shortName);
	});

	function clearActiveNote() {
		for (const t of activeNoteTimers) clearTimeout(t);
		activeNoteTimers = [];
		internalActiveNoteMidi = null;
	}

	function newQuestion(autoplay = false) {
		isCorrect = null;
		previewHighlights = null;
		clearActiveNote();
		question = generateChordQuestion(currentDiff.qualities, { openOnly });
		selectedAnswer = null;
		selectedOpenAnswer = null;
		if (openOnly && question) {
			openOptions = generateOpenChordOptions(question, currentDiff.qualities);
		}
		if (autoplay) playCurrentQuestion();
	}

	function switchDifficulty(diff: ChordGroup) {
		difficulty = diff;
		score = { correct: 0, total: 0 };
		newQuestion();
	}

	async function playCurrentQuestion() {
		if (isPlaying || !question) return;
		isPlaying = true;
		clearActiveNote();
		try {
			const midis = question.playedNotes.map((n) => n.midi);
			for (let i = 0; i < midis.length; i++) {
				activeNoteTimers.push(setTimeout(() => { internalActiveNoteMidi = midis[i]; }, i * 500));
			}
			const strumTime = midis.length * 500 + 200;
			activeNoteTimers.push(setTimeout(() => { internalActiveNoteMidi = null; }, strumTime));
			await audioEngine!.playChordPattern(question.noteStrings);
			const totalTime = question.noteStrings.length * 500 + 200 + question.noteStrings.length * 40;
			setTimeout(() => { isPlaying = false; clearActiveNote(); }, totalTime + 200);
		} catch {
			isPlaying = false;
		}
	}

	function submitAnswer(quality: ChordQuality) {
		if (!question || selectedAnswer !== null) return;
		selectedAnswer = quality;
		isCorrect = quality.name === question.quality.name;
		score.total++;
		if (isCorrect) score.correct++;
		recordAnswer('chord', question.quality.name, isCorrect);
	}

	function submitOpenAnswer(option: OpenChordOption) {
		if (!question || selectedOpenAnswer !== null) return;
		selectedOpenAnswer = option.label;
		const correctLabel = chordLabel(FAMILY_ROOT_NAMES[question.shape.family], question.quality.shortName);
		isCorrect = option.label === correctLabel;
		score.total++;
		if (isCorrect) score.correct++;
		recordAnswer('chord', correctLabel, isCorrect);
	}

	async function previewOpenChord(option: OpenChordOption) {
		if (isPlaying || !question) return;
		isPlaying = true;
		const voicingNotes = getChordVoicingNotes(option.family, 0, option.quality);
		const midis = voicingNotes.map(n => n.midi);
		if (hasAnswered) {
			previewHighlights = voicingNotes.map((note) => ({
				midi: note.midi,
				role: note.isRoot ? 'root' as const : 'interval' as const,
				stringIndex: note.stringIndex,
				fret: note.fret
			}));
			clearActiveNote();
			for (let i = 0; i < midis.length; i++) {
				activeNoteTimers.push(setTimeout(() => { internalActiveNoteMidi = midis[i]; }, i * 500));
			}
			const strumTime = midis.length * 500 + 200;
			activeNoteTimers.push(setTimeout(() => { internalActiveNoteMidi = null; }, strumTime));
		}
		try {
			const notes = midis.map((m) => noteToString(midiToNote(m)));
			await audioEngine!.playChordPattern(notes);
			const totalTime = midis.length * 500 + 200 + midis.length * 40;
			setTimeout(() => { isPlaying = false; previewHighlights = null; clearActiveNote(); }, totalTime + 200);
		} catch {
			isPlaying = false;
			previewHighlights = null;
			clearActiveNote();
		}
	}

	async function previewChord(quality: ChordQuality) {
		if (isPlaying || !question) return;
		isPlaying = true;
		const voicingNotes = getChordVoicingNotes(question.shape.family, question.offset, quality, question.rootMidi);
		const midis = voicingNotes.map(n => n.midi);
		if (hasAnswered) {
			previewHighlights = voicingNotes.map((note) => ({
				midi: note.midi,
				role: note.isRoot ? 'root' as const : 'interval' as const,
				stringIndex: note.stringIndex,
				fret: note.fret
			}));
			clearActiveNote();
			for (let i = 0; i < midis.length; i++) {
				activeNoteTimers.push(setTimeout(() => { internalActiveNoteMidi = midis[i]; }, i * 500));
			}
			const strumTime = midis.length * 500 + 200;
			activeNoteTimers.push(setTimeout(() => { internalActiveNoteMidi = null; }, strumTime));
		}
		try {
			const notes = midis.map((m) => noteToString(midiToNote(m)));
			await audioEngine!.playChordPattern(notes);
			const totalTime = midis.length * 500 + 200 + midis.length * 40;
			setTimeout(() => { isPlaying = false; previewHighlights = null; clearActiveNote(); }, totalTime + 200);
		} catch {
			isPlaying = false;
			previewHighlights = null;
			clearActiveNote();
		}
	}

	onMount(() => {
		newQuestion();
	});
</script>

<!-- Difficulty selector -->
<div class="mb-6 flex flex-wrap items-center gap-1">
	{#each CHORD_GROUPS as diff}
		<button
			class="rounded px-3 py-1 text-xs font-medium transition-colors
				{difficulty === diff.key ? 'bg-indigo-500/60 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}"
			onclick={() => switchDifficulty(diff.key)}
		>
			{t(currentLocale, `ui.difficulty.${diff.key}`)}
		</button>
	{/each}
	<label class="ml-3 flex cursor-pointer items-center gap-1.5 text-xs text-gray-400">
		<input
			type="checkbox"
			class="accent-indigo-500"
			bind:checked={openOnly}
			onchange={() => newQuestion()}
		/>
		{t(currentLocale, 'ui.openChords')}
	</label>
</div>

<!-- Exercise Area -->
<section class="flex flex-col items-center p-4">
	<div class="mb-3 text-sm text-gray-400">
		{t(currentLocale, 'ui.score')} {score.correct} / {score.total}
	</div>

	<div class="flex gap-4">
		<button
			class="rounded-lg bg-indigo-600 px-6 py-3 font-semibold transition-colors hover:bg-indigo-500 disabled:opacity-50"
			onclick={playCurrentQuestion}
			disabled={isPlaying}
		>
			{isPlaying ? t(currentLocale, 'ui.play.playing') : t(currentLocale, 'ui.play.play')}
		</button>

		{#if hasAnswered}
			<button
				class="rounded-lg bg-gray-700 px-6 py-3 font-semibold transition-colors hover:bg-gray-600"
				onclick={() => newQuestion(true)}
			>
				{t(currentLocale, 'ui.play.next')}
			</button>
		{/if}
	</div>

	{#if hasAnswered}
		<div class="mt-4 text-lg font-semibold {isCorrect ? 'text-green-400' : 'text-red-400'}">
			{#if isCorrect}
				{t(currentLocale, 'ui.feedback.correct')}
			{:else}
				{t(currentLocale, 'ui.feedback.wrong').replace('{name}', correctAnswerName)}
			{/if}
		</div>
		{#if question}
			{@const rootName = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][question.rootMidi % 12]}
			{@const suffixMap: Record<string, string> = { Maj: '', Min: 'm', Dim: 'dim', Aug: 'aug', Sus2: 'sus2', Sus4: 'sus4', '5': '5', Dom7: '7', Maj7: 'maj7', Min7: 'm7', Dim7: 'dim7', m7b5: 'm7b5', Aug7: 'aug7', mMaj7: 'mMaj7', '7sus4': '7sus4', '6': '6', m6: 'm6', add9: 'add9', add11: 'add11' }}
			{@const suffix = suffixMap[question.quality.shortName] ?? question.quality.shortName}
			<div class="mt-1 text-xs text-gray-500">
				{rootName}{suffix} -- {question.shape.family}-shape at fret {question.offset}
			</div>
		{/if}
	{/if}
</section>

<!-- Answer Grid -->
<section class="flex shrink-0 flex-wrap items-center justify-center gap-3 p-4">
	{#if openOnly}
		{#each openOptions as option}
			{@const isSelected = selectedOpenAnswer === option.label}
			{@const isAnswer = selectedOpenAnswer !== null && option.label === correctAnswerName}
			<div class="flex">
				<button
					class="rounded-l-lg border-r border-black/20 px-2 py-3 text-xs transition-colors
						{isSelected && isCorrect
							? 'bg-green-700 text-white'
							: isSelected && !isCorrect
								? 'bg-red-700 text-white'
								: isAnswer
									? 'bg-green-700/50 text-white'
									: hasAnswered
										? 'bg-gray-800/80 text-gray-600'
										: 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white cursor-pointer'}"
					onclick={() => previewOpenChord(option)}
					disabled={isPlaying}
				>
					{isPlaying ? '...' : '▶'}
				</button>
				<button
					class="rounded-r-lg px-4 py-3 text-sm font-semibold transition-colors
						{isSelected && isCorrect
							? 'bg-green-600 text-white'
							: isSelected && !isCorrect
								? 'bg-red-600 text-white'
								: isAnswer
									? 'bg-green-600/50 text-white'
									: hasAnswered
										? 'bg-gray-800 text-gray-500 cursor-default'
										: 'bg-gray-700 text-white hover:bg-gray-600 cursor-pointer'}"
					onclick={() => submitOpenAnswer(option)}
					disabled={hasAnswered}
				>
					{option.label}
				</button>
			</div>
		{/each}
	{:else}
		{#each currentDiff.qualities as quality}
			{@const isSelected = selectedAnswer?.name === quality.name}
			{@const isAnswer = selectedAnswer !== null && question?.quality.name === quality.name}
			<div class="flex">
				<button
					class="rounded-l-lg border-r border-black/20 px-2 py-3 text-xs transition-colors
						{isSelected && isCorrect
							? 'bg-green-700 text-white'
							: isSelected && !isCorrect
								? 'bg-red-700 text-white'
								: isAnswer
									? 'bg-green-700/50 text-white'
									: hasAnswered
										? 'bg-gray-800/80 text-gray-600'
										: 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white cursor-pointer'}"
					onclick={() => previewChord(quality)}
					disabled={isPlaying}
				>
					{isPlaying ? '...' : '▶'}
				</button>
				<button
					class="rounded-r-lg px-4 py-3 text-sm font-semibold transition-colors
						{isSelected && isCorrect
							? 'bg-green-600 text-white'
							: isSelected && !isCorrect
								? 'bg-red-600 text-white'
								: isAnswer
									? 'bg-green-600/50 text-white'
									: hasAnswered
										? 'bg-gray-800 text-gray-500 cursor-default'
										: 'bg-gray-700 text-white hover:bg-gray-600 cursor-pointer'}"
					onclick={() => submitAnswer(quality)}
					disabled={hasAnswered}
				>
					{getChordName(currentLocale, quality.shortName)}
				</button>
			</div>
		{/each}
	{/if}
</section>
