// ============================================
// RANI'S CALIFORNIA - SCRIPTS
// Shopping cart, product modal, form validation
// ============================================

(function() {
    'use strict';

    // ============================================
    // STATE MANAGEMENT
    // ============================================

    let products = [];
    let cart = JSON.parse(localStorage.getItem('ranisCart')) || [];
    let currentProduct = null;
    let currentImageIndex = 0;

    // ============================================
    // INITIALIZATION
    // ============================================

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        loadProducts();
        setupNavigation();
        setupCart();
        setupModals();
        setupForms();
        setupFilters();
        setupFAQs();
        updateCartUI();
    }

    // ============================================
    // PRODUCT LOADING
    // ============================================

    async function loadProducts() {
        try {
            const response = await fetch('products.json');
            products = await response.json();
            renderProducts(products);
        } catch (error) {
            console.error('Failed to load products:', error);
            showProductError();
        }
    }

    function renderProducts(productsToRender) {
        const grid = document.getElementById('product-grid');
        if (!grid) return;

        if (productsToRender.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-muted);">No products match your filters.</p>';
            return;
        }

        grid.innerHTML = productsToRender.map(product => `
            <article class="product-card" data-product-id="${product.id}" role="listitem">
                <div class="product-image">
                    ${product.images.length > 0 ? renderProductImage(product) : renderPlaceholder()}
                    ${product.madeToMeasure ? '<span class="product-badge">Made-to-Measure</span>' : ''}
                </div>
                <div class="product-info">
                    <h3>${product.title}</h3>
                    <p class="product-meta">${product.material}</p>
                    <p class="product-price">${formatPrice(product.price, product.currency)}</p>
                </div>
            </article>
        `).join('');

        // Add click handlers to product cards
        grid.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const productId = card.dataset.productId;
                const product = products.find(p => p.id === productId);
                if (product) openProductModal(product);
            });
        });
    }

    function renderProductImage(product) {
        const primaryImage = product.images[0];
        const filename = primaryImage.filename || 'placeholder.jpg';
        const baseName = filename.replace(/\.(jpg|png|webp)$/i, '');

        return `
            <picture>
                <source
                    srcset="images/${baseName}-480.webp 480w, images/${baseName}-900.webp 900w"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    type="image/webp">
                <img
                    srcset="images/${baseName}-480.jpg 480w, images/${baseName}-900.jpg 900w"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    src="images/${baseName}-900.jpg"
                    alt="${primaryImage.alt}"
                    loading="lazy">
            </picture>
        `;
    }

    function renderPlaceholder() {
        return `
            <div class="product-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
                <p>Made-to-order: request photos</p>
            </div>
        `;
    }

    function showProductError() {
        const grid = document.getElementById('product-grid');
        if (grid) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-muted);">Unable to load products. Please refresh the page.</p>';
        }
    }

    // ============================================
    // NAVIGATION
    // ============================================

    function setupNavigation() {
        const menuToggle = document.querySelector('.menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const header = document.getElementById('site-header');

        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', () => {
                const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
                menuToggle.setAttribute('aria-expanded', !isExpanded);
                navMenu.setAttribute('aria-expanded', !isExpanded);
                document.body.style.overflow = !isExpanded ? 'hidden' : '';
            });

            // Close menu when clicking nav links
            navMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    menuToggle.setAttribute('aria-expanded', 'false');
                    navMenu.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                });
            });
        }

        // Sticky header on scroll
        if (header) {
            let lastScroll = 0;
            window.addEventListener('scroll', () => {
                const currentScroll = window.pageYOffset;
                if (currentScroll > 100) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                lastScroll = currentScroll;
            });
        }

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // ============================================
    // SHOPPING CART
    // ============================================

    function setupCart() {
        const cartToggle = document.getElementById('cart-toggle');
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartClose = document.getElementById('cart-close');

        if (cartToggle && cartSidebar) {
            cartToggle.addEventListener('click', () => {
                cartSidebar.hidden = false;
            });
        }

        if (cartClose && cartSidebar) {
            cartClose.addEventListener('click', () => {
                cartSidebar.hidden = true;
            });
        }

        // Close cart when clicking outside
        if (cartSidebar) {
            document.addEventListener('click', (e) => {
                if (!cartSidebar.hidden &&
                    !cartSidebar.contains(e.target) &&
                    !cartToggle.contains(e.target)) {
                    cartSidebar.hidden = true;
                }
            });
        }
    }

    function addToCart(product, options) {
        const cartItem = {
            id: product.id,
            title: product.title,
            price: product.price,
            currency: product.currency,
            image: product.images[0],
            color: options.color,
            size: options.size,
            madeToMeasure: options.madeToMeasure,
            quantity: 1
        };

        // Check if item already exists in cart
        const existingIndex = cart.findIndex(item =>
            item.id === cartItem.id &&
            item.color === cartItem.color &&
            item.size === cartItem.size &&
            item.madeToMeasure === cartItem.madeToMeasure
        );

        if (existingIndex > -1) {
            cart[existingIndex].quantity += 1;
        } else {
            cart.push(cartItem);
        }

        saveCart();
        updateCartUI();

        // Show cart sidebar
        const cartSidebar = document.getElementById('cart-sidebar');
        if (cartSidebar) cartSidebar.hidden = false;
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        saveCart();
        updateCartUI();
    }

    function updateCartQuantity(index, change) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            removeFromCart(index);
        } else {
            saveCart();
            updateCartUI();
        }
    }

    function saveCart() {
        localStorage.setItem('ranisCart', JSON.stringify(cart));
    }

    function updateCartUI() {
        const cartCount = document.getElementById('cart-count');
        const cartItems = document.getElementById('cart-items');
        const cartSubtotal = document.getElementById('cart-subtotal');

        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        if (cartCount) {
            if (totalItems > 0) {
                cartCount.textContent = totalItems;
                cartCount.hidden = false;
            } else {
                cartCount.hidden = true;
            }
        }

        if (cartItems) {
            if (cart.length === 0) {
                cartItems.innerHTML = '<p class="cart-empty">Your cart is empty</p>';
            } else {
                cartItems.innerHTML = cart.map((item, index) => `
                    <div class="cart-item">
                        <img src="images/${item.image.filename}" alt="${item.image.alt}" class="cart-item-image">
                        <div class="cart-item-details">
                            <h3 class="cart-item-title">${item.title}</h3>
                            <p class="cart-item-meta">${item.color} / ${item.size}${item.madeToMeasure ? ' / Made-to-Measure' : ''}</p>
                            <p class="cart-item-price">${formatPrice(item.price, item.currency)}</p>
                            <div class="cart-item-actions">
                                <div class="cart-item-qty">
                                    <button onclick="updateCartQuantity(${index}, -1)" aria-label="Decrease quantity">−</button>
                                    <span>${item.quantity}</span>
                                    <button onclick="updateCartQuantity(${index}, 1)" aria-label="Increase quantity">+</button>
                                </div>
                                <button onclick="removeFromCart(${index})" class="btn-text" aria-label="Remove from cart">Remove</button>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }

        if (cartSubtotal) {
            cartSubtotal.textContent = formatPrice(subtotal, cart[0]?.currency || 'USD');
        }
    }

    // Make cart functions globally accessible
    window.updateCartQuantity = updateCartQuantity;
    window.removeFromCart = removeFromCart;

    // ============================================
    // PRODUCT MODAL
    // ============================================

    function setupModals() {
        const productModal = document.getElementById('product-modal');
        const rsvpModal = document.getElementById('rsvp-modal');

        // Close modals
        document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                closeAllModals();
            });
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAllModals();
            }
        });

        // Prevent modal content clicks from closing modal
        document.querySelectorAll('.modal-content').forEach(content => {
            content.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });

        // Gallery navigation
        const prevBtn = productModal?.querySelector('.gallery-prev');
        const nextBtn = productModal?.querySelector('.gallery-next');

        if (prevBtn) prevBtn.addEventListener('click', () => navigateGallery(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => navigateGallery(1));

        // Keyboard navigation for gallery
        document.addEventListener('keydown', (e) => {
            if (!productModal || productModal.hidden) return;
            if (e.key === 'ArrowLeft') navigateGallery(-1);
            if (e.key === 'ArrowRight') navigateGallery(1);
        });

        // Add to cart button
        const addToCartBtn = productModal?.querySelector('.add-to-cart');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', handleAddToCart);
        }

        // Event RSVP buttons
        document.querySelectorAll('[data-event]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const eventId = btn.dataset.event;
                const eventCard = btn.closest('.event-card');
                const eventTitle = eventCard?.querySelector('.event-title')?.textContent;
                openRSVPModal(eventId, eventTitle);
            });
        });
    }

    function openProductModal(product) {
        currentProduct = product;
        currentImageIndex = 0;

        const modal = document.getElementById('product-modal');
        if (!modal) return;

        // Update product details
        modal.querySelector('.product-title').textContent = product.title;
        modal.querySelector('.product-price').textContent = formatPrice(product.price, product.currency);
        modal.querySelector('.product-description').innerHTML = `<p>${product.description}</p>`;

        // Update gallery
        updateGallery();

        // Update colors
        const colorSwatches = modal.querySelector('.color-swatches');
        if (colorSwatches && product.availableColors.length > 0) {
            colorSwatches.innerHTML = product.availableColors.map((color, index) => `
                <div
                    class="color-swatch"
                    style="background-color: ${color.hex}"
                    role="radio"
                    aria-checked="${index === 0}"
                    aria-label="${color.name}"
                    data-color="${color.name}"
                    tabindex="0">
                </div>
            `).join('');

            colorSwatches.querySelectorAll('.color-swatch').forEach(swatch => {
                swatch.addEventListener('click', () => selectColor(swatch));
                swatch.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selectColor(swatch);
                    }
                });
            });
        }

        // Update sizes
        const sizeSelect = modal.querySelector('#product-size');
        if (sizeSelect && product.sizes.length > 0) {
            sizeSelect.innerHTML = '<option value="">Select size</option>' +
                product.sizes.map(size => `<option value="${size}">${size}</option>`).join('');
        }

        // Show/hide made-to-measure option
        const mtmToggle = modal.querySelector('.mtm-toggle');
        if (mtmToggle) {
            mtmToggle.style.display = product.madeToMeasure ? 'block' : 'none';
            modal.querySelector('#mtm-checkbox').checked = false;
        }

        // Update fabric & care
        const fabricContent = modal.querySelector('.product-meta .meta-content');
        if (fabricContent) {
            fabricContent.textContent = `${product.material}. ${product.careInstructions}`;
        }

        // Update lead time
        const leadTimeContent = modal.querySelector('.lead-time');
        if (leadTimeContent) {
            leadTimeContent.textContent = `Ships within ${product.leadTimeDays} days. Made-to-measure adds 2-3 weeks.`;
        }

        modal.hidden = false;
        modal.querySelector('.modal-close').focus();
    }

    function updateGallery() {
        if (!currentProduct) return;

        const modal = document.getElementById('product-modal');
        const mainImage = modal.querySelector('#modal-image');
        const thumbsContainer = modal.querySelector('.gallery-thumbs');

        if (currentProduct.images.length === 0) {
            mainImage.src = 'images/placeholder.jpg';
            mainImage.alt = 'Product image not available';
            thumbsContainer.innerHTML = '';
            return;
        }

        const currentImage = currentProduct.images[currentImageIndex];
        const filename = currentImage.filename;
        const baseName = filename.replace(/\.(jpg|png|webp)$/i, '');

        mainImage.src = `images/${baseName}-1600.jpg`;
        mainImage.alt = currentImage.alt;

        // Update thumbnails
        thumbsContainer.innerHTML = currentProduct.images.map((img, index) => {
            const thumbBase = img.filename.replace(/\.(jpg|png|webp)$/i, '');
            return `
                <img
                    src="images/${thumbBase}-480.jpg"
                    alt="${img.alt}"
                    class="gallery-thumb ${index === currentImageIndex ? 'active' : ''}"
                    data-index="${index}">
            `;
        }).join('');

        thumbsContainer.querySelectorAll('.gallery-thumb').forEach(thumb => {
            thumb.addEventListener('click', () => {
                currentImageIndex = parseInt(thumb.dataset.index);
                updateGallery();
            });
        });
    }

    function navigateGallery(direction) {
        if (!currentProduct || currentProduct.images.length === 0) return;

        currentImageIndex += direction;
        if (currentImageIndex < 0) currentImageIndex = currentProduct.images.length - 1;
        if (currentImageIndex >= currentProduct.images.length) currentImageIndex = 0;

        updateGallery();
    }

    function selectColor(swatch) {
        const parent = swatch.parentElement;
        parent.querySelectorAll('.color-swatch').forEach(s => {
            s.setAttribute('aria-checked', 'false');
        });
        swatch.setAttribute('aria-checked', 'true');
    }

    function handleAddToCart() {
        const modal = document.getElementById('product-modal');
        const colorSwatch = modal.querySelector('.color-swatch[aria-checked="true"]');
        const sizeSelect = modal.querySelector('#product-size');
        const mtmCheckbox = modal.querySelector('#mtm-checkbox');

        const options = {
            color: colorSwatch?.dataset.color || currentProduct.availableColors[0]?.name || 'Default',
            size: sizeSelect?.value || currentProduct.sizes[0] || 'One Size',
            madeToMeasure: mtmCheckbox?.checked || false
        };

        if (currentProduct.sizes.length > 0 && !sizeSelect.value) {
            alert('Please select a size');
            sizeSelect.focus();
            return;
        }

        addToCart(currentProduct, options);
        closeAllModals();
    }

    function openRSVPModal(eventId, eventTitle) {
        const modal = document.getElementById('rsvp-modal');
        if (!modal) return;

        modal.querySelector('#rsvp-event-name').textContent = eventTitle;
        modal.querySelector('#rsvp-event-id').value = eventId;
        modal.querySelector('#rsvp-form').reset();
        modal.hidden = false;
    }

    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.hidden = true;
        });
        currentProduct = null;
    }

    // ============================================
    // FORM VALIDATION
    // ============================================

    function setupForms() {
        // Custom order form
        const customForm = document.getElementById('custom-form');
        if (customForm) {
            customForm.addEventListener('submit', handleCustomFormSubmit);

            // Real-time validation
            customForm.querySelectorAll('input, select, textarea').forEach(field => {
                field.addEventListener('blur', () => validateField(field));
                field.addEventListener('input', () => {
                    if (field.getAttribute('aria-invalid') === 'true') {
                        validateField(field);
                    }
                });
            });
        }

        // RSVP form
        const rsvpForm = document.getElementById('rsvp-form');
        if (rsvpForm) {
            rsvpForm.addEventListener('submit', handleRSVPSubmit);
        }

        // Newsletter form
        const newsletterForm = document.querySelector('.newsletter-signup');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', handleNewsletterSubmit);
        }
    }

    function validateField(field) {
        const errorEl = document.getElementById(`error-${field.id}`);
        let errorMessage = '';

        // Required field validation
        if (field.hasAttribute('required') && !field.value.trim()) {
            errorMessage = 'This field is required';
        }
        // Email validation
        else if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                errorMessage = 'Please enter a valid email address';
            }
        }
        // Number validation
        else if (field.type === 'number' && field.value) {
            const num = parseFloat(field.value);
            const min = parseFloat(field.min);
            const max = parseFloat(field.max);

            if (isNaN(num)) {
                errorMessage = 'Please enter a valid number';
            } else if (min && num < min) {
                errorMessage = `Value must be at least ${min}`;
            } else if (max && num > max) {
                errorMessage = `Value must be at most ${max}`;
            }
        }

        if (errorMessage) {
            field.setAttribute('aria-invalid', 'true');
            if (errorEl) errorEl.textContent = errorMessage;
            return false;
        } else {
            field.setAttribute('aria-invalid', 'false');
            if (errorEl) errorEl.textContent = '';
            return true;
        }
    }

    function validateForm(form) {
        let isValid = true;
        const fields = form.querySelectorAll('input[required], select[required], textarea[required]');

        fields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    async function handleCustomFormSubmit(e) {
        e.preventDefault();

        if (!validateForm(e.target)) {
            const firstError = e.target.querySelector('[aria-invalid="true"]');
            if (firstError) firstError.focus();
            return;
        }

        const formData = new FormData(e.target);
        const submitButton = e.target.querySelector('button[type="submit"]');

        // Build measurements object
        const measurements = {
            chest_cm: parseFloat(formData.get('chest')) || null,
            waist_cm: parseFloat(formData.get('waist')) || null,
            hip_cm: parseFloat(formData.get('hip')) || null,
            sleeve_cm: parseFloat(formData.get('sleeve')) || null,
            length_cm: parseFloat(formData.get('length')) || null
        };

        // Build items array (for now, single item from form)
        // TODO: If you have product selection in the form, build items array properly
        const items = [{
            product_id: formData.get('product_id') || '00000000-0000-0000-0000-000000000000', // Placeholder - update with actual product selection
            qty: 1,
            price_cents_each: 0 // Will be calculated server-side
        }];

        // Create new FormData with JSON fields
        const newFormData = new FormData();
        newFormData.append('name', formData.get('name'));
        newFormData.append('email', formData.get('email'));
        newFormData.append('country', formData.get('country'));
        newFormData.append('garmentType', formData.get('garmentType'));
        if (formData.get('notes')) {
            newFormData.append('notes', formData.get('notes'));
        }
        newFormData.append('measurements', JSON.stringify(measurements));
        newFormData.append('items', JSON.stringify(items));

        // Add photo files if any
        const photoInput = document.getElementById('custom-file');
        if (photoInput && photoInput.files) {
            for (let i = 0; i < photoInput.files.length; i++) {
                newFormData.append('photos', photoInput.files[i]);
            }
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        try {
            const response = await fetch('/api/custom-orders', {
                method: 'POST',
                body: newFormData
            });

            const data = await response.json();

            if (response.ok) {
                alert('Thank you! We\'ll send you a detailed measurement guide within 24 hours.');
                e.target.reset();
            } else {
                throw new Error(data.message || 'Submission failed');
            }
        } catch (error) {
            alert('Sorry, there was an error submitting your request. Please try again or email us directly at hello@raniscalifornia.com');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Request';
        }
    }

    async function handleRSVPSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const submitButton = e.target.querySelector('button[type="submit"]');

        // Build JSON payload
        const payload = {
            event_id: formData.get('eventId'),
            name: formData.get('name'),
            email: formData.get('email'),
            guests: parseInt(formData.get('guests') || '1', 10)
        };

        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        try {
            const response = await fetch('/api/events/rsvp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                alert('RSVP confirmed! Check your email for event details.');
                closeAllModals();
                e.target.reset();
            } else {
                throw new Error(data.message || 'Submission failed');
            }
        } catch (error) {
            alert('Sorry, there was an error with your RSVP. Please try again or email us at hello@raniscalifornia.com');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Confirm RSVP';
        }
    }

    async function handleNewsletterSubmit(e) {
        e.preventDefault();

        const emailInput = e.target.querySelector('input[type="email"]');
        if (!emailInput.value || !validateField(emailInput)) {
            return;
        }

        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Subscribing...';

        try {
            // Send JSON to API
            const payload = {
                email: emailInput.value
            };

            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Thank you for subscribing!');
                e.target.reset();
            } else {
                throw new Error(data.message || 'Subscription failed');
            }
        } catch (error) {
            alert('Thank you for subscribing! Please check your email to confirm.');
            e.target.reset();
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Subscribe';
        }
    }

    // ============================================
    // FILTERS
    // ============================================

    function setupFilters() {
        const categoryFilter = document.getElementById('filter-category');
        const fabricFilter = document.getElementById('filter-fabric');
        const colorFilter = document.getElementById('filter-color');
        const mtmFilter = document.getElementById('filter-mtm');

        [categoryFilter, fabricFilter, colorFilter, mtmFilter].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', applyFilters);
            }
        });
    }

    function applyFilters() {
        const category = document.getElementById('filter-category')?.value || '';
        const fabric = document.getElementById('filter-fabric')?.value.toLowerCase() || '';
        const color = document.getElementById('filter-color')?.value.toLowerCase() || '';
        const mtmOnly = document.getElementById('filter-mtm')?.checked || false;

        const filtered = products.filter(product => {
            const matchCategory = !category || product.collection === category;
            const matchFabric = !fabric || product.material.toLowerCase().includes(fabric);
            const matchColor = !color || product.availableColors.some(c => c.name.toLowerCase().includes(color));
            const matchMTM = !mtmOnly || product.madeToMeasure;

            return matchCategory && matchFabric && matchColor && matchMTM;
        });

        renderProducts(filtered);
    }

    // ============================================
    // FAQS
    // ============================================

    function setupFAQs() {
        document.querySelectorAll('.faq-question button').forEach(button => {
            button.addEventListener('click', () => {
                const isExpanded = button.getAttribute('aria-expanded') === 'true';
                const answer = button.closest('.faq-item').querySelector('.faq-answer');

                button.setAttribute('aria-expanded', !isExpanded);
                answer.hidden = isExpanded;
            });
        });
    }

    // ============================================
    // UTILITIES
    // ============================================

    function formatPrice(price, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(price);
    }

    // Lazy loading polyfill for older browsers
    if ('loading' in HTMLImageElement.prototype) {
        // Browser supports native lazy loading
    } else {
        // Fallback: load all images immediately
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            img.src = img.src;
        });
    }

})();
