// Footer Newsletter Form Enhancement
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.querySelector('.footer_form');
    const emailInput = document.querySelector('.footer_input');
    const submitButton = document.querySelector('.footer_submit');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            
            if (!validateEmail(email)) {
                showError(emailInput, 'Por favor ingresa un correo válido');
                shakeElement(emailInput);
                return;
            }
            
            // Show loading state
            setLoadingState(true);
            
            // Simulate API call
            setTimeout(() => {
                showSuccess(emailInput, submitButton);
                setLoadingState(false);
                emailInput.value = '';
                
                // Reset success message after 3 seconds
                setTimeout(() => {
                    resetForm(emailInput, submitButton);
                }, 3000);
            }, 1500);
        });
        
        // Real-time validation
        emailInput.addEventListener('input', function() {
            const email = this.value.trim();
            if (email && !validateEmail(email)) {
                this.style.borderColor = '#ff6b6b';
            } else {
                this.style.borderColor = '';
            }
        });
        
        // Remove error state on focus
        emailInput.addEventListener('focus', function() {
            removeError(this);
        });
    }
    
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function showError(input, message) {
        removeError(input);
        input.style.borderColor = '#ff6b6b';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'footer-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #ff6b6b;
            font-size: 0.85rem;
            margin-top: 5px;
            position: absolute;
            animation: fadeInUp 0.3s ease;
        `;
        
        input.parentNode.style.position = 'relative';
        input.parentNode.appendChild(errorDiv);
    }
    
    function removeError(input) {
        const errorDiv = input.parentNode.querySelector('.footer-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        input.style.borderColor = '';
    }
    
    function shakeElement(element) {
        element.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }
    
    function setLoadingState(loading) {
        if (loading) {
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <span>Suscribiendo...</span>
                <div class="footer-spinner" style="
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                "></div>
            `;
        } else {
            submitButton.disabled = false;
            submitButton.innerHTML = `
                <span>Suscribirse</span>
                <svg class="footer_submit_icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m22 2-7 20-4-9-9-4Z"/>
                    <path d="M22 2 11 13"/>
                </svg>
            `;
        }
    }
    
    function showSuccess(input, button) {
        removeError(input);
        
        const successDiv = document.createElement('div');
        successDiv.className = 'footer-success';
        successDiv.textContent = '¡Suscripción exitosa! 🎉';
        successDiv.style.cssText = `
            color: #4caf50;
            font-size: 0.9rem;
            font-weight: 600;
            margin-top: 10px;
            text-align: center;
            animation: fadeInUp 0.5s ease;
            background: rgba(76, 175, 80, 0.1);
            padding: 8px 16px;
            border-radius: 8px;
            border: 1px solid rgba(76, 175, 80, 0.3);
        `;
        
        button.parentNode.appendChild(successDiv);
        
        // Add success animation to button
        button.style.background = 'linear-gradient(135deg, #4caf50, #45a049)';
        button.innerHTML = `
            <span>¡Éxito!</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 6L9 17l-5-5"/>
            </svg>
        `;
    }
    
    function resetForm(input, button) {
        const successDiv = button.parentNode.querySelector('.footer-success');
        if (successDiv) {
            successDiv.remove();
        }
        
        button.style.background = '';
        button.innerHTML = `
            <span>Suscribirse</span>
            <svg class="footer_submit_icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m22 2-7 20-4-9-9-4Z"/>
                <path d="M22 2 11 13"/>
            </svg>
        `;
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
