// Global variables
const itemForm = document.getElementById('item-form');
const itemInput = document.getElementById('item-input');
const itemList = document.getElementById('item-list');
const itemFilter = document.getElementById('filter');
const formBtn = itemForm.querySelector('button');
const clearBtn = document.getElementById('clear');
const clearAll = document.getElementById('clear-all-items');
const closeModal = document.getElementById('cancel');
let isEditMode = false;
let itemBeingEdited = null;
let currentId = 1;

// Display items 
function displayItems() {
    const itemsFromStorage = getItemsFromStorage();
    itemsFromStorage.forEach(item => addItemToDom(item.text, item.id));
    checkUI();
}

// Function to add item 
function onAddItemSubmit(event) {
    event.preventDefault();

    const newItem = itemInput.value.trim();
    if (newItem === '') {
        alert('Please add an item');
        return;
    }

    // Check for edit mode
    if (isEditMode) {
        updateItem(itemBeingEdited, newItem);
        updateItemInStorage(itemBeingEdited.getAttribute('item-number'), newItem);
        itemBeingEdited.classList.remove('edit-mode');
        isEditMode = false;
    } else {
        if (checkIfItemExists(newItem)) {
            alert('Item already on the list!');
            return;
        }
        // Create item DOM element 
        addItemToDom(newItem, currentId);

        // Add item to local storage
        addItemToStorage(newItem, currentId);
        currentId++;
    }

    checkUI();
    itemInput.value = '';
}

// Add item to DOM
function addItemToDom(item, id) {
    const li = document.createElement('li');
    li.setAttribute('draggable', 'true');
    li.setAttribute('item-number', id);
    li.appendChild(document.createTextNode(item));

    const button = createButton('remove-item btn-link text-red');
    li.appendChild(button);
    itemList.appendChild(li);
}

// Update item in the DOM
function updateItem(itemElement, newValue) {
    itemElement.firstChild.textContent = newValue;
}

// Create Button 
function createButton(classes) {
    const button = document.createElement('button');
    button.className = classes;
    const icon = createIcon('fa-solid fa-minus');
    button.appendChild(icon);
    return button;
}

// Create Icon
function createIcon(classes) {
    const icon = document.createElement('i');
    icon.className = classes;
    return icon;
}

// Adding item to storage
function addItemToStorage(item, id) {
    const itemsFromStorage = getItemsFromStorage();
    itemsFromStorage.push({ text: item, id });
    localStorage.setItem('items', JSON.stringify(itemsFromStorage));
}

// Update item in storage
function updateItemInStorage(id, newValue) {
    let itemsFromStorage = getItemsFromStorage();
    itemsFromStorage = itemsFromStorage.map(item => 
        item.id == id ? { ...item, text: newValue } : item
    );
    localStorage.setItem('items', JSON.stringify(itemsFromStorage));
}

// Get items from storage 
function getItemsFromStorage() {
    let itemsFromStorage;
    if (localStorage.getItem('items') === null) {
        itemsFromStorage = [];
    } else {
        itemsFromStorage = JSON.parse(localStorage.getItem('items'));
    }
    return itemsFromStorage;
}

// Remove items from storage 
function onClickItem(event) {
    if (event.target.parentElement.classList.contains('remove-item')) {
        removeItem(event.target.parentElement.parentElement);
    } else {
        setItemToEdit(event.target);
    }
}

// Prevent duplicate items
function checkIfItemExists(item) {
    const itemsFromStorage = getItemsFromStorage();
    return itemsFromStorage.some(i => i.text === item);
}

// Setting item to edit
function setItemToEdit(item) {
    isEditMode = true;
    itemBeingEdited = item;
    itemList.querySelectorAll('li').forEach(item => item.classList.remove('edit-mode'));
    item.classList.add('edit-mode');
    formBtn.innerHTML = '<i class="fa-solid fa-pen"></i>Update Item';
    formBtn.style.backgroundColor = '#388E3C';
    itemInput.value = item.firstChild.textContent;
}

// Remove List Item
function removeItem(item) {
    const itemId = item.getAttribute('item-number');
    removeItemFromStorage(itemId);
    item.remove();
    checkUI();
}

// Remove item from local storage
function removeItemFromStorage(id) {
    let itemsFromStorage = getItemsFromStorage();
    itemsFromStorage = itemsFromStorage.filter(item => item.id != id);
    localStorage.setItem('items', JSON.stringify(itemsFromStorage));
}

// Clear all items
function clearItems() {
    while (itemList.firstChild) {
        itemList.removeChild(itemList.firstChild);
    }
    localStorage.removeItem('items');
    location.reload();
    checkUI();
}
clearAll.addEventListener('click', clearItems);

// Filter Items
function filterItems(event) {
    const items = document.querySelectorAll('li');
    const text = event.target.value.toLowerCase();

    items.forEach(item => {
        const itemName = item.firstChild.textContent.toLocaleLowerCase();
        item.style.display = itemName.includes(text) ? 'flex' : 'none';
    });
}

// Check UI
function checkUI() {
    itemInput.value = '';
    const items = document.querySelectorAll('li');
    if (items.length === 0) {
        clearBtn.style.display = 'none';
        itemFilter.style.display = 'none';
    } else {
        clearBtn.style.display = 'block';
        itemFilter.style.display = 'block';
    }
    formBtn.innerHTML = '<i class="fa-solid fa-plus"></i>Add Item';
    formBtn.style.backgroundColor = '#388E3C';
    isEditMode = false;
}

// Initialize app
function init() {
    // Event Listeners
    itemForm.addEventListener('submit', onAddItemSubmit);
    itemList.addEventListener('click', onClickItem);
    clearBtn.addEventListener('click', openModal);
    itemFilter.addEventListener('input', filterItems);
    document.addEventListener('DOMContentLoaded', function() {
        displayItems();  // Display existing items from local storage
        restoreListOrder();  // Restore the order from localStorage
    });
    checkUI();
}

init();

// Draggable list functionality

const list = itemList;
let draggedItem = null;
let placeholder = document.createElement('li');

// Style the placeholder
placeholder.className = "placeholder";
placeholder.style.height = "30px"; 
placeholder.style.backgroundColor = "#f0f0f0";
placeholder.style.border = "2px solid #ccc";
placeholder.style.margin = "5px";

list.addEventListener("dragstart", function(e) {
    if (e.target && e.target.nodeName === "LI") {
        draggedItem = e.target;
        setTimeout(() => {
            e.target.style.display = "none";
        }, 0);
    }
});

list.addEventListener("dragend", function(e) {
    setTimeout(() => {
        draggedItem.style.display = "flex";
        draggedItem = null;
        if (placeholder.parentNode) {
            placeholder.parentNode.removeChild(placeholder);
        }
    }, 0);
    saveListOrder();  // Save the order after every drag operation
});

list.addEventListener("dragover", function(e) {
    e.preventDefault();
    if (e.target && e.target.nodeName === "LI" && e.target !== draggedItem) {
        let targetRect = e.target.getBoundingClientRect();
        let halfwayPoint = targetRect.top + targetRect.height / 2;

        if (e.clientY < halfwayPoint) {
            list.insertBefore(placeholder, e.target);
        } else {
            list.insertBefore(placeholder, e.target.nextSibling);
        }
    }
});

list.addEventListener("drop", function(e) {
    e.preventDefault();
    if (placeholder.parentNode) {
        list.insertBefore(draggedItem, placeholder);
        placeholder.parentNode.removeChild(placeholder);
        saveListOrder(); // Save the order immediately
    }
});

// Save the order
function saveListOrder() {
    const items = list.querySelectorAll("li");
    const order = Array.from(items).map(item => item.getAttribute('item-number'));
    localStorage.setItem('listOrder', JSON.stringify(order));
}

// Restore the order
function restoreListOrder() {
    const savedOrder = JSON.parse(localStorage.getItem('listOrder'));
    if (savedOrder) {
        savedOrder.forEach(itemNumber => {
            const item = list.querySelector(`[item-number="${itemNumber}"]`);
            list.appendChild(item);
        });
    }
}

// Open Modal 
let modal = document.getElementById('clear-items-modal');
function openModal() {
    modal.style.display = 'block';
}

// Close modal after clicking cancel
function closeModal() {
    modal.style.display = 'none';
}
closeModal.addEventListener('click', closeModal);
