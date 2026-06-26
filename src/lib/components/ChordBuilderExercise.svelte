<script lang="ts">
	import { onMount } from 'svelte';
	import { CHORD_GROUPS, type ChordGroup } from '$lib/music/chords';
	import { generateChordBuilderQuestion, validateChordBuilderAnswer, type ChordBuilderQuestion } from '$lib/exercise/chord-builder';
	import { STANDARD_TUNING } from '$lib/music/notes';
	import { locale } from '$lib/i18n/locale';
	import { t, getChordName, getNoteNames } from '$lib/i18n/translations';
	import type { HighlightedNote, MutedString, SelectedFret } from '$lib/types/fretboard';

	let {
		audioEngine,
		highlights = $bindable([]),
		mutedStrings = $bindable([]),
		activeNoteMidi = $bindable(null),
		selectedFrets = $bindable([]),
		selectable = $bindable(false),
	}: {
		audioEngine: typeof import('$lib/audio/engine') | null;
		highlights?: HighlightedNote[];
		mutedStrings?: MutedString[];
		activeNoteMidi?: number | null;
		selectedFrets?: SelectedFret[];
		selectable?: boolean;
	} = $props();

	let currentLocale = $derived($locale);
	let noteNames = $derived(getNoteNames(currentLocale));

	let difficulty: ChordGroup = $state('triads');
	let currentDiff = $derived(CHORD_GROUPS.find((d) => d.key === difficulty)!);

	let question: ChordBuilderQuestion | null = $state(null);
	let hasChecked = $state(false);
	let isCorrect: boolean | null = $state(null);
	let score = $state({ correct: 0, total: 0 });

	let promptText = $derived.by(() => {
		if (!question) return '';
		const rootName = noteNames[question.rootPitchClass];
		const qualityName = getChordName(currentLocale, question.quality.shortName);
		return `${rootName} ${qualityName}`;
	});

	$effect(() => {
		if (!question) {
			highlights = [];
			return;
		}

		const result: HighlightedNote[] = [];

		const rootMidi = STANDARD_TUNING[question.rootHint.stringIndex] + question.rootHint.fret;
		result.push({
			midi: rootMidi,
			role: 'root',
			stringIndex: question.rootHint.stringIndex,
			fret: question.rootHint.fret
		});

		highlights = result;
	});

	$effect(() => {
		selectable = !hasChecked;
	});

	$effect(() => {
		mutedStrings = [];
	});

	function newQuestion() {
		hasChecked = false;
		isCorrect = null;
		selectedFrets = [];
		question = generateChordBuilderQuestion(difficulty);
	}

	function switchDifficulty(diff: ChordGroup) {
		difficulty = diff;
		score = { correct: 0, total: 0 };
		newQuestion();
	}

	function checkAnswer() {
		if (!question || selectedFrets.length === 0) return;
		const validation = validateChordBuilderAnswer(question, selectedFrets);
		hasChecked = true;
		isCorrect = validation.correct;
		score.total++;
		if (isCorrect) score.correct++;
	}

	function handleNext() {
		newQuestion();
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
</div>

<!-- Exercise Area -->
<section class="flex flex-col items-center p-4">
	<div class="mb-3 text-sm text-gray-400">
		{t(currentLocale, 'ui.score')} {score.correct} / {score.total}
	</div>

	{#if question}
		<div class="mb-4 text-center">
			<span class="text-xs uppercase tracking-wide text-gray-500">
				{t(currentLocale, 'ui.chordBuilder.buildPrompt')}
			</span>
			<div class="mt-1 text-2xl font-bold text-white">{promptText}</div>
		</div>
	{/if}

	<div class="flex gap-4">
		{#if !hasChecked}
			<button
				class="rounded-lg bg-indigo-600 px-6 py-3 font-semibold transition-colors hover:bg-indigo-500 disabled:opacity-50"
				onclick={checkAnswer}
				disabled={selectedFrets.length === 0}
			>
				{t(currentLocale, 'ui.chordBuilder.check')}
			</button>
		{:else}
			<button
				class="rounded-lg bg-gray-700 px-6 py-3 font-semibold transition-colors hover:bg-gray-600"
				onclick={handleNext}
			>
				{t(currentLocale, 'ui.play.next')}
			</button>
		{/if}
	</div>

	{#if hasChecked}
		<div class="mt-4 text-lg font-semibold {isCorrect ? 'text-green-400' : 'text-red-400'}">
			{#if isCorrect}
				{t(currentLocale, 'ui.feedback.correct')}
			{:else}
				{t(currentLocale, 'ui.feedback.wrong').replace('{name}', promptText)}
			{/if}
		</div>
	{/if}
</section>
