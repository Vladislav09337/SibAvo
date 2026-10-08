// SibAvto — основной JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // Поиск по VIN
    const searchForm = document.querySelector('.search__form');
    if (searchForm) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const vin = document.querySelector('.search__input').value.trim();
            if (vin.length === 17) {
                alert('Поиск по VIN: ' + vin);
            } else {
                alert('VIN-номер должен содержать 17 символов');
            }
        });
    }

    // Кнопки "В корзину"
    const addToCartButtons = document.querySelectorAll('.product__card .btn');
    addToCartButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            alert('Товар добавлен в корзину');
        });
    });

    // Корзина — изменение количества
    const qtyButtons = document.querySelectorAll('.cart__qty button');
    qtyButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const input = this.parentElement.querySelector('input');
            let value = parseInt(input.value);
            if (this.textContent === '+') {
                value++;
            } else if (this.textContent === '−' && value > 1) {
                value--;
            }
            input.value = value;
        });
    });

    // Корзина — удаление товара
    const removeButtons = document.querySelectorAll('.cart__remove');
    removeButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (confirm('Удалить товар из корзины?')) {
                this.closest('.cart__item').remove();
            }
        });
    });

    // Оформление заказа
    const checkoutForm = document.querySelector('.checkout__form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function (e) {
            e.preventDefault();
            alert('Заказ успешно оформлен! Номер заказа: 2026-' + Math.floor(Math.random() * 10000));
        });
    }

    // Обратная связь
    const contactsForm = document.querySelector('.contacts__form form');
    if (contactsForm) {
        contactsForm.addEventListener('submit', function (e) {
            e.preventDefault();
            alert('Сообщение отправлено!');
            this.reset();
        });
    }

    // Авторизация
    const authForm = document.querySelector('.auth__form');
    if (authForm) {
        authForm.addEventListener('submit', function (e) {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }
});