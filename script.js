// GANTI URL_INI dengan URL Web App dari Google Apps Script
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbziPXLpmtFAxhqi3P0sX4RLHJQ22DLgaT053YNStyrsmJpgu3nS0iEva-QDquFE6fOPzA/exec";

// DOM Elements
const form = document.getElementById('mainForm');
const formMessage = document.getElementById('form-message');
const submitText = document.getElementById('submit-text');
const loadingSpinner = document.getElementById('loading-spinner');
const backToTopBtn = document.getElementById('backToTop');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

// Mobile Menu Toggle
menuToggle.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && 
        !e.target.closest('.nav-links') && 
        !e.target.closest('.menu-toggle')) {
        navLinks.style.display = 'none';
    }
});

// Back to Top Button
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopBtn.style.display = 'flex';
    } else {
        backToTopBtn.style.display = 'none';
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Form Validation
function validateField(field) {
    const value = field.value.trim();
    const errorElement = field.parentElement.querySelector('.error-message');
    
    // Clear previous error
    errorElement.textContent = '';
    field.style.borderColor = '#ddd';
    
    // Required validation
    if (field.hasAttribute('required') && !value) {
        errorElement.textContent = 'Field ini wajib diisi';
        field.style.borderColor = '#f44336';
        return false;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            errorElement.textContent = 'Format email tidak valid';
            field.style.borderColor = '#f44336';
            return false;
        }
    }
    
    // Phone validation (optional)
    if (field.name === 'Telepon' && value) {
        const phoneRegex = /^[0-9+\-\s()]{10,}$/;
        if (!phoneRegex.test(value)) {
            errorElement.textContent = 'Format telepon tidak valid';
            field.style.borderColor = '#f44336';
            return false;
        }
    }
    
    return true;
}

// Real-time validation
form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
        const errorElement = field.parentElement.querySelector('.error-message');
        errorElement.textContent = '';
        field.style.borderColor = '#ddd';
    });
});

// Form Submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate all fields
    let isValid = true;
    const fields = form.querySelectorAll('input, textarea');
    
    fields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showFormMessage('Harap perbaiki error di atas', 'error');
        return;
    }
    
    // Disable submit button and show loading
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitText.style.display = 'none';
    loadingSpinner.style.display = 'block';
    
    try {
        // Prepare form data
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Send to Google Apps Script
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(data)
        });
        
        // Note: 'no-cors' mode doesn't allow reading response
        // But we assume it's successful if no network error
        
        // Simulate response for demo
        setTimeout(() => {
            showFormMessage('Pesan Anda berhasil dikirim! Kami akan menghubungi Anda dalam 1x24 jam.', 'success');
            form.reset();
            
            // Re-enable submit button
            submitBtn.disabled = false;
            submitText.style.display = 'block';
            loadingSpinner.style.display = 'none';
        }, 1500);
        
    } catch (error) {
        showFormMessage('Terjadi kesalahan. Silakan coba lagi atau hubungi kami langsung.', 'error');
        
        // Re-enable submit button
        submitBtn.disabled = false;
        submitText.style.display = 'block';
        loadingSpinner.style.display = 'none';
    }
});

// Show form message
function showFormMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = type === 'success' ? 'success-message' : 'error-message-global';
    formMessage.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        formMessage.style.display = 'none';
    }, 5000);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                navLinks.style.display = 'none';
            }
        }
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set minimum height for mobile menu
    if (window.innerWidth <= 768) {
        navLinks.style.display = 'none';
    } else {
        navLinks.style.display = 'flex';
    }
    
    // Add animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements to animate
    document.querySelectorAll('.feature-card, .contact-form, .hero-image').forEach(el => {
        observer.observe(el);
    });
});