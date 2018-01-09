var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var eol = require('eol');
var request = require('request');

/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

exports.paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../archives/sites'),
  list: path.join(__dirname, '../archives/sites.txt')
};

// Used for stubbing paths for tests, do not modify
exports.initialize = function(pathsObj) {
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

exports.readListOfUrls = function(callback) {
  fs.readFile(exports.paths.list, 'utf8', function (err, content) {
    if(err) {
      console.log('error in readListOfUrls:', err);
      callback(err);
    } else {
      var urls = eol.split(content);
      //console.log('success in readListOfUrls', urls);
      callback(urls);
    }
  });
};

exports.isUrlInList = function(url, callback) {
  //console.log(url)
  exports.readListOfUrls(function(data){
    //console.log('sites.txt: ',data.length);
    if (data.indexOf(url) > -1) {
      //console.log('inside isUrlArchived true');
      callback(true);
    } else {
      callback(false);
    }
  });
};

exports.addUrlToList = function(url, callback) {
  exports.isUrlInList(url, function(siteExists) {
    if(!siteExists) {
      //console.log(url);
      url += '\r\n';
      //need solution for Ioannis
      fs.appendFile(exports.paths.list, url, function(err) {
        if (err) {
          callback(false);
        } else {
          callback(true);
        }
      });
    } else {
      //console.log(url,' already exists in archive!');
      callback(false);
    }
  });
};

exports.isUrlArchived = function(url, callback) {
  fs.access(path.join(exports.paths.archivedSites, url), function(err){
    callback(!err);
  });
};

exports.downloadUrls = function(urls) {
  urls.forEach(function(url){
  //   exports.isUrlArchived(url, function(isArchived){
  //     if (!isArchived) {
        //urlWithHttp = url;
        urlWithHttp = 'http://' + url;
        request(urlWithHttp, function(error, response, body){
          if (error) {
            console.log('inside download urls request error:', error);
          } else {
            fs.writeFile(path.join(exports.paths.archivedSites, url), body, function(error){
              if (error) {
                console.log('inside download urls error:', error);
              } else {
                //console.log('inside download urls success:', response);
              }
            });
          }
        });
  //     }
  //   });
  });
};
