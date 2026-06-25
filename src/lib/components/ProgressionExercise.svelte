<script lang="ts">
	import { onMount } from 'svelte';
	import { type Progression, type ProgressionDifficulty, PROGRESSION_DIFFICULTIES } from '$lib/music/progressions';
	import { generateProgressionQuestion, type ProgressionQuestion } from '$lib/exercise/progression-exercise';
	import { recordAnswer } from '$lib/stats/store';
	import { locale } from '$lib/i18n/locale';
	import { t } from '$lib/i18n/translations';
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

	let difficulty: ProgressionDifficulty = $state('easy');

	let question: ProgressionQuestion | null = $state(null);
	let selectedAnswer: Progression | null = $state(null);
	let isCorrect: boolean | null = $state(null);
	let score = $state({ correct: 0, total: 0 });
	let isPlaying = $state(false);
	let previewHighlights: HighlightedNote[] | null = $state(null);
	let activeNoteTimers: ReturnType<typeof setTimeout>[] = [];

	$effect(() => {
		highlights = previewHighlights ?? [];
	});

	$effect(() => {
		mutedStrings = [];
	});

	$effect(() => {
		activeNoteMidi = null;
	});

	let hasAnswered = $derived(selectedAnswer !== null);

	function clearActiveNote() {
		for (const t of activeNoteTimers) clearTimeout(t);
		activeNoteTimers = [];
	}

	function newQuestion(autoplay = false) {
		isCorrect = null;
		isPlaying = false;
		previewHighlights = null;
		clearActiveNote();
		question = generateProgressionQuestion(difficulty);
		selectedAnswer = null;
		if (autoplay) playCurrentQuestion();
	}

	function switchDifficulty(diff: ProgressionDifficulty) {
		difficulty = diff;
		score = { correct: 0, total: 0 };
		newQuestion();
	}

	async function playCurrentQuestion() {
		if (isPlaying || !question) return;
		isPlaying = true;
		clearActiveNote();
		try {
			if (selectedAnswer !== null) {
				await replayProgressionWithHighlights();
				return;
			}
			const chords = question.voicings.map(v => v.noteStrings);
			await audioEngine!.playProgressionPattern(chords);
			const totalTime = chords.length * 1200;
			setTimeout(() => { isPlaying = false; }, totalTime + 200);
		} catch {
			isPlaying = false;
		}
	}

	function submitAnswer(progression: Progression) {
		if (!question || selectedAnswer !== null) return;
		selectedAnswer = progression;
		isCorrect = progression.nashville === question.progression.nashville;
		score.total++;
		if (isCorrect) score.correct++;
		recordAnswer('progression', question.progression.nashville, isCorrect);
		replayProgressionWithHighlights();
	}

	async function replayProgressionWithHighlights() {
		if (!question || !audioEngine) return;
		isPlaying = true;
		clearActiveNote();
		const voicings = question.voicings;
		const chords = voicings.map(v => v.noteStrings);
		const chordDuration = 1200;

		for (let c = 0; c < voicings.length; c++) {
			const v = voicings[c];
			activeNoteTimers.push(setTimeout(() => {
				previewHighlights = v.notes.map(n => ({
					midi: n.midi,
					role: (n.isRoot ? 'root' : 'interval') as 'root' | 'interval',
					stringIndex: n.stringIndex,
					fret: n.fret
				}));
			}, c * chordDuration));
		}

		activeNoteTimers.push(setTimeout(() => {
			previewHighlights = null;
			isPlaying = false;
		}, voicings.length * chordDuration));

		try {
			await audioEngine.playProgressionPattern(chords);
		} catch {
			previewHighlights = null;
			isPlaying = false;
			clearActiveNote();
		}
	}

	async function previewProgression(option: Progression) {
		if (isPlaying || !question) return;
		isPlaying = true;
		clearActiveNote();

		const voicings = question.optionVoicings[option.nashville];
		if (!voicings) { isPlaying = false; return; }

		const chordDuration = 1200;

		if (hasAnswered) {
			for (let c = 0; c < voicings.length; c++) {
				const v = voicings[c];
				activeNoteTimers.push(setTimeout(() => {
					previewHighlights = v.notes.map(n => ({
						midi: n.midi,
						role: (n.isRoot ? 'root' : 'interval') as 'root' | 'interval',
						stringIndex: n.stringIndex,
						fret: n.fret
					}));
				}, c * chordDuration));
			}
			activeNoteTimers.push(setTimeout(() => {
				previewHighlights = null;
			}, voicings.length * chordDuration));
		}

		try {
			const chords = voicings.map(v => v.noteStrings);
			await audioEngine!.playProgressionPattern(chords);
			const totalTime = chords.length * chordDuration;
			setTimeout(() => { isPlaying = false; previewHighlights = null; }, totalTime + 200);
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
	{#each PROGRESSION_DIFFICULTIES as diff}
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
		<div class="mb-3 text-lg font-semibold text-indigo-400">
			{t(currentLocale, 'ui.infoPanel.key')}: {question.keyName}
		</div>
	{/if}

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
				{t(currentLocale, 'ui.feedback.wrong').replace('{name}', question?.progression.nashville ?? '')}
			{/if}
		</div>
		{#if question}
			<div class="mt-1 text-sm text-gray-400">
				{question.progression.nashville} = {question.chordNames.join(' - ')}
			</div>
		{/if}
	{/if}
</section>

<!-- Answer Grid -->
<section class="flex shrink-0 flex-wrap items-center justify-center gap-3 p-4">
	{#if question}
		{#each question.options as option}
			{@const isSelected = selectedAnswer?.nashville === option.nashville}
			{@const isAnswer = selectedAnswer !== null && question.progression.nashville === option.nashville}
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
					onclick={() => previewProgression(option)}
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
					onclick={() => submitAnswer(option)}
					disabled={hasAnswered}
				>
					{option.nashville}
				</button>
			</div>
		{/each}
	{/if}
</section>
