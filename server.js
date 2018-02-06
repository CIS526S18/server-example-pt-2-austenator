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

/** @function serveFile
 * Serves the specified file.
 * @param {string} path - specifies the file path to read.
 * @param {http.serverResponse} res - the http response object.
 */
function serveFile(path, res){
  console.log('About to serve this file: ' + path);
    fs.readFile(path, function(err, data){
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
function serveIndex(path, res){
  console.log('About to read from: ' + path);
    fs.readdir(path, function(err, files){
        if(err){
            myError(res);
        }

        var html = '<p>Index of ' + path + '</p>';
        html += '<ul>';
        html += files.map(function(item){
            return "<li><a href='"+ item + "'>" + item + '</a></li>';
        }).join('');
        html += '</ul>';
        res.end(html);
    });
}

function serveDirectory(){

}

/** @function handleRequest
 * Request handler that handles requests and sends response.
 * @param {http.ClientRequest} req - the http request obj.
 * @param {http.ServerRespnse} res - the http response obj.
 */
function handleRequestBad(req, res) {
  let originalUrl = req.url;
  // let originalCwd = process.cwd();
  // let publicDir = path.join(process.cwd(),'public');
  // let newUrl = path.join(publicDir,originalUrl);
  var uri = url.parse(req.url).pathname;
  var filename = path.join(process.cwd(), uri);

  console.log('Handling the request for: '+originalUrl + '\n Which has the filename: '+filename);

  if(fs.existsSync(filename)){
    let stats = fs.lstatSync(filename);
    if(stats.isDirectory()){
      console.log('It\'s a directory.');
      var filenameIndex = path.join(filename,'/index.html');
      if(!fs.existsSync(filenameIndex)){
        console.log('An index file doesn\'nt exist. Serving this directory: ' + uri);
        serveIndex(filename, res);
      }
      else{
        console.log('There\'s an index file! Serving: '+filenameIndex);
        serveFile(filenameIndex, res);
      }

      if(filename === '/'){
        serveIndex('public', res);
        // process.chdir('public');
      }
      else{
        serveIndex(filename, res);
        // process.chdir(filename);
      }

    }
    else if(stats.isFile()){
      console.log('It\'s a file.');
      serveFile(newUrl, res);
    }
    else{
      console.log('It\'s neither.');
      myError(res, 404, 'File not found.');
    }
    // switch(newUrl) {
    //     case '/':
    //     case '/index.html':
    //         serveIndex('public',res);
    //         break;
    //     case newUrl:
    //         serveFile('public/'+newUrl, res);
    //         break;
    //     default:
    //         res.statusCode = 404;
    //         res.end("File Not Found");
    // }
  }
  else{
    myError(res, 500, 'Yoooo doesn\'t exist: ' + filename);
  }

}

function handleRequest(req, res){
  // /public or /test or /
  var url = req.url;

  // Current directory plus the desired destination
  var filename = path.join(__dirname, url);
  res.end(url);


}

// Create the web server
var server = http.createServer(handleRequest);

// Start listening on port PORT
server.listen(PORT, function(){
    console.log("Listening on port " + PORT);
});
