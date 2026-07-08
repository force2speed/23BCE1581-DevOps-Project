
import '/styles.css';

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        initMobileMenu();
        initContactForm();
        initApplicationForm();
        initFAQ();
        initGallery();
        initSmoothScroll();
        initHeaderScroll();
    });

    function initMobileMenu() {
        const menuBtn = document.getElementById('mobileMenuBtn');
        const nav = document.getElementById('nav');

        if (menuBtn && nav) {
            menuBtn.addEventListener('click', function() {
                menuBtn.classList.toggle('active');
                nav.classList.toggle('active');
            });

            const navLinks = nav.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', function() {
                    menuBtn.classList.remove('active');
                    nav.classList.remove('active');
                });
            });

            document.addEventListener('click', function(e) {
                if (!nav.contains(e.target) && !menuBtn.contains(e.target)) {
                    menuBtn.classList.remove('active');
                    nav.classList.remove('active');
                }
            });
        }
    }
    function initContactForm() {
        const form = document.getElementById('contactForm');
        const successMessage = document.getElementById('formSuccess');

        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const formData = new FormData(form);
                const data = Object.fromEntries(formData);
                if (!validateForm(data, ['name', 'email', 'subject', 'message'])) {
                    showAlert('Please fill in all required fields.');
                    return;
                }

                if (!isValidEmail(data.email)) {
                    showAlert('Please enter a valid email address.');
                    return;
                }

                console.log('Contact Form Submission:', data);

                form.style.display = 'none';
                if (successMessage) {
                    successMessage.classList.remove('hidden');
                }

                showAlert('Thank you! Your message has been sent successfully. We will get back to you within 24-48 hours.');
            });
        }
    }
    function initApplicationForm() {
        const form = document.getElementById('applicationForm');

        if (form) {
            const applyButtons = document.querySelectorAll('.apply-btn');
            applyButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    const position = this.getAttribute('data-position');
                    const positionSelect = document.getElementById('position');
                    if (positionSelect && position) {
                        positionSelect.value = position;
                    }
                    const formSection = document.getElementById('application-form');
                    if (formSection) {
                        formSection.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });

            form.addEventListener('submit', function(e) {
                e.preventDefault();

                const formData = new FormData(form);
                const data = Object.fromEntries(formData);
                if (!validateForm(data, ['name', 'email', 'position', 'experience'])) {
                    showAlert('Please fill in all required fields.');
                    return;
                }

                if (!isValidEmail(data.email)) {
                    showAlert('Please enter a valid email address.');
                    return;
                }
                console.log('Application Form Submission:', data);
                form.reset();
                showAlert('Thank you for your application! We have received your submission and will review it shortly.');
            });
        }
    }
    function initFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');

            if (question) {
                question.addEventListener('click', function() {
                    faqItems.forEach(other => {
                        if (other !== item && other.classList.contains('active')) {
                            other.classList.remove('active');
                        }
                    });
                    item.classList.toggle('active');
                });
                question.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        question.click();
                    }
                });
            }
        });
    }
    function initGallery() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const galleryItems = document.querySelectorAll('.gallery-item');
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightboxImg');
        const lightboxCaption = document.getElementById('lightboxCaption');
        const lightboxClose = document.getElementById('lightboxClose');
        const lightboxPrev = document.getElementById('lightboxPrev');
        const lightboxNext = document.getElementById('lightboxNext');

        let currentIndex = 0;
        let visibleItems = [];

        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');
                galleryItems.forEach(item => {
                    const category = item.getAttribute('data-category');
                    if (filter === 'all' || category === filter) {
                        item.style.display = 'block';
                        item.style.animation = 'fadeIn 0.3s ease';
                    } else {
                        item.style.display = 'none';
                    }
                });

                updateVisibleItems();
            });
        });
        function updateVisibleItems() {
            visibleItems = Array.from(galleryItems).filter(item =>
                item.style.display !== 'none'
            );
        }
        updateVisibleItems();
        if (lightbox) {
            galleryItems.forEach((item, index) => {
                item.addEventListener('click', function() {
                    const img = item.querySelector('img');
                    const overlay = item.querySelector('.gallery-overlay');

                    if (img && lightboxImg) {
                        lightboxImg.src = img.src;
                        lightboxImg.alt = img.alt;

                        if (lightboxCaption && overlay) {
                            const title = overlay.querySelector('h3');
                            const desc = overlay.querySelector('p');
                            lightboxCaption.innerHTML = '';
                            if (title) {
                                const titleEl = document.createElement('h4');
                                titleEl.textContent = title.textContent;
                                lightboxCaption.appendChild(titleEl);
                            }
                            if (desc) {
                                const descEl = document.createElement('p');
                                descEl.textContent = desc.textContent;
                                lightboxCaption.appendChild(descEl);
                            }
                        }

                        currentIndex = visibleItems.indexOf(item);
                        lightbox.classList.add('active');
                        document.body.style.overflow = 'hidden';
                    }
                });
            });
            if (lightboxClose) {
                lightboxClose.addEventListener('click', closeLightbox);
            }

            lightbox.addEventListener('click', function(e) {
                if (e.target === lightbox) {
                    closeLightbox();
                }
            });
            if (lightboxPrev) {
                lightboxPrev.addEventListener('click', function(e) {
                    e.stopPropagation();
                    navigate(-1);
                });
            }

            if (lightboxNext) {
                lightboxNext.addEventListener('click', function(e) {
                    e.stopPropagation();
                    navigate(1);
                });
            }
            document.addEventListener('keydown', function(e) {
                if (!lightbox.classList.contains('active')) return;

                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowLeft') navigate(-1);
                if (e.key === 'ArrowRight') navigate(1);
            });

            function closeLightbox() {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }

            function navigate(direction) {
                currentIndex = (currentIndex + direction + visibleItems.length) % visibleItems.length;
                const item = visibleItems[currentIndex];
                const img = item.querySelector('img');
                const overlay = item.querySelector('.gallery-overlay');

                if (img) {
                    lightboxImg.src = img.src;
                    lightboxImg.alt = img.alt;
                }

                if (lightboxCaption && overlay) {
                    const title = overlay.querySelector('h3');
                    const desc = overlay.querySelector('p');
                    lightboxCaption.innerHTML = '';
                    if (title) {
                        const titleEl = document.createElement('h4');
                        titleEl.textContent = title.textContent;
                        lightboxCaption.appendChild(titleEl);
                    }
                    if (desc) {
                        const descEl = document.createElement('p');
                        descEl.textContent = desc.textContent;
                        lightboxCaption.appendChild(descEl);
                    }
                }
            }
        }
    }
    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');

        links.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }
    function initHeaderScroll() {
        const header = document.querySelector('.header');
        let lastScroll = 0;

        if (header) {
            window.addEventListener('scroll', function() {
                const currentScroll = window.pageYOffset;

                if (currentScroll > 100) {
                    header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                } else {
                    header.style.boxShadow = 'none';
                }

                lastScroll = currentScroll;
            });
        }
    }
    function validateForm(data, requiredFields) {
        return requiredFields.every(field => data[field] && data[field].trim() !== '');
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showAlert(message) {
        const alert = document.createElement('div');
        alert.className = 'custom-alert';
        alert.innerHTML = `
            <div class="alert-content">
                <p>${message}</p>
                <button class="alert-close">OK</button>
            </div>
        `;
        const style = document.createElement('style');
        style.textContent = `
            .custom-alert {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 3000;
                animation: fadeIn 0.2s ease;
            }
            .alert-content {
                background: #ffffff;
                padding: 2rem;
                border-radius: 12px;
                max-width: 400px;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            }
            .alert-content p {
                color: #1e293b;
                margin-bottom: 1.5rem;
                font-size: 1rem;
                line-height: 1.6;
            }
            .alert-close {
                background: #3079bb;
                color: #ffffff;
                border: none;
                padding: 0.75rem 2rem;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s;
            }
            .alert-close:hover {
                background: #2766a0;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(alert);

        const closeBtn = alert.querySelector('.alert-close');
        closeBtn.addEventListener('click', function() {
            alert.remove();
            style.remove();
        });
        alert.addEventListener('click', function(e) {
            if (e.target === alert) {
                alert.remove();
                style.remove();
            }
        });
    }

})();
