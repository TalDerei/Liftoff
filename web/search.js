const search = document.getElementById('search');
const submitButton = document.getElementById('submit');
const results = document.getElementById('search-results');

submitButton.addEventListener('click', (e) => {
  console.log(e.target.value);
  fetch(`https://liftoff.acm.lehigh.edu/groups/${e.target.value}`)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      let resultsHTML = "";
      for(let result of data){
        resultsHTML += `
          <li>
            <h3 class="group-title">${result.title}</h3>
            <p class="group-description">${result.description}</p>
          </li>
        `;
      }
      
    });
});
