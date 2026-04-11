const XLSX = require('xlsx');
const fs = require('fs');

const inputPath = 'public/number_of_political_violence_events_by_country-year_as-of-20Mar2026.xlsx';

function isFiniteNumber(value) {
	return typeof value === 'number' && Number.isFinite(value);
}

function parseNumber(value) {
	if (value === null || value === undefined) return null;
	if (isFiniteNumber(value)) return value;
	const cleaned = String(value).replace(/,/g, '').trim();
	if (!cleaned) return null;
	const n = Number(cleaned);
	return Number.isFinite(n) ? n : null;
}

function pickKey(obj, candidates) {
	if (!obj) return null;
	const keys = Object.keys(obj);
	const lower = new Map(keys.map((k) => [k.toLowerCase(), k]));
	for (const c of candidates) {
		const found = lower.get(c.toLowerCase());
		if (found) return found;
	}
	return null;
}

const workbook = XLSX.readFile(inputPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const raw = XLSX.utils.sheet_to_json(sheet, { defval: null });

console.log('Workbook:', inputPath);
console.log('Sheet:', sheetName);
console.log('Total raw rows:', raw.length);
console.log('Sample raw rows (first 3):');
console.log(JSON.stringify(raw.slice(0, 3), null, 2));
console.log('Raw columns:', Object.keys(raw[0] || {}));

let normalized = [];

if (raw.length > 0) {
	// Case A: long/tidy format (Country, Year, Events)
	const countryKey = pickKey(raw[0], ['Country', 'country', 'Location', 'location']);
	const yearKey = pickKey(raw[0], ['Year', 'year']);
	const eventsKey = pickKey(raw[0], ['Events', 'events', 'Event', 'event', 'Count', 'count', 'Number of events', 'number_of_events']);

	if (countryKey && yearKey && eventsKey) {
		normalized = raw
			.map((r) => ({
				Country: r[countryKey],
				Year: parseNumber(r[yearKey]),
				Events: parseNumber(r[eventsKey]),
			}))
			.filter((r) => r.Country && Number.isFinite(r.Year) && Number.isFinite(r.Events));
	} else {
		// Case B: wide format: first column is Country, and year columns like 1997, 1998...
		const guessedCountryKey = countryKey || Object.keys(raw[0])[0];
		for (const r of raw) {
			const country = r[guessedCountryKey];
			if (!country) continue;
			for (const [k, v] of Object.entries(r)) {
				if (k === guessedCountryKey) continue;
				const year = parseNumber(k);
				const events = parseNumber(v);
				if (Number.isFinite(year) && Number.isFinite(events)) {
					normalized.push({ Country: country, Year: year, Events: events });
				}
			}
		}
	}
}

console.log('Total normalized rows:', normalized.length);
console.log('Sample normalized rows (first 5):');
console.log(JSON.stringify(normalized.slice(0, 5), null, 2));

// Save to JSON for use in React
fs.writeFileSync('src/data.json', JSON.stringify(normalized, null, 2));
console.log('\nData saved to src/data.json');
