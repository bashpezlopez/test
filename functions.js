
    let inventoryData = [];
 
 
 
 
    function showSection(sectionId) {
       document.getElementById('create-bill').style.display = 'none';
       document.getElementById('dashboard').style.display = 'none';
       document.getElementById(sectionId).style.display = 'block';
 
       document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
       document.querySelector(`.sidebar a[href='#${sectionId}']`).classList.add('active');
     }
 
 function validateAndAddBill() {
   const customerName = document.getElementById('customer_name').value.trim();
   const customerEmail = document.getElementById('customer_email').value.trim();
   let allItemsValid = true;
 
   if (!customerName) {
     document.getElementById('customer_name-error').textContent = 'Customer name is required.';
     allItemsValid = false;
   } else {
     document.getElementById('customer_name-error').textContent = '';
   }
 
   if (!validateEmail(customerEmail)) {
     document.getElementById('customer_email-error').textContent = 'Please enter a valid email address.';
     allItemsValid = false;
   } else {
     document.getElementById('customer_email-error').textContent = '';
   }
 
   document.querySelectorAll('.item-row').forEach(row => {
     const itemName = row.querySelector('.item_name').value;
     const quantity = row.querySelector('.quantity').value;
 
     if (!itemName) {
       row.querySelector('.item_name + .error-message').textContent = 'Item name is required.';
       allItemsValid = false;
     } else {
       row.querySelector('.item_name + .error-message').textContent = '';
     }
 
     if (!quantity || parseFloat(quantity) <= 0) {
       row.querySelector('.quantity + .error-message').textContent = 'Please enter a valid quantity.';
       allItemsValid = false;
     } else {
       row.querySelector('.quantity + .error-message').textContent = '';
     }
   });
 
   if (allItemsValid) {
     addBill();
   }
 }
 
 function validateEmail(email) {
   const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   return re.test(String(email).toLowerCase());
 }
 
 function addBill() {
   const items = [];
   document.querySelectorAll('.item-row').forEach(row => {
     const quantity = parseFloat(row.querySelector('.quantity').value) || 0;
     const price = parseFloat(row.querySelector('.price').value) || 0;
     const total = quantity * price;
     items.push({
       ITEM_NAME: row.querySelector('.item_name').value,
       QUANTITY: quantity,
       PRICE: price,
       TOTAL: total,
     });
   });
 
   const data = {
     CUSTOMER_NAME: document.getElementById('customer_name').value,
     CUSTOMER_EMAIL: document.getElementById('customer_email').value,
     ITEMS: items,
   };
 
   console.log("Data to be added:", data); // Debugging line
 
   google.script.run.withSuccessHandler(() => {
     showSnackbar('Bill added successfully!');
     clearForm();
   }).withFailureHandler(error => {
     console.error("Error adding bill:", error);
   }).addBill(data);
 }
 
 function clearForm() {
   document.getElementById('customer_name').value = '';
   document.getElementById('customer_email').value = '';
   document.getElementById('items-container').innerHTML = '';
   addItemRow();
   updateTotalSummary();
 }
 
 function loadInventory(callback) {
   google.script.run.withSuccessHandler(function(data) {
     inventoryData = data;
     if (callback) callback();
   }).getInventory();
 }
 
 function getSelectedItems() {
   const selectedItems = [];
   document.querySelectorAll('.item_name').forEach(dropdown => {
     const selectedItem = dropdown.value;
     if (selectedItem) {
       selectedItems.push(selectedItem);
     }
   });
   return selectedItems;
 }
 
 function populateItemDropdown(dropdown, preserveSelection = false) {
   const selectedItems = getSelectedItems();
   const previousValue = dropdown.value;
 
   dropdown.innerHTML = '<option value="" disabled selected>Select an item</option>';
   inventoryData.forEach(row => {
     if (!selectedItems.includes(row[1]) || row[1] === previousValue) {
       const option = document.createElement('option');
       option.value = row[1]; // ITEM_NAME
       option.textContent = row[1]; // ITEM_NAME
       dropdown.appendChild(option);
     }
   });
 
   if (preserveSelection && previousValue) {
     dropdown.value = previousValue;
   }
 }
 
 function addItemRow() {
   const itemRowTemplate = document.getElementById('item-row-template').content.cloneNode(true);
   document.getElementById('items-container').appendChild(itemRowTemplate);
   const newRow = document.getElementById('items-container').lastElementChild;
   populateItemDropdown(newRow.querySelector('.item_name'), true);
   addEventListeners();
   toggleRemoveButtons();
   updateTotalSummary();
 }
 
 function removeItemRow(button) {
   const rows = document.querySelectorAll('.item-row');
   if (rows.length > 1) {
     button.closest('.item-row').remove();
     toggleRemoveButtons();
     updateTotalSummary();
     document.querySelectorAll('.item_name').forEach(dropdown => {
       populateItemDropdown(dropdown, true);
     });
   } else {
     alert('At least one item is required.');
   }
 }
 
 function toggleRemoveButtons() {
   const rows = document.querySelectorAll('.item-row');
   rows.forEach(row => {
     const removeButton = row.querySelector('.remove-item-button');
     if (rows.length > 1) {
       removeButton.style.display = 'inline';
     } else {
       removeButton.style.display = 'none';
     }
   });
 }
 
 function updatePriceAndTotal(row) {
   const selectedItem = row.querySelector('.item_name').value;
   const quantity = parseFloat(row.querySelector('.quantity').value) || 0;
   const item = inventoryData.find(row => row[1] === selectedItem); // Find selected item in inventory
   if (item) {
     const price = parseFloat(item[3]) || 0; // PRICE
     const priceField = row.querySelector('.price');
     if (priceField) {
       priceField.value = price;
     }
     const total = quantity * price;
     const totalField = row.querySelector('.total');
     if (totalField) {
       totalField.value = total;
     }
   }
   updateTotalSummary();
 }
 
 function updateTotalSummary() {
   const summaryContent = document.getElementById('summary-content');
   summaryContent.innerHTML = '';
   let grandTotal = 0;
   document.querySelectorAll('.item-row').forEach(row => {
     const itemName = row.querySelector('.item_name').value;
     const quantity = parseFloat(row.querySelector('.quantity').value) || 0;
     const price = parseFloat(row.querySelector('.price').value) || 0;
     const total = quantity * price;
     if (itemName && quantity && price) {
       const itemSummary = document.createElement('div');
       itemSummary.textContent = `${itemName} (${quantity}) - $${total.toFixed(2)}`;
       summaryContent.appendChild(itemSummary);
       grandTotal += total;
     }
   });
   const grandTotalSummary = document.createElement('div');
   grandTotalSummary.textContent = `Total Amount: $${grandTotal.toFixed(2)}`;
   summaryContent.appendChild(grandTotalSummary);
 }
 
 function addEventListeners() {
   document.querySelectorAll('.item_name').forEach(dropdown => {
     dropdown.addEventListener('change', function() {
       updatePriceAndTotal(dropdown.closest('.item-row'));
     });
   });
 
   document.querySelectorAll('.quantity').forEach(input => {
     input.addEventListener('input', function() {
       updatePriceAndTotal(input.closest('.item-row'));
     });
   });
 
   document.getElementById('customer_email').addEventListener('input', function() {
     validateEmailInput(this);
   });
 
   document.getElementById('customer_name').addEventListener('input', function() {
     validateTextInput(this);
   });
 
   document.querySelectorAll('.item_name').forEach(dropdown => {
     dropdown.addEventListener('change', function() {
       validateDropdown(dropdown);
     });
   });
 
   document.querySelectorAll('.quantity').forEach(input => {
     input.addEventListener('input', function() {
       validateQuantity(input);
     });
   });
 }
 
 function validateEmailInput(input) {
   const email = input.value;
   const emailError = document.getElementById('customer_email-error');
   if (!validateEmail(email)) {
     emailError.textContent = 'Please enter a valid email address.';
     emailError.style.display = 'block';
   } else {
     emailError.textContent = '';
     emailError.style.display = 'none';
   }
 }
 
 function validateTextInput(input) {
   const errorSpan = document.getElementById(`${input.id}-error`);
   if (!input.value.trim()) {
     errorSpan.textContent = 'This field is required.';
     errorSpan.style.display = 'block';
   } else {
     errorSpan.textContent = '';
     errorSpan.style.display = 'none';
   }
 }
 
 function validateDropdown(dropdown) {
   const errorSpan = dropdown.nextElementSibling;
   if (!dropdown.value) {
     errorSpan.textContent = 'Please select an item.';
     errorSpan.style.display = 'block';
   } else {
     errorSpan.textContent = '';
     errorSpan.style.display = 'none';
   }
 }
 
 function validateQuantity(input) {
   const errorSpan = input.nextElementSibling;
   if (!input.value || parseFloat(input.value) <= 0) {
     errorSpan.textContent = 'Please enter a valid quantity.';
     errorSpan.style.display = 'block';
   } else {
     errorSpan.textContent = '';
     errorSpan.style.display = 'none';
   }
 }
 
 function validateEmail(email) {
   const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   return re.test(String(email).toLowerCase());
 }
 
 function showSnackbar(message) {
   const snackbar = document.getElementById('snackbar');
   snackbar.textContent = message;
   snackbar.className = 'show';
   setTimeout(() => { snackbar.className = snackbar.className.replace('show', ''); }, 3000);
 }
 
 window.onload = function() {
   loadInventory(function() {
     const initialRow = document.querySelector('.item-row');
     populateItemDropdown(initialRow.querySelector('.item_name'));
     addEventListeners();
     toggleRemoveButtons();
     updateTotalSummary();
   });
   document.getElementById('add-item-button').addEventListener('click', addItemRow);
 };