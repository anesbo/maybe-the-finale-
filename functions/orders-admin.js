// orders-admin.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- Supabase Configuration ---
const supabaseUrl = 'https://eogfdfaclptqpkknixln.supabase.co'; // REPLACE WITH YOUR SUPABASE PROJECT URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvZ2ZkZmFjbHB0cXBra25peGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODMzNDQsImV4cCI6MjA2OTM1OTM0NH0.ikbfxz70_nGH8_7lYICyTRezE14ryuymlWR4e6BLyMg'; // REPLACE WITH YOUR SUPABASE PUBLIC ANON KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey);
// --- End Supabase Configuration ---

// Global DOM Elements for initial loading and main content
const initialLoadingMessage = document.getElementById('initial-loading-message');
const mainAdminContent = document.getElementById('main-admin-content');

// DOM Elements for Orders Section
const loadingMessageOrders = document.getElementById('loading-message-orders');
const ordersTableContainer = document.getElementById('orders-table-container');
const ordersTbody = document.getElementById('orders-tbody'); // Use ordersTbody

const logoutBtn = document.createElement('button'); // Dynamically created logout button

/**
 * Check user authentication status and admin role.
 * If not logged in or not an admin, redirects to the login page.
 * Otherwise, loads the orders management content.
 */
async function checkAuthAndLoad() {
    // Show initial loading message and hide main content while checking
    initialLoadingMessage.style.display = 'flex';
    mainAdminContent.style.display = 'none';
    initialLoadingMessage.querySelector('p').textContent = 'Checking admin access...';
    initialLoadingMessage.querySelector('.spinner').style.display = 'block';

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
    console.log("5. User is admin. Loading customer orders content.");
    initialLoadingMessage.style.display = 'none'; // Hide initial loading overlay
    mainAdminContent.style.display = 'block';   // Show main content

    // Proceed to load data for this section
    loadingMessageOrders.textContent = 'Loading orders...';
    await fetchOrders(); // Load customer orders

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


// Function to update an order's status
async function updateOrderStatus(orderId, newStatus) {
    const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

    if (error) {
        alert(`Error updating status: ${error.message}`);
        console.error('Error updating order status:', error);
    } else {
        fetchOrders(); // Refresh the table
    }
}

// Function to delete an order
async function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId);

        if (error) {
            alert(`Error deleting order: ${error.message}`);
            console.error('Error deleting order:', error);
        } else {
            fetchOrders(); // Refresh the table
        }
    }
}

// Main function to fetch and display all orders
async function fetchOrders() {
    loadingMessageOrders.style.display = 'block';
    ordersTableContainer.style.display = 'none';
    ordersTbody.innerHTML = `<tr><td colspan="11">Loading orders...</td></tr>`; // Updated colspan

    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        ordersTbody.innerHTML = `<tr><td colspan="11">Error: ${error.message}</td></tr>`; // Updated colspan
        console.error('Error fetching orders:', error);
        loadingMessageOrders.textContent = `Error loading orders: ${error.message}`;
        return;
    }

    loadingMessageOrders.style.display = 'none';
    ordersTableContainer.style.display = 'block';

    if (orders.length === 0) {
        ordersTbody.innerHTML = `<tr><td colspan="11">No orders found.</td></tr>`; // Updated colspan
        return;
    }

    // Populate the table with order data and action buttons
    const rowsHtml = orders.map(order => `
        <tr>
            <td data-label="Order ID">${order.id}</td>
            <td data-label="Product Name">${order.product_name}</td>
            <td data-label="Quantity">${order.quantity}</td>
            <td data-label="Total Price">${parseFloat(order.total_price).toFixed(2)} DZD</td>
            <td data-label="Customer Name">${order.name}</td>
            <td data-label="Phone Number">${order.phoneNumber}</td>
            <td data-label="Wilaya">${order.state || 'N/A'}</td>
            <td data-label="Delivery Details">${order.delivery_type === 'Home' ? order.address : order.delivery_type}</td>
            <td data-label="Status">${order.status || 'pending'}</td>
            <td data-label="Created At">${order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}</td>
            <td data-label="Actions">
                <button data-id="${order.id}" data-action="done">Done</button>
                <button data-id="${order.id}" data-action="cancel">Cancel</button>
                <button data-id="${order.id}" data-action="delete" style="background-color:#dc2626;">Delete</button>
            </td>
        </tr>
    `).join('');

    ordersTbody.innerHTML = rowsHtml;
}

// Use event delegation to handle clicks on the buttons within the orders table
ordersTbody.addEventListener('click', (event) => {
    if (event.target.matches('button')) {
        const button = event.target;
        const orderId = button.dataset.id;
        const action = button.dataset.action;

        if (action === 'done') {
            updateOrderStatus(orderId, 'Done'); // Capitalized 'Done'
        } else if (action === 'cancel') {
            updateOrderStatus(orderId, 'Canceled'); // Capitalized 'Canceled'
        } else if (action === 'delete') {
            deleteOrder(orderId);
        }
    }
});


// Initial check on page load
document.addEventListener('DOMContentLoaded', checkAuthAndLoad);