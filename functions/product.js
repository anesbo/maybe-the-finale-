// product.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- Supabase Configuration ---
const supabaseUrl = 'https://eogfdfaclptqpkknixln.supabase.co'; // REPLACE WITH YOUR SUPABASE PROJECT URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvZ2ZkZmFjbHB0cXBra25peGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODMzNDQsImV4cCI6MjA2OTM1OTM0NH0.ikbfxz70_nGH8_7lYICyTRezE14ryuymlWR4e6BLyMg'; // REPLACE WITH YOUR SUPABASE PUBLIC ANON KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const algeriaWilayas = ["Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouïra", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", "In Salah", "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Meniaa"];

// --- MAIN ENTRY POINT: This runs when the initial HTML is ready ---
document.addEventListener('DOMContentLoaded', () => {
    const productDataString = sessionStorage.getItem('selectedProduct');
    if (!productDataString) {
        document.body.innerHTML = '<h1>Error: No product found. Please return to the homepage and select a product.</h1>';
        return;
    }
    const product = JSON.parse(productDataString);
    setupPage(product); // Start the setup process
});


/**
 * Main function to set up the entire product page in logical steps.
 */
async function setupPage(product) {
    const productContainer = document.getElementById('product-container');
    const orderFormContainer = document.getElementById('order-form-container');
    const loader = document.getElementById('loader');

    // 1. Display the static product details first (images, name, etc.)
    displayProductDetails(product, productContainer);
    loader.style.display = 'none';

    // 2. Fetch all the data needed for the order form in parallel
    try {
        const [variants, deliveryPrices] = await Promise.all([
            fetchProductVariants(product.id),
            fetchDeliveryPrices()
        ]);

        // 3. Once all data is fetched, build the fully interactive order form
        setupOrderForm(product, variants, deliveryPrices, orderFormContainer);

    } catch (error) {
        console.error("Failed to load page components:", error);
        orderFormContainer.innerHTML = `<p class="error">Could not load ordering options. Please try again later.</p>`;
    }
}

/**
 * Renders the main product info (gallery, name, price).
 */
/**
 * Renders the main product info (gallery, name, price) AND
 * sets up the interactive image gallery with a modal.
 */
function displayProductDetails(product, container) {
    let priceHtml = '';
    const price = parseFloat(product.price);
    const old_price = product.old_price ? parseFloat(product.old_price) : 0;

    if (old_price > 0 && price < old_price) {
        priceHtml = `<span class="discount-price">${price.toFixed(2)} DA</span> <span class="original-price-slashed">${old_price.toFixed(2)} DA</span>`;
    } else {
        priceHtml = `${price.toFixed(2)} DA`;
    }

    container.innerHTML = `
        <div class="product-details">
            <div class="product-gallery">
                <img src="${product.image_url[0]}" alt="${product.name}" class="main-image" id="main-image">
                <div class="thumbnails" id="thumbnails"></div>
            </div>
            <div class="product-info">
                <h1>${product.name}</h1>
                <p class="price">${priceHtml}</p>
                <p class="description">${product.description}</p>
                <a href="#" id="description-toggle" class="description-toggle-btn">Show More</a>
            </div>
        </div>
    `;
    // Add this block at the end of your displayProductDetails function in product.js

function setupDescriptionToggle() {
    const description = document.querySelector('.product-info .description');
    const toggleBtn = document.getElementById('description-toggle');
    const infoContainer = document.querySelector('.product-info');

    // Safety check to make sure elements exist
    if (!description || !toggleBtn || !infoContainer) {
        return;
    }

    // Check if the text is actually overflowing. If not, hide the button.
    // We use a small timeout to let the browser render first.
    setTimeout(() => {
        if (description.scrollHeight > description.clientHeight) {
            toggleBtn.style.display = 'inline-block'; // Show the button
        }
    }, 100);


    // Add the click event listener
    toggleBtn.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent the link from jumping the page

        // Toggle the 'expanded' class on the parent container
        infoContainer.classList.toggle('description-expanded');

        // Change the button text based on the state
        if (infoContainer.classList.contains('description-expanded')) {
            toggleBtn.textContent = 'Show Less';
        } else {
            toggleBtn.textContent = 'Show More';
        }
    });
}

// Call the new function
setupDescriptionToggle();

    // --- LOGIC FOR IMAGE THUMBNAILS ---
    const thumbnailsContainer = document.getElementById('thumbnails');
    if (thumbnailsContainer && Array.isArray(product.image_url)) {
        product.image_url.forEach((url, index) => {
            const thumb = document.createElement('img');
            thumb.src = url;
            if (index === 0) thumb.classList.add('active');
            thumb.addEventListener('click', () => {
                document.getElementById('main-image').src = url;
                document.querySelectorAll('.thumbnails img').forEach(img => img.classList.remove('active'));
                thumb.classList.add('active');
            });
            thumbnailsContainer.appendChild(thumb);
        });
    }
    
    // --- THIS IS THE MODAL LOGIC THAT WAS MISSING ---
    const modal = document.getElementById('image-modal');
    const mainImage = document.getElementById('main-image');
    const modalImage = document.getElementById('modal-image');
    const closeBtn = document.querySelector('.close-btn');

    // Safety check to make sure all modal elements exist
    if (modal && mainImage && modalImage && closeBtn) {
        // When the user clicks the main image, open the modal
        mainImage.addEventListener('click', () => {
            modal.style.display = 'flex';
            modalImage.src = mainImage.src;
        });

        // When the user clicks on <span> (x), close the modal
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Also close modal if user clicks on the background overlay
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

/**
 * Fetches all stock variants for a specific product ID.
 */
async function fetchProductVariants(productId) {
    const { data, error } = await supabase.from('product_stock').select('*').eq('product_id', productId);
    if (error) throw new Error('Could not fetch product variants: ' + error.message);
    return data;
}

/**
 * Fetches all delivery prices.
 */
async function fetchDeliveryPrices() {
    const { data, error } = await supabase.from('delivery_prices').select('*');
    if (error) throw new Error('Could not fetch delivery prices: ' + error.message);
    return data.map(item => ({
        ...item,
        price_for_desk: parseFloat(item.price_for_desk) || 0,
        price_for_home: parseFloat(item.price_for_home) || 0,
    }));
}

/**
 * Builds the order form and makes it fully interactive.
 */
/**
 * Builds the order form and makes it fully interactive,
 * including dependent variant selection and stock checking.
 */
/**
 * Builds the order form and makes it fully interactive,
 * including dependent variant selection and stock checking.
 */
/**
 * Builds the order form and makes it fully interactive.
 * This is the complete and final version.
 */
function setupOrderForm(product, variants, deliveryPrices, container) {
    const uniqueSizes = [...new Set(variants.map(v => v.size))];
    const uniqueColors = [...new Set(variants.map(v => v.color))];

    // --- PART 1: BUILD THE COMPLETE FORM HTML ---
    container.innerHTML = `
        <h2>Place Your Order</h2>
        <form id="order-form">
            <div class="variant-selection">
                <div id="size-options-container">
                    <label>Size:</label>
                    <div class="options-group">
                        ${uniqueSizes.map(size => `<div><input type="radio" name="size" value="${size}" id="size-${size}" required><label class="variant-label" for="size-${size}">${size}</label></div>`).join('')}
                    </div>
                </div>
                <div id="color-options-container">
                    <label>Color:</label>
                    <div class="options-group">
                        ${uniqueColors.map(color => `<div><input type="radio" name="color" value="${color}" id="color-${color}" required><label class="variant-label" for="color-${color}">${color}</label></div>`).join('')}
                    </div>
                </div>
                <div id="stock-status-display" class="stock-status">Please select a size and color</div>
            </div>
            
            <div class="form-group"><label for="name">Full Name</label><input type="text" id="name" required></div>
            <div class="form-group"><label for="phoneNumber">Phone Number</label><input type="tel" id="phoneNumber" required></div>
            <div class="form-group">
                <label for="quantity">Quantity</label>
                <div class="quantity-selector">
                    <button type="button" class="quantity-btn minus-btn">&minus;</button>
                    <input type="number" id="quantity" value="1" min="1" required>
                    <button type="button" class="quantity-btn plus-btn">+</button>
                </div>
            </div>
            <div class="form-group"><label for="state">State (Wilaya)</label>
                <select id="state" required><option value="" disabled selected>Select a state</option></select>
            </div>
            <div class="form-group"><label>Delivery Option</label>
                <div>
                    <div class="delivery-option"><input type="radio" id="deliveryDesk" name="deliveryType" value="Desk" checked><label for="deliveryDesk">Delivery to Desk</label></div>
                    <div class="delivery-option"><input type="radio" id="deliveryHome" name="deliveryType" value="Home"><label for="deliveryHome">Home Address</label></div>
                </div>
            </div>
            <div class="form-group" id="home-address-group" style="display:none;"><label for="address">Home Address</label><input type="text" id="address"></div>
            <p id="total-price-display" style="font-size: 1.2em; font-weight: bold;">Select options to see total price</p>
            <div id="success-message" class="success-message"></div>
            <button type="submit">Place Order</button>
        </form>
    `;

    // --- PART 2: GET ELEMENTS & ATTACH LISTENERS (NOW THAT THE FORM EXISTS) ---
    const orderForm = document.getElementById('order-form');
    const quantityInput = document.getElementById('quantity');
    const stateSelect = document.getElementById('state');
    const totalPriceDisplay = document.getElementById('total-price-display');
    const stockDisplay = document.getElementById('stock-status-display');
    const submitButton = orderForm.querySelector('button[type="submit"]');

    // **THIS IS THE CODE THAT WAS MISSING**
    // Populate the state dropdown with all the Wilayas
    stateSelect.innerHTML += algeriaWilayas.map(w => `<option value="${w}">${w}</option>`).join('');

    // --- Price Calculation Logic ---
    const calculatePrice = () => {
        const selectedState = stateSelect.value;
        if (!selectedState) { totalPriceDisplay.textContent = 'Please select a state for delivery.'; return; }
        
        const deliveryType = orderForm.querySelector('input[name="deliveryType"]:checked').value;
        const quantity = parseInt(quantityInput.value) || 1;
        const productPrice = parseFloat(product.price);
        
        const stateData = deliveryPrices.find(w => w.wilaya_en === selectedState);
        if (!stateData) { totalPriceDisplay.textContent = 'Delivery not available.'; return; }

        const deliveryCost = deliveryType === 'Home' ? stateData.price_for_home : stateData.price_for_desk;
        const finalPrice = (productPrice * quantity) + deliveryCost;
        totalPriceDisplay.textContent = `Total Price: ${finalPrice.toFixed(2)} DZD (Delivery: ${deliveryCost.toFixed(2)} DZD)`;
    };
    
    // --- Event Listeners for Form Interactivity ---
    const updateOptionsAndPrice = () => {
        const selectedSize = orderForm.querySelector('input[name="size"]:checked')?.value;
        const selectedColor = orderForm.querySelector('input[name="color"]:checked')?.value;
        
        // Update size/color availability
        orderForm.querySelectorAll('input[name="color"]').forEach(c => {
            c.disabled = !variants.some(v => v.color === c.value && (!selectedSize || v.size === selectedSize) && v.stock_quantity > 0);
        });
        orderForm.querySelectorAll('input[name="size"]').forEach(s => {
            s.disabled = !variants.some(v => v.size === s.value && (!selectedColor || v.color === selectedColor) && v.stock_quantity > 0);
        });

        // Update stock display
        if (selectedSize && selectedColor) {
            const variant = variants.find(v => v.size === selectedSize && v.color === selectedColor);
            
            // --- NEW LOGIC for stock display ---
            if (variant && variant.stock_quantity > 0) {
                if (variant.stock_quantity < 5) {
                    // Low stock condition
                    stockDisplay.textContent = `Low Stock (Only ${variant.stock_quantity} left!)`;
                    stockDisplay.className = 'stock-status low-stock';
                } else {
                    // Plenty of stock
                    stockDisplay.textContent = 'In Stock';
                    stockDisplay.className = 'stock-status in-stock';
                }
                submitButton.disabled = false; // Enable the submit button
            }
        } else {
            // A variant hasn't been fully selected yet
            submitButton.disabled = true;
        }
        calculatePrice(); // Recalculate price on any change
    };

    orderForm.querySelector('.plus-btn').addEventListener('click', () => { quantityInput.value = parseInt(quantityInput.value, 10) + 1; calculatePrice(); });
    orderForm.querySelector('.minus-btn').addEventListener('click', () => { let v = parseInt(quantityInput.value, 10); if (v > 1) quantityInput.value = v - 1; calculatePrice(); });
    
    const interactiveElements = orderForm.querySelectorAll('input[name="size"], input[name="color"], input[name="deliveryType"], #quantity, #state');
    interactiveElements.forEach(el => el.addEventListener('change', updateOptionsAndPrice));

    orderForm.querySelectorAll('input[name="deliveryType"]').forEach(radio => radio.addEventListener('change', (e) => {
        const homeAddressGroup = document.getElementById('home-address-group');
        const addressInput = document.getElementById('address');
        if (e.target.value === 'Home') {
            homeAddressGroup.style.display = 'block';
            addressInput.required = true;
        } else {
            homeAddressGroup.style.display = 'none';
            addressInput.required = false;
        }
    }));
    
    updateOptionsAndPrice(); // Run once on load to set initial state

    // --- Form Submission Logic ---
    orderForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = 'Placing Order...';
        
        const selectedSize = orderForm.querySelector('input[name="size"]:checked')?.value;
        const selectedColor = orderForm.querySelector('input[name="color"]:checked')?.value;
        const quantity = parseInt(quantityInput.value);

        if (!selectedSize || !selectedColor) { alert('Please select a size and color.'); submitButton.disabled = false; submitButton.textContent = 'Place Order'; return; }
        
        const variant = variants.find(v => v.size === selectedSize && v.color === selectedColor);
        if (!variant || variant.stock_quantity < quantity) { alert('Sorry, this item is out of stock or not enough stock is available.'); submitButton.disabled = false; submitButton.textContent = 'Place Order'; return; }
        
        const orderData = {
            name: document.getElementById('name').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            state: stateSelect.value,
            address: document.querySelector('input[name="deliveryType"]:checked').value === 'Home' ? document.getElementById('address').value : 'Delivery to Desk',
            product_id: product.id,
            product_name: product.name,
            quantity: quantity,
            total_price: parseFloat(totalPriceDisplay.textContent.match(/[\d.]+/)[0]),
            size: selectedSize,
            color: selectedColor,
            status: 'pending'
        };
        
        const { error } = await supabase.from('orders').insert(orderData);
        if (error) {
            alert(`Error placing order: ${error.message}`);
            submitButton.disabled = false; submitButton.textContent = 'Place Order';
        } else {
            orderForm.reset();
            const successContainer = document.getElementById('success-message');
            successContainer.textContent = 'Thank you! Your order has been placed successfully.';
            successContainer.style.display = 'block';
            submitButton.disabled = false;
            submitButton.textContent = 'order again';
        }
    });
}