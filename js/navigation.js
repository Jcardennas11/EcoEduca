// Modern Navigation Enhancement
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.modern-nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Remove active class from all links
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                
                // Add active class to clicked link
                this.classList.add('active');
                
                // Smooth scroll to target
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update URL hash without jumping
                history.pushState(null, null, targetId);
            }
        });
    });
    
    // Set active link based on scroll position
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id], header[id], footer[id]');
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    // Update active link on scroll
    window.addEventListener('scroll', updateActiveNavLink);
    
    // Set initial active link
    updateActiveNavLink();
    
    // Add hover effect for navigation items
    const navItems = document.querySelectorAll('.nav_items');
    
    navItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Mobile menu enhancement (if needed)
    const navMenu = document.querySelector('.nav_menu');
    const navLinkMenu = document.querySelector('.nav_link_menu');
    const navClose = document.querySelector('.nav_close');
    
    if (navMenu && navLinkMenu && navClose) {
        navMenu.addEventListener('click', function() {
            navLinkMenu.style.setProperty('--show', 'block');
        });
        
        navClose.addEventListener('click', function() {
            navLinkMenu.style.setProperty('--show', 'none');
        });
        
        // Close menu when clicking a link (mobile)
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navLinkMenu.style.setProperty('--show', 'none');
                }
            });
        });
    }
});
