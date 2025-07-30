// navbar.js (Updated with Root-Relative Paths)

/**
 * Dynamically creates and inserts the common navigation bar into the page.
 * Highlights the active link based on the current page's filename.
 * Implements a responsive hamburger menu for mobile.
 */
export function insertNavbar() {
    // Get the full path from the root (e.g., "/index.html", "/pages/about-us.html", or "/" for root)
    const currentPath = window.location.pathname;
    // Get just the filename (e.g., "index.html", "about-us.html", or empty string for root)
    const currentPageFilename = currentPath.split('/').pop();
    
    console.log(`Navbar: Current Path is "${currentPath}", Filename is "${currentPageFilename}"`);

    const navbarHtml = `
        <header>
            <nav class="navbar">
                <div class="store-name">
                    Store
                </div>
                <button class="hamburger-icon" aria-label="Toggle navigation menu">
                    <span class="bar"></span>
                    <span class="bar"></span>
                    <span class="bar"></span>
                </button>
                <ul class="nav-links desktop-nav" id="desktop-nav-links-container">
                    <li><a href="/">Main Page</a></li>               <li><a href="about-us.html">About Us</a></li>     <li><a href="contact-us.html">Contact Us</a></li> </ul>
            </nav>

            <div class="mobile-menu-overlay" id="mobile-menu-overlay"></div>
            <ul class="nav-links mobile-nav" id="mobile-nav-links-container">
                <li><a href="/">Main Page</a></li>               <li><a href="about-us.html">About Us</a></li>     <li><a href="contact-us.html">Contact Us</a></li> </ul>
        </header>
    `;

    document.body.insertAdjacentHTML('afterbegin', navbarHtml);

    // --- Active Link Highlighting Logic ---
    const desktopNavLinksContainer = document.getElementById('desktop-nav-links-container');
    const mobileNavLinksContainer = document.getElementById('mobile-nav-links-container');

    const applyActiveClass = (container) => {
        if (!container) {
            console.warn("Navbar: Container not found for active class highlighting.");
            return;
        }

        const links = container.querySelectorAll('a');
        links.forEach(link => {
            link.classList.remove('active'); // First, remove 'active' from all links in this container

            const linkHref = link.getAttribute('href');
            if (!linkHref) {
                console.log("Navbar: Skipping link without href:", link);
                return;
            }

            console.log(`Navbar: Checking link "${linkHref}". Current Path: "${currentPath}".`);

            let isActive = false;

            // Normalize the linkHref for comparison (remove trailing slashes, etc.)
            let normalizedLinkHref = linkHref;
            if (linkHref === '/') { // Home link might be just "/"
                normalizedLinkHref = '/index.html'; // Treat "/" as "/index.html" for comparison
            }
            
            // Normalize currentPath for comparison (e.g., "/" -> "/index.html" or "/product.html" special case)
            let normalizedCurrentPath = currentPath;
            if (currentPath === '/') {
                normalizedCurrentPath = '/index.html'; // Treat root path as index.html
            } else if (currentPath.includes('/product.html')) {
                normalizedCurrentPath = '/index.html'; // Product page makes Main Page active
            }


            // Direct comparison of the full root-relative paths
            if (normalizedLinkHref === normalizedCurrentPath) {
                isActive = true;
            }
            
            // Special case: If link is "/index.html" and current path is "/product.html"
            // This needs to map product page to main page link, so the main page link should be active
            if (linkHref === '/' && currentPath.includes('/product.html')) {
                 isActive = true;
            }


            if (isActive) {
                link.classList.add('active');
                console.log(`Navbar: ACTIVE link set for: "${linkHref}"`);
            }
        });
    };

    applyActiveClass(desktopNavLinksContainer);
    applyActiveClass(mobileNavLinksContainer);

    // --- Hamburger Menu Logic (remains the same) ---
    const hamburgerIcon = document.querySelector('.hamburger-icon');
    const mobileNavLinks = document.getElementById('mobile-nav-links-container');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');

    const toggleMobileMenu = () => {
        mobileNavLinks.classList.toggle('is-open');
        mobileMenuOverlay.classList.toggle('is-open');
        document.body.classList.toggle('no-scroll');
        hamburgerIcon.classList.toggle('is-open');
    };

    if (hamburgerIcon) {
        hamburgerIcon.addEventListener('click', toggleMobileMenu);
    }
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', toggleMobileMenu);
    }

    if (mobileNavLinks) {
        mobileNavLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mobileNavLinks.classList.contains('is-open')) {
                    toggleMobileMenu();
                }
            });
        });
    }
}