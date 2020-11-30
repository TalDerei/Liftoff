// use node-postgres module to create a pool of connections w/ environment variables stored off-repo
const Pool = require('pg').Pool;
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
module.exports = pool.connect().then(() => pool).catch(err => {
	console.error(`Unable to connect to database: ${err}`);
	process.exit(1);
});

