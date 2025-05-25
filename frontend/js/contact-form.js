// js/contact-form.js
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formFeedback = document.getElementById('contactFormFeedback'); // Assumes class 'form-feedback-message' for styling

    function showError(inputElement, message) {
        const formGroup = inputElement.closest('.form-group');
        if (!formGroup) return;
        const errorElement = formGroup.querySelector('.form-error');
        inputElement.classList.add('is-invalid');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    function clearError(inputElement) {
        const formGroup = inputElement.closest('.form-group');
        if (!formGroup) return;
        const errorElement = formGroup.querySelector('.form-error');
        inputElement.classList.remove('is-invalid');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    function validateField(field) {
        clearError(field);
        let isValid = true;
        if (field.required && field.value.trim() === '') {
            showError(field, `${field.labels[0].textContent} is required.`);
            isValid = false;
        }
        if (field.type === 'email' && field.value.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) {
            showError(field, 'Please enter a valid email address.');
            isValid = false;
        }
        return isValid;
    }
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            if(formFeedback) {
                formFeedback.textContent = '';
                formFeedback.className = 'form-feedback-message'; // Reset classes
            }

            let isFormValid = true;
            const fieldsToValidate = contactForm.querySelectorAll('input[required], textarea[required]');
            
            fieldsToValidate.forEach(field => {
                if (!validateField(field)) {
                    isFormValid = false;
                }
            });
            // Also validate non-required fields if they have specific patterns (e.g. subject format - not done here)

            if (isFormValid) {
                const formData = new FormData(contactForm);
                const messageData = {
                    id: `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                    name: formData.get('contactName'),
                    email: formData.get('contactEmail'),
                    subject: formData.get('contactSubject') || 'No Subject',
                    message: formData.get('contactMessage'),
                    receivedAt: new Date().toISOString(),
                    isRead: false
                };

                try {
                    let messages = JSON.parse(localStorage.getItem('corkGrillContactMessages')) || [];
                    messages.unshift(messageData); // Add new message to the beginning
                    localStorage.setItem('corkGrillContactMessages', JSON.stringify(messages));
                    
                    if(formFeedback) {
                        formFeedback.textContent = 'Thank you! Your message has been received (simulated).';
                        formFeedback.classList.add('success');
                    }
                    contactForm.reset(); 
                    fieldsToValidate.forEach(field => clearError(field)); // Clear errors after reset

                    // Optional: Show a global toast message as well
                    if (typeof showToast === 'function') {
                        showToast('Message sent successfully!', 'success');
                    }


                } catch (e) {
                    console.error("Error saving contact message to localStorage:", e);
                    if(formFeedback) {
                        formFeedback.textContent = 'Sorry, there was an error sending your message. Please try again.';
                        formFeedback.classList.add('error');
                    }
                }

            } else {
                if(formFeedback) {
                    formFeedback.textContent = 'Please correct the errors highlighted above.';
                    formFeedback.classList.add('error');
                }
            }
        });

        // Real-time validation feedback as user types or blurs
        contactForm.querySelectorAll('input[required], textarea[required]').forEach(field => {
            field.addEventListener('blur', () => validateField(field)); // Validate on blur
            field.addEventListener('input', () => { // Clear error on input if user starts typing
                if (field.classList.contains('is-invalid')) {
                    validateField(field); // Re-validate or just clear
                }
            });
        });
    }
});