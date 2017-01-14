var zoneIds = [ 'GMZ830', 'GMZ873' ];
var zoomOutFactors = [ 0, 10 ];
var save_directory = 'screenshots';

module.exports = {
  'Body is visible': function(browser) {
    browser.url(`http://localhost:3000/`).waitForElementVisible('body', 1000);
  },
  'Viewport Screenshots': function(browser) {
    zoneIds.forEach(function(zoneId) {
      zoomOutFactors.forEach(function(zoomOutFactor) {
        browser
          .url(`http://localhost:3000/#/zoneId/${zoneId}?zoomOutFactor=${zoomOutFactor}`)
          .waitForElementVisible('body', 1000);
        browser.resizeWindow(750, 1334);
        browser.pause(3000);
        browser.saveScreenshot(`${save_directory}/${zoneId}.${zoomOutFactor}.png`, function() {
          console.log(`Took snapshot of ${zoneId} @ ${zoomOutFactor}`);
        });
      });
    });
    browser.end();
  }
};