const { createLightship } = require('lightship');

// Create a new instance of the lightship probe handler:
const lightship = createLightship({
	detectKubernetes: false
});

// Define a SIGINT handler to call the shutdown hook:
process.on('SIGINT', function() {
	console.log('Caught SIGINT; triggering server shutdown ...');
	lightship.shutdown();
});

// Export lightship:
module.exports = lightship;

