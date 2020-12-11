// Obtain the OAuth ID from the server && wait for the DOM to load:
Promise.all([
	fetch('/api/auth/oauth-id'),
	new Promise((res) => { window.addEventListener('load', res); })
]).then(arr => arr[0]).then(res => res.text()).then(id => id.replace(/\s/g, '')).then(id => {
	// Attach an event-listener to the sign-in button:
	document.getElementById('login-button').addEventListener('click', () => {
		// Attempt to sign the user in via the Google API:
		gapi.load('auth2', function() {
			gapi.auth2.authorize({
				client_id: id,
				scope: 'profile email',
				response_type: 'authorization_code'
			}, function(response) {
				// Check for errors:
				if(response.error) {
					console.error('ERROR: Unable to signin:', response.error);
					alert('ERROR: Unable to signin: ' + JSON.stringify(response.error));
					window.location.reload();
					return;
				}

				// Encode the search parameters:
				let params = new URLSearchParams();
				params.append('code', response.code);

				// Send the authorization code to the server:
				fetch('/api/auth/google?' + params.toString()).then(function(response) {
					// The auth cookie has been set. Now, let's see where we're supposed to go next:
					const params = new URLSearchParams(window.location.search);
					let redirectLocation = params.get('redirect') || '/index.html';

					// Redirect to the next location:
					window.location.replace(redirectLocation);
				}).catch(function(err) {
					// If the authentication failed, report the error, & reload the page:
					console.error('Failed sending Google token to backend');
					console.error(err);
					window.location.reload();
				});
			});
		});
	});
	console.log('Attached Click-Listener to Sign-in Button');
}).catch(err => {
	// If this gets called, something has gone wrong with the oauth-id route.
	console.log(err);
	alert('ERROR: Unable to load Sign-in page. If you see this more than once, try again in an hour or two.');
	window.location.reload();
});

