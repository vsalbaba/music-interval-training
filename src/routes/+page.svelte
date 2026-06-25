<script lang="ts">
	import { onMount } from 'svelte';
	import Fretboard from '$lib/components/Fretboard.svelte';
	import InfoPanel from '$lib/components/InfoPanel.svelte';
	import { INTERVAL_DIFFICULTIES, type Interval, type IntervalDifficulty } from '$lib/music/intervals';
	import { generateQuestion, type IntervalQuestion } from '$lib/exercise/interval-exercise';
	import { CHORD_DIFFICULTIES, type ChordQuality, type ChordDifficulty } from '$lib/music/chords';
	import { generateChordQuestion, type ChordQuestion } from '$lib/exercise/chord-exercise';
	import { midiToNote, noteToString } from '$lib/music/notes';
	import { recordAnswer, getAccuracy, getOverallStats, clearStats, type AccuracyEntry } from '$lib/stats/store';
	import { locale } from '$lib/i18n/locale';
	import { t, getIntervalName, getChordName, translateStatsName } from '$lib/i18n/translations';

	let currentLocale = $derived($locale);

	type View = 'exercise' | 'stats';
	let currentView: View = $state('exercise');
	let showInfo = $state(false);

	type ExerciseType = 'intervals' | 'chords';
	let exerciseType: ExerciseType = $state('intervals');
	let intervalDifficulty: IntervalDifficulty = $state('easy');
	let chordDifficulty: ChordDifficulty = $state('triads');

	let currentIntervalDiff = $derived(INTERVAL_DIFFICULTIES.find((d) => d.key === intervalDifficulty)!);
	let currentChordDiff = $derived(CHORD_DIFFICULTIES.find((d) => d.key === chordDifficulty)!);

	let intervalQuestion: IntervalQuestion | null = $state(null);
	let chordQuestion: ChordQuestion | null = $state(null);

	let selectedIntervalAnswer: Interval | null = $state(null);
	let selectedChordAnswer: ChordQuality | null = $state(null);
	let isCorrect: boolean | null = $state(null);
	let score = $state({ correct: 0, total: 0 });
	let isPlaying = $state(false);
	let previewHighlights: HighlightedNote[] | null = $state(null);
	let activeNoteMidi: number | null = $state(null);
	let activeNoteTimers: ReturnType<typeof setTimeout>[] = [];
	let audioEngine: typeof import('$lib/audio/engine') | null = null;

	let intervalAccuracy: AccuracyEntry[] = $state([]);
	let chordAccuracy: AccuracyEntry[] = $state([]);
	let overallStats = $state({ total: 0, correct: 0, percentage: 0 });

	type HighlightedNote = { midi: number; role: 'root' | 'interval' | 'ghost'; stringIndex?: number; fret?: number };
	type MutedString = { stringIndex: number };

	let highlights: HighlightedNote[] = $derived.by(() => {
		if (previewHighlights) return previewHighlights;
		if (exerciseType === 'intervals') {
			if (!intervalQuestion || selectedIntervalAnswer === null) return [];
			return [
				{ midi: intervalQuestion.rootMidi, role: 'root' as const },
				{ midi: intervalQuestion.intervalMidi, role: 'interval' as const }
			];
		} else {
			if (!chordQuestion || selectedChordAnswer === null) return [];

			const result: HighlightedNote[] = [];
			const playedSet = new Set(chordQuestion.playedNotes.map((n) => `${n.stringIndex}-${n.fret}`));

			for (const note of chordQuestion.playedNotes) {
				result.push({
					midi: note.midi,
					role: note.isRoot ? 'root' : 'interval',
					stringIndex: note.stringIndex,
					fret: note.fret
				});
			}

			for (const stringNote of chordQuestion.voicing.strings) {
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

			return result;
		}
	});

	let mutedStrings: MutedString[] = $derived.by(() => {
		if (exerciseType !== 'chords' || !chordQuestion || selectedChordAnswer === null) return [];
		return chordQuestion.voicing.strings
			.map((s, i) => (s === null ? { stringIndex: i } : null))
			.filter((m): m is MutedString => m !== null);
	});

	let hasAnswered = $derived(
		exerciseType === 'intervals' ? selectedIntervalAnswer !== null : selectedChordAnswer !== null
	);

	let correctAnswerName = $derived.by(() => {
		if (exerciseType === 'intervals' && intervalQuestion)
			return getIntervalName(currentLocale, intervalQuestion.interval.semitones);
		if (exerciseType === 'chords' && chordQuestion)
			return getChordName(currentLocale, chordQuestion.quality.shortName);
		return '';
	});

	onMount(async () => {
		audioEngine = await import('$lib/audio/engine');
		newQuestion();
	});

	function switchExercise(type: ExerciseType) {
		exerciseType = type;
		score = { correct: 0, total: 0 };
		newQuestion();
	}

	function switchIntervalDifficulty(diff: IntervalDifficulty) {
		intervalDifficulty = diff;
		score = { correct: 0, total: 0 };
		newQuestion();
	}

	function switchChordDifficulty(diff: ChordDifficulty) {
		chordDifficulty = diff;
		score = { correct: 0, total: 0 };
		newQuestion();
	}

	function clearActiveNote() {
		for (const t of activeNoteTimers) clearTimeout(t);
		activeNoteTimers = [];
		activeNoteMidi = null;
	}

	function newQuestion(autoplay = false) {
		isCorrect = null;
		previewHighlights = null;
		clearActiveNote();
		if (exerciseType === 'intervals') {
			intervalQuestion = generateQuestion(currentIntervalDiff.intervals);
			selectedIntervalAnswer = null;
		} else {
			chordQuestion = generateChordQuestion(currentChordDiff.qualities);
			selectedChordAnswer = null;
		}
		if (autoplay) playCurrentQuestion();
	}

	async function playCurrentQuestion() {
		if (isPlaying) return;
		isPlaying = true;
		clearActiveNote();
		try {
			if (exerciseType === 'intervals' && intervalQuestion) {
				activeNoteMidi = intervalQuestion.rootMidi;
				activeNoteTimers.push(setTimeout(() => { activeNoteMidi = intervalQuestion!.intervalMidi; }, 500));
				activeNoteTimers.push(setTimeout(() => { activeNoteMidi = intervalQuestion!.rootMidi; }, 1200));
				activeNoteTimers.push(setTimeout(() => { activeNoteMidi = null; }, 1300));
				await audioEngine!.playIntervalPattern(intervalQuestion.rootNoteString, intervalQuestion.intervalNoteString);
				setTimeout(() => { isPlaying = false; clearActiveNote(); }, 1400);
			} else if (exerciseType === 'chords' && chordQuestion) {
				const midis = chordQuestion.playedNotes.map((n) => n.midi);
				for (let i = 0; i < midis.length; i++) {
					activeNoteTimers.push(setTimeout(() => { activeNoteMidi = midis[i]; }, i * 500));
				}
				const strumTime = midis.length * 500 + 200;
				activeNoteTimers.push(setTimeout(() => { activeNoteMidi = null; }, strumTime));
				await audioEngine!.playChordPattern(chordQuestion.noteStrings);
				const totalTime = chordQuestion.noteStrings.length * 500 + 200 + chordQuestion.noteStrings.length * 40;
				setTimeout(() => { isPlaying = false; clearActiveNote(); }, totalTime + 200);
			} else {
				isPlaying = false;
			}
		} catch {
			isPlaying = false;
		}
	}

	function submitIntervalAnswer(interval: Interval) {
		if (!intervalQuestion || selectedIntervalAnswer !== null) return;
		selectedIntervalAnswer = interval;
		isCorrect = interval.semitones === intervalQuestion.interval.semitones;
		score.total++;
		if (isCorrect) score.correct++;
		recordAnswer('interval', intervalQuestion.interval.name, isCorrect);
	}

	function submitChordAnswer(quality: ChordQuality) {
		if (!chordQuestion || selectedChordAnswer !== null) return;
		selectedChordAnswer = quality;
		isCorrect = quality.name === chordQuestion.quality.name;
		score.total++;
		if (isCorrect) score.correct++;
		recordAnswer('chord', chordQuestion.quality.name, isCorrect);
	}

	async function previewInterval(interval: Interval) {
		if (isPlaying || !intervalQuestion) return;
		isPlaying = true;
		const rootMidi = intervalQuestion.rootMidi;
		const targetMidi = rootMidi + interval.semitones;
		if (hasAnswered) {
			previewHighlights = [
				{ midi: rootMidi, role: 'root' },
				{ midi: targetMidi, role: 'interval' }
			];
			clearActiveNote();
			activeNoteMidi = rootMidi;
			activeNoteTimers.push(setTimeout(() => { activeNoteMidi = targetMidi; }, 500));
			activeNoteTimers.push(setTimeout(() => { activeNoteMidi = rootMidi; }, 1200));
			activeNoteTimers.push(setTimeout(() => { activeNoteMidi = null; }, 1300));
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

	async function previewChord(quality: ChordQuality) {
		if (isPlaying || !chordQuestion) return;
		isPlaying = true;
		const rootMidi = chordQuestion.rootMidi;
		const midis = quality.intervals.map((i) => rootMidi + i);
		if (hasAnswered) {
			previewHighlights = quality.intervals.map((i) => ({
				midi: rootMidi + i,
				role: i === 0 ? 'root' as const : 'interval' as const
			}));
			clearActiveNote();
			for (let i = 0; i < midis.length; i++) {
				activeNoteTimers.push(setTimeout(() => { activeNoteMidi = midis[i]; }, i * 500));
			}
			const strumTime = midis.length * 500 + 200;
			activeNoteTimers.push(setTimeout(() => { activeNoteMidi = null; }, strumTime));
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

	function showStats() {
		intervalAccuracy = getAccuracy('interval');
		chordAccuracy = getAccuracy('chord');
		overallStats = getOverallStats();
		currentView = 'stats';
	}

	function hideStats() {
		currentView = 'exercise';
	}

	function handleClearStats() {
		clearStats();
		intervalAccuracy = [];
		chordAccuracy = [];
		overallStats = { total: 0, correct: 0, percentage: 0 };
	}
</script>

<div class="flex h-screen flex-col overflow-hidden bg-gray-950 text-white">
	{#if currentView === 'stats'}
		<!-- Stats View -->
		<div class="flex min-h-0 flex-1 flex-col items-center overflow-y-auto p-8">
			<div class="w-full max-w-lg">
				<div class="mb-6 flex items-center justify-between">
					<h2 class="text-xl font-bold">{t(currentLocale, 'ui.stats.heading')}</h2>
					<button
						class="rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold hover:bg-gray-600"
						onclick={hideStats}
					>
						{t(currentLocale, 'ui.stats.back')}
					</button>
				</div>

				<div class="mb-8 rounded-lg bg-gray-800/50 p-4">
					<div class="text-sm text-gray-400">{t(currentLocale, 'ui.stats.overall')}</div>
					<div class="mt-1 text-2xl font-bold">
						{overallStats.percentage}%
						<span class="text-sm font-normal text-gray-400">
							({overallStats.correct} / {overallStats.total})
						</span>
					</div>
				</div>

				{#if intervalAccuracy.length > 0}
					<div class="mb-6">
						<h3 class="mb-3 text-sm font-semibold text-gray-400 uppercase">{t(currentLocale, 'ui.exerciseType.intervals')}</h3>
						{#each intervalAccuracy as entry}
							<div class="mb-2 flex items-center justify-between rounded bg-gray-800/30 px-3 py-2">
								<span class="text-sm">{translateStatsName(currentLocale, 'interval', entry.name)}</span>
								<div class="flex items-center gap-3">
									<div class="h-2 w-24 overflow-hidden rounded-full bg-gray-700">
										<div
											class="h-full rounded-full {entry.percentage < 60 ? 'bg-red-500' : entry.percentage < 80 ? 'bg-yellow-500' : 'bg-green-500'}"
											style="width: {entry.percentage}%"
										></div>
									</div>
									<span class="w-16 text-right text-sm {entry.percentage < 60 ? 'text-red-400' : 'text-gray-300'}">
										{entry.percentage}%
										<span class="text-xs text-gray-500">({entry.total})</span>
									</span>
								</div>
							</div>
						{/each}
					</div>
				{/if}

				{#if chordAccuracy.length > 0}
					<div class="mb-6">
						<h3 class="mb-3 text-sm font-semibold text-gray-400 uppercase">{t(currentLocale, 'ui.exerciseType.chords')}</h3>
						{#each chordAccuracy as entry}
							<div class="mb-2 flex items-center justify-between rounded bg-gray-800/30 px-3 py-2">
								<span class="text-sm">{translateStatsName(currentLocale, 'chord', entry.name)}</span>
								<div class="flex items-center gap-3">
									<div class="h-2 w-24 overflow-hidden rounded-full bg-gray-700">
										<div
											class="h-full rounded-full {entry.percentage < 60 ? 'bg-red-500' : entry.percentage < 80 ? 'bg-yellow-500' : 'bg-green-500'}"
											style="width: {entry.percentage}%"
										></div>
									</div>
									<span class="w-16 text-right text-sm {entry.percentage < 60 ? 'text-red-400' : 'text-gray-300'}">
										{entry.percentage}%
										<span class="text-xs text-gray-500">({entry.total})</span>
									</span>
								</div>
							</div>
						{/each}
					</div>
				{/if}

				{#if overallStats.total === 0}
					<p class="text-center text-gray-500">{t(currentLocale, 'ui.stats.noData')}</p>
				{/if}

				{#if overallStats.total > 0}
					<button
						class="mt-4 rounded bg-red-900/50 px-4 py-2 text-sm text-red-300 hover:bg-red-900/80"
						onclick={handleClearStats}
					>
						{t(currentLocale, 'ui.stats.clearAll')}
					</button>
				{/if}
			</div>
		</div>
	{:else}
		<!-- Exercise + Info split area -->
		<div class="relative flex min-h-0 flex-1">
			<!-- Top-right controls: language toggle + info toggle -->
			<div class="absolute right-3 top-3 z-20 flex items-center gap-2">
				<div class="flex overflow-hidden rounded-full border border-gray-600 text-xs font-semibold">
					<button
						class="px-2 py-1 transition-colors {currentLocale === 'en' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'}"
						onclick={() => ($locale = 'en')}
						aria-label="Switch to English"
					>EN</button>
					<button
						class="px-2 py-1 transition-colors {currentLocale === 'cs' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'}"
						onclick={() => ($locale = 'cs')}
						aria-label="Switch to Czech"
					>CZ</button>
				</div>
				<button
					class="flex h-8 w-8 items-center justify-center rounded-full border transition-colors
						{showInfo ? 'border-indigo-500 bg-indigo-600 text-white' : 'border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-500 hover:text-gray-300'}"
					onclick={() => (showInfo = !showInfo)}
					aria-label="Toggle reference info"
				>
					<span class="text-sm font-serif font-semibold italic">i</span>
				</button>
			</div>

			<!-- Exercise column -->
			<div class="flex min-h-0 flex-1 flex-col items-center justify-center">
				<!-- Exercise type selector + Stats button -->
				<div class="mb-2 flex gap-2">
					<button
						class="rounded-lg px-4 py-2 text-sm font-semibold transition-colors
							{exerciseType === 'intervals' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}"
						onclick={() => switchExercise('intervals')}
					>
						{t(currentLocale, 'ui.exerciseType.intervals')}
					</button>
					<button
						class="rounded-lg px-4 py-2 text-sm font-semibold transition-colors
							{exerciseType === 'chords' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}"
						onclick={() => switchExercise('chords')}
					>
						{t(currentLocale, 'ui.exerciseType.chords')}
					</button>
					<button
						class="rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold transition-colors hover:bg-gray-600"
						onclick={showStats}
					>
						{t(currentLocale, 'ui.stats.heading')}
					</button>
				</div>

				<!-- Difficulty selector -->
				<div class="mb-6 flex gap-1">
					{#if exerciseType === 'intervals'}
						{#each INTERVAL_DIFFICULTIES as diff}
							<button
								class="rounded px-3 py-1 text-xs font-medium transition-colors
									{intervalDifficulty === diff.key ? 'bg-indigo-500/60 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}"
								onclick={() => switchIntervalDifficulty(diff.key)}
							>
								{t(currentLocale, `ui.difficulty.${diff.key}`)}
							</button>
						{/each}
					{:else}
						{#each CHORD_DIFFICULTIES as diff}
							<button
								class="rounded px-3 py-1 text-xs font-medium transition-colors
									{chordDifficulty === diff.key ? 'bg-indigo-500/60 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}"
								onclick={() => switchChordDifficulty(diff.key)}
							>
								{t(currentLocale, `ui.difficulty.${diff.key}`)}
							</button>
						{/each}
					{/if}
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
						{#if exerciseType === 'chords' && chordQuestion}
							{@const rootName = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][chordQuestion.rootMidi % 12]}
							{@const suffixMap = { Maj: '', Min: 'm', Dim: 'dim', Aug: 'aug', Sus2: 'sus2', Sus4: 'sus4', Dom7: '7', Maj7: 'maj7', Min7: 'm7' }}
							{@const suffix = suffixMap[chordQuestion.quality.shortName] ?? chordQuestion.quality.shortName}
							<div class="mt-1 text-xs text-gray-500">
								{rootName}{suffix} -- {chordQuestion.shape.family}-shape at fret {chordQuestion.offset}
							</div>
						{/if}
					{/if}
				</section>

				<!-- Answer Grid -->
				<section class="flex shrink-0 flex-wrap items-center justify-center gap-3 p-4">
					{#if exerciseType === 'intervals'}
						{#each currentIntervalDiff.intervals as interval}
							{@const isSelected = selectedIntervalAnswer?.semitones === interval.semitones}
							{@const isAnswer = selectedIntervalAnswer !== null && intervalQuestion?.interval.semitones === interval.semitones}
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
									onclick={() => submitIntervalAnswer(interval)}
									disabled={hasAnswered}
								>
									{getIntervalName(currentLocale, interval.semitones)}
								</button>
							</div>
						{/each}
					{:else}
						{#each currentChordDiff.qualities as quality}
							{@const isSelected = selectedChordAnswer?.name === quality.name}
							{@const isAnswer = selectedChordAnswer !== null && chordQuestion?.quality.name === quality.name}
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
									onclick={() => submitChordAnswer(quality)}
									disabled={hasAnswered}
								>
									{getChordName(currentLocale, quality.shortName)}
								</button>
							</div>
						{/each}
					{/if}
				</section>
			</div>

			<!-- Info Panel: desktop split -->
			{#if showInfo}
				<div class="hidden min-h-0 w-1/2 border-l border-gray-800 md:block">
					<InfoPanel mode={exerciseType} />
				</div>
			{/if}

			<!-- Info Panel: mobile overlay -->
			{#if showInfo}
				<div class="absolute inset-0 z-10 bg-gray-950 md:hidden">
					<div class="flex h-full flex-col">
						<div class="flex items-center justify-between border-b border-gray-800 px-4 py-3">
							<span class="text-sm font-semibold text-gray-300">{t(currentLocale, 'ui.infoPanel.reference')}</span>
							<button
								class="rounded bg-gray-700 px-3 py-1 text-xs font-medium text-gray-300 hover:bg-gray-600"
								onclick={() => (showInfo = false)}
							>
								{t(currentLocale, 'ui.infoPanel.close')}
							</button>
						</div>
						<div class="min-h-0 flex-1">
							<InfoPanel mode={exerciseType} />
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Fretboard -->
	<section class="shrink-0 border-t border-gray-800 bg-gray-900/50 py-4">
		<Fretboard {highlights} {mutedStrings} {activeNoteMidi} />
	</section>
</div>
