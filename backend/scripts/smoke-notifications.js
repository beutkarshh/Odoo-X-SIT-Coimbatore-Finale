require('dotenv').config();

const { createApp } = require('../src/app');

async function httpJson(url, options = {}) {
	const res = await fetch(url, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...(options.headers || {}),
		},
	});
	const text = await res.text();
	let json;
	try {
		json = text ? JSON.parse(text) : null;
	} catch {
		json = { raw: text };
	}
	if (!res.ok) {
		const err = new Error(`HTTP ${res.status} ${url}`);
		err.payload = json;
		throw err;
	}
	return json;
}

async function main() {
	const app = createApp();
	const server = await new Promise((resolve) => {
		const s = app.listen(0, () => resolve(s));
	});

	const port = server.address().port;
	const base = `http://localhost:${port}`;

	try {
		const login = await httpJson(`${base}/api/auth/login`, {
			method: 'POST',
			body: JSON.stringify({ email: 'john.doe@customer.com', password: 'Customer@123' }),
		});
		const token = login?.data?.token;
		if (!token) throw new Error('No token from login');

		const headers = { Authorization: `Bearer ${token}` };
		const unread1 = await httpJson(`${base}/api/notifications/unread-count`, { headers });
		const list = await httpJson(`${base}/api/notifications?limit=5`, { headers });

		console.log('unread-count:', unread1?.data);
		console.log('notifications:', Array.isArray(list?.data) ? list.data.length : 0);

		const firstUnread = Array.isArray(list?.data) ? list.data.find((n) => !n.isRead) : null;
		if (firstUnread) {
			await httpJson(`${base}/api/notifications/${firstUnread.id}/read`, { method: 'POST', headers });
			const unread2 = await httpJson(`${base}/api/notifications/unread-count`, { headers });
			console.log('unread-count-after-markRead:', unread2?.data);
		}

		console.log('✅ Smoke notifications OK');
	} finally {
		await new Promise((resolve) => server.close(resolve));
	}
}

main().catch((e) => {
	console.error('❌ Smoke failed:', e.message);
	if (e.payload) console.error('Payload:', JSON.stringify(e.payload, null, 2));
	process.exitCode = 1;
});
