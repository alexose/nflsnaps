var http   = require("http")
  , url    = require("url")
  , path   = require("path")
  , fs     = require("fs")
  , qs     = require("querystring");

var options = {
  url : 'http://www.nfl.com/liveupdate/game-center/{{dir}}/{{gid}}_gtd.json',
  delay : 10000
};

var args = process.argv || [];

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

  var queries = qs.parse(request.url.split('?')[1])
    , interval = {};

  function error(string){
    respond(string, "text", 500);
  }

  if (queries.gid){
    start(queries.gid);
  } else {
    explain();
  }

  function explain(){
    respond('Please provide a Game ID (e.g. 2014101912).');
  }

  function start(gid){
    var url = options.url
      .replace('{{dir}}', gid)
      .replace('{{gid}}', gid);

    interval[gid] = setInterval(function(){
      fetch(url, broadcast);
    }, options.delay);
  }

  function broadcast(response){
    console.log(response);
  }

  function stop(gid){
    if (interval[gid]){
      clearInterval(interval[gid]);
      console.log('Stopped polling gid ' + gid);
    } else {
      console.log('Tried to stop polling gid ' + gid + ', but it wasn\'t running.');
    }

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


function fetch(url, cb){

  var request = http.request(url, function(response){
    var body = ""
    response.on('data', function(data) {
      body += data;
    });
    response.on('end', function(){
      cb(body);
    });
  });

  request.on('error', function(e) {
    console.log('Problem with request: ' + e.message);
  });

  request.end();
}
