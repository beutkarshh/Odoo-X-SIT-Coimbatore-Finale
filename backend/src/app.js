
const express = require('express');
const cors = require('cors');

const { errorMiddleware } = require('./middlewares/error.middleware');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const planRoutes = require('./routes/plan.routes');

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

	// API Routes
	app.use('/api/auth', authRoutes);
	app.use('/api/users', userRoutes);
	app.use('/api/products', productRoutes);
	app.use('/api/plans', planRoutes);

	// 404
	app.use((_req, res) => {
		res.status(404).json({ success: false, message: 'Route not found' });
	});

	// Error handler
	app.use(errorMiddleware);

	return app;
}

module.exports = { createApp };


