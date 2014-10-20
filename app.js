var http   = require("http")
  , url    = require("url")
  , path   = require("path")
  , fs     = require("fs")
  , qs     = require("querystring")
  , Sieve  = require("sievejs");

var args   = process.argv || [];

var ports = {
  http   : args[2] || 3000,
  socket : args[3] || 8080
};

// Websocket interface
var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({port: ports.socket});

wss.on('connection', function(ws){

  send('connect');

  function send(type, data){
    try {
      ws.send(JSON.stringify({
        message : type,
        data : data
      }));
    } catch(e){
      ws.on('message', function(){});
      console.log(e);
    }
  }
});

// Load HTML template
var template = fs.readFileSync('index.tmpl', 'utf8');

// HTTP interface
http.createServer(function(request, response) {

  respond('It works');

  function error(string){
    respond(string, "text", 500);
  }

  // End the response
  function finish(results){

    var string = JSON.stringify(results)
      , type = "text/plain";

    // Support JSONP
    if (queries.callback){
      type = "application/x-javascript";
      string = queries.callback + '(' + string + ')';
    }

    respond(string, type);
  }

  function respond(string, type, code){

    var origin = "http://alexose.github.io";

    type = type || "text/html";
    code = code || 200;

    response.writeHead(code, {
      "Content-Type": type,
      "Access-Control-Allow-Origin": origin
    });
    response.write(string);
    response.end();
  }

}).listen(ports.http, function(){
  console.log('Server running on port ' + ports.http);
});

