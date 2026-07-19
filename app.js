/**
 * P.P. Industries - formspree logic
 * Built to handle core interactions and secure API form routing.
 */

 document.addEventListener('DOMContentLoaded', () => {
    
    // --- Dom Element Cache ---
    const elements = {
        header: document.querySelector('.main-header'),
        mobileToggle: document.querySelector('.mobile-nav-toggle'),
        navLinks: document.querySelector('.nav-links')
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
            
            // Animate hamburger to an 'X' (optional visual feedback)
            elements.mobileToggle.classList.toggle('is-open');
        });
    }

    // --- Utility Functions for Cookie Management ---
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

        // 1. Intercept cookie verification state to block duplicate submissions
        if (getCookie("pp_rfp_submitted") === "true") {
            statusAlert.style.display = "block";
            statusAlert.style.backgroundColor = "#F4F0DD"; // Brand Cream
            statusAlert.style.color = "#7B6859";           // Brand Taupe
            statusAlert.style.borderColor = "#7B6859";
            statusAlert.innerHTML = "You have already submitted an inquiry. Our engineering desk is reviewing your details! For additional details, kindly mail - ppind79@gmail.com";
            
            // Cleanly freeze user interaction fields
            Array.from(form.elements).forEach(element => element.disabled = true);
            if (submitBtn) {
                submitBtn.innerText = "Inquiry Already Submitted";
                submitBtn.style.opacity = "0.5";
                submitBtn.style.cursor = "not-allowed";
            }
            return;
        }

        // 2. Form Submission Management Loop
        form.addEventListener("submit", async (event) => {
            event.preventDefault(); 

            // Visually freeze interactive state elements immediately
            submitBtn.innerText = "Sending Inquiry...";
            submitBtn.disabled = true;
            statusAlert.style.display = "none"; 

            const formData = new FormData(form);

            try {
                // Pointing directly to your active Formspree container path
                const response = await fetch("https://formspree.io/f/xzdnryvj", {
                    method: "POST",
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                // Case A: Delivery Successful (Matches clean light visual alerts)
                if (response.ok) {
                    statusAlert.style.display = "block";
                    statusAlert.style.backgroundColor = "#E8F0E8"; // Emerald White
                    statusAlert.style.color = "#1E4620";           // Deep Forest Green
                    statusAlert.style.borderColor = "#C3E6CB";
                    statusAlert.innerHTML = "Thank you! Your inquiry has been sent successfully. Our team will contact you shortly.";

                    // Drop persistent tracking cookie into user session (valid for 365 days)
                    setCookie("pp_rfp_submitted", "true", 365);

                    // Block further programmatic form resubmissions
                    Array.from(form.elements).forEach(element => element.disabled = true);
                    submitBtn.innerText = "Inquiry Sent";
                    submitBtn.style.opacity = "0.5";
                } 
                
                // Case B: Explicit API Field Validation Failure
                else {
                    const responseData = await response.json();
                    if (responseData.errors) {
                        statusAlert.innerHTML = "Submission Error: " + responseData.errors.map(err => err.message).join(", ");
                    } else {
                        statusAlert.innerHTML = "Oops! System rejected this request. Code: " + response.status;
                    }
                    throw new Error("Formspree rejected transmission package.");
                }

            } catch (error) {
                // Case C: Physical Network Timeout / Connection Dropped
                statusAlert.style.display = "block";
                statusAlert.style.backgroundColor = "#FDF2F2"; // Earthy Crimson
                statusAlert.style.color = "#9B1C1C";           // High-contrast Warning Red
                statusAlert.style.borderColor = "#FDE8E8";
                
                if (!statusAlert.innerHTML || statusAlert.innerHTML.includes("successfully")) {
                    statusAlert.innerHTML = "Network connection issue. Please check your internet connectivity and try again.";
                }
                
                // Safely restore actionable button states for re-attempts
                submitBtn.innerText = "Submit Technical RFP";
                submitBtn.disabled = false;
            }
        });
    }

    // Execute application subsystems
    initializeContactForm();
});