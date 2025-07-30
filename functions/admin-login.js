// admin-login.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- Supabase Configuration ---
const supabaseUrl = 'https://eogfdfaclptqpkknixln.supabase.co'; // REPLACE WITH YOUR SUPABASE PROJECT URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvZ2ZkZmFjbHB0cXBra25peGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODMzNDQsImV4cCI6MjA2OTM1OTM0NH0.ikbfxz70_nGH8_7lYICyTRezE14ryuymlWR4e6BLyMg'; // REPLACE WITH YOUR SUPABASE PUBLIC ANON KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey);
// --- End Supabase Configuration ---

const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const errorMessage = document.getElementById('error-message');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    loginBtn.disabled = true;
    errorMessage.style.display = 'none';

    const email = emailInput.value;
    const password = passwordInput.value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        errorMessage.textContent = `Login failed: ${error.message}`;
        errorMessage.style.display = 'block';
        loginBtn.disabled = false;
        console.error('Login error:', error);
    } else {
        console.log('User logged in:', data.user);
        window.location.href = '/delivery-admin.html'; // Redirect to admin page on success
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        console.log('Already logged in, redirecting to admin page.');
        window.location.href = '/delivery-admin.html';
    }
});