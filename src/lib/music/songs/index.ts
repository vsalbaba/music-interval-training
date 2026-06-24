import starWarsAbc from './star-wars.abc?raw';
import hereComesTheBrideAbc from './here-comes-the-bride.abc?raw';
import whenTheSaintsAbc from './when-the-saints.abc?raw';
import greensleevesAbc from './greensleeves.abc?raw';
import happyBirthdayAbc from './happy-birthday.abc?raw';
import plamenAbc from './plamen.abc?raw';
import malovaniAbc from './malovani.abc?raw';
import stinKatedralAbc from './stin-katedral.abc?raw';
import smokeOnTheWaterAbc from './smoke-on-the-water.abc?raw';
import ovcaciCtveraciAbc from './ovcaci-ctveraci.abc?raw';
import takeOnMeAbc from './take-on-me.abc?raw';

export interface SongSnippet {
	title: string;
	interval: string;
	direction: 'ascending' | 'descending';
	abc: string;
}

export const SONG_SNIPPETS: SongSnippet[] = [
	{
		title: 'Star Wars Main Theme',
		interval: 'P5',
		direction: 'ascending',
		abc: starWarsAbc
	},
	{
		title: 'Here Comes the Bride',
		interval: 'P4',
		direction: 'ascending',
		abc: hereComesTheBrideAbc
	},
	{
		title: 'Oh! When the Saints Go Marching In',
		interval: 'M3',
		direction: 'ascending',
		abc: whenTheSaintsAbc
	},
	{
		title: 'Greensleeves',
		interval: 'm3',
		direction: 'ascending',
		abc: greensleevesAbc
	},
	{
		title: 'Happy Birthday',
		interval: 'M2',
		direction: 'ascending',
		abc: happyBirthdayAbc
	},
	{
		title: 'Plamen',
		interval: 'm7',
		direction: 'ascending',
		abc: plamenAbc
	},
	{
		title: 'Malování',
		interval: 'm3',
		direction: 'ascending',
		abc: malovaniAbc
	},
	{
		title: 'Stín katedrál',
		interval: 'P4',
		direction: 'ascending',
		abc: stinKatedralAbc
	},
	{
		title: 'Smoke on the Water',
		interval: 'm3',
		direction: 'ascending',
		abc: smokeOnTheWaterAbc
	},
	{
		title: 'Ovčáci, čtveráci',
		interval: 'M3',
		direction: 'ascending',
		abc: ovcaciCtveraciAbc
	},
	{
		title: 'Take on Me',
		interval: 'M7',
		direction: 'ascending',
		abc: takeOnMeAbc
	}
];

export function getSongSnippets(
	intervalShortName: string,
	direction: 'ascending' | 'descending'
): SongSnippet[] {
	return SONG_SNIPPETS.filter(
		(s) => s.interval === intervalShortName && s.direction === direction
	);
}
