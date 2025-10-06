(function ($) {
    "use strict";

    // Función para calcular y actualizar el total del carrito
    function updateCartTotal() {
        let subtotal = 0;
        const shipping = parseFloat($('#shipping-cost').text().replace('$', ''));
        
        // Iterar sobre cada fila de producto en el carrito
        $('.cart-item').each(function() {
            const $row = $(this);
            const price = parseFloat($row.data('price'));
            const quantity = parseInt($row.find('.item-quantity').val());
            const itemTotal = price * quantity;
            
            // Actualizar el total de la fila
            $row.find('.item-total-display').text(`$${itemTotal}`);
            
            subtotal += itemTotal;
        });

        // Actualizar los valores en el resumen del carrito
        $('#subtotal-price').text(`$${subtotal}`);
        const total = subtotal + shipping;
        $('#total-price').text(`$${total}`);

        // Mostrar un mensaje si el carrito está vacío
        if (subtotal === 0) {
            $('#cart-items-body').html('<tr><td colspan="5" class="text-center p-5">Tu carrito de compras está vacío.</td></tr>');
            $('#proceed-to-checkout').prop('disabled', true);
            $('#total-price').text('$0');
        } else {
            $('#proceed-to-checkout').prop('disabled', false);
        }
    }
    
    // Dropdown on mouse hover
    $(document).ready(function () {
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

        // Llamar a la función de cálculo inicial al cargar la página
        updateCartTotal();
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


    // Vendor carousel
    $('.vendor-carousel').owlCarousel({
        loop: true,
        margin: 29,
        nav: false,
        autoplay: true,
        smartSpeed: 1000,
        responsive: {
            0:{
                items:2
            },
            576:{
                items:3
            },
            768:{
                items:4
            },
            992:{
                items:5
            },
            1200:{
                items:6
            }
        }
    });


    // Related carousel
    $('.related-carousel').owlCarousel({
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
            },
            992:{
                items:4
            }
        }
    });


    // Product Quantity (Actualizado para el cálculo de totales)
    $('#cart-items-body').on('click', '.quantity button', function () {
        var button = $(this);
        var $input = button.closest('.quantity').find('.item-quantity');
        var oldValue = parseInt($input.val());
        var newVal;

        if (button.hasClass('btn-plus')) {
            newVal = oldValue + 1;
        } else {
            // Asegura que la cantidad no baje de 1
            if (oldValue > 1) {
                newVal = oldValue - 1;
            } else {
                newVal = 1;
            }
        }
        
        $input.val(newVal);
        updateCartTotal(); // Recalcular totales después de cambiar la cantidad
    });

    // Eliminar producto
    $('#cart-items-body').on('click', '.btn-remove', function () {
        // Encontrar la fila del producto (el tr) y eliminarla
        $(this).closest('.cart-item').remove();
        updateCartTotal(); // Recalcular totales después de eliminar un producto
        alert("¡Producto eliminado del carrito!");
    });

    // Simular Proceder al Pago
    $('#proceed-to-checkout').on('click', function(e) {
        e.preventDefault();
        
        // Simulación de validación
        const totalText = $('#total-price').text();
        if (totalText === '$10' || totalText === '$0') { // Solo el costo de envío o vacío
            alert("Tu carrito está vacío. ¡Añade productos antes de proceder al pago!");
            return;
        }
        
        // Simulación de proceso de compra exitoso
        alert(`¡Felicidades! Se ha simulado la compra por un total de ${totalText}. Recibirás un correo de confirmación. ¡Gracias por tu compra en EShopper!`);
        
        // Opcional: limpiar el carrito después de la "compra" simulada
        // $('#cart-items-body').empty(); 
        // updateCartTotal(); 
    });
        $('#proceed-to-checkout').on('click', function(e) {
        e.preventDefault();
        
        // 1. Obtener los datos del carrito
        const cartItems = [];
        $('.cart-item').each(function() {
            const $row = $(this);
            const price = parseFloat($row.data('price'));
            const quantity = parseInt($row.find('.item-quantity').val());
            const name = $row.find('td:first').text().trim().replace(/.*?\s/, ''); // Obtener solo el nombre del producto
            const totalItem = price * quantity;

            cartItems.push({
                name: name,
                price: price,
                quantity: quantity,
                total: totalItem
            });
        });

        const subtotal = parseFloat($('#subtotal-price').text().replace('$', ''));
        const shipping = parseFloat($('#shipping-cost').text().replace('$', ''));
        const total = parseFloat($('#total-price').text().replace('$', ''));

        const checkoutData = {
            items: cartItems,
            subtotal: subtotal,
            shipping: shipping,
            total: total
        };
        
        // 2. Guardar los datos en localStorage
        // Guardar como JSON string
        localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
        
        // 3. Redirigir al usuario
        window.location.href = 'checkout.html';
    });
    
})(jQuery);

