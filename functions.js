function validateAndAddBill() {
  const customerName = document.getElementById("customer_name").value;
  const customerEmail = document.getElementById("customer_email").value;
  const items = [];

  const itemRows = document.querySelectorAll("#items-container .item-row");
  itemRows.forEach(row => {
    const itemName = row.querySelector(".item_name").value;
    const quantity = row.querySelector(".quantity").value;
    const price = row.querySelector(".price").value;
    const total = quantity * price;

    items.push({
      ITEM_NAME: itemName,
      QUANTITY: quantity,
      PRICE: price,
      TOTAL: total
    });
  });

  const data = {
    CUSTOMER_NAME: customerName,
    CUSTOMER_EMAIL: customerEmail,
    ITEMS: items
  };

  google.script.run.withSuccessHandler(onSuccess).withFailureHandler(onFailure).addBill(data);
}

function onSuccess(response) {
  alert(response.message);
}

function onFailure(error) {
  alert("Error: " + error.message);
}

function removeItemRow(button) {
  const row = button.parentNode;
  row.parentNode.removeChild(row);
}

function fetchInventory() {
  google.script.run.withSuccessHandler(renderInventory).getInventory();
}

function renderInventory(response) {
  if (response.success) {
    const inventoryData = response.data;
    const itemSelectElements = document.querySelectorAll(".item_name");
    itemSelectElements.forEach(select => {
      select.innerHTML = '<option value="" disabled selected>Select an item</option>';
      inventoryData.forEach(item => {
        const option = document.createElement("option");
        option.value = item[0];
        option.textContent = item[0];
        select.appendChild(option);
      });
    });
  } else {
    alert(response.message);
  }
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("add-item-button").addEventListener("click", function() {
    const template = document.getElementById("item-row-template").content.cloneNode(true);
    document.getElementById("items-container").appendChild(template);
    fetchInventory();
  });

  fetchInventory();
});
