var http   = require("http")
  , url    = require("url")
  , path   = require("path")
  , fs     = require("fs")
  , qs     = require("querystring");

var GIDStream = require("./gidstream");

var args = process.argv || [];

var ports = {
  http   : args[2] || 3000,
  socket : args[3] || 8080
};

// Options
var options = {
  url : 'http://www.nfl.com/liveupdate/game-center/{{dir}}/{{gid}}_gtd.json',
  delay : 1000,
  server : 'localhost'
};


// Websocket interface
var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({port: ports.socket});

var streams = {};

wss.on('connection', function(ws){

  send('connected');

  var gid;

  // Wait for GID request
  ws.on('message', function(_gid){

    // TODO: connect to multiple streams
    gid = _gid;

    var stream = streams[gid];

    if (!stream){

      // Spin up a new stream
      streams[gid] = {
        users : 0,
        readable : new GIDStream(gid)
      }

      stream = streams[gid];
    }

    // Increment user count
    stream.users += 1;

    // Set up readable event
    var r = stream.readable;

    r.on('readable', function(buf){
      var buf = r.read();

      if (buf && buf.length){
        send(buf);
      }
    });
  });

  ws.on('close', function(){

    var stream = streams[gid];

    // See if a stream should be closed
    if (stream){

      stream.users -= 1;

      if (!stream.users){

        // Close stream if we're out of users
        stream.readable.end();
        console.log('Closing stream for GID ' + gid);
      }
    }
  })

  function send(type, data){
    try {

      var payload = JSON.stringify({
        message : type,
        data : data
      });

      // TODO: jsonpatch
      ws.send(payload);

    } catch(e){}
  }

});

// HTTP interface
http.createServer(function(request, response) {

  var queries = qs.parse(request.url.split('?')[1]);

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

    // Load HTML template
    var template = fs.readFileSync('index.tmpl', 'utf8')
      .replace('{{gid}}', gid)
      .replace('{{server}}', options.server)
      .replace('{{port}}', ports.socket);

    respond(template);
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
