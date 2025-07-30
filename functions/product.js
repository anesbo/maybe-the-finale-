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
    }

    const product = JSON.parse(productJSON);
    loader.style.display = 'none';

    document.title = product.name;
    productContainer.innerHTML = `
      <a href="/index.html">home page</a>
      <p> click the image to make it bigger</p>
      <div class="product-details">
        <div class="product-gallery">
          <img src="${product.image_url[0]}" alt="${product.name}" class="main-image" id="main-image">
          <div class="thumbnails" id="thumbnails"></div>
        </div>
        <div class="product-info">
          <h1>${product.name}</h1>
          <p class="price">${product.price} DA</p>
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
      <h2>Place Your Order</h2>
      <form id="order-form">
        <div class="form-group"><label for="name">Full Name</label><input type="text" id="name" required></div>
        <div class="form-group"><label for="phoneNumber">Phone Number</label><input type="tel" id="phoneNumber" required></div>
        <div class="form-group"><label for="quantity">Quantity</label><input type="number" id="quantity" value="1" min="1" required></div>
        <div class="form-group"><label for="state">State (Wilaya)</label>
          <select id="state" required><option value="" disabled selected>Select a state</option></select>
        </div>
        <div class="form-group"><label>Delivery Option</label>
          <div>
            <div class="delivery-option">
              <label for="deliveryDesk">Delivery to Desk</label>
              <input type="radio" id="deliveryDesk" name="deliveryType" value="Desk" checked>
            </div>
            <div class="delivery-option">
              <label for="deliveryHome">Home Address</label>
              <input type="radio" id="deliveryHome" name="deliveryType" value="Home">
            </div>
          </div>
        </div>
        <div class="form-group" id="home-address-group" style="display:none;"><label for="address">Home Address</label><input type="text" id="address"></div>
        <p id="total-price-display" style="font-size: 1.2em; font-weight: bold;"></p>
        <button type="submit">Place Order</button>
      </form>
    `;

    // Now, re-select DOM elements AFTER innerHTML is updated
    const stateSelect = document.getElementById('state');
    const quantityInput = document.getElementById('quantity');
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

        if (!selectedState || deliveryPrices.length === 0) {
            totalPriceDisplay.textContent = 'Please select a state and wait for prices to load.';
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

            const codPrice = stateData.price_cod_dzd; // This is already parsed to a number or 0

            const totalProductCost = productPrice * quantity;
            const finalPrice = totalProductCost + deliveryCost;

            totalPriceDisplay.textContent = `Total Price: ${finalPrice} DZD (Delivery: ${deliveryCost} DZD)`;
        } else {
            totalPriceDisplay.textContent = 'Price not found for selected state.';
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
        const submitBtn = orderForm.querySelector('button');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        const quantity = parseInt(quantityInput.value);
        const selectedState = stateSelect.value;
        const deliveryType = document.querySelector('input[name="deliveryType"]:checked').value;
        const productPrice = parseFloat(product.price); // Ensure product.price is parsed here too

        let deliveryCost = 0;
        let codPrice = 0;
        const stateData = deliveryPrices.find(w => w.wilaya_en === selectedState);
        if (stateData) {
            if (deliveryType === 'Desk') {
                deliveryCost = stateData.price_for_desk;
            } else if (deliveryType === 'Home') {
                deliveryCost = stateData.price_for_home;
            }
            codPrice = stateData.price_cod_dzd;
        }

        const productTotalPrice = productPrice * quantity;
        const finalCalculatedPrice = productTotalPrice + deliveryCost + codPrice;

        const orderData = {
            name: document.getElementById('name').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            state: selectedState,
            address: document.getElementById('deliveryHome').checked ? document.getElementById('address').value : 'Delivery to Desk',
            delivery_type: deliveryType,
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
            orderFormContainer.innerHTML = '<h2>Thank you for your order!</h2><p>Your order has been placed successfully!</p>';
        }
    });
}

document.addEventListener('DOMContentLoaded', setupPage);