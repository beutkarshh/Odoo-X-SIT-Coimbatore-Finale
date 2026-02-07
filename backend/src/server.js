
require('dotenv').config();

const { createApp } = require('./app');
const { env } = require('./config/env');

const app = createApp();

app.listen(env.PORT, () => {
	// eslint-disable-next-line no-console
	console.log(`API listening on http://localhost:${env.PORT}`);
});


