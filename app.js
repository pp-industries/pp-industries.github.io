document.addEventListener('DOMContentLoaded', () => {
    
    // --- Dom Element Cache ---
    const elements = {
        header: document.querySelector('.main-header'),
        mobileToggle: document.querySelector('.mobile-nav-toggle'),
        navLinks: document.querySelector('.nav-links'),
        featuredGrid: document.getElementById('featured-products-grid'), // For Home view
        allProductsGrid: document.getElementById('all-products-grid')     // For Catalog view
    };

    // --- Window Scroll Controller ---
    const handleWindowScroll = () => {
        if (window.scrollY > 40) {
            elements.header.style.padding = '0.5rem 0';
            elements.header.style.backgroundColor = 'rgba(255, 251, 244, 0.98)';
            elements.header.style.boxShadow = '0 4px 12px rgba(123, 104, 89, 0.1)';
        } else {
            elements.header.style.padding = '0';
            elements.header.style.backgroundColor = 'rgba(255, 251, 244, 0.95)';
            elements.header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.03)';
        }
    };
    window.addEventListener('scroll', handleWindowScroll);

    // --- Functional Mobile Nav Controller ---
    if (elements.mobileToggle) {
        elements.mobileToggle.addEventListener('click', () => {
            elements.navLinks.classList.toggle('active');
        });
    }

    // --- Dynamic JSON Product Ingestion Subsystem ---
    async function loadProductCatalog() {
        try {
            const response = await fetch('products.json');
            if (!response.ok) throw new Error("Failed to load products database file.");
            
            const productsList = await response.json();

            // Function to generate the HTML string structure for a card card component
            const createProductCard = (product) => `
                <div class="product-card">
                    <div class="product-img-wrapper">
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                    </div>
                    <div class="product-info">
                        <span class="prod-code">Code: ${product.code}</span>
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <a href="#contact" class="btn-text">Request Custom Mold &rarr;</a>
                    </div>
                </div>
            `;

            // Stream Type A: Inject Top 3 Featured items if on home page view
            if (elements.featuredGrid) {
                const featuredItems = productsList.slice(0, 3);
                elements.featuredGrid.innerHTML = featuredItems.map(createProductCard).join('');
            }

            // Stream Type B: Inject the entire file collection if on full catalog view
            if (elements.allProductsGrid) {
                elements.allProductsGrid.innerHTML = productsList.map(createProductCard).join('');
            }

        } catch (error) {
            console.error("Catalog Ingestion Pipeline Interruption:", error);
            const fallbackMsg = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Catalog loading down temporarily for maintenance. Please access specifications via direct PDF.</p>`;
            if (elements.featuredGrid) elements.featuredGrid.innerHTML = fallbackMsg;
            if (elements.allProductsGrid) elements.allProductsGrid.innerHTML = fallbackMsg;
        }
    }

    // --- Cookie Management Functions ---
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=Strict";
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // --- Core Formspree Integration Lifecycle ---
    function initializeContactForm() {
        const form = document.getElementById("rfpForm");
        const statusAlert = document.getElementById("formStatus");
        const submitBtn = document.getElementById("submit-btn");

        if (!form || !statusAlert) return;

        if (getCookie("pp_rfp_submitted") === "true") {
            statusAlert.style.display = "block";
            statusAlert.style.backgroundColor = "#F4F0DD"; 
            statusAlert.style.color = "#7B6859";           
            statusAlert.style.borderColor = "#7B6859";
            statusAlert.innerHTML = "You have already submitted an inquiry. Our engineering desk is reviewing your details!";
            
            Array.from(form.elements).forEach(element => element.disabled = true);
            if (submitBtn) {
                submitBtn.innerText = "Inquiry Already Submitted";
                submitBtn.style.opacity = "0.5";
                submitBtn.style.cursor = "not-allowed";
            }
            return;
        }

        form.addEventListener("submit", async (event) => {
            event.preventDefault(); 

            submitBtn.innerText = "Sending Inquiry...";
            submitBtn.disabled = true;
            statusAlert.style.display = "none"; 

            const formData = new FormData(form);

            try {
                const response = await fetch("https://formspree.io/f/xzdnryvj", {
                    method: "POST",
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    statusAlert.style.display = "block";
                    statusAlert.style.backgroundColor = "#E8F0E8"; 
                    statusAlert.style.color = "#1E4620";           
                    statusAlert.style.borderColor = "#C3E6CB";
                    statusAlert.innerHTML = "Thank you! Your inquiry has been sent successfully. Our team will contact you shortly.";

                    setCookie("pp_rfp_submitted", "true", 365);

                    Array.from(form.elements).forEach(element => element.disabled = true);
                    submitBtn.innerText = "Inquiry Sent";
                    submitBtn.style.opacity = "0.5";
                } else {
                    const responseData = await response.json();
                    if (responseData.errors) {
                        statusAlert.innerHTML = "Submission Error: " + responseData.errors.map(err => err.message).join(", ");
                    } else {
                        statusAlert.innerHTML = "Oops! System rejected this request. Code: " + response.status;
                    }
                    throw new Error("Formspree rejected package.");
                }

            } catch (error) {
                statusAlert.style.display = "block";
                statusAlert.style.backgroundColor = "#FDF2F2"; 
                statusAlert.style.color = "#9B1C1C";           
                statusAlert.style.borderColor = "#FDE8E8";
                
                if (!statusAlert.innerHTML || statusAlert.innerHTML.includes("successfully")) {
                    statusAlert.innerHTML = "Network connection issue. Please check your internet connectivity and try again.";
                }
                
                submitBtn.innerText = "Submit Technical RFP";
                submitBtn.disabled = false;
            }
        });
    }

    // Initialize Subsystems
    loadProductCatalog();
    initializeContactForm();
});