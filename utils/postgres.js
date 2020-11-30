const lightship = require('./lightship');
const Pool = require('pg').Pool;

// use node-postgres module to create a pool of connections w/ environment variables stored off-repo
const pool = new Pool({
	user: process.env['POSTGRES_USER'].replace(/\s/g, ''),
	password: process.env['POSTGRES_PASS'].replace(/\s/g, ''),
	host: process.env['POSTGRES_HOST'].replace(/\s/g, ''),
	port: process.env['POSTGRES_PORT'].replace(/\s/g, ''),
	database: process.env['POSTGRES_DB'].replace(/\s/g, ''),
	ssl: {
		rejectUnauthorized: false
	}
});

// connect to database instance
module.exports = pool;

// Create a shutdown handler to drain the pool:
lightship.registerShutdownHandler(async () => {
	console.log('Awaiting Postgres termination ...');
	await pool.end()
		.then(() => console.log('Postgres pool has terminated.'))
		.catch(err => console.error('Failed to shutdown Postgres pool: ', err));
});

// Set a hook to shutdown the app on error:
pool.on('error', (err, client) => {
	console.error('Unexpected error occured in database connection: ', err);
	lightship.shutdown();
});

