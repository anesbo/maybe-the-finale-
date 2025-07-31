// /functions/footer.js

// This function will be exported so it can be used on other pages
export function insertFooter() {

    // The complete HTML structure for your footer
    const footerHTML = `
        <div class="footer-content">
            <div class="footer-section footer-links">
                <h4>Quick Links</h4>
                <a href="/index.html">Home</a>
                <a href="/contact-us.html">Contact Us</a>
            </div>

            <div class="footer-section footer-contact">
                <h4>Get in Touch</h4>
                <p>Phone: +213 (0) XX XX XX XX</p>
                <div>
                <p>developed by anes</p>
                <a  href='https://github.com/anesbo'>
                    <img src="/images/git.png" alt="github" class="footer-icon"></a>
                <a  href='https://www.instagram.com/anesb0?igsh=MTh0eW1qNTAwdDFmbA=='>    
                    <img src="/images/insta.png" alt="instagram" class="footer-icon"></a>
                </div>
            </div>
        </div>
        <div class="footer-copyright">
            &copy; <span id="current-year"></span> anes. All Rights Reserved.
        </div>
    `;

    // Find the placeholder element in your main HTML
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (footerPlaceholder) {
        // Inject the HTML into the placeholder
        footerPlaceholder.innerHTML = footerHTML;
        
        // Add the main 'site-footer' class for styling
        footerPlaceholder.classList.add('site-footer');

        // Update the copyright year
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    } else {
        console.warn('Footer placeholder not found. Could not insert footer.');
    }
}