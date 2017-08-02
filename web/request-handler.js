var path = require('path');
var archive = require('../helpers/archive-helpers');
var fs = require('fs');
// require more modules/folders here!

exports.handleRequest = function (req, res) {
  var statusCode;
  var headers = defaultCorsHeaders;
  archive.isUrlInList(req.url.slice(1) , function(results) {
    if(req.method === 'GET') {
      if(req.url === '/' || req.url === '/styles.css'){
        if(req.url === '/styles.css'){
          headers['Content-Type'] = 'text/css';
        }
        //console.log(req.url);
        //console.log(req.method);
        fs.readFile(__dirname + '/public/index.html', 'utf8', function (err, content) {
          if (err) {
            //console.log('fs.readFile failed :(\n', err)
          } else {
            statusCode = 200;
            headers['Content-Type'] = 'text/html';
            res.writeHead(statusCode, headers);
            res.end(content);
          }
        });
        // if requested url is www.google.com then :
        //1. www.google.com should exist in sites.txt AND
        //2. www.google.com should be a file under sites
      } else if (req.url.length > 1) {
        archive.isUrlArchived(req.url, function(isArchived) {
          if(isArchived) {
            fs.readFile(path.join(archive.paths.archivedSites,req.url),'utf8', function (err, content) {
              if(err) {
                console.log('error',err);
              } else {
                statusCode = 200;
                headers['Content-Type'] = 'text/html';
                res.writeHead(statusCode, headers);
                res.end(content);
              }
            });
          } else {
           console.log('url does not exist');
           statusCode = 404;
           res.writeHead(statusCode, headers);
           res.end();
          }
        });
      }
      // else if (results === false){
      //   console.log('url does not exist');
      //   statusCode = 404;
      //   res.writeHead(statusCode, headers);
      //   res.end();
      // }
    }
  });
  if(req.method === 'POST') {
    var dataStream = '';
    req.on('data', (data) => {
      dataStream += data;
    });
    req.on('end', () => {
      var url = dataStream.slice(4);
      archive.isUrlInList(url, function(results) {
        if(results) {
          archive.isUrlArchived(url, function(results) {
            if(results) {
              fs.readFile(path.join(paths.archivedSites,url), 'utf8', function (err, content) {
                if (err) {
                  console.log('fs.readFile failed :(\n', err)
                } else {
                  statusCode = 302;
                  headers['Content-Type'] = 'text/html';
                  res.writeHead(statusCode, headers);
                  res.end(content);
                }
              });
            }
          });
        } else {
          archive.addUrlToList(url, function(results) {
            if(results) {
              fs.readFile(__dirname + '/public/loading.html', 'utf8', function (err, content) {
                statusCode = 302;
                headers['Content-Type'] = 'text/html';
                res.writeHead(statusCode, headers);
                res.end(content);
              });
            }
          });
        }
      });
    });
  }
  console.log(req.url.slice(1))


  // res.end(archive.paths.list);
};

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};
