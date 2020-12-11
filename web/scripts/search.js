const search = document.getElementById('search');
const submitButton = document.getElementById('submit');
const results = document.getElementById('search-results');

submitButton.addEventListener('click', (e) => {
  console.log(e.target.value);
  fetch(`/api/projects?q=${encodeURIComponent(search.value)}`)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      let resultsHTML = "";
      for (let result of data) {
        let tagsHTML = "";
        var tagsList = result._source.tags.join();
        for (let tag of tagsList.split(',')) {
          tagsHTML += `
            <li class="tag">${tag.trim()}</li>
          `;
        }
        resultsHTML += `
          <li>
            <h3 class="group-title">${result._source.title}</h3>
            <p class="group-description">${result._source.description}</p>
            <ul class="tags">${tagsHTML}</ul>
            <h4 class="group-group">${result._source.group}</h4>
          </li>
        `;
      }
      results.innerHTML = resultsHTML;
    });
});

