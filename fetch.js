var http = require('http');

module.exports = function (url, success, error){

  var request = http.request(url, function(response){
    var body = ""
    response.on('data', function(data) {
      body += data;
    });
    response.on('end', function(){
      success(body);
    });
  });

  request.on('error', function(e) {
    error(e);
    console.log('Problem with request: ' + e.message);
  });

  request.end();
}
