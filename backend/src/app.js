
const express = require('express');
const cors = require('cors');

const { errorMiddleware } = require('./middlewares/error.middleware');

function createApp() {
	const app = express();

	app.use(cors());
	app.use(express.json());

	// Basic readiness endpoint for local dev + deployments.
	app.get('/health', (_req, res) => {
		res.json({ ok: true, service: 'backend', ts: new Date().toISOString() });
	});

	// Placeholder root
	app.get('/', (_req, res) => {
		res.json({ ok: true, message: 'Subscription Management API' });
	});

	// 404
	app.use((_req, res) => {
		res.status(404).json({ success: false, message: 'Route not found' });
	});

	// Error handler
	app.use(errorMiddleware);

	return app;
}

module.exports = { createApp };


