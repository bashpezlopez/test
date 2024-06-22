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

  // Add your Google Apps Script call here
  // google.script.run.withSuccessHandler(() => {
  //   showSnackbar('Bill added successfully!');
  //   clearForm();
  // }).withFailureHandler(error => {
  //   console.error("Error adding bill:", error);
  // }).addBill(data);
}

function clearForm() {
  document.getElementById('customer_name').value = '';
  document.getElementById('customer_email').value = '';
  document.getElementById('items-container').innerHTML = '';
  addItemRow();
  updateTotalSummary();
}

function addItemRow() {
  const itemRowTemplate = document.getElementById('item-row-template').content.cloneNode(true);
  document.getElementById('items-container').appendChild(itemRowTemplate);
  const newRow = document.getElementById('items-container').lastElementChild;
  addEventListeners(newRow);
  toggleRemoveButtons();
  updateTotalSummary();
}

function removeItemRow(button) {
  const rows = document.querySelectorAll('.item-row');
  if (rows.length > 1) {
    button.closest('.item-row').remove();
    toggleRemoveButtons();
    updateTotalSummary();
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
  const price = 10; // Example price, replace with actual price from inventory data
  const priceField = row.querySelector('.price');
  if (priceField) {
    priceField.value = price;
  }
  const total = quantity * price;
  const totalField = row.querySelector('.total');
  if (totalField) {
    totalField.value = total;
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

function addEventListeners(row) {
  row.querySelector('.item_name').addEventListener('change', function() {
    updatePriceAndTotal(row);
  });

  row.querySelector('.quantity').addEventListener('input', function() {
    updatePriceAndTotal(row);
  });
}

document.getElementById('add-item-button').addEventListener('click', addItemRow);

window.onload = function() {
  addItemRow(); // Add the initial row
};
