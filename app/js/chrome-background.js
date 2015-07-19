/* global chrome */
'use strict';
chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html',
    {
      'id': 'mainWindow',
      'resizable': true,
      'innerBounds': { 'width': 360, 'height': 540 }
    });
});
