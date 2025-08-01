// Add the word truncation function here.
// This function needs to be defined within the same script or imported.
function truncateWords(text, maxWords) {
    if (!text || typeof text !== 'string') {
        return '';
    }
    const words = text.split(/\s+/); // Split by one or more whitespace characters
    if (words.length > maxWords) {
        return words.slice(0, maxWords).join(' ') + '...';
    }
    return text;
}

// This function now runs immediately without fetching
function displayProducts() {
    const productsContainer = document.getElementById('products-container');
    const loader = document.getElementById('loader');
    loader.style.display = 'none';

    // Define the maximum word limit for descriptions on this product listing page
    const MAX_DESCRIPTION_WORDS_LISTING = 2; // You can adjust this value as needed

    // Loop through the localProducts array (assuming localProducts is defined elsewhere)
    localProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
    
        // --- Start of New Price Logic ---
        let priceHtml = '';
        const Price = parseFloat(product.price);
        const old_price = product.old_price ? parseFloat(product.old_price) : 0;
    
        // Check if there is a valid discount
        if (Price > 0 && Price < old_price) {
            // If yes, show the new price and the slashed old price
            priceHtml = `
                <p class="price">
                    <span class="discount-price">${Price.toFixed(2)} DA</span>
                    <span class="original-price-slashed">${old_price.toFixed(2)} DA</span>
                </p>
            `;
        } else {
            // If no discount, show only the original price
            priceHtml = `
                <p class="price">${Price.toFixed(2)} DA</p>
            `;
        }
        // --- End of New Price Logic ---
    
        const imageUrl = (product.image_url && product.image_url.length > 0)
            ? '/' + product.image_url[0].replace(/^\/+/g, '').replace(/\.\.\//g, '') 
            : 'https://placehold.co/600x400?text=No+Image';
    
        const truncatedDescription = truncateWords(product.name, MAX_DESCRIPTION_WORDS_LISTING);
    
        // Use the generated priceHtml in the card
        card.innerHTML = `
            <img src="${imageUrl}" alt="${product.name}">
            <div class="product-info">
                <h2>${truncatedDescription}</h2>
                <p>${priceHtml} </p>
                <a href="/product.html" class="buy-now-btn">Buy Now</a>
            </div>
        `;
    
        card.addEventListener('click', () => {
            sessionStorage.setItem('selectedProduct', JSON.stringify(product));
            window.location.href = '/product.html';
        });
    
        productsContainer.appendChild(card);
    });
}
// Call the function to display products
displayProducts();