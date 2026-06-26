<script lang="ts">
	import { onMount } from 'svelte';
	import Fretboard from '$lib/components/Fretboard.svelte';
	import InfoPanel from '$lib/components/InfoPanel.svelte';
	import IntervalExercise from '$lib/components/IntervalExercise.svelte';
	import ChordExercise from '$lib/components/ChordExercise.svelte';
	import ProgressionExercise from '$lib/components/ProgressionExercise.svelte';
	import ChordBuilderExercise from '$lib/components/ChordBuilderExercise.svelte';
	import { getAccuracy, getOverallStats, clearStats, type AccuracyEntry } from '$lib/stats/store';
	import { locale } from '$lib/i18n/locale';
	import { t, translateStatsName } from '$lib/i18n/translations';
	import type { HighlightedNote, MutedString } from '$lib/types/fretboard';

	let currentLocale = $derived($locale);

	type View = 'exercise' | 'stats';
	let currentView: View = $state('exercise');
	let showInfo = $state(false);

	type ExerciseType = 'intervals' | 'chords' | 'progressions' | 'chordBuilder';
	let exerciseType: ExerciseType = $state('intervals');

	let audioEngine: typeof import('$lib/audio/engine') | null = $state(null);

	let highlights: HighlightedNote[] = $state([]);
	let mutedStrings: MutedString[] = $state([]);
	let activeNoteMidi: number | null = $state(null);
	let selectedFrets: import('$lib/types/fretboard').SelectedFret[] = $state([]);
	let fretboardSelectable = $state(false);
	function getInfoPanelMode(et: ExerciseType): 'intervals' | 'chords' | 'progressions' {
		return et === 'chordBuilder' ? 'chords' : et;
	}
	let infoPanelMode = $derived(getInfoPanelMode(exerciseType));

	let intervalAccuracy: AccuracyEntry[] = $state([]);
	let chordAccuracy: AccuracyEntry[] = $state([]);
	let chordBuilderAccuracy: AccuracyEntry[] = $state([]);
	let progressionAccuracy: AccuracyEntry[] = $state([]);
	let overallStats = $state({ total: 0, correct: 0, percentage: 0 });

	onMount(async () => {
		audioEngine = await import('$lib/audio/engine');
	});

	function switchExercise(type: ExerciseType) {
		exerciseType = type;
		if (type !== 'chordBuilder') {
			fretboardSelectable = false;
			selectedFrets = [];
		}
	}

	function showStats() {
		intervalAccuracy = getAccuracy('interval');
		chordAccuracy = getAccuracy('chord');
		chordBuilderAccuracy = getAccuracy('chord-builder');
		progressionAccuracy = getAccuracy('progression');
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
		chordBuilderAccuracy = [];
		progressionAccuracy = [];
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

				{#if chordBuilderAccuracy.length > 0}
					<div class="mb-6">
						<h3 class="mb-3 text-sm font-semibold text-gray-400 uppercase">{t(currentLocale, 'ui.exerciseType.chordBuilder')}</h3>
						{#each chordBuilderAccuracy as entry}
							<div class="mb-2 flex items-center justify-between rounded bg-gray-800/30 px-3 py-2">
								<span class="text-sm">{translateStatsName(currentLocale, 'chord-builder', entry.name)}</span>
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

				{#if progressionAccuracy.length > 0}
					<div class="mb-6">
						<h3 class="mb-3 text-sm font-semibold text-gray-400 uppercase">{t(currentLocale, 'ui.exerciseType.progressions')}</h3>
						{#each progressionAccuracy as entry}
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
						class="rounded-lg px-4 py-2 text-sm font-semibold transition-colors
							{exerciseType === 'progressions' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}"
						onclick={() => switchExercise('progressions')}
					>
						{t(currentLocale, 'ui.exerciseType.progressions')}
					</button>
					<button
						class="rounded-lg px-4 py-2 text-sm font-semibold transition-colors
							{exerciseType === 'chordBuilder' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}"
						onclick={() => switchExercise('chordBuilder')}
					>
						{t(currentLocale, 'ui.exerciseType.chordBuilder')}
					</button>
					<button
						class="rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold transition-colors hover:bg-gray-600"
						onclick={showStats}
					>
						{t(currentLocale, 'ui.stats.heading')}
					</button>
				</div>

				<!-- Exercise component -->
				{#if exerciseType === 'intervals'}
					<IntervalExercise {audioEngine} bind:highlights bind:mutedStrings bind:activeNoteMidi />
				{:else if exerciseType === 'chords'}
					<ChordExercise {audioEngine} bind:highlights bind:mutedStrings bind:activeNoteMidi />
				{:else if exerciseType === 'progressions'}
					<ProgressionExercise {audioEngine} bind:highlights bind:mutedStrings bind:activeNoteMidi />
				{:else}
					<ChordBuilderExercise {audioEngine} bind:highlights bind:mutedStrings bind:activeNoteMidi bind:selectedFrets bind:selectable={fretboardSelectable} />
				{/if}
			</div>

			<!-- Info Panel: desktop split -->
			{#if showInfo}
				<div class="hidden min-h-0 w-1/2 border-l border-gray-800 md:block">
					<InfoPanel mode={infoPanelMode} />
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
							<InfoPanel mode={infoPanelMode} />
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Fretboard -->
	<section class="shrink-0 border-t border-gray-800 bg-gray-900/50 py-4">
		<Fretboard {highlights} {mutedStrings} {activeNoteMidi} selectable={fretboardSelectable} bind:selectedFrets />
	</section>
</div>
