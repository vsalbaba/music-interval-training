<script lang="ts">
	import { onMount } from 'svelte';
	import { INTERVAL_DIFFICULTIES, type Interval, type IntervalDifficulty } from '$lib/music/intervals';
	import { generateQuestion, type IntervalQuestion } from '$lib/exercise/interval-exercise';
	import { midiToNote, noteToString } from '$lib/music/notes';
	import { recordAnswer } from '$lib/stats/store';
	import { locale } from '$lib/i18n/locale';
	import { t, getIntervalName } from '$lib/i18n/translations';
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

	let difficulty: IntervalDifficulty = $state('easy');
	let currentDiff = $derived(INTERVAL_DIFFICULTIES.find((d) => d.key === difficulty)!);

	let question: IntervalQuestion | null = $state(null);
	let selectedAnswer: Interval | null = $state(null);
	let isCorrect: boolean | null = $state(null);
	let score = $state({ correct: 0, total: 0 });
	let isPlaying = $state(false);
	let previewHighlights: HighlightedNote[] | null = $state(null);
	let internalActiveNoteMidi: number | null = $state(null);
	let activeNoteTimers: ReturnType<typeof setTimeout>[] = [];

	$effect(() => {
		if (previewHighlights) {
			highlights = previewHighlights;
		} else if (question && selectedAnswer !== null) {
			highlights = [
				{ midi: question.rootMidi, role: 'root' as const },
				{ midi: question.intervalMidi, role: 'interval' as const }
			];
		} else {
			highlights = [];
		}
	});

	$effect(() => {
		mutedStrings = [];
	});

	$effect(() => {
		activeNoteMidi = internalActiveNoteMidi;
	});

	let hasAnswered = $derived(selectedAnswer !== null);

	let correctAnswerName = $derived.by(() => {
		if (question) return getIntervalName(currentLocale, question.interval.semitones);
		return '';
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
		question = generateQuestion(currentDiff.intervals);
		selectedAnswer = null;
		if (autoplay) playCurrentQuestion();
	}

	function switchDifficulty(diff: IntervalDifficulty) {
		difficulty = diff;
		score = { correct: 0, total: 0 };
		newQuestion();
	}

	async function playCurrentQuestion() {
		if (isPlaying || !question) return;
		isPlaying = true;
		clearActiveNote();
		try {
			internalActiveNoteMidi = question.rootMidi;
			activeNoteTimers.push(setTimeout(() => { internalActiveNoteMidi = question!.intervalMidi; }, 500));
			activeNoteTimers.push(setTimeout(() => { internalActiveNoteMidi = question!.rootMidi; }, 1200));
			activeNoteTimers.push(setTimeout(() => { internalActiveNoteMidi = null; }, 1300));
			await audioEngine!.playIntervalPattern(question.rootNoteString, question.intervalNoteString);
			setTimeout(() => { isPlaying = false; clearActiveNote(); }, 1400);
		} catch {
			isPlaying = false;
		}
	}

	function submitAnswer(interval: Interval) {
		if (!question || selectedAnswer !== null) return;
		selectedAnswer = interval;
		isCorrect = interval.semitones === question.interval.semitones;
		score.total++;
		if (isCorrect) score.correct++;
		recordAnswer('interval', question.interval.name, isCorrect);
	}

	async function previewInterval(interval: Interval) {
		if (isPlaying || !question) return;
		isPlaying = true;
		const rootMidi = question.rootMidi;
		const targetMidi = rootMidi + interval.semitones;
		if (hasAnswered) {
			previewHighlights = [
				{ midi: rootMidi, role: 'root' },
				{ midi: targetMidi, role: 'interval' }
			];
			clearActiveNote();
			internalActiveNoteMidi = rootMidi;
			activeNoteTimers.push(setTimeout(() => { internalActiveNoteMidi = targetMidi; }, 500));
			activeNoteTimers.push(setTimeout(() => { internalActiveNoteMidi = rootMidi; }, 1200));
			activeNoteTimers.push(setTimeout(() => { internalActiveNoteMidi = null; }, 1300));
		}
		try {
			const rootStr = noteToString(midiToNote(rootMidi));
			const targetStr = noteToString(midiToNote(targetMidi));
			await audioEngine!.playIntervalPattern(rootStr, targetStr);
			setTimeout(() => { isPlaying = false; previewHighlights = null; clearActiveNote(); }, 1400);
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
<div class="mb-6 flex gap-1">
	{#each INTERVAL_DIFFICULTIES as diff}
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
	{/if}
</section>

<!-- Answer Grid -->
<section class="flex shrink-0 flex-wrap items-center justify-center gap-3 p-4">
	{#each currentDiff.intervals as interval}
		{@const isSelected = selectedAnswer?.semitones === interval.semitones}
		{@const isAnswer = selectedAnswer !== null && question?.interval.semitones === interval.semitones}
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
				onclick={() => previewInterval(interval)}
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
				onclick={() => submitAnswer(interval)}
				disabled={hasAnswered}
			>
				{getIntervalName(currentLocale, interval.semitones)}
			</button>
		</div>
	{/each}
</section>
