const search = document.getElementById('search');
const submitButton = document.getElementById('submit');
const results = document.getElementById('search-results');

submitButton.addEventListener('click', (e) => {
  console.log(e.target.value);
  //fetch for group info using project name
  fetch(`https://liftoff.acm.lehigh.edu/project/${e.target.value}`)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      let resultsHTML = "";
      //for loop for results
      for (let result of data) {
        let tagsHTML = "";
        //for loop to generate html for tags
        for (let tag of result.tags.split(',')) {
          tagsHTML += `
            <li class="tag">${tag.trim()}</li>
          `;
        }
        //results HTML
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
