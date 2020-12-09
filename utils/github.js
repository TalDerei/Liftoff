const fetch = require('node-fetch')

//fetch only number of commits and author
function smallDataFetch(search){
  return fetch('https://api.github.com/repos/'+search+'/stats/contributors')
  .then(data=>data.json())
  .then(data=>{
      let betterData = []
      for(i=0; i<data.length; i++){
          betterData.push({'total':data[i].total,'user':data[i].author.login})
      }
      return betterData
  })
}


//fetch a bunch of stuff
function bigDataFetch(search){
    //search should be in form ':owner/:repo'
    return fetch('https://api.github.com/repos/'+search+'/commits')
    .then(data=>data.json())
    .then(data=>{

    //collect the commit ids
    let commitsID = [];
    for(i = 0; i < data.length; i++){
      commitsID.push(data[i].sha)
    }

    //make group of fetches
    let requests = commitsID.map(id=>{
      return fetch('https://api.github.com/repos/'+search+'/commits/'+id)
    })

    //parse the fetches
    return Promise.all(requests)
    .then(body=>{
      let requests = body.map(res=>{
        return res.json()
      })
      return Promise.all(requests)
      .then(data=>{
        //now we have the new and improved data, but still need language info
        return fetch('https://api.github.com/repos/'+search+'/languages')
        .then(data=>data.json())
        .then(lang=>{
          let finalData = {'commits': data,'languages':lang}
          console.log(finalData)
          return finalData
        })
        .catch(error=>{
          console.error('Error:',error)
        })
      })
    })
    .catch(error=>{
      console.error('Error:',error)
    })
  })
  .catch(error=>{
    console.error('Error:',error)
  })
}

//smallDataFetch('Lehigh-Coders-Community/CSE6cubed').then(data=>{console.log(data)})

module.exports = smallDataFetch;