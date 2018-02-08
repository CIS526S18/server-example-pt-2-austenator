"use strict";

// PORT definition
const PORT = 3067;

// Import the HTTP library
const http = require('http');

// Import the fs library
const fs = require('fs');

// Import path library.
const path = require('path');

const url = require('url');

const cwd = process.cwd();

const publicDir = path.join(cwd,'public');

//const cache = {};
//cache['openhouse.html'] = fs.readFileSync('public/openhouse.html');
//cache['openhouse.css'] = fs.readFileSync('public/openhouse.css');
//cache['openhouse.js'] = fs.readFileSync('public/openhouse.js');

/** @function myError
 * Issues an error on a response with the specified params.
 * @param  {http.ServerResponse} res Response object to end.
 * @param  {Number} [status_code=500] Desired status code. Defaults to 500.
 * @param  {string} message A custom error message.
 * @return {undefined}
 */
function myError(res, status_code=500, message='Server error!'){
  console.error(message);
  res.statusCode = status_code;
  res.end(message);
  return;
}

function removePublic(str){
  return str.slice(6);
}

/** @function serveFile
 * Serves the specified file.
 * @param {string} thisPath - specifies the file path to read.
 * @param {http.serverResponse} res - the http response object.
 */
function serveFile(thisPath, res){
  // thisPath = removePublic(thisPath);
  console.log('About to serve this file: ' + thisPath);
    fs.readFile(thisPath, function(err, data){
        if(err){
          myError(res);
        }
        res.end(data);
    });
}

/** @function serveIndex
 * Serves index page.
 * @param {http.ServerResponse} res
 */
function serveIndex(thisPath, res){
  console.log('About to read from: ' + thisPath);
    fs.readdir(thisPath, function(err, files){
        if(err){
            myError(res);
        }

        var html = '<p>Index of ' + thisPath + '</p>';
        html += '<ul>';
        html += files.map(function(item){
            return "<li><a href='"+ path.join(removePublic(thisPath),item) + "'>" + item + '</a></li>';
        }).join('');
        html += '</ul>';
        res.end(html);
    });
}

function serveDirectory(uri, res){
  // process.chdir(url);
  // uri = path.join('public',uri);
  var indexPath = path.join(uri,'/index.html');
  if(!fs.existsSync(indexPath)){
    // console.log('Path doesnt have an index. Making one.');
    serveIndex(uri, res);
  }
  else{
    // console.log('Path has an index file, serving: '+indexPath);
    serveFile(indexPath, res);
  }
}

function handleRequest(req, res){

  // /public or /test or /
  var uri = req.url;
  console.log('Handling the request at raw url of: '+uri);

  // Current directory plus the desired destination
  // var fullUrl = uri;
  // var fullUrl = path.join('public',uri);
  var realPath = path.join('public',uri);
  // console.log('The full url is: '+fullUrl);
  console.log('The real path is: '+realPath);

  if(!fs.existsSync(realPath)){
    console.log('The  url doesn\'t exist.');
    myError(res, 404, 'Destination Not Found.');
    return;
  }

  var stats = fs.lstatSync(realPath);

  if(stats.isDirectory()) {
    // console.log('Full url is a directory.');
    serveDirectory(realPath, res);
  }
  else if (stats.isFile()) {
    // console.log('Full url is a file.');
    serveFile(realPath, res)
  }
  else {
    // console.log('It\'s neither.');
    myError(res, 404, 'File not found.');
  }
}

// Create the web server
var server = http.createServer(handleRequest);

// Start listening on port PORT
server.listen(PORT, function(){
    console.log("Listening on port " + PORT);
});

/** @function handleRequest
 * Request handler that handles requests and sends response.
 * @param {http.ClientRequest} req - the http request obj.
 * @param {http.ServerRespnse} res - the http response obj.
 */
