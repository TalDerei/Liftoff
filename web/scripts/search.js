// Get DOM handles to each element relevant to performing the search:
const search = document.getElementById('search');
const submitButton = document.getElementById('submit');
const results = document.getElementById('search-results');

// Get DOM handles to each element relevant to displaying the results modal
const resultModal = document.getElementById('result-modal');
const resultTitle = document.getElementById('result-title');
const resultGroup = document.getElementById('result-group');
const resultBody = document.getElementById('result-body');

// Provide a handler for the close button:
for(let button of document.getElementsByClassName('close'))
	button.addEventListener('click', function(e) {
		// Hide the modal:
		button.parentElement.parentElement.parentElement.style.display = 'none';
	});

// Define a function to handle displaying the result modal:
function displayResultModal(event) {
	resultTitle.innerText = event.currentTarget.getAttribute('data-title');
	resultGroup.innerText = event.currentTarget.getAttribute('data-group');
	resultBody.innerText = event.currentTarget.getAttribute('data-description');
	resultModal.style.display = 'block';
}

// Set a click-listener for the search button:
submitButton.addEventListener('click', (e) => {
	console.log(e.target.value);
	// Send the search request:
	fetch(`/api/projects?q=${encodeURIComponent(search.value)}`, { credentials: 'include' })
		.then(response => response.json())
		.then(data => {
			console.log(data);
			results.innerHTML = "";
			for (let result of data) {
				let tagsList = result._source.tags.join();
				let tagsElement = document.createElement('ul');
				for (let tag of tagsList.split(',')) {
					// Create a new tag:
					let element = document.createElement('li');
					element.className = 'tag';
					element.innerText = tag.trim();
					tagsElement.appendChild(element);
					tagsElement.appendChild(document.createTextNode(' '));
					/*tagsHTML += `
						<li class="tag">${tag.trim()}</li>
					`;*/
				}

				// Create a new listing:
				let element = document.createElement('li');
				element.setAttribute('data-description', result._source.description);
				element.setAttribute('data-title', result._source.title);
				element.setAttribute('data-title', result._source.group);
				element.addEventListener('click', displayResultModal);

				// Add the title:
				let tmp = document.createElement('h3');
				tmp.className = 'group-title';
				tmp.innerText = result._source.title;
				element.appendChild(tmp);

				// Add the description:
				tmp = document.createElement('p');
				tmp.className = 'group-description';
				tmp.innerText = result._source.description;
				element.appendChild(tmp);

				// Add the tag list:
				tagsElement.className = 'tags';
				element.appendChild(tagsElement);

				// Add the group name:
				tmp = document.createElement('h4');
				tmp.className = 'group-group';
				tmp.innerText = result._source.group;
				element.appendChild(tmp);

				// Display the listing:
				results.appendChild(element);
			}
		});
});

