const supabaseUrl = 'https://eogfdfaclptqpkknixln.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvZ2ZkZmFjbHB0cXBra25peGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODMzNDQsImV4cCI6MjA2OTM1OTM0NH0.ikbfxz70_nGH8_7lYICyTRezE14ryuymlWR4e6BLyMg';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

const algeriaWilayas = ["Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Algiers", "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", "In Salah", "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Meniaa"];

function setupPage() {
    const productContainer = document.getElementById('product-container');
    const orderFormContainer = document.getElementById('order-form-container');
    const loader = document.getElementById('loader');

    // 1. Get the product data from session storage (the "no backend" method)
    const productJSON = sessionStorage.getItem('selectedProduct');

    if (!productJSON) {
        loader.textContent = 'Error: No product data found. Please select a product from the main page.';
        return;
    }

    // 2. Convert the text back into a JavaScript object
    const product = JSON.parse(productJSON);
    loader.style.display = 'none';
    
    // 3. Display the product details
    document.title = product.name;
    productContainer.innerHTML = `
      <a href="../index.html">home page</a>
      <p> click the image to make it bigger</p>
      <div class="product-details">
        <div class="product-gallery">
          <img src="${product.image_url[0]}" alt="${product.name}" class="main-image" id="main-image">
          <div class="thumbnails" id="thumbnails"></div>
        </div>
        <div class="product-info">
          <h1>${product.name}</h1>
          <p class="price">$${product.price}</p>
          <p class="description">${product.description}</p>
        </div>
      </div>
    `;

    // 4. Create image thumbnails
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

    // Add this block inside your setupPage function, after creating the thumbnails

const modal = document.getElementById('image-modal');
const mainImage = document.getElementById('main-image');
const modalImage = document.getElementById('modal-image');
const closeBtn = document.querySelector('.close-btn');

// When the user clicks the main image, open the modal
    mainImage.addEventListener('click', () => {
      modal.style.display = 'flex';
      modalImage.src = mainImage.src;
    });

    // When the user clicks on <span> (x) or the modal background, close it
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) { // only close if the background is clicked
            modal.style.display = 'none';
        }
    });
    
    // 5. Display the order form
    orderFormContainer.innerHTML = `
      <h2>Place Your Order</h2>
      <form id="order-form">
        <div class="form-group"><label for="name">Full Name</label><input type="text" id="name" required></div>
        <div class="form-group"><label for="phoneNumber">Phone Number</label><input type="tel" id="phoneNumber" required></div>
        <div class="form-group"><label for="quantity">Quantity</label><input type="number" id="quantity" value="1" min="1" required></div>
        <div class="form-group"><label for="state">State (Wilaya)</label>
          <select id="state" required><option value="" disabled selected>Select a state</option>${algeriaWilayas.map(w => `<option value="${w}">${w}</option>`).join('')}</select>
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
        <div class="form-group" id="home-address-group"><label for="address">Home Address</label><input type="text" id="address"></div>
        <p id="total-price-display" style="font-size: 1.2em; font-weight: bold;"></p>
        <button type="submit">Place Order</button>
      </form>
    `;

    // 6. Add all event listeners
    const deliveryRadios = document.querySelectorAll('input[name="deliveryType"]');
    const homeAddressGroup = document.getElementById('home-address-group');
    deliveryRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            if (event.target.value === 'Home') {
                homeAddressGroup.style.display = 'block';
                document.getElementById('address').required = true;
            } else {
                homeAddressGroup.style.display = 'none';
                document.getElementById('address').required = false;
            }
        });
    });

    const quantityInput = document.getElementById('quantity');
    const totalPriceDisplay = document.getElementById('total-price-display');
    function updateTotalPrice() {
      const quantity = parseInt(quantityInput.value) || 0;
      const totalPrice = product.price * quantity;
      totalPriceDisplay.textContent = `Total Price: $${totalPrice.toFixed(2)}`;
    }
    quantityInput.addEventListener('input', updateTotalPrice);
    updateTotalPrice(); 

    const orderForm = document.getElementById('order-form');
    orderForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submitBtn = orderForm.querySelector('button');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        const quantity = parseInt(document.getElementById('quantity').value);
        const totalPrice = product.price * quantity;

        const orderData = {
            name: document.getElementById('name').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            state: document.getElementById('state').value,
            address: document.getElementById('deliveryHome').checked ? document.getElementById('address').value : 'Delivery to Desk',
            product_id: product.id,
            product_name: product.name,
            quantity: quantity,
            total_price: totalPrice,
        };

        const { error: insertError } = await supabaseClient.from('orders').insert([orderData]);

        if (insertError) {
            alert(`Error: ${insertError.message}`);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Place Order';
        } else {
            orderFormContainer.innerHTML = '<h2>Thank you for your order!</h2>';
        }
    });
}

// Call the one main function to run everything
setupPage();