/* Test to create index under local cluster */

var client = require('./connection.js');

client.indices.create({  
  index: 'sample_index'
},function(err,resp,status) {
  if(err) {
    console.log(err);
  }
  else {
    console.log("create",resp);
  }
});