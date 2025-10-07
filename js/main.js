(function ($) {
    "use strict";

    // --- FUNCIONES CENTRALES DE GESTIÓN DEL CARRITO ---

    // 1. Obtiene el carrito del localStorage (Fuente de verdad)
    function getCart() {
        const cartJson = localStorage.getItem('cartItems');
        return cartJson ? JSON.parse(cartJson) : [];
    }

    // 2. Guarda el carrito en el localStorage
    function saveCart(cart) {
        localStorage.setItem('cartItems', JSON.stringify(cart));
    }

    // 3. Actualiza el contador del carrito en el navbar (ID: #cart-count)
    function updateCartCounter() {
        const cart = getCart();
        let totalQuantity = 0;
        
        // Suma la cantidad de cada producto en el carrito
        cart.forEach(item => {
            totalQuantity += item.quantity;
        });

        $('#cart-count').text(totalQuantity);
    }
    
    // 4. Añade o incrementa un producto al carrito
    function addToCart(itemDetails) {
        let cart = getCart();
        const existingItemIndex = cart.findIndex(item => item.id === itemDetails.id);

        if (existingItemIndex > -1) {
            // Si el producto ya existe, incrementa la cantidad
            cart[existingItemIndex].quantity += itemDetails.quantity;
        } else {
            // Si es un producto nuevo, añádelo
            cart.push(itemDetails);
        }

        saveCart(cart);
        updateCartCounter();
        alert(`¡"${itemDetails.name}" añadido al carrito! Cantidad: ${itemDetails.quantity}`);
    }

    // --- LÓGICA DE CART.HTML (Para mantener la compatibilidad con el paso anterior) ---

    // Función que sincroniza los cambios en el DOM de cart.html con localStorage y actualiza el contador
    function syncDomToLocalStorage() {
        const newCartItems = [];
        $('.cart-item').each(function() {
            const $row = $(this);
            const price = parseFloat($row.data('price'));
            const quantity = parseInt($row.find('.item-quantity').val());
            const name = $row.find('td:first').text().trim().replace(/.*?\s/, ''); 
            const id = $row.data('id') || name.replace(/\s/g, '-').toLowerCase(); // ID o nombre

            if (quantity > 0) {
                 newCartItems.push({
                    id: id.toString(),
                    name: name,
                    price: price,
                    quantity: quantity
                });
            }
        });
        saveCart(newCartItems); // Guarda el nuevo estado del carrito
        updateCartCounter();
    }
    
    // Función para calcular y actualizar el total del carrito (DOM)
    function updateCartTotal() {
        let subtotal = 0;
        const shippingElement = $('#shipping-cost');
        const shipping = shippingElement.length ? parseFloat(shippingElement.text().replace('$', '')) : 10;
        
        // Recorre el DOM para calcular
        $('.cart-item').each(function() {
            const $row = $(this);
            const price = parseFloat($row.data('price'));
            const quantity = parseInt($row.find('.item-quantity').val());
            const itemTotal = price * quantity;
            
            $row.find('.item-total-display').text(`$${itemTotal}`);
            subtotal += itemTotal;
        });

        // Actualizar totales en el resumen
        $('#subtotal-price').text(`$${subtotal}`);
        const total = subtotal + shipping;
        $('#total-price').text(`$${total}`);

        if (subtotal === 0) {
            // Manejar carrito vacío
            $('#cart-items-body').html('<tr><td colspan="5" class="text-center p-5">Tu carrito de compras está vacío.</td></tr>');
            $('#proceed-to-checkout').prop('disabled', true);
            $('#total-price').text('$0');
        } else {
            $('#proceed-to-checkout').prop('disabled', false);
        }

        // Sincronizar los cambios del DOM (ej. delete, quantity change) con localStorage
        syncDomToLocalStorage();
    }
    
    // --- MANEJADORES DE EVENTOS GLOBALES ---

    $(document).ready(function () {
        // Inicializar el contador del carrito al cargar cualquier página
        updateCartCounter();
        
        // Si estamos en cart.html, realizar el cálculo inicial
        if ($('#cart-items-body').length) {
            updateCartTotal();
        }

        // Resto de la inicialización de la plantilla (toggleNavbarMethod, etc.)
        function toggleNavbarMethod() {
            if ($(window).width() > 992) {
                $('.navbar .dropdown').on('mouseover', function () {
                    $('.dropdown-toggle', this).trigger('click');
                }).on('mouseout', function () {
                    $('.dropdown-toggle', this).trigger('click').blur();
                });
            } else {
                $('.navbar .dropdown').off('mouseover').off('mouseout');
            }
        }
        toggleNavbarMethod();
        $(window).resize(toggleNavbarMethod);
    });
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });

    // Vendor carousel & Related carousel (Mantengo las funciones de la plantilla)
    $('.vendor-carousel').owlCarousel({
        loop: true, margin: 29, nav: false, autoplay: true, smartSpeed: 1000,
        responsive: { 0:{ items:2 }, 576:{ items:3 }, 768:{ items:4 }, 992:{ items:5 }, 1200:{ items:6 } }
    });
    $('.related-carousel').owlCarousel({
        loop: true, margin: 29, nav: false, autoplay: true, smartSpeed: 1000,
        responsive: { 0:{ items:1 }, 576:{ items:2 }, 768:{ items:3 }, 992:{ items:4 } }
    });

    // --- LÓGICA DE ACCIÓN DEL CARRITO (cart.html) ---

    // A. Actualizar cantidad
    $('#cart-items-body').on('click', '.quantity button', function () {
        var button = $(this);
        var $input = button.closest('.quantity').find('.item-quantity');
        var oldValue = parseInt($input.val());
        var newVal;

        if (button.hasClass('btn-plus')) {
            newVal = oldValue + 1;
        } else {
            newVal = (oldValue > 1) ? oldValue - 1 : 1;
        }
        
        $input.val(newVal);
        updateCartTotal();
    });

    // B. Eliminar producto
    $('#cart-items-body').on('click', '.btn-remove', function () {
        $(this).closest('.cart-item').remove();
        updateCartTotal();
        alert("¡Producto eliminado del carrito!");
    });
    
    // C. Proceder al Pago (Usando la estructura de localStorage)
    $('#proceed-to-checkout').on('click', function(e) {
        e.preventDefault();
        
        // Usar los datos de localStorage que se sincronizaron en updateCartTotal()
        const cart = getCart();

        if (cart.length === 0) { 
            alert("Tu carrito está vacío. ¡Añade productos antes de proceder al pago!");
            return;
        }

        // Recalcular los totales finales para el checkout
        let subtotal = 0;
        cart.forEach(item => {
            subtotal += item.price * item.quantity;
        });

        const shippingElement = $('#shipping-cost');
        const shipping = shippingElement.length ? parseFloat(shippingElement.text().replace('$', '')) : 10;
        const total = subtotal + shipping;
        
        const checkoutData = {
            items: cart,
            subtotal: subtotal,
            shipping: shipping,
            total: total
        };

        // Guardar los datos de checkout
        localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
        
        // Redirigir al usuario
        window.location.href = 'checkout.html';
    });
    
    // --- LÓGICA AÑADIR AL CARRITO (shop.html y detail.html) ---
    
    // 1. Manejador para botones en shop.html (clase 'add-to-cart-btn')
    $('body').on('click', '.add-to-cart-btn', function(e) {
        e.preventDefault();
        const $product = $(this).closest('[data-id]'); 
        
        const itemDetails = {
            id: $product.data('id').toString(),
            name: $product.data('name') || 'Producto Tienda',
            price: parseFloat($product.data('price')) || 0,
            quantity: 1 // Siempre añade 1 por defecto
        };

        if (itemDetails.price > 0) {
            addToCart(itemDetails);
        } else {
            alert('Error: No se pudo obtener el precio del producto.');
        }
    });

    // 2. Manejador para el botón en detail.html (ID 'add-to-cart-detail-btn')
    $('#add-to-cart-detail-btn').on('click', function(e) {
        e.preventDefault();

        // Obtener datos del producto y cantidad
        const $productContainer = $(this).closest('.row').find('.col-lg-7').first();
        const $nameElement = $productContainer.find('.h4').first();
        const $quantityInput = $('#detail-quantity');

        const priceText = $productContainer.find('.text-primary.mr-2').first().text();
        const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
        const name = $nameElement.text().trim() || 'Producto de Detalle';
        const quantity = parseInt($quantityInput.val()) || 1;
        const id = $productContainer.closest('[data-id]').data('id') || name.replace(/\s/g, '-').toLowerCase();

        if (price === 0 || quantity === 0) {
            alert("Error: No se pudo obtener el precio o la cantidad es cero.");
            return;
        }

        const itemDetails = {
            id: id.toString(),
            name: name,
            price: price,
            quantity: quantity
        };

        addToCart(itemDetails);
    });

        $('.team-carousel').owlCarousel({
        loop: true,
        margin: 29,
        nav: false,
        autoplay: true,
        smartSpeed: 1000,
        responsive: {
            0:{
                items:1
            },
            576:{
                items:2
            },
            768:{
                items:3
            }
        }
    });
    
})(jQuery);