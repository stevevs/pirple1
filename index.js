/*
* Primary file for API
*
*/

//Dependancies
var http = require('http');
var https = require('https');
var url  = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

// Instaniating the HTTP server
var  httpServer = http.createServer(function(req, res){
unifiedServer(req,res);
}
);

// Start the server and have it listen on port
httpServer.listen(config.httpPort,function(){
  console.log('The Server is listening on port ' +config.httpPort);
})
var httpsServerOptions = {
  'key' : fs.readFileSync('./https/key.pem'),
  'cert' : fs.readFileSync('./https/cert.pem')
};
// Instaniating the HTTPS server
var  httpsServer = https.createServer(httpsServerOptions,function(req, res){
  unifiedServer(req,res);
}
);

// Start the HTTPS server and have it listen on port
httpsServer.listen(config.httpsPort,function(){
  console.log('The Server is listening on port ' +config.httpsPort);
})

//All the server logic for http and https Server
var unifiedServer = function(req,res){
  // get url and parse it
  var parsedUrl = url.parse(req.url,true);
  // true tells it to parse the query string
  // as if we sent to query string module

  // get the path
  var path = parsedUrl.pathname;
  //pathname = untrimmed path
  var trimmedPath = path.replace(/^\/+|\/+$/g ,'');
  // trims slashes

  // Get the http method
  var method = req.method.toLowerCase();

  // Get the query string
  var queryStringObject = parsedUrl.query;

  // Get the headers as an object
  var headers = req.headers;

  // Get the payload if any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';

 //node stream
  req.on('data',function(data){
    buffer += decoder.write(data);
  });
  req.on('end',function(){
    buffer +=decoder.end();

    // choose the handler this request to go to
    // if not found, use nonFound
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    //Construct Data object to send to handlers
    var data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers' : headers,
      'payload': buffer
    };

    //Rout the request to the handler specifed by the Router
    chosenHandler(data,function(statusCode, payload){
      // use the status code called back by handler or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
      // use the payload default called back or default to empty
      payload = typeof(payload) == 'object' ? payload : {};

      var payloadString = JSON.stringify(payload);
      res.setHeader('Content-Type','application/json');
      // return the response
      res.writeHead(statusCode);
      // send the response
      res.end(payloadString);

      // log the request path
      console.log('Returning this response: ',statusCode, payloadString);

    });

  });

};

// Define handlers
var handlers = {};

handlers.ping = function (data, callback){
  callback(200);
};

handlers.hello = function (data, callback){

  callback(200,{'welcomeMessage': 'Welcome to my API',
                'postData':data.queryStringObject});
};

handlers.notFound = function (data, callback){
  callback(404);
};

// Defining a Request Router
var router = {
  'ping' : handlers.ping,
  'hello' : handlers.hello
};
