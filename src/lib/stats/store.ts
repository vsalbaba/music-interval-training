const STORAGE_KEY = 'interval-training-stats';

export interface AnswerRecord {
	type: 'interval' | 'chord';
	name: string;
	correct: boolean;
	timestamp: number;
}

export interface Stats {
	answers: AnswerRecord[];
}

function load(): Stats {
	if (typeof localStorage === 'undefined') return { answers: [] };
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return { answers: [] };
		return JSON.parse(raw);
	} catch {
		return { answers: [] };
	}
}

function save(stats: Stats) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function recordAnswer(type: 'interval' | 'chord', name: string, correct: boolean) {
	const stats = load();
	stats.answers.push({ type, name, correct, timestamp: Date.now() });
	save(stats);
}

export interface AccuracyEntry {
	name: string;
	correct: number;
	total: number;
	percentage: number;
}

export function getAccuracy(type: 'interval' | 'chord'): AccuracyEntry[] {
	const stats = load();
	const filtered = stats.answers.filter((a) => a.type === type);
	const grouped = new Map<string, { correct: number; total: number }>();

	for (const a of filtered) {
		const entry = grouped.get(a.name) ?? { correct: 0, total: 0 };
		entry.total++;
		if (a.correct) entry.correct++;
		grouped.set(a.name, entry);
	}

	return Array.from(grouped.entries())
		.map(([name, { correct, total }]) => ({
			name,
			correct,
			total,
			percentage: Math.round((correct / total) * 100)
		}))
		.sort((a, b) => a.percentage - b.percentage);
}

export function getOverallStats(): { total: number; correct: number; percentage: number } {
	const stats = load();
	const total = stats.answers.length;
	const correct = stats.answers.filter((a) => a.correct).length;
	return { total, correct, percentage: total ? Math.round((correct / total) * 100) : 0 };
}

export function clearStats() {
	localStorage.removeItem(STORAGE_KEY);
}
