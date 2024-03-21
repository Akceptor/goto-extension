// Function to update the table with the keywords and URLs.
function updateTable() {
    const table = document.getElementById('keywordsTable');
    chrome.storage.local.get('urlMap', (result) => {
      const urlMap = result.urlMap || {};
      // Clear existing table rows.
      while (table.rows.length > 1) {
        table.deleteRow(1);
      }
      // Populate the table with keywords and URLs.
      Object.keys(urlMap).forEach((key) => {
        let row = table.insertRow(-1);
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        cell1.textContent = key;
        cell2.textContent = urlMap[key];
      });
    });
  }
  
  // Event listener for DOM content loaded.
  document.addEventListener('DOMContentLoaded', updateTable);
  
  // Event listener for the Add button click.
  document.getElementById('add').onclick = function() {
    const keyword = document.getElementById('keyword').value;
    const url = document.getElementById('url').value;
  
    // Send a message to the background script to update the map.
    chrome.runtime.sendMessage({
      action: 'updateMap',
      keyword: keyword,
      url: url
    }, (response) => {
      if (response.status === 'success') {
        console.log('New keyword added.');
        // Close the current tab after a short delay to allow for the console message.
        setTimeout(() => window.close(), 1000);
        // Update the table with the new keyword.
        updateTable();
      }
    });
  };
  