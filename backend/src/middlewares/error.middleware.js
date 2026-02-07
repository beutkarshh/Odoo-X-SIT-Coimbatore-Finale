
function errorMiddleware(err, _req, res, _next) {
	const statusCode = err?.statusCode || 500;
	const message = err?.message || 'Internal Server Error';

	if (process.env.NODE_ENV !== 'production') {
		// eslint-disable-next-line no-console
		console.error(err);
	}

	res.status(statusCode).json({ success: false, message });
}

module.exports = { errorMiddleware };


