import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- Supabase Configuration ---
const supabaseUrl = 'https://eogfdfaclptqpkknixln.supabase.co'; // REPLACE WITH YOUR SUPABASE PROJECT URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvZ2ZkZmFjbHB0cXBra25peGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODMzNDQsImV4cCI6MjA2OTM1OTM0NH0.ikbfxz70_nGH8_7lYICyTRezE14ryuymlWR4e6BLyMg'; // REPLACE WITH YOUR SUPABASE PUBLIC ANON KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey);
// --- End Supabase Configuration ---
let currentPage = 1;
const rowsPerPage = 6; 
// --- DOM Elements ---
const initialLoadingMessage = document.getElementById('initial-loading-message');
const mainAdminContent = document.getElementById('main-admin-content');
const loadingMessageOrders = document.getElementById('loading-message-orders');
const ordersTableContainer = document.getElementById('orders-table-container');
const ordersTbody = document.getElementById('orders-tbody');
const statusFilter = document.getElementById('statusFilter'); // Get the filter dropdown

// --- Global State ---
let allOrders = []; // This will be our master list of orders

// =================================================================================
// RENDER & FILTER FUNCTIONS (NEW/MODIFIED)
// =================================================================================

/**
 * Renders the provided array of orders into the table body.
 * @param {Array} ordersToRender - The array of order objects to display.
 */


function updatePaginationControls() {
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    const pageInfo = document.getElementById('page-info');

    // Calculate the total number of pages needed
    const totalPages = Math.ceil(allOrders.length / rowsPerPage);

    // Update the page info text
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    // Disable the 'Previous' button if on the first page
    prevBtn.disabled = currentPage === 1;

    // Disable the 'Next' button if on the last page
    nextBtn.disabled = currentPage === totalPages;
}

/**
 * Slices the main data array and renders the table for the given page.
 * @param {number} page - The page number to display.
 */
function displayPage(page) {
    currentPage = page;
    
    // Calculate the start and end index for the data slice
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    
    // Get the subset of orders for the current page
    const paginatedOrders = allOrders.slice(startIndex, endIndex);

    // Render the table with only the data for the current page
    renderTable(paginatedOrders);
    
    // Update the buttons and page number display
    updatePaginationControls();
}

function renderTable(ordersToRender) {
    // Show a message if the array (original or filtered) is empty
    if (!ordersToRender || ordersToRender.length === 0) {
        ordersTbody.innerHTML = `<tr><td colspan="11">No orders found.</td></tr>`;
        return;
    }

    // Map the orders array to HTML table rows
    const rowsHtml = ordersToRender.map(order => `
        <tr>
            <td data-label="Order ID">${order.id}</td>
            <td data-label="Product Name">${order.product_name}</td>
            <td data-label="Quantity">${order.quantity}</td>
            <td data-label="Total Price">${parseFloat(order.total_price).toFixed(2)} DZD</td>
            <td data-label="Customer Name">${order.name}</td>
            <td data-label="Phone Number">${order.phoneNumber}</td>
            <td data-label="Wilaya">${order.state || 'N/A'}</td>
            <td data-label="Delivery Details">${order.address === 'Delivery to Desk' ? order.address :order.address}</td>
            <td data-label="Status">${order.status}</td>
            <td data-label="Created At">${order.created_at ? new Date(order.created_at).toLocaleString('fr-DZ', { timeZone: 'Africa/Algiers' }) : 'N/A'}</td>
            <td data-label="Actions">
                <select class="statusFilter" data-id="${order.id}">
                    <option value="pending" ${order.status.toLowerCase() === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="Canceled" ${order.status === 'Canceled' ? 'selected' : ''}>Canceled</option>
                </select>
                <button class="delete-btn" data-id="${order.id}">Delete</button>
            </td>
        </tr>
    `).join('');

    ordersTbody.innerHTML = rowsHtml;
}

// This part of your JavaScript function...

/**
 * Calculates statistics from the allOrders array and updates the DOM.
 * 📊 This function scans all orders to find key metrics.
 */


// =================================================================================
// DATA FETCHING AND MANIPULATION
// =================================================================================

/**
 * Main function to fetch all orders from Supabase.
 * This is MODIFIED to work with renderTable().
 */
async function fetchOrders(status = '') {
    loadingMessageOrders.style.display = 'block';
    ordersTableContainer.style.display = 'none';

    // Start building the query
    let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    // If a status is provided, add the filter
    if (status) {
        query = query.eq('status', status);
    }
    
    const { data: orders, error } = await query;

    loadingMessageOrders.style.display = 'none';
    ordersTableContainer.style.display = 'block';

    if (error) {
        console.error('Error fetching orders:', error);
        ordersTbody.innerHTML = `<tr><td colspan="11">Error: ${error.message}</td></tr>`;
        return;
    }

    // 1. Save the newly fetched (and possibly filtered) data
    allOrders = orders || []; 

    // 2. Display page 1 of the new data set
    displayPage(1);
}
// Add this to your Event Listeners section at the bottom of the file

const prevBtn = document.getElementById('prev-page-btn');
const nextBtn = document.getElementById('next-page-btn');

if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        // Go to the previous page
        displayPage(currentPage - 1);
    });
}

if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        // Go to the next page
        displayPage(currentPage + 1);
    });
}

/**
 * Function to update an order's status.
 * It re-fetches all orders after completion to ensure data is fresh.
 */
async function updateOrderStatus(orderId, newStatus) {
    const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

    if (error) {
        alert(`Error updating status: ${error.message}`);
        console.error('Error updating order status:', error);
    } else {
        // After updating, re-fetch all data to ensure the view is consistent
        await fetchOrders(); 
    }
}

/**
 * Function to delete an order.
 * It re-fetches all orders after completion.
 */
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
            // After deleting, re-fetch all data
            await fetchOrders(); 
        }
    }
}
ordersTbody.addEventListener('click', (event) => {
    
    // --- NEW LOGIC FOR DELETE BUTTON ---
    // Check if a button with the class 'delete-order-btn' was clicked
    if (event.target.matches('.delete-order-btn')) {
        // Get the order ID from the button's data-id attribute
        const orderId = event.target.dataset.id;
        
        // Call your existing deleteOrder function
        deleteOrder(orderId);
    }
    
    // You can keep other click logic here too, like for product links
    if (event.target.matches('a.product-link')) {
        // ... your product link logic ...
    }
});

// =================================================================================
// AUTHENTICATION & INITIALIZATION
// =================================================================================

/**
 * Checks user authentication and admin role.
 */
async function checkAuthAndLoad() {
    initialLoadingMessage.style.display = 'flex';
    mainAdminContent.style.display = 'none';

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        window.location.href = 'admin-login.html';
        return;
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (error || !profile || profile.role !== 'admin') {
        alert('Access Denied: You must be an administrator.');
        await supabase.auth.signOut();
        window.location.href = 'admin-login.html';
        return;
    }

    // User is an admin, show the main content and load data
    initialLoadingMessage.style.display = 'none';
    mainAdminContent.style.display = 'block';
    
    await fetchOrders();
    await fetchAndDisplayStats();

    // Setup logout button
    const logoutBtn = document.getElementById('logout-button');

// Add the logout functionality to it
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Logout error:', error);
            alert('Failed to log out. Please try again.');
        } else {
            window.location.href = '/admin-login.html';
        }
    });
}
}


// =================================================================================
// EVENT LISTENERS
// =================================================================================

// Listen for clicks on the action buttons (Done, Cancel, Delete)
ordersTbody.addEventListener('change', (event) => {
    // Check if the element that changed was a status dropdown
    if (event.target.matches('.statusFilter')) {
        const selectElement = event.target;
        
        // Get the order ID from the dropdown's data-id attribute
        const orderId = selectElement.dataset.id;
        
        // Get the new status from the selected option's value
        const newStatus = selectElement.value;

        console.log(`Updating order #${orderId} to status: ${newStatus}`);

        // Call your existing function to update the status in the database
        updateOrderStatus(orderId, newStatus);
    }
});

/**
 * Called when the status filter dropdown changes.
 */
function handleStatusFilterChange() {
    const selectedStatus = document.getElementById('statusFilter').value;
    
    // Re-fetch the orders from the backend with the selected status
    fetchOrders(selectedStatus);
}

// =================================================================================
// EVENT LISTENERS (Add this section at the bottom of your file)
// =================================================================================

/**
 * Fetches total order counts for each status directly from the database.
 * This is efficient and always reflects the total data, regardless of table filters.
 */
async function fetchAndDisplayStats() {
    try {
      // We create a promise for each count we need from the database.
      // The { count: 'exact', head: true } part is very efficient;
      // it only gets the count, not the full data.
      const pendingPromise = supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      const shippedPromise = supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'Shipped');
      const deliveredPromise = supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'Delivered');
      const canceledPromise = supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'Canceled');
  
      // Promise.all runs all four queries at the same time for speed.
      const [
        { count: pendingCount },
        { count: shippedCount },
        { count: deliveredCount },
        { count: canceledCount }
      ] = await Promise.all([
          pendingPromise, 
          shippedPromise, 
          deliveredPromise, 
          canceledPromise
      ]);
  
      // Update the HTML elements with the counts from the database
      document.getElementById('stats-pending').textContent = pendingCount ?? 0;
      document.getElementById('stats-shipped').textContent = shippedCount ?? 0;
      document.getElementById('stats-delivered').textContent = deliveredCount ?? 0;
      document.getElementById('stats-canceled').textContent = canceledCount ?? 0;
  
    } catch (error) {
      console.error('Error fetching order stats:', error);
      // Optionally, hide the stats or show an error message
    }
  }
// Find the filter dropdown element


// Attach the event listener programmatically
if (statusFilter) {
    statusFilter.addEventListener('change', handleStatusFilterChange);
}

// Your existing listener for page load
document.addEventListener('DOMContentLoaded', checkAuthAndLoad);

// Your existing listener for table clicks
ordersTbody.addEventListener('click', (event) => {
    // ... your button click logic
});

// Listen for changes on the status filter dropdown
if (statusFilter) {
    statusFilter.addEventListener('change', handleStatusFilterChange);
}

// Initial check when the page loads
document.addEventListener('DOMContentLoaded', checkAuthAndLoad);