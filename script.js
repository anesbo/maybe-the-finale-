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
    const MAX_DESCRIPTION_WORDS_LISTING = 10; // You can adjust this value as needed

    // Loop through the localProducts array (assuming localProducts is defined elsewhere)
    localProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        // ✅ FIX: Correct the image path for the main page
        // Check if images exist, then make it root-relative
        const imageUrl = (product.image_url && product.image_url.length > 0)
            ? '/' + product.image_url[0].replace(/^\/+/g, '').replace(/\.\.\//g, '') 
            : 'https://placehold.co/600x400?text=No+Image';
        // Apply word truncation to the product description
        const truncatedDescription = truncateWords(product.description, MAX_DESCRIPTION_WORDS_LISTING);

        card.innerHTML = `
            <img src="${imageUrl}" alt="${product.name}">
            <div class="product-info">
                <h2>${product.name}</h2>
                 <p class="price">${product.price} DA</p>
                <p>${truncatedDescription}</p> 
            </div>
        `;

        // This part saves data for the next page
        card.addEventListener('click', () => {
            sessionStorage.setItem('selectedProduct', JSON.stringify(product));
            window.location.href = '/product.html'; // CORRECTED: Made root-relative
        });

        productsContainer.appendChild(card);
    });
}

// Call the function to display products
displayProducts();