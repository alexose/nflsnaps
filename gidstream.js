// GIDStream
//
// Provides a node stream of GID data.
// These streams are managed by app.js.

var http   = require("http")
  , url    = require("url")
  , path   = require("path")
  , fs     = require("fs")
  , qs     = require("querystring")
  , Readable = require('stream').Readable;

module.exports = function(gid){

  var url = 'http://www.nfl.com/liveupdate/game-center/{{dir}}/{{gid}}_gtd.json';

  var target = url
    .replace('{{dir}}', gid)
    .replace('{{gid}}', gid);

  var rs = new Readable;

  rs._read = function(evt){}

  // Begin polling the target and emitting data to the stream
  function poll(data){
    if (data){
      rs.push(data);
      fetch(target, poll, error);
    } else {
      setTimeout(function(){
        fetch(target, poll, error);
      }, 5000);
    }
  }

  function error(){
    rs.end();
    console.log('Ending stream ' + gid);
  }

  return rs;
};

function fetch(url, success, error){

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
