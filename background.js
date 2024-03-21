// This event is fired each time the extension is loaded.
chrome.runtime.onInstalled.addListener(() => {
    // Set up the initial map of keywords to URLs in local storage.
    const initialMap = {
      'jira': 'https://jira.com',
      'git': 'https://github.com'
    };
    chrome.storage.local.set({ 'urlMap': initialMap });
  });
  
  // This function updates the map in local storage with a new keyword and URL.
  function updateMap(keyword, url) {
    chrome.storage.local.get('urlMap', (result) => {
      const urlMap = result.urlMap || {};
      urlMap[keyword] = url;
      chrome.storage.local.set({ 'urlMap': urlMap }, () => {
        console.log('Keyword map updated.');
      });
    });
  }
  
  // This event is fired with the user accepts the input in the omnibox.
  chrome.omnibox.onInputEntered.addListener((text) => {
    // Retrieve the map from local storage.
    chrome.storage.local.get('urlMap', (result) => {
      const urlMap = result.urlMap;
      const redirectUrl = urlMap[text];
  
      if (redirectUrl) {
        // If the keyword exists, redirect to the stored URL.
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          chrome.tabs.update(tabs[0].id, {url: redirectUrl});
        });
      } else {
        // If the keyword doesn't exist, show the HTML page to add a new keyword.
        chrome.tabs.create({ url: 'addKeyword.html' });
      }
    });
  });
  
  // Listen for messages from the addKeyword.html page to update the map.
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateMap' && request.keyword && request.url) {
      updateMap(request.keyword, request.url);
      sendResponse({status: 'success'});
    }
  });
  