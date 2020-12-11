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
        var tagsList = result.tags.join();
        for (let tag of result.tags.split(',')) {
          tagsHTML += `
            <li class="tag">${tag.trim()}</li>
          `;
        }
        resultsHTML += `
          <li>
            <h3 class="group-title">${result.title}</h3>
            <p class="group-description">${result.description}</p>
            <ul class="tags">${tagsHTML}</ul>
            <h4 class="group-group">${result.group}</h4>
          </li>
        `;
      }
      results.innerHTML = resultsHTML;
    });
});

