var path = require('path');
var archive = require('../helpers/archive-helpers');
var fs = require('fs');
// require more modules/folders here!

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

exports.handleRequest = function (req, res) {
  var statusCode;
  var headers = defaultCorsHeaders;
  archive.isUrlInList(req.url.slice(1) , function(results) {
    if(req.method === 'GET') { // GET Request
      if(req.url === '/' || req.url === '/styles.css'){ //Root
        if(req.url === '/styles.css'){
          headers['Content-Type'] = 'text/css';
        }
        fs.readFile(__dirname + '/public/index.html', 'utf8', function (err, content) {
          if (err) {
            console.log('fs.readFile failed :(\n', err);
          } else {
            statusCode = 200;
            headers['Content-Type'] = 'text/html';
            res.writeHead(statusCode, headers);
            res.end(content);
          }
        });// Return index.html
      } else if (req.url.length > 1) { //If it is a GET request to another end point (supposedly an archived site)
        archive.isUrlArchived(req.url, function(isArchived) {
          if(isArchived) { // if the site requested is archived
            fs.readFile(path.join(archive.paths.archivedSites,req.url),'utf8', function (err, content) {
              if(err) {
                console.log('error in req-handler if is archived',err);
              } else {
                statusCode = 200;
                headers['Content-Type'] = 'text/html';
                res.writeHead(statusCode, headers);
                res.end(content);
              }
            });// send back its content
          } else {
            statusCode = 404;
            res.writeHead(statusCode, headers);
            res.end();
          }// else send back error
        });
      }
    }
  });
  if(req.method === 'POST') {//if the user inputs data to the box and hits enter
    var dataStream = '';
    req.on('data', (data) => {
      dataStream += data;
    });
    req.on('end', () => {
      var url = dataStream.slice(4); // get the actual url
      archive.isUrlInList(url, function(results) {
        if(results) {// if the url is in sites.txt
          archive.isUrlArchived(url, function(results) {
            if(results) {// if the url is archived
              fs.readFile(path.join(archive.paths.archivedSites,url), 'utf8', function (err, content) {
                if (err) {
                  console.log('fs.readFile failed :(\n', err);
                } else {
                  statusCode = 302;
                  headers['Content-Type'] = 'text/html';
                  res.writeHead(statusCode, headers);
                  res.end(content); // send back the content of the file
                }
              });
            } else {// if url is in sites.txt but not archived
              fs.readFile(__dirname + '/public/loading.html', 'utf8', function (err, content) {
                statusCode = 302;
                headers['Content-Type'] = 'text/html';
                res.writeHead(statusCode, headers);
                res.end(content); // send back loading.html
              });
            }
          });
        } else {//if the url is not in sites.txt
          archive.addUrlToList(url, function(results) { // add url to sites.txt
            if(results) { // if url added succefully to sites.txt
              console.log('inside add url to sites.txt req handler');
              fs.readFile(__dirname + '/public/loading.html', 'utf8', function (err, content) {
                statusCode = 302;
                headers['Content-Type'] = 'text/html';
                res.writeHead(statusCode, headers);
                res.end(content); // send back loading.html
              });
            }
          });
        }
      });
    });
  }
};
