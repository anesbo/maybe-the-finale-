// stock-admin.js

import { localProducts } from '/functions/products2.js'; 
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- Supabase Configuration ---
const supabaseUrl = 'https://eogfdfaclptqpkknixln.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvZ2ZkZmFjbHB0cXBra25peGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODMzNDQsImV4cCI6MjA2OTM1OTM0NH0.ikbfxz70_nGH8_7lYICyTRezE14ryuymlWR4e6BLyMg'; // REPLACE WITH YOUR SUPABASE PUBLIC ANON KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const container = document.getElementById('stock-overview-container');
const loadingMessage = document.getElementById('loading-message');

/**
 * Fetches all data and builds the complete stock overview page.
 */
// In stock-admin.js
async function displayStockOverview() {
    try {
        const { data: allVariants, error } = await supabase.from('product_stock').select('*').order('id', { ascending: true });
        if (error) throw error;

        const allProductsHtml = localProducts.map(product => {
            const variantsForThisProduct = allVariants.filter(variant => variant.product_id === product.id);
            return `
                <div class="product-stock-card">
                    <h2>${product.name}</h2>
                    <table class="variants-table">
                        <thead>
                            <tr>
                                <th>Size</th>
                                <th>Color</th>
                                <th>Stock Quantity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${variantsForThisProduct.map(variant => `
                                <tr>
                                    <td data-label="Size">${variant.size}</td>
                                    <td data-label="Color">${variant.color}</td>
                                    <td data-label="Stock Quantity"><input type="number" class="stock-input" value="${variant.stock_quantity}" min="0"></td>
                                    <td data-label="Actions" class="actions-cell">
                                        <button class="save-stock-btn" data-variant-id="${variant.id}">Save</button>
                                        <button class="delete-variant-btn" data-variant-id="${variant.id}">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td data-label="New Size"><input type="text" class="new-variant-size" placeholder="e.g., L"></td>
                                <td data-label="New Color"><input type="text" class="new-variant-color" placeholder="e.g., Green"></td>
                                <td data-label="New Stock"><input type="number" class="new-variant-stock" placeholder="e.g., 50" min="0"></td>
                                <td data-label="Add New"><button class="add-variant-btn" data-product-id="${product.id}">Add Variant</button></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            `;
        }).join('');

        loadingMessage.style.display = 'none';
        container.innerHTML = allProductsHtml;

    } catch (error) {
        console.error("Error building stock overview:", error);
        loadingMessage.innerHTML = `<p class="error">Failed to load stock data: ${error.message}</p>`;
    }
}

/**
 * Updates the stock for an EXISTING variant.
 */
async function updateStock(variantId, newQuantity) {
    const { error } = await supabase
        .from('product_stock')
        .update({ stock_quantity: newQuantity })
        .eq('id', variantId);
    
    if (error) {
        alert('Error updating stock: ' + error.message);
    } else {
        alert(`Stock updated successfully!`);
    }
}

/**
 * Adds a NEW variant to the database.
 */
async function addNewVariant(productId, size, color, quantity) {
    const { error } = await supabase
        .from('product_stock')
        .insert({ product_id: productId, size: size, color: color, stock_quantity: quantity });

    if (error) {
        alert('Error adding new variant: ' + error.message);
    } else {
        alert('New variant added successfully! The page will now refresh.');
        displayStockOverview();
    }
}

/**
 * NEW: Deletes a variant from the database.
 */
async function deleteVariant(variantId) {
    // Show a confirmation dialog to prevent accidental deletion
    if (confirm('Are you sure you want to permanently delete this variant?')) {
        const { error } = await supabase
            .from('product_stock')
            .delete()
            .eq('id', variantId);

        if (error) {
            alert('Error deleting variant: ' + error.message);
        } else {
            alert('Variant deleted successfully! The page will now refresh.');
            displayStockOverview(); // Refresh the entire view
        }
    }
}

// --- Event Listener for ALL buttons inside the container ---
container.addEventListener('click', async (event) => {
    // --- Logic for the "Save" button ---
    if (event.target.matches('.save-stock-btn')) {
        const button = event.target;
        button.disabled = true;
        button.textContent = 'Saving...';

        const variantId = button.dataset.variantId;
        const input = button.closest('tr').querySelector('.stock-input');
        const newQuantity = parseInt(input.value, 10);

        if (!isNaN(newQuantity) && newQuantity >= 0) {
            await updateStock(variantId, newQuantity);
        } else {
            alert('Please enter a valid, non-negative number.');
        }
        button.disabled = false;
        button.textContent = 'Save';
    }

    // --- Logic for the "Add Variant" button ---
    if (event.target.matches('.add-variant-btn')) {
        const button = event.target;
        button.disabled = true;
        button.textContent = 'Adding...';

        const productId = button.dataset.productId;
        const row = button.closest('tr');
        const size = row.querySelector('.new-variant-size').value.trim();
        const color = row.querySelector('.new-variant-color').value.trim();
        const quantity = parseInt(row.querySelector('.new-variant-stock').value, 10);

        if (size && color && !isNaN(quantity) && quantity >= 0) {
            await addNewVariant(productId, size, color, quantity);
        } else {
            alert('Please fill in all fields (Size, Color, Quantity) for the new variant.');
        }
        
        button.disabled = false;
        button.textContent = 'Add Variant';
    }
    
    // --- NEW: Logic for the "Delete" button ---
    if (event.target.matches('.delete-variant-btn')) {
        const button = event.target;
        const variantId = button.dataset.variantId;
        await deleteVariant(variantId);
    }
});

// --- Initial Load ---
displayStockOverview();