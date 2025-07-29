function displayProducts() {
  const productsContainer = document.getElementById('products-container');
  const loader = document.getElementById('loader');
  loader.style.display = 'none';

  // Loop through the localProducts array
  localProducts.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // ✅ FIX: Correct the image path for the main page
    // Check if images exist, then remove the '../' from the path
    const imageUrl = (product.image_url && product.image_url.length > 0) 
      ? product.image_url[0].replace('../', '') 
      : 'https://placehold.co/600x400?text=No+Image';

    card.innerHTML = `
      <img src="${imageUrl}" alt="${product.name}">
      <div class="product-info">
        <h2>${product.name}</h2>
        <p class="price">$${product.price}</p>
      </div>
    `;
    
    // This part saves data for the next page
    card.addEventListener('click', () => {
      sessionStorage.setItem('selectedProduct', JSON.stringify(product));
      window.location.href = './pages/product.html';
    });
    
    productsContainer.appendChild(card);
  });
}