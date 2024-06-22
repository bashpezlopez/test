const SPREADSHEET_ID = '1UY1wQqlLy6v3m_7W3Lz7lM7FyW9eJWhc1Z0TudyTvcs'; // Replace with your spreadsheet ID

function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate();
}

function addBill(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Sheet1'); // Replace with your sheet name
    const lastRow = sheet.getLastRow();
    const newId = lastRow > 1 ? sheet.getRange(lastRow, 1).getValue() + 1 : 1; // Generate new ID
    const date = new Date(); // Get current date
    data.ITEMS.forEach(item => {
      sheet.appendRow([newId, date, data.CUSTOMER_NAME, data.CUSTOMER_EMAIL, item.ITEM_NAME, item.QUANTITY, item.PRICE, item.TOTAL]);
    });
    return { success: true, message: 'Bill added successfully.' };
  } catch (error) {
    Logger.log(error);
    return { success: false, message: 'Error adding bill: ' + error.message };
  }
}

function getInventory() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('inventory'); // Replace with your sheet name
    const data = sheet.getRange("A2:D" + sheet.getLastRow()).getValues(); // Get inventory data
    return { success: true, data: data };
  } catch (error) {
    Logger.log(error);
    return { success: false, message: 'Error fetching inventory: ' + error.message };
  }
}