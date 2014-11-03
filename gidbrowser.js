// GIDBrowser
//
// Provides a list of active games and their GIDs.
// Data is from nfl.com's game-center

var parse = require("xml2js").parseString
  , fetch  = require("./fetch");

var url = 'http://www.nfl.com/liveupdate/scorestrip/ss.xml';

GIDBrowser = function(){
  this.update();
  return this;
};

GIDBrowser.prototype.update = function(){

  var self = this;

  fetch(url, success, error);

  function success(data){
    parse(data, function(err, obj){
      var arr = obj.ss.gms[0].g
        .map(function(d){ return d.$; })
        .filter(function(d){ return d.q !== 'F' && d.q !== 'P'; });

      self.data = { games : arr };
    });
  }

  function error(e){
      console.log(e);
  }

  return this;
};

module.exports = new GIDBrowser();

