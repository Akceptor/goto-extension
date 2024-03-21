//Constants
const API_URL = 'https://crudcrud.com/api/6c59f7774d224b32a35108e0b0dac2ff/mygoto';

// This event is fired each time the extension is loaded.
chrome.runtime.onInstalled.addListener(() => {
    // Set up the initial map of keywords to URLs in local storage.
    loadDataFromServer();
  });
  
// This function updates the map in local storage and sends it to the server.
  function updateMap(keyword, url) {
    chrome.storage.local.get('urlMap', (result) => {
      const urlMap = result.urlMap || {};
      urlMap[keyword] = url;
      chrome.storage.local.set({ 'urlMap': urlMap }, () => {
        console.log('Keyword map updated.');

        const dataToSend = Object.keys(urlMap).map(keyword => ({
          keyword: keyword,
          url: urlMap[keyword]
        }));
      
        // Wrap the array in an object with a 'data' property
        const dataObject = { data: dataToSend }
        // Send the updated map to the server
        sendDataToServer(JSON.stringify(dataObject));
      });
    });
  }

// This function sends the data to the server via a POST request using the Fetch API.
function sendDataToServer(data) {
  fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: data
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); // Parse the JSON response body
  })
  .then(data => {
    // Create an object with only 'status' and 'id' fields
    const result = {
      status: 'success',
      id: data._id
    };
    console.log('Response from server:', result);
    return result; // Return the result object
  })
  .catch(error => {
    console.error('Failed to send data to server:', error);
    return { status: 'error', id: null }; // Return error status if the fetch fails
  });
}

// This function loads data from the server and initializes the local storage with it.
function loadDataFromServer() {
  fetch(API_URL)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(dataArray => {
      // Initialize an empty map to store the combined keyword-url pairs
      const urlMap = {};

      // Iterate over each object in the dataArray
      dataArray.forEach(dataObject => {
        // Check if the dataObject has a 'data' property
        if (dataObject.data) {
          // Extract the 'data' array from the dataObject
          const innerDataArray = dataObject.data;
          // Transform the array into a map of keywords to URLs
          innerDataArray.forEach(item => {
            urlMap[item.keyword] = item.url;
          });
        }
      });

      // Set the combined map in local storage
      chrome.storage.local.set({ 'urlMap': urlMap }, () => {
        console.log('Initial data loaded from server and set in local storage.');
      });
    })
    .catch(error => {
      console.error('Failed to load data from server:', error);
    });
}


  
  // This event is fired with the user accepts the input in the omnibox.
  chrome.omnibox.onInputEntered.addListener((text) => {
    // Retrieve the map from local storage.
    chrome.storage.local.get('urlMap', (result) => {
      const urlMap = result.urlMap || {};
      let redirectUrl = urlMap[text];
      if (redirectUrl) {
        if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
        redirectUrl = `https://${redirectUrl}`;
      }
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          console.log("opening: ", redirectUrl)
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
