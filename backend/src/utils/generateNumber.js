const crypto = require('crypto');

function pad2(n) {
	return String(n).padStart(2, '0');
}

/**
 * Generate human-friendly unique-ish numbers.
 * Example: SUB-20260207-153012-4821
 */
function generateNumber(prefix) {
	const now = new Date();
	const y = now.getFullYear();
	const m = pad2(now.getMonth() + 1);
	const d = pad2(now.getDate());
	const hh = pad2(now.getHours());
	const mm = pad2(now.getMinutes());
	const ss = pad2(now.getSeconds());
	const rand = crypto.randomInt(1000, 10000); // 4 digits
	return `${String(prefix).toUpperCase()}-${y}${m}${d}-${hh}${mm}${ss}-${rand}`;
}

module.exports = { generateNumber };


