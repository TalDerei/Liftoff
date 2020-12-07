function data(owner,repo){
    fetch('https://api.github.com/repos/'+owner+'/'+repo+'/languages',{
        method: 'GET',
        headers:{
            'Accept': 'application/vnd.github.v3+json'
        },
    })
    .then(data=>data.json())
    .then(data=>{
        console.log(data)
    })
}


module.exports = data;