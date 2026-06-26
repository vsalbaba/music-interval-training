<script lang="ts">
	import { onMount } from 'svelte';
	import { CHORD_GROUPS, type ChordGroup } from '$lib/music/chords';
	import { generateChordBuilderQuestion, validateChordBuilderAnswer, findReferenceVoicing, type ChordBuilderQuestion, type ChordBuilderValidation } from '$lib/exercise/chord-builder';
	import { STANDARD_TUNING, midiToNote, noteToString } from '$lib/music/notes';
	import { locale } from '$lib/i18n/locale';
	import { t, getChordName, getNoteNames } from '$lib/i18n/translations';
	import { recordAnswer } from '$lib/stats/store';
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
	let validation: ChordBuilderValidation | null = $state(null);
	let score = $state({ correct: 0, total: 0 });
	let isPlaying = $state(false);

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

		if (hasChecked && validation) {
			const result: HighlightedNote[] = [];
			for (const nr of validation.noteResults) {
				const midi = STANDARD_TUNING[nr.stringIndex] + nr.fret;
				result.push({
					midi,
					role: nr.isValid ? 'correct' : 'wrong',
					stringIndex: nr.stringIndex,
					fret: nr.fret
				});
			}
			highlights = result;
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
		validation = null;
		selectedFrets = [];
		question = generateChordBuilderQuestion(difficulty);
	}

	function switchDifficulty(diff: ChordGroup) {
		difficulty = diff;
		score = { correct: 0, total: 0 };
		newQuestion();
	}

	async function checkAnswer() {
		if (!question || selectedFrets.length === 0) return;
		const v = validateChordBuilderAnswer(question, selectedFrets);
		hasChecked = true;
		isCorrect = v.correct;
		validation = v;
		score.total++;
		if (isCorrect) score.correct++;
		recordAnswer('chord-builder', question.quality.shortName, isCorrect);

		await playFeedback();
	}

	async function playFeedback() {
		if (!question || !audioEngine || isPlaying) return;
		isPlaying = true;

		try {
			const userMidis = selectedFrets
				.slice()
				.sort((a, b) => a.stringIndex - b.stringIndex)
				.map(sf => STANDARD_TUNING[sf.stringIndex] + sf.fret);
			const userNotes = userMidis.map(m => noteToString(midiToNote(m)));
			await audioEngine.playChordPattern(userNotes);

			const userPlayTime = userNotes.length * 500 + 200 + userNotes.length * 40 + 400;

			await new Promise(resolve => setTimeout(resolve, userPlayTime));

			const ref = findReferenceVoicing(question!);
			if (ref) {
				const refNotes = ref.notes
					.slice()
					.sort((a, b) => a.stringIndex - b.stringIndex)
					.map(n => noteToString(midiToNote(n.midi)));
				await audioEngine!.playChordPattern(refNotes);
				const refPlayTime = refNotes.length * 500 + 200 + refNotes.length * 40 + 200;
				await new Promise(resolve => setTimeout(resolve, refPlayTime));
			}
		} catch {
			// audio error
		}
		isPlaying = false;
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

	{#if hasChecked && question && validation}
		<div class="mt-4 text-lg font-semibold {isCorrect ? 'text-green-400' : 'text-red-400'}">
			{#if isCorrect}
				{t(currentLocale, 'ui.feedback.correct')}
			{:else}
				{t(currentLocale, 'ui.feedback.wrong').replace('{name}', promptText)}
			{/if}
		</div>

		<!-- Theory text -->
		<div class="mt-4 w-full max-w-md space-y-2 rounded-lg bg-gray-800/50 p-4 text-sm">
			<div class="flex gap-2">
				<span class="text-gray-500">{t(currentLocale, 'ui.infoPanel.formula')}:</span>
				<span class="text-gray-200">{question.quality.formula}</span>
			</div>
			<div class="flex gap-2">
				<span class="text-gray-500">{t(currentLocale, 'ui.infoPanel.notes')}:</span>
				<span class="text-gray-200">
					{question.validPitchClasses.map(pc => noteNames[pc]).join(' - ')}
				</span>
			</div>

			{#if validation.noteResults.length > 0}
				<div class="mt-2 border-t border-gray-700 pt-2">
					{#each validation.noteResults as nr}
						<div class="flex items-center gap-2 text-xs">
							<span class="inline-block h-2 w-2 rounded-full {nr.isValid ? 'bg-emerald-500' : 'bg-red-500'}"></span>
							<span class="{nr.isValid ? 'text-gray-300' : 'text-red-300'}">
								{noteNames[nr.pitchClass]}
							</span>
							{#if !nr.isValid}
								<span class="text-gray-500">-- not in chord</span>
							{/if}
						</div>
					{/each}
				</div>
			{/if}

			{#if validation.missingPitchClasses.length > 0}
				<div class="mt-1 text-xs text-yellow-400/80">
					Missing: {validation.missingPitchClasses.map(pc => noteNames[pc]).join(', ')}
				</div>
			{/if}
		</div>
	{/if}
</section>
