// Attempt to validate the user's identity, and redirect to the login page otherwise:
fetch('/api/auth/whoami', { credentials: 'include' })
	.then(res => res.json())
	.then(res => console.log('Currently logged in as ', res.username))
	.catch(err => window.location.href = '/login.html?redirect='
		+ encodeURIComponent(window.location.toString()));

