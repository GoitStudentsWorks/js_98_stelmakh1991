import axios from 'https://cdn.skypack.dev/axios';

import Pagination from 'tui-pagination';
import 'tui-pagination/dist/tui-pagination.css';

import { renderShoppingListFromLocalStorage } from './local-storage';
import { localStorageItems } from './local-storage';
import { renderBookFromLocalStorageWithoutFetch } from './local-storage';
import { shoppingList } from './local-storage';

// const shoppingList = document.querySelector('.shopping-list');
const placeholder = document.querySelector('.shop-list-placeholder');
// const localStorageItems = JSON.parse(localStorage.getItem('books')) || [];
const paginationContainer = document.querySelector('.tui-pagination');

async function getBooksAndAddToLocalStorage(array) {
  const localStorageArray = [];

  try {
    // Use Promise.all to await all Axios requests concurrently
    await Promise.all(
      array.map(async id => {
        const url = `https://books-backend.p.goit.global/books/${id}`;
        const response = await axios.get(url);
        localStorageArray.push(response.data); // Push entire book object to the array
      })
    );

    // Convert the array to a string before storing it in local storage
    localStorage.setItem('books', JSON.stringify(localStorageArray));
  } catch (error) {
    console.error('Error fetching books:', error);
    // Optionally, you can handle the error here, e.g., display an error message to the user
    iziToast.error({
      title: 'Error',
      message: `Oops! Something went wrong while fetching books. Please try again later or contact support if the issue persists.`,
      position: 'topRight',
    });
  }
}

const booksToFetch = [
  '643282b1e85766588626a0dc',
  '643282b1e85766588626a080',
  '643282b1e85766588626a0b2',
  '643282b1e85766588626a085',
  '643282b1e85766588626a085',
  '643282b1e85766588626a0dc',
  '643282b1e85766588626a086',
  '643282b1e85766588626a0dc',
  '643282b1e85766588626a085',
  '643282b1e85766588626a0b2',
  '643282b1e85766588626a086',
  '643282b1e85766588626a086',
  '643282b1e85766588626a085',
  '643282b1e85766588626a085',
  '643282b1e85766588626a0dc',
  '643282b1e85766588626a086',
  '643282b1e85766588626a0dc',
  '643282b1e85766588626a085',
  '643282b1e85766588626a0b2',
  '643282b1e85766588626a086',
];

getBooksAndAddToLocalStorage(booksToFetch);

// ===================== Get from local storage ========================================================================



// ============================ Placeholder =======================================

renderShoppingListFromLocalStorage();

function toggleVisibility() {
    if (localStorageItems.length === 0) {
        placeholder.style.display = 'block'; // Display placeholder if no items left
    } else {
        placeholder.style.display = 'none'; // Hide placeholder if items exist
    }
}

toggleVisibility();

// =========================== Pagination ============================================

const pagination = new Pagination(paginationContainer, {
  totalItems: localStorageItems.length, // Set the total number of items
  itemsPerPage: getWindowWidth() <= 767 ? 4 : 3,
  visiblePages: 3, // Set the number of visible pages
  page: 1, // Set the initial page
    template: {
        page: '<a href="#" class="tui-page-btn">{{page}}</a>',
        currentPage: '<strong class="tui-page-btn tui-is-selected">{{page}}</strong>',
        moveButton:
             '<a href="#" class="tui-page-btn tui-{{type}}">' +
                 '<span class="tui-ico-{{type}}">{{type}}</span>' +
             '</a>',
        disabledMoveButton:
             '<span class="tui-page-btn tui-is-disabled tui-{{type}}">' +
                 '<span class="tui-ico-{{type}}">{{type}}</span>' +
             '</span>',
       moreButton:
             '<a href="#" class="tui-page-btn tui-{{type}}-is-ellip">' +
                 '<span class="tui-ico-ellip">...</span>' +
             '</a>'
     }
});

function getWindowWidth() {
  return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
}

// Handle page change event
pagination.on('afterMove', function (eventData) {
  renderBooks(eventData.page); // Render books based on the current page
});

function renderBooks(page) {
  shoppingList.innerHTML = ''; // Clear the shopping list
  const startIndex = (page - 1) * pagination._options.itemsPerPage;
  const endIndex = startIndex + pagination._options.itemsPerPage;
  const booksToRender = localStorageItems.slice(startIndex, endIndex);

  booksToRender.forEach(book => {
    renderBookFromLocalStorageWithoutFetch(book);
  });
}

// =================== Remove from shopping list and local storage =============================

// Видалення елемента з Shopping List
export function onRemoveFromShoppingListAndLocalStorage(e) {
  const target = e.target;

  // Check if the clicked element is the button or PNG image
  if (target.classList.contains('delete-btn-icon') || target.classList.contains('delete-btn')) {
    const button = target.closest('.delete-btn');
    const id = button.parentNode.dataset.id; // Get the ID from the parent element
    const index = localStorageItems.findIndex(item => item._id === id);

    if (index !== -1) {
      localStorageItems.splice(index, 1);
      localStorage.setItem('books', JSON.stringify(localStorageItems));
      renderBooks(pagination.getCurrentPage()); // Render books for the current page
      pagination.reset(localStorageItems.length); // Reset pagination with updated total items
    }

    button.parentNode.remove(); // Remove the parent element (li)
    toggleVisibility();

    if (localStorageItems.length === 0) {
      localStorage.removeItem('books');
      paginationContainer.style.display = 'none';
    }
  }
}

shoppingList.addEventListener('click', onRemoveFromShoppingListAndLocalStorage);

// Initial rendering
renderBooks(1); // Render books for the first page