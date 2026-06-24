<script lang="ts">
	import { onMount } from 'svelte';
	import Fretboard from '$lib/components/Fretboard.svelte';
	import { INTERVAL_DIFFICULTIES, type Interval, type IntervalDifficulty } from '$lib/music/intervals';
	import { generateQuestion, type IntervalQuestion } from '$lib/exercise/interval-exercise';
	import { CHORD_DIFFICULTIES, type ChordQuality, type ChordDifficulty } from '$lib/music/chords';
	import { generateChordQuestion, type ChordQuestion } from '$lib/exercise/chord-exercise';
	import { recordAnswer, getAccuracy, getOverallStats, clearStats, type AccuracyEntry } from '$lib/stats/store';

	type View = 'exercise' | 'stats';
	let currentView: View = $state('exercise');

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

	let intervalAccuracy: AccuracyEntry[] = $state([]);
	let chordAccuracy: AccuracyEntry[] = $state([]);
	let overallStats = $state({ total: 0, correct: 0, percentage: 0 });

	type HighlightedNote = { midi: number; role: 'root' | 'interval' | 'ghost'; stringIndex?: number; fret?: number };
	type MutedString = { stringIndex: number };

	let highlights: HighlightedNote[] = $derived.by(() => {
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
		if (exerciseType === 'intervals' && intervalQuestion) return intervalQuestion.interval.name;
		if (exerciseType === 'chords' && chordQuestion) return chordQuestion.quality.name;
		return '';
	});

	onMount(() => {
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

	function newQuestion() {
		isCorrect = null;
		if (exerciseType === 'intervals') {
			intervalQuestion = generateQuestion(currentIntervalDiff.intervals);
			selectedIntervalAnswer = null;
		} else {
			chordQuestion = generateChordQuestion(currentChordDiff.qualities);
			selectedChordAnswer = null;
		}
	}

	async function playCurrentQuestion() {
		if (isPlaying) return;
		isPlaying = true;
		if (exerciseType === 'intervals' && intervalQuestion) {
			const { playIntervalPattern } = await import('$lib/audio/engine');
			await playIntervalPattern(intervalQuestion.rootNoteString, intervalQuestion.intervalNoteString);
			setTimeout(() => { isPlaying = false; }, 1400);
		} else if (exerciseType === 'chords' && chordQuestion) {
			const { playChordPattern } = await import('$lib/audio/engine');
			await playChordPattern(chordQuestion.noteStrings);
			const totalTime = chordQuestion.noteStrings.length * 500 + 200 + chordQuestion.noteStrings.length * 40;
			setTimeout(() => { isPlaying = false; }, totalTime + 200);
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
					<h2 class="text-xl font-bold">Stats</h2>
					<button
						class="rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold hover:bg-gray-600"
						onclick={hideStats}
					>
						Back
					</button>
				</div>

				<div class="mb-8 rounded-lg bg-gray-800/50 p-4">
					<div class="text-sm text-gray-400">Overall</div>
					<div class="mt-1 text-2xl font-bold">
						{overallStats.percentage}%
						<span class="text-sm font-normal text-gray-400">
							({overallStats.correct} / {overallStats.total})
						</span>
					</div>
				</div>

				{#if intervalAccuracy.length > 0}
					<div class="mb-6">
						<h3 class="mb-3 text-sm font-semibold text-gray-400 uppercase">Intervals</h3>
						{#each intervalAccuracy as entry}
							<div class="mb-2 flex items-center justify-between rounded bg-gray-800/30 px-3 py-2">
								<span class="text-sm">{entry.name}</span>
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
						<h3 class="mb-3 text-sm font-semibold text-gray-400 uppercase">Chords</h3>
						{#each chordAccuracy as entry}
							<div class="mb-2 flex items-center justify-between rounded bg-gray-800/30 px-3 py-2">
								<span class="text-sm">{entry.name}</span>
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
					<p class="text-center text-gray-500">No data yet. Start practicing!</p>
				{/if}

				{#if overallStats.total > 0}
					<button
						class="mt-4 rounded bg-red-900/50 px-4 py-2 text-sm text-red-300 hover:bg-red-900/80"
						onclick={handleClearStats}
					>
						Clear all stats
					</button>
				{/if}
			</div>
		</div>
	{:else}
		<!-- Exercise + Answer area -->
		<div class="flex min-h-0 flex-1 flex-col items-center justify-center">
			<!-- Exercise type selector + Stats button -->
			<div class="mb-2 flex gap-2">
				<button
					class="rounded-lg px-4 py-2 text-sm font-semibold transition-colors
						{exerciseType === 'intervals' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}"
					onclick={() => switchExercise('intervals')}
				>
					Intervals
				</button>
				<button
					class="rounded-lg px-4 py-2 text-sm font-semibold transition-colors
						{exerciseType === 'chords' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}"
					onclick={() => switchExercise('chords')}
				>
					Chords
				</button>
				<button
					class="rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold transition-colors hover:bg-gray-600"
					onclick={showStats}
				>
					Stats
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
							{diff.label}
						</button>
					{/each}
				{:else}
					{#each CHORD_DIFFICULTIES as diff}
						<button
							class="rounded px-3 py-1 text-xs font-medium transition-colors
								{chordDifficulty === diff.key ? 'bg-indigo-500/60 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}"
							onclick={() => switchChordDifficulty(diff.key)}
						>
							{diff.label}
						</button>
					{/each}
				{/if}
			</div>

			<!-- Exercise Area -->
			<section class="flex flex-col items-center p-4">
				<div class="mb-3 text-sm text-gray-400">
					Score: {score.correct} / {score.total}
				</div>

				<div class="flex gap-4">
					<button
						class="rounded-lg bg-indigo-600 px-6 py-3 font-semibold transition-colors hover:bg-indigo-500 disabled:opacity-50"
						onclick={playCurrentQuestion}
						disabled={isPlaying}
					>
						{isPlaying ? 'Playing...' : 'Play'}
					</button>

					{#if hasAnswered}
						<button
							class="rounded-lg bg-gray-700 px-6 py-3 font-semibold transition-colors hover:bg-gray-600"
							onclick={newQuestion}
						>
							Next
						</button>
					{/if}
				</div>

				{#if hasAnswered}
					<div class="mt-4 text-lg font-semibold {isCorrect ? 'text-green-400' : 'text-red-400'}">
						{#if isCorrect}
							Correct!
						{:else}
							Wrong -- it was {correctAnswerName}
						{/if}
					</div>
					{#if exerciseType === 'chords' && chordQuestion}
						<div class="mt-1 text-xs text-gray-500">
							{chordQuestion.shape.family}-shape at fret {chordQuestion.offset}
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
						<button
							class="rounded-lg px-5 py-3 text-sm font-semibold transition-colors
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
							{interval.name}
						</button>
					{/each}
				{:else}
					{#each currentChordDiff.qualities as quality}
						{@const isSelected = selectedChordAnswer?.name === quality.name}
						{@const isAnswer = selectedChordAnswer !== null && chordQuestion?.quality.name === quality.name}
						<button
							class="rounded-lg px-5 py-3 text-sm font-semibold transition-colors
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
							{quality.name}
						</button>
					{/each}
				{/if}
			</section>
		</div>
	{/if}

	<!-- Fretboard -->
	<section class="shrink-0 border-t border-gray-800 bg-gray-900/50 py-4">
		<Fretboard {highlights} {mutedStrings} />
	</section>
</div>
