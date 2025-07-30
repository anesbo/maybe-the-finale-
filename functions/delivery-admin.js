// delivery-prices-admin.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- Supabase Configuration ---
const supabaseUrl = 'https://eogfdfaclptqpkknixln.supabase.co'; // REPLACE WITH YOUR SUPABASE PROJECT URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvZ2ZkZmFjbHB0cXBra25peGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODMzNDQsImV4cCI6MjA2OTM1OTM0NH0.ikbfxz70_nGH8_7lYICyTRezE14ryuymlWR4e6BLyMg'; // REPLACE WITH YOUR SUPABASE PUBLIC ANON KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey);
// --- End Supabase Configuration ---

// Global DOM Elements for initial loading and main content
const initialLoadingMessage = document.getElementById('initial-loading-message');
const mainAdminContent = document.getElementById('main-admin-content');

// DOM Elements for Delivery Prices Section
const loadingMessagePrices = document.getElementById('loading-message-prices');
const deliveryTableContainer = document.getElementById('delivery-table-container');
const deliveryPricesTbody = document.getElementById('delivery-prices-tbody');
const editFormContainer = document.getElementById('edit-form-container');
const editWilayaName = document.getElementById('edit-wilaya-name');
const editIdInput = document.getElementById('edit-id-input');
const editWilayaEnInput = document.getElementById('edit-wilaya-en');
const editPriceDeskInput = document.getElementById('edit-price-desk');
const editPriceHomeInput = document.getElementById('edit-price-home');
const editDeliveryForm = document.getElementById('edit-delivery-form');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

const logoutBtn = document.createElement('button'); // Dynamically created logout button

let currentDeliveryPrices = []; // To store the fetched delivery price data

/**
 * Check user authentication status and admin role.
 * If not logged in or not an admin, redirects to the login page.
 * Otherwise, loads the delivery prices management content.
 */
async function checkAuthAndLoad() {
    // Show initial loading message and hide main content while checking
    initialLoadingMessage.style.display = 'flex'; // Use 'flex' for center alignment
    mainAdminContent.style.display = 'none';
    initialLoadingMessage.querySelector('p').textContent = 'Checking admin access...';
    initialLoadingMessage.querySelector('.spinner').style.display = 'block'; // Show spinner

    console.log("1. Starting authentication check...");

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
        console.error("Auth getUser error:", userError);
        initialLoadingMessage.querySelector('p').textContent = 'Authentication error. Redirecting...';
        initialLoadingMessage.querySelector('.spinner').style.display = 'none';
        setTimeout(() => { window.location.href = 'admin-login.html'; }, 1000);
        return;
    }

    if (!user) {
        console.log("2. No user found. Redirecting to login page.");
        initialLoadingMessage.querySelector('p').textContent = 'Not logged in. Redirecting...';
        initialLoadingMessage.querySelector('.spinner').style.display = 'none';
        setTimeout(() => { window.location.href = 'admin-login.html'; }, 1000);
        return;
    }

    console.log("2. User found:", user.email, "ID:", user.id);
    initialLoadingMessage.querySelector('p').textContent = 'Verifying admin role...';

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.error("3. Profile fetch error:", profileError);
        alert('Error fetching user profile. Please try again.');
        initialLoadingMessage.querySelector('p').textContent = 'Profile error. Logging out...';
        initialLoadingMessage.querySelector('.spinner').style.display = 'none';
        await supabase.auth.signOut();
        setTimeout(() => { window.location.href = 'admin-login.html'; }, 1000);
        return;
    }

    if (!profile) {
        console.log("3. Profile not found for user.");
        alert('User profile not found. Please ensure your account has a profile entry.');
        initialLoadingMessage.querySelector('p').textContent = 'Profile missing. Logging out...';
        initialLoadingMessage.querySelector('.spinner').style.display = 'none';
        await supabase.auth.signOut();
        setTimeout(() => { window.location.href = 'admin-login.html'; }, 1000);
        return;
    }

    console.log("3. User profile found. Role:", profile.role);

    if (profile.role !== 'admin') {
        console.log("4. User is NOT an admin. Role:", profile.role, ". Redirecting to login.");
        alert('Access Denied: You must be an administrator to view this page.');
        initialLoadingMessage.querySelector('p').textContent = 'Access Denied. Logging out...';
        initialLoadingMessage.querySelector('.spinner').style.display = 'none';
        await supabase.auth.signOut();
        setTimeout(() => { window.location.href = 'admin-login.html'; }, 1000);
        return;
    }

    // If we reach here, the user is authenticated AND is an admin!
    console.log("5. User is admin. Loading delivery prices content.");
    initialLoadingMessage.style.display = 'none'; // Hide initial loading overlay
    mainAdminContent.style.display = 'block';   // Show main content

    // Proceed to load data for this section
    loadingMessagePrices.textContent = 'Loading delivery prices...';
    await fetchDeliveryPrices();

    // Add logout button to the page (only if authenticated and admin)
    logoutBtn.textContent = 'Log Out';
    logoutBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        padding: 10px 15px;
        background-color: #dc3545;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.9em;
        z-index: 1000;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    logoutBtn.addEventListener('click', async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Logout error:', error);
            alert('Failed to log out. Please try again.');
        } else {
            window.location.href = 'admin-login.html';
        }
    });
    document.body.appendChild(logoutBtn);
}

/**
 * Fetches delivery prices from Supabase.
 * Ensures all price fields are parsed as numbers.
 */
async function fetchDeliveryPrices() {
    loadingMessagePrices.style.display = 'block';
    deliveryTableContainer.style.display = 'none';
    editFormContainer.style.display = 'none';

    const { data, error } = await supabase
        .from('delivery_prices')
        .select('id, wilaya_en, price_for_desk, price_for_home') // Select existing columns
        .order('id', { ascending: true }); // Order by 'id'

    if (error) {
        console.error('Error fetching delivery prices:', error);
        loadingMessagePrices.textContent = `Error loading prices: ${error.message}`;
        return [];
    }

    const parsedData = data.map(item => ({
        ...item,
        price_for_desk: parseFloat(item.price_for_desk) || 0,
        price_for_home: parseFloat(item.price_for_home) || 0,
    }));

    currentDeliveryPrices = parsedData;
    loadingMessagePrices.style.display = 'none';
    deliveryTableContainer.style.display = 'block';
    renderDeliveryPricesTable(parsedData);
    return parsedData;
}

/**
 * Renders the delivery prices into the HTML table.
 * @param {Array} prices - The array of delivery price objects.
 */
function renderDeliveryPricesTable(prices) {
    deliveryPricesTbody.innerHTML = ''; // Clear existing rows

    if (prices.length === 0) {
        deliveryPricesTbody.innerHTML = '<tr><td colspan="5">No delivery prices found.</td></tr>';
        return;
    }

    prices.forEach(price => {
        const row = deliveryPricesTbody.insertRow();
        row.dataset.id = price.id; // Store 'id' for easy lookup

        row.insertCell().textContent = price.id; // Display ID
        row.insertCell().textContent = price.wilaya_en;
        row.insertCell().textContent = price.price_for_desk.toFixed(2);
        row.insertCell().textContent = price.price_for_home.toFixed(2);

        const actionsCell = row.insertCell();
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => openEditForm(price.id)); // Pass 'id' to edit form
        actionsCell.appendChild(editButton);
    });
}

/**
 * Opens the edit form populated with data for the selected wilaya.
 * @param {number} id - The 'id' of the row to edit.
 */
function openEditForm(id) {
    const priceToEdit = currentDeliveryPrices.find(p => p.id === id);

    if (priceToEdit) {
        editWilayaName.textContent = `${priceToEdit.wilaya_en}`;
        editIdInput.value = priceToEdit.id;
        editWilayaEnInput.value = priceToEdit.wilaya_en;

        editPriceDeskInput.value = priceToEdit.price_for_desk.toFixed(2);
        editPriceHomeInput.value = priceToEdit.price_for_home.toFixed(2);

        deliveryTableContainer.style.display = 'none';
        editFormContainer.style.display = 'block';
    } else {
        alert('Could not find price data for this entry.');
    }
}

function closeEditForm() {
    editFormContainer.style.display = 'none';
    deliveryTableContainer.style.display = 'block';
}

/**
 * Handles the form submission to update delivery prices in Supabase.
 * @param {Event} event - The form submission event.
 */
async function handleEditFormSubmit(event) {
    event.preventDefault();

    const saveButton = document.getElementById('save-price-btn');
    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';

    const idToUpdate = editIdInput.value; // Get the 'id' from the hidden input
    const updatedPriceDesk = parseFloat(editPriceDeskInput.value);
    const updatedPriceHome = parseFloat(editPriceHomeInput.value);

    if (isNaN(updatedPriceDesk) || isNaN(updatedPriceHome)) {
        alert('Please enter valid numbers for Desk and Home price fields.');
        saveButton.disabled = false;
        saveButton.textContent = 'Save Changes';
        return;
    }

    const { data, error } = await supabase
        .from('delivery_prices')
        .update({
            price_for_desk: updatedPriceDesk,
            price_for_home: updatedPriceHome,
        })
        .eq('id', idToUpdate); // Update by 'id'

    if (error) {
        console.error('Error updating price:', error);
        alert(`Failed to update price: ${error.message}`);
        saveButton.disabled = false;
        saveButton.textContent = 'Save Changes';
    } else {
        alert('Price updated successfully!');
        closeEditForm();
        fetchDeliveryPrices(); // Re-fetch and re-render the table to show updated data
    }
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', checkAuthAndLoad); // This initiates the auth check and page load
editDeliveryForm.addEventListener('submit', handleEditFormSubmit);
cancelEditBtn.addEventListener('click', closeEditForm);