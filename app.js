/**
 * P.P. Industries - formspree logic
 * Built to handle core interactions and secure API form routing.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Dom Element Cache (Updated) ---
    const elements = {
        header: document.querySelector('.main-header'),
        mobileToggle: document.querySelector('.mobile-nav-toggle'),
        navLinks: document.querySelector('.nav-links') // Added for mobile menu
    };

    // --- Window Scroll Controller (Fixed for Light Theme) ---
    const handleWindowScroll = () => {
        if (window.scrollY > 40) {
            elements.header.style.padding = '0.5rem 0';
            elements.header.style.backgroundColor = 'rgba(255, 251, 244, 0.98)'; // Warm White
            elements.header.style.boxShadow = '0 4px 12px rgba(123, 104, 89, 0.1)'; // Subtle shadow
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
            
            // Animate hamburger to an 'X' (optional visual feedback)
            elements.mobileToggle.classList.toggle('is-open');
        });
    }

    // --- Formspree Integration & Browser Caching ---
    function initializeContactForm() {
        const form = document.getElementById("rfpForm");
        const statusAlert = document.getElementById("formStatus");
        const submitBtn = document.getElementById("submit-btn");

        if (!form || !statusAlert) return;

        // 1. Check browser cache to prevent duplicate entries
        if (localStorage.getItem("pp_form_submitted") === "true") {
            statusAlert.style.display = "block";
            // Updated to match the Cream/Taupe aesthetic
            statusAlert.style.backgroundColor = "#F4F0DD"; 
            statusAlert.style.color = "#7B6859"; 
            statusAlert.style.borderColor = "#7B6859";
            statusAlert.innerHTML = "You have already submitted an inquiry. Our engineering team is reviewing your details.";
            
            // Lock form inputs cleanly
            Array.from(form.elements).forEach(element => element.disabled = true);
            if (submitBtn) {
                submitBtn.innerText = "Inquiry Already Submitted";
                submitBtn.style.opacity = "0.5";
                submitBtn.style.cursor = "not-allowed";
            }
            return;
        }

        // 2. Intercept submission using a native Promise-based handler
        form.addEventListener("submit", async (event) => {
            event.preventDefault(); 

            // Update button state immediately
            submitBtn.innerText = "Transmitting...";
            submitBtn.disabled = true;
            statusAlert.style.display = "none"; 

            const formData = new FormData(form);

            try {
                // Direct backend POST query to Formspree
                const response = await fetch("https://formspree.io/f/xeewyyob", {
                    method: "POST",
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                // Handle successful HTTP 200 responses
                if (response.ok) {
                    statusAlert.style.display = "block";
                    // Updated to a soft earthy green that fits the light theme
                    statusAlert.style.backgroundColor = "#E8F0E8"; 
                    statusAlert.style.color = "#27ae60";
                    statusAlert.style.borderColor = "#C3E6CB";
                    statusAlert.innerHTML = "Transmission successful. Your technical RFP has been received.";

                    // Save submission flag to browser memory cache
                    localStorage.setItem("pp_form_submitted", "true");

                    // Lock fields
                    Array.from(form.elements).forEach(element => element.disabled = true);
                    submitBtn.innerText = "RFP Secured";
                    submitBtn.style.opacity = "0.5";
                } 
                // Catch validation or system errors
                else {
                    const responseData = await response.json();
                    if (responseData.errors) {
                        statusAlert.innerHTML = "Error: " + responseData.errors.map(err => err.message).join(", ");
                    } else {
                        statusAlert.innerHTML = "System rejected the request. Code: " + response.status;
                    }
                    throw new Error("Server rejected request");
                }

            } catch (error) {
                statusAlert.style.display = "block";
                // Updated to a soft earthy red that fits the light theme
                statusAlert.style.backgroundColor = "#FDF2F2"; 
                statusAlert.style.color = "#eb5757";
                statusAlert.style.borderColor = "#FDE8E8";
                
                if (!statusAlert.innerHTML || statusAlert.innerHTML.includes("Transmission successful")) {
                    statusAlert.innerHTML = "Network timeout. Please verify your connection and attempt transmission again.";
                }
                
                // Re-enable button
                submitBtn.innerText = "Submit Technical RFP";
                submitBtn.disabled = false;
            }
        });
    }

    // Initialize the form logic
    initializeContactForm();
});