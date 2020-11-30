// use node-postgres module to create a pool of connections w/ environment variables stored off-repo
const Pool = require('pg').Pool;
const pool = new Pool({
	user: process.env['POSTGRES_USER'],
	password: process.env['POSTGRES_PASS'],
	host: process.env['POSTGRES_HOST'],
	port: process.env['POSTGRES_PORT'],
	database: process.env['POSTGRES_DB'],
	ssl: {
		rejectUnauthorized: false
	}
});

// connect to database instance
module.exports = pool.connect().then(() => pool).catch(err => {
	console.error(`Unable to connect to database: ${err}`);
	process.exit(1);
});

