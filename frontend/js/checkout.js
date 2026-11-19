// ============================================================
// Логика оформления заказа
// ============================================================

function togglePayment(type) {
    const cardForm = document.getElementById('cardForm');
    const sbpBlock = document.getElementById('sbpBlock');
    
    if (!cardForm || !sbpBlock) return;
    
    cardForm.style.display = 'none';
    sbpBlock.style.display = 'none';
    
    if (type === 'card') {
        cardForm.style.display = 'block';
    } else if (type === 'sbp') {
        sbpBlock.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', function () {

    const currentUser = JSON.parse(localStorage.getItem('sibavto_current_user') || 'null');

    if (currentUser) {
        document.getElementById('customerName').value = currentUser.fullName || '';
        document.getElementById('customerPhone').value = currentUser.phone || '';
        document.getElementById('customerEmail').value = currentUser.email || '';
    }

    const addressBlock = document.getElementById('addressBlock');
    const savedAddressesList = document.getElementById('savedAddressesList');

    // Показываем блок адреса, если курьер выбран по умолчанию
    const initialDelivery = document.querySelector('input[name="delivery"]:checked');
    if (initialDelivery && initialDelivery.value === 'courier') {
        addressBlock.style.display = 'block';
        renderSavedAddresses();
    }

    document.querySelectorAll('input[name="delivery"]').forEach(radio => {
        radio.addEventListener('change', function () {
            addressBlock.style.display = this.value === 'courier' ? 'block' : 'none';
            if (this.value === 'courier') renderSavedAddresses();
        });
    });

    // ============ РЕНДЕР СОХРАНЁННЫХ АДРЕСОВ ============
    function renderSavedAddresses() {
        if (!currentUser) {
            savedAddressesList.innerHTML = '<p style="color: #888; font-size: 14px; padding: 12px 0;">Войдите в аккаунт, чтобы использовать сохранённые адреса</p>';
            return;
        }

        const addresses = JSON.parse(localStorage.getItem('sibavto_addresses_' + currentUser.id) || '[]');

        if (addresses.length === 0) {
            savedAddressesList.innerHTML = '<p style="color: #888; font-size: 14px; padding: 12px 0;">У вас нет сохранённых адресов</p>';
            return;
        }

        savedAddressesList.innerHTML = addresses.map((addr, i) => {
            const cleanAddress = (addr.fullAddress || '').replace(/\s+/g, ' ').trim();
            return `
                <label class="address__option">
                    <input type="radio" name="savedAddress" value="${i}">
                    <div class="address__option-content">
                        <strong class="address__option-title">
                            <span class="address__option-icon">📍</span> ${addr.label || 'Адрес доставки'}
                        </strong>
                        <p class="address__option-text">${cleanAddress}</p>
                        ${addr.comment ? `<p class="address__option-comment">💬 ${addr.comment}</p>` : ''}
                    </div>
                </label>
            `;
        }).join('');
    }

    // ============ ФОРМАТИРОВАНИЕ КАРТЫ ============
    const cardNumber = document.getElementById('cardNumber');
    const cardHolder = document.getElementById('cardHolder');
    const cardExpiry = document.getElementById('cardExpiry');
    const cardCvv = document.getElementById('cardCvv');

    const previewNumber = document.getElementById('cardPreviewNumber');
    const previewName = document.getElementById('cardPreviewName');
    const previewExpiry = document.getElementById('cardPreviewExpiry');

    if (cardNumber) {
        cardNumber.addEventListener('input', function () {
            let value = this.value.replace(/\D/g, '');
            value = value.match(/.{1,4}/g)?.join(' ') || '';
            this.value = value.slice(0, 19);
            if (previewNumber) previewNumber.textContent = this.value || '•••• •••• •••• ••••';
        });
    }

    if (cardHolder) {
        cardHolder.addEventListener('input', function () {
            this.value = this.value.toUpperCase();
            if (previewName) previewName.textContent = this.value || 'ИМЯ ДЕРЖАТЕЛЯ';
        });
    }

    if (cardExpiry) {
        cardExpiry.addEventListener('input', function () {
            let value = this.value.replace(/\D/g, '');
            if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2, 4);
            this.value = value.slice(0, 5);
            if (previewExpiry) previewExpiry.textContent = this.value || 'MM/YY';
        });
    }

    if (cardCvv) {
        cardCvv.addEventListener('input', function () {
            this.value = this.value.replace(/\D/g, '').slice(0, 3);
        });
    }

    // ============ ОТПРАВКА ЗАКАЗА ============
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const cart = JSON.parse(localStorage.getItem('sibavto_cart') || '[]');
            if (cart.length === 0) {
                if (typeof showToast === 'function') showToast('Корзина пуста', 'error');
                return;
            }

            const delivery = document.querySelector('input[name="delivery"]:checked').value;
            const payment = document.querySelector('input[name="payment"]:checked').value;
            const comment = document.getElementById('orderComment').value.trim();

            let address = null;
            if (delivery === 'courier') {
                const selectedSaved = document.querySelector('input[name="savedAddress"]:checked');
                const manual = document.getElementById('manualAddress').value.trim();

                if (selectedSaved && currentUser) {
                    const addresses = JSON.parse(localStorage.getItem('sibavto_addresses_' + currentUser.id) || '[]');
                    address = addresses[parseInt(selectedSaved.value)].fullAddress;
                } else if (manual) {
                    address = manual;
                } else {
                    if (typeof showToast === 'function') showToast('Выберите или введите адрес доставки', 'error');
                    return;
                }
            }

            // Валидация карты
            if (payment === 'card') {
                const cardNum = cardNumber.value.replace(/\s/g, '');
                const expiry = cardExpiry.value;
                const cvv = cardCvv.value;
                const holder = cardHolder.value.trim();

                if (cardNum.length !== 16) { showToast('Введите номер карты (16 цифр)', 'error'); return; }
                if (!holder) { showToast('Введите имя держателя', 'error'); return; }
                if (expiry.length !== 5) { showToast('Введите срок (MM/YY)', 'error'); return; }
                if (cvv.length !== 3) { showToast('Введите CVV', 'error'); return; }
            }

            // Симуляция оплаты
            if (payment === 'card') {
                const btn = this.querySelector('button[type="submit"]');
                btn.textContent = 'Обработка оплаты...';
                btn.disabled = true;
                setTimeout(() => { completeOrder(cart, delivery, payment, address, comment); }, 1500);
            } else if (payment === 'sbp') {
                showToast('Подтвердите оплату в приложении банка', 'success');
                setTimeout(() => { completeOrder(cart, delivery, payment, address, comment); }, 2000);
            } else {
                completeOrder(cart, delivery, payment, address, comment);
            }
        });
    }

    // ============ СОХРАНЕНИЕ ЗАКАЗА ============
    function completeOrder(cart, delivery, payment, address, comment) {
        const orderNumber = '2026-' + Math.floor(1000 + Math.random() * 9000);
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const order = {
            number: orderNumber,
            items: cart,
            total: total,
            status: 'new', // Начальный статус
            deliveryMethod: delivery,
            address: address,
            paymentMethod: payment,
            comment: comment,
            createdAt: new Date().toISOString() // Фиксируем время
        };

        if (currentUser) {
            const ordersKey = 'sibavto_orders_' + currentUser.id;
            const orders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
            orders.unshift(order);
            localStorage.setItem(ordersKey, JSON.stringify(orders));
        }

        localStorage.removeItem('sibavto_cart');
        showToast('Заказ №' + orderNumber + ' оформлен!', 'success');

        setTimeout(() => {
            window.location.href = currentUser ? 'profile.html' : 'index.html';
        }, 1500);
    }
});