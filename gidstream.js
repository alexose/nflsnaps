// GIDStream
//
// Provides a Readable stream of NFL JSON data.
// Data is from nfl.com's game-center
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

  var timeout;

  rs.setEncoding('utf8');

  rs._read = function(evt){}

  rs.end = function(){
    console.log('Ending stream ' + gid);
    clearTimeout(timeout);
  }

  poll();

  // Begin polling the target and emitting data to the stream
  function poll(data){
    if (data){
      rs.push(data);
      timeout = setTimeout(function(){
        fetch(target, poll, error);
      }, 5000);
    } else {
      fetch(target, poll, error);
    }
  }

  function error(){
    rs.end();
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
