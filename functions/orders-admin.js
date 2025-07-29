const supabaseUrl = 'https://eogfdfaclptqpkknixln.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvZ2ZkZmFjbHB0cXBra25peGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODMzNDQsImV4cCI6MjA2OTM1OTM0NH0.ikbfxz70_nGH8_7lYICyTRezE14ryuymlWR4e6BLyMg';  // ❗️ Add your Key here
const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

const tableBody = document.getElementById('orders-table-body');

// Function to update an order's status
async function updateOrderStatus(orderId, newStatus) {
  const { error } = await supabaseClient
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId);

  if (error) {
    alert(`Error updating status: ${error.message}`);
  } else {
    fetchOrders(); // Refresh the table
  }
}

// Function to delete an order
async function deleteOrder(orderId) {
  if (confirm('Are you sure you want to delete this order?')) {
    const { error } = await supabaseClient
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      alert(`Error deleting order: ${error.message}`);
    } else {
      fetchOrders(); // Refresh the table
    }
  }
}

// Main function to fetch and display all orders
async function fetchOrders() {
  tableBody.innerHTML = `<tr><td colspan="8">Loading...</td></tr>`;

  const { data: orders, error } = await supabaseClient
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    tableBody.innerHTML = `<tr><td colspan="8">Error: ${error.message}</td></tr>`;
    return;
  }

  if (orders.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8">No orders found.</td></tr>`;
    return;
  }

  // Populate the table with order data and action buttons
  const rowsHtml = orders.map(order => `
    <tr>
      <td data-label="Order Date">${order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}</td>
      <td data-label="Customer Name">${order.name}</td>
      <td data-label="Phone Number">${order.phoneNumber}</td>
      <td data-label="Product Name">${order.product_name}</td>
      <td data-label="Quantity">${order.quantity}</td>
      <td data-label="Total Price">$${order.total_price.toFixed(2)}</td>
      <td data-label="Status">${order.status}</td>
      <td data-label="Actions">
        <button data-id="${order.id}" data-action="done">Done</button>
        <button data-id="${order.id}" data-action="cancel">Cancel</button>
        <button data-id="${order.id}" data-action="delete" style="background-color:#dc2626;">Delete</button>
      </td>
    </tr>
  `).join('');

  tableBody.innerHTML = rowsHtml;
}

// Use event delegation to handle clicks on the buttons
tableBody.addEventListener('click', (event) => {
  if (event.target.matches('button')) {
    const button = event.target;
    const orderId = button.dataset.id;
    const action = button.dataset.action;

    if (action === 'done') {
      updateOrderStatus(orderId, 'done');
    } else if (action === 'cancel') {
      updateOrderStatus(orderId, 'canceled');
    } else if (action === 'delete') {
      deleteOrder(orderId);
    }
  }
});

// Initial fetch
fetchOrders();