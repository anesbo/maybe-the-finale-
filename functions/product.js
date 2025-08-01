import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://eogfdfaclptqpkknixln.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvZ2ZkZmFjbHB0cXBra25peGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODMzNDQsImV4cCI6MjA2OTM1OTM0NH0.ikbfxz70_nGH8_7lYICyTRezE14ryuymlWR4e6BLyMg';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const algeriaWilayas = ["Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouïra", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", "In Salah", "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Meniaa"];

let deliveryPrices = [];

async function fetchDeliveryPrices() {
    const { data, error } = await supabase
        .from('delivery_prices')
        .select('*');

    if (error) {
        console.error('Error fetching delivery prices:', error);
        return [];
    }
    // IMPORTANT: Ensure all price fields are parsed as numbers when fetched
    return data.map(item => ({
        ...item,
        price_for_desk: parseFloat(item.price_for_desk) || 0, // Convert to number, default to 0 if invalid
        price_for_home: parseFloat(item.price_for_home) || 0, // Convert to number, default to 0 if invalid
    }));
}


function setupPage() {
    const productContainer = document.getElementById('product-container');
    const orderFormContainer = document.getElementById('order-form-container');
    const loader = document.getElementById('loader');

    const productJSON = sessionStorage.getItem('selectedProduct');

    if (!productJSON) {
        loader.textContent = 'Error: No product data found. Please select a product from the main page.';
        return;
    }else {
        // 1. Create the product object FIRST
        const product = JSON.parse(productJSON);
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
    
 
    loader.style.display = 'none';

    document.title = product.name;
    productContainer.innerHTML = `
      <div class="product-details">
        <div class="product-gallery">
          <img src="${product.image_url[0]}" alt="${product.name}" class="main-image" id="main-image">
          <div class="thumbnails" id="thumbnails"></div>
        </div>
        <div class="product-info">
          <h1>${product.name}</h1>
          <p class="price">${priceHtml}</p>
          <p class="description">${product.description}</p>
        </div>
      </div>
    `;

    const thumbnailsContainer = document.getElementById('thumbnails');
    if (thumbnailsContainer && Array.isArray(product.image_url)) {
        console.log("Images for this product:", product.image_url);
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

    const modal = document.getElementById('image-modal');
    const mainImage = document.getElementById('main-image');
    const modalImage = document.getElementById('modal-image');
    const closeBtn = document.querySelector('.close-btn');

    mainImage.addEventListener('click', () => {
        modal.style.display = 'flex';
        modalImage.src = mainImage.src;
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // ---------------------------------------------------------------
    // IMPORTANT FIX: Render the form FIRST, then get its elements
    // ---------------------------------------------------------------

    // 5. Display the order form
    orderFormContainer.innerHTML = `
        <h2>Place Your Order for ${product.name}</h2>
        <form id="order-form">
            <div class="form-group"><label for="name">Full Name</label><input type="text" id="name" required></div>
            <div class="form-group"><label for="phoneNumber">Phone Number</label><input type="tel" id="phoneNumber" required></div>

            <div class="form-group">
                <label for="quantity">Quantity</label>
                <div class="quantity-selector">
                    <button type="button" class="quantity-btn minus-btn" aria-label="Decrease quantity">&minus;</button>
                    <input type="number" id="quantity" value="1" min="1" required>
                    <button type="button" class="quantity-btn plus-btn" aria-label="Increase quantity">+</button>
                </div>
            </div>

            <div class="form-group"><label for="state">State (Wilaya)</label>
                <select id="state" required><option value="" disabled selected>Select a state</option></select>
            </div>
            <div class="form-group"><label>Delivery Option</label>
                <div>
                    <div class="delivery-option">
                        <input type="radio" id="deliveryDesk" name="deliveryType" value="Desk" checked>
                        <label for="deliveryDesk">Delivery to Desk</label>
                    </div>
                    <div class="delivery-option">
                        <input type="radio" id="deliveryHome" name="deliveryType" value="Home">
                        <label for="deliveryHome">Home Address</label>
                    </div>
                </div>
            </div>
            <div class="form-group" id="home-address-group" style="display:none;"><label for="address">Home Address</label><input type="text" id="address"></div>
            <p id="total-price-display" style="font-size: 1.2em; font-weight: bold;"></p>
            <div id="success-message" class="success-message"></div>
            <button type="submit" id="submit">Place Order</button>
        </form>
    `;

    // --- B. Find Elements & Add Listeners (AFTER they are on the page) ---
    const quantityInput = document.getElementById('quantity');
    const minusBtn = document.querySelector('.minus-btn');
    const plusBtn = document.querySelector('.plus-btn');

    // Make the quantity buttons work
    if (quantityInput && minusBtn && plusBtn) {
        plusBtn.addEventListener('click', () => {
            quantityInput.value = parseInt(quantityInput.value, 10) + 1;
        });

        minusBtn.addEventListener('click', () => {
            let currentValue = parseInt(quantityInput.value, 10);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });
    }


    // Now, re-select DOM elements AFTER innerHTML is updated
    const stateSelect = document.getElementById('state');
    const totalPriceDisplay = document.getElementById('total-price-display');
    const deliveryRadios = document.querySelectorAll('input[name="deliveryType"]');
    const homeAddressGroup = document.getElementById('home-address-group');
    const orderForm = document.getElementById('order-form');


    // Populate the state dropdown in the newly rendered form
    stateSelect.innerHTML = `<option value="" disabled selected>Select a state</option>${algeriaWilayas.map(w => `<option value="${w}">${w}</option>`).join('')}`;


    // Fetch prices from Supabase and then calculate initial price
    (async () => {
        deliveryPrices = await fetchDeliveryPrices();
        calculatePrice(); // Call once after prices are fetched to set initial display
    })();


    const calculatePrice = () => {
        const selectedState = stateSelect.value;
        const deliveryType = document.querySelector('input[name="deliveryType"]:checked').value;
        // IMPORTANT: Ensure product.price is parsed to a float
        const productPrice = parseFloat(product.price);
        const quantity = parseInt(quantityInput.value) || 1;

        if (isNaN(productPrice)) { // Add a check for product price
            totalPriceDisplay.textContent = 'Error: Invalid product price.';
            return;
        }


        const stateData = deliveryPrices.find(w => w.wilaya_en === selectedState);

        if (stateData) {
            let deliveryCost = 0;
            // These are already numbers because of the parsing in fetchDeliveryPrices
            if (deliveryType === 'Desk') {
                deliveryCost = stateData.price_for_desk;
            } else if (deliveryType === 'Home') {
                deliveryCost = stateData.price_for_home;
            }


            const totalProductCost = productPrice * quantity;
            const finalPrice = totalProductCost + deliveryCost;

            totalPriceDisplay.textContent = `Total Price: ${finalPrice} DZD (Delivery: ${deliveryCost} DZD)`;
        }
    };

    deliveryRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            if (event.target.value === 'Home') {
                homeAddressGroup.style.display = 'block';
                document.getElementById('address').required = true;
            } else {
                homeAddressGroup.style.display = 'none';
                document.getElementById('address').required = false;
            }
            calculatePrice();
        });
    });

    quantityInput.addEventListener('input', calculatePrice);
    stateSelect.addEventListener('change', calculatePrice);


    orderForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submitBtn = orderForm.querySelector('submit');

        const quantity = parseInt(quantityInput.value);
        const selectedState = stateSelect.value;
        const deliveryType = document.querySelector('input[name="deliveryType"]:checked').value;
        const productPrice = parseFloat(product.price); // Ensure product.price is parsed here too

        let deliveryCost = 0;
        const stateData = deliveryPrices.find(w => w.wilaya_en === selectedState);
        if (stateData) {
            if (deliveryType === 'Desk') {
                deliveryCost = stateData.price_for_desk;
            } else if (deliveryType === 'Home') {
                deliveryCost = stateData.price_for_home;
            }
        }

        const productTotalPrice = productPrice * quantity;
        const finalCalculatedPrice = productTotalPrice + deliveryCost;

        const orderData = {
            name: document.getElementById('name').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            state: selectedState,
            address: document.getElementById('deliveryHome').checked ? document.getElementById('address').value : 'Delivery to Desk',
            product_id: product.id,
            product_name: product.name,
            quantity: quantity,
            total_price: finalCalculatedPrice,
        };

        const { error: insertError } = await supabase.from('orders').insert([orderData]);
        if (insertError) {
            alert(`Error placing order: ${insertError.message}`);
            console.error('Order insert error:', insertError);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Place Order';
        } else {
            const successContainer = document.getElementById('success-message');
            successContainer.textContent = 'Thank you for your order! Your order has been placed successfully.';
            // 4. Make the success message visible
            successContainer.style.display = 'block';
            document.querySelector('form').reset();
        }
    });
    
}
}

document.addEventListener('DOMContentLoaded', setupPage);