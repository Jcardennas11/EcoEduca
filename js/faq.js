// Modern FAQ Accordion Functionality
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    // Initialize all FAQ items as closed
    faqItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Add click event listeners to FAQ questions
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const toggle = item.querySelector('.faq-toggle');
        
        // Click on question or toggle button
        [question, toggle].forEach(element => {
            element.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const isActive = item.classList.contains('active');
                
                // Close all other items (optional - remove if you want multiple open)
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                if (isActive) {
                    item.classList.remove('active');
                } else {
                    item.classList.add('active');
                    
                    // Smooth scroll to item if opening
                    setTimeout(() => {
                        const itemRect = item.getBoundingClientRect();
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                        
                        if (itemRect.top < 100) {
                            window.scrollTo({
                                top: scrollTop + itemRect.top - 100,
                                behavior: 'smooth'
                            });
                        }
                    }, 100);
                }
                
                // Add ripple effect to toggle button
                if (e.target === toggle) {
                    createRippleEffect(toggle, e);
                }
            });
        });
        
        // Add hover effects
        question.addEventListener('mouseenter', function() {
            if (!item.classList.contains('active')) {
                item.style.transform = 'translateY(-1px)';
            }
        });
        
        question.addEventListener('mouseleave', function() {
            if (!item.classList.contains('active')) {
                item.style.transform = 'translateY(0)';
            }
        });
    });
    
    // Ripple effect function
    function createRippleEffect(button, event) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        // Add ripple styles
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(46, 204, 113, 0.3)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s ease-out';
        ripple.style.pointerEvents = 'none';
        
        // Add ripple animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    // Keyboard accessibility
    faqItems.forEach(item => {
        const toggle = item.querySelector('.faq-toggle');
        
        toggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle.click();
            }
        });
    });
    
    // Add smooth height transitions for answers
    const answers = document.querySelectorAll('.faq-answer');
    answers.forEach(answer => {
        // Set initial height for smooth transitions
        const observer = new ResizeObserver(entries => {
            entries.forEach(entry => {
                const item = entry.target.closest('.faq-item');
                if (item.classList.contains('active')) {
                    entry.target.style.maxHeight = entry.target.scrollHeight + 'px';
                }
            });
        });
        
        observer.observe(answer);
    });
});
