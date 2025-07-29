// This function now runs immediately without fetching
function displayProducts() {
    const productsContainer = document.getElementById('products-container');
    const loader = document.getElementById('loader');
    loader.style.display = 'none';
  
    // Loop through the localProducts array
    localProducts.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      
      card.innerHTML = `
        <img src="${product.image_url[0]}" alt="${product.name}">
        <div class="product-info">
          <h2>${product.name}</h2>
          <p class="price">$${product.price}</p>
        </div>
      `;
      
      // This part stays the same: it saves data for the next page
      card.addEventListener('click', () => {
        sessionStorage.setItem('selectedProduct', JSON.stringify(product));
        window.location.href = '/pages/product.html';
      });
      
      productsContainer.appendChild(card);
    });
  }
  
  displayProducts();