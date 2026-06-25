<script lang="ts">
	import { onMount } from 'svelte';

	let log: string[] = $state([]);
	let toneModule: typeof import('tone') | null = null;

	function addLog(msg: string) {
		const ts = new Date().toLocaleTimeString();
		log = [...log, `[${ts}] ${msg}`];
	}

	onMount(async () => {
		addLog('Page mounted');
		try {
			toneModule = await import('tone');
			const ctx = toneModule.getContext();
			addLog(`Tone.js loaded. Context state: ${ctx.state}`);
			addLog(`Sample rate: ${ctx.rawContext.sampleRate}`);
			addLog(`UA: ${navigator.userAgent}`);
		} catch (e: any) {
			addLog(`Tone.js import failed: ${e.message}`);
		}
	});

	// Strategy 1: Just Tone.start() + PluckSynth (current approach)
	async function test1_currentApproach() {
		addLog('--- Test 1: Current approach (Tone.start + PluckSynth) ---');
		try {
			const Tone = toneModule!;
			addLog(`Context state before: ${Tone.getContext().state}`);
			await Tone.start();
			addLog(`Context state after Tone.start(): ${Tone.getContext().state}`);
			const synth = new Tone.PluckSynth({
				attackNoise: 2,
				dampening: 4000,
				resonance: 0.98
			}).toDestination();
			synth.triggerAttack('C4', Tone.now());
			addLog('PluckSynth.triggerAttack("C4") called');
		} catch (e: any) {
			addLog(`ERROR: ${e.message}`);
		}
	}

	// Strategy 2: Tone.start() + silent buffer unlock + PluckSynth
	async function test2_silentBuffer() {
		addLog('--- Test 2: Silent buffer unlock + PluckSynth ---');
		try {
			const Tone = toneModule!;
			await Tone.start();
			addLog(`Context state after Tone.start(): ${Tone.getContext().state}`);

			const ctx = Tone.getContext().rawContext as AudioContext;
			const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
			const source = ctx.createBufferSource();
			source.buffer = buffer;
			source.connect(ctx.destination);
			source.start(0);
			addLog('Silent buffer played');

			const synth = new Tone.PluckSynth({
				attackNoise: 2,
				dampening: 4000,
				resonance: 0.98
			}).toDestination();
			synth.triggerAttack('C4', Tone.now());
			addLog('PluckSynth.triggerAttack("C4") called');
		} catch (e: any) {
			addLog(`ERROR: ${e.message}`);
		}
	}

	// Strategy 3: Raw Web Audio API oscillator (no Tone.js)
	async function test3_rawOscillator() {
		addLog('--- Test 3: Raw Web Audio oscillator (no Tone.js) ---');
		try {
			const ctx = new AudioContext();
			addLog(`New AudioContext state: ${ctx.state}`);
			if (ctx.state === 'suspended') {
				await ctx.resume();
				addLog(`After resume: ${ctx.state}`);
			}
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = 'sine';
			osc.frequency.value = 261.63; // C4
			gain.gain.value = 0.5;
			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.start();
			setTimeout(() => {
				osc.stop();
				addLog('Raw oscillator stopped');
			}, 1000);
			addLog('Raw oscillator started (1s sine wave at C4)');
		} catch (e: any) {
			addLog(`ERROR: ${e.message}`);
		}
	}

	// Strategy 4: Tone.js Synth (simple oscillator-based, not PluckSynth)
	async function test4_toneSynth() {
		addLog('--- Test 4: Tone.js Synth (oscillator-based) ---');
		try {
			const Tone = toneModule!;
			await Tone.start();
			addLog(`Context state: ${Tone.getContext().state}`);
			const synth = new Tone.Synth().toDestination();
			synth.triggerAttackRelease('C4', '0.5');
			addLog('Tone.Synth triggerAttackRelease("C4", "0.5") called');
		} catch (e: any) {
			addLog(`ERROR: ${e.message}`);
		}
	}

	// Strategy 5: Reuse Tone's context via raw resume + silent buffer, then PluckSynth
	async function test5_resumeAndSilent() {
		addLog('--- Test 5: rawContext.resume() + silent buffer + PluckSynth ---');
		try {
			const Tone = toneModule!;
			const ctx = Tone.getContext().rawContext as AudioContext;
			addLog(`Context state before: ${ctx.state}`);
			await ctx.resume();
			addLog(`Context state after resume: ${ctx.state}`);

			const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
			const source = ctx.createBufferSource();
			source.buffer = buffer;
			source.connect(ctx.destination);
			source.start(0);
			addLog('Silent buffer played on raw context');

			await Tone.start();
			addLog(`Context state after Tone.start(): ${Tone.getContext().state}`);

			const synth = new Tone.PluckSynth({
				attackNoise: 2,
				dampening: 4000,
				resonance: 0.98
			}).toDestination();
			synth.triggerAttack('C4', Tone.now());
			addLog('PluckSynth.triggerAttack("C4") called');
		} catch (e: any) {
			addLog(`ERROR: ${e.message}`);
		}
	}

	// Strategy 6: Fresh AudioContext passed to Tone.js
	async function test6_freshContext() {
		addLog('--- Test 6: Fresh AudioContext set into Tone.js ---');
		try {
			const Tone = toneModule!;
			const freshCtx = new AudioContext();
			addLog(`Fresh context state: ${freshCtx.state}`);
			await freshCtx.resume();
			addLog(`After resume: ${freshCtx.state}`);

			Tone.setContext(freshCtx);
			await Tone.start();
			addLog(`Tone context state: ${Tone.getContext().state}`);

			const synth = new Tone.PluckSynth({
				attackNoise: 2,
				dampening: 4000,
				resonance: 0.98
			}).toDestination();
			synth.triggerAttack('C4', Tone.now());
			addLog('PluckSynth.triggerAttack("C4") called');
		} catch (e: any) {
			addLog(`ERROR: ${e.message}`);
		}
	}

	// Strategy 7: Tone.js MonoSynth
	async function test7_monoSynth() {
		addLog('--- Test 7: Tone.js MonoSynth ---');
		try {
			const Tone = toneModule!;
			await Tone.start();
			addLog(`Context state: ${Tone.getContext().state}`);
			const synth = new Tone.MonoSynth({
				oscillator: { type: 'sawtooth' },
				envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.5 }
			}).toDestination();
			synth.triggerAttackRelease('C4', '0.5');
			addLog('MonoSynth triggerAttackRelease("C4", "0.5") called');
		} catch (e: any) {
			addLog(`ERROR: ${e.message}`);
		}
	}

	// Strategy 8: Raw Web Audio with Karplus-Strong (like PluckSynth does internally)
	async function test8_rawKarplus() {
		addLog('--- Test 8: Raw Karplus-Strong pluck ---');
		try {
			const ctx = new AudioContext();
			if (ctx.state === 'suspended') await ctx.resume();
			addLog(`Context state: ${ctx.state}`);

			const sampleRate = ctx.sampleRate;
			const freq = 261.63; // C4
			const delayLength = Math.round(sampleRate / freq);
			const duration = 2;
			const totalSamples = sampleRate * duration;
			const buffer = ctx.createBuffer(1, totalSamples, sampleRate);
			const data = buffer.getChannelData(0);

			// Initialize delay line with noise
			for (let i = 0; i < delayLength; i++) {
				data[i] = Math.random() * 2 - 1;
			}
			// Karplus-Strong: average adjacent samples
			for (let i = delayLength; i < totalSamples; i++) {
				data[i] = (data[i - delayLength] + data[i - delayLength + 1]) * 0.498;
			}

			const source = ctx.createBufferSource();
			source.buffer = buffer;
			source.connect(ctx.destination);
			source.start(0);
			addLog('Raw Karplus-Strong pluck started (C4, 2s)');
		} catch (e: any) {
			addLog(`ERROR: ${e.message}`);
		}
	}

	function clearLog() {
		log = [];
	}
</script>

<div class="min-h-screen bg-gray-950 p-4 text-white">
	<h1 class="mb-4 text-xl font-bold">Audio Debug - iOS Chrome</h1>
	<p class="mb-6 text-sm text-gray-400">Tap each button and report which ones produce sound.</p>

	<div class="mb-8 grid grid-cols-1 gap-3">
		<button
			class="rounded-lg bg-indigo-700 px-4 py-3 text-left font-semibold active:bg-indigo-600"
			onclick={test1_currentApproach}
		>
			1. Current approach<br />
			<span class="text-xs font-normal text-indigo-300">Tone.start() + PluckSynth</span>
		</button>

		<button
			class="rounded-lg bg-indigo-700 px-4 py-3 text-left font-semibold active:bg-indigo-600"
			onclick={test2_silentBuffer}
		>
			2. Silent buffer + PluckSynth<br />
			<span class="text-xs font-normal text-indigo-300">Tone.start() + play empty buffer + PluckSynth</span>
		</button>

		<button
			class="rounded-lg bg-indigo-700 px-4 py-3 text-left font-semibold active:bg-indigo-600"
			onclick={test3_rawOscillator}
		>
			3. Raw Web Audio oscillator<br />
			<span class="text-xs font-normal text-indigo-300">New AudioContext + OscillatorNode (no Tone.js)</span>
		</button>

		<button
			class="rounded-lg bg-indigo-700 px-4 py-3 text-left font-semibold active:bg-indigo-600"
			onclick={test4_toneSynth}
		>
			4. Tone.js Synth<br />
			<span class="text-xs font-normal text-indigo-300">Simple oscillator-based Tone.Synth</span>
		</button>

		<button
			class="rounded-lg bg-indigo-700 px-4 py-3 text-left font-semibold active:bg-indigo-600"
			onclick={test5_resumeAndSilent}
		>
			5. Raw resume + silent + Tone.start + PluckSynth<br />
			<span class="text-xs font-normal text-indigo-300">Resume raw context first, then silent buffer, then Tone</span>
		</button>

		<button
			class="rounded-lg bg-indigo-700 px-4 py-3 text-left font-semibold active:bg-indigo-600"
			onclick={test6_freshContext}
		>
			6. Fresh AudioContext into Tone.js<br />
			<span class="text-xs font-normal text-indigo-300">Create new AudioContext in gesture, set into Tone</span>
		</button>

		<button
			class="rounded-lg bg-indigo-700 px-4 py-3 text-left font-semibold active:bg-indigo-600"
			onclick={test7_monoSynth}
		>
			7. Tone.js MonoSynth<br />
			<span class="text-xs font-normal text-indigo-300">Sawtooth-based MonoSynth (different from PluckSynth)</span>
		</button>

		<button
			class="rounded-lg bg-indigo-700 px-4 py-3 text-left font-semibold active:bg-indigo-600"
			onclick={test8_rawKarplus}
		>
			8. Raw Karplus-Strong<br />
			<span class="text-xs font-normal text-indigo-300">Manual pluck synthesis via AudioBuffer (no Tone.js)</span>
		</button>
	</div>

	<!-- Log output -->
	<div class="mb-2 flex items-center justify-between">
		<h2 class="text-sm font-semibold text-gray-400">Log</h2>
		<button class="rounded bg-gray-700 px-3 py-1 text-xs text-gray-300" onclick={clearLog}>Clear</button>
	</div>
	<div class="rounded-lg bg-gray-900 p-3 font-mono text-xs leading-relaxed text-green-400" style="max-height: 40vh; overflow-y: auto;">
		{#each log as line}
			<div>{line}</div>
		{/each}
		{#if log.length === 0}
			<div class="text-gray-600">No logs yet. Tap a test button above.</div>
		{/if}
	</div>
</div>
