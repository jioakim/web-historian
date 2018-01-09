// Use the code in `archive-helpers.js` to actually download the urls
// that are waiting.
var archive = require('../helpers/archive-helpers');
var schedule = require('node-schedule');

var job = schedule.scheduleJob('*/10 * * * * *', function(){
  archive.readListOfUrls(function(urls){
    var nonEmptyUrls = [];
    for (var i = 0; i < urls.length; i++) {
      if (urls[i].length > 1) {
        nonEmptyUrls.push(urls[i]);
      }
    }
    if (nonEmptyUrls.length > 0) {
      archive.downloadUrls(nonEmptyUrls);
    }
    //console.log('inside sheduled job, list of urls:', urls);
  });
});