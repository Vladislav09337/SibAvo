// ============================================================
// SibAvto — основной JavaScript
// ============================================================

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast toast--' + type;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('toast--show'), 100);
    setTimeout(() => {
        toast.classList.remove('toast--show');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

function getCart() {
    return JSON.parse(localStorage.getItem('sibavto_cart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('sibavto_cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cartBadge');
    if (badge) badge.textContent = count;
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('sibavto_current_user') || 'null');
}

function updateHeaderUserButton() {
    const user = getCurrentUser();
    const btns = document.querySelectorAll('.header__actions .btn--outline');
    btns.forEach(btn => {
        if (user) {
            btn.textContent = user.fullName.split(' ')[0];
            btn.href = 'profile.html';
        } else {
            btn.textContent = 'Войти';
            btn.href = 'login.html';
        }
    });
}

function getFavorites() {
    const user = getCurrentUser();
    if (!user) return [];
    return JSON.parse(localStorage.getItem('sibavto_favorites_' + user.id) || '[]');
}

function updateFavoritesCount() {
    const favorites = getFavorites();
    const count = favorites.length;
    const badge = document.getElementById('favoritesBadge');
    if (badge) badge.textContent = count;
}

function updateCompareBadge() {
    const compare = JSON.parse(localStorage.getItem('sibavto_compare') || '[]');
    const badge = document.getElementById('compareBadge');
    if (badge) badge.textContent = compare.length;
}

// ============ ИЗБРАННОЕ ============
function toggleFavorite(product) {
    const user = getCurrentUser();
    if (!user) {
        showToast('Войдите в аккаунт', 'error');
        setTimeout(() => window.location.href = 'login.html', 1200);
        return;
    }

    const favorites = getFavorites();
    const existingIndex = favorites.findIndex(f => f.article === product.article);

    if (existingIndex === -1) {
        favorites.push({
            id: product.id,
            name: product.name,
            article: product.article,
            price: product.price,
            image: product.image || ''
        });
        showToast('Добавлено в избранное', 'success');
    } else {
        favorites.splice(existingIndex, 1);
        showToast('Удалено из избранного', 'success');
    }

    localStorage.setItem('sibavto_favorites_' + user.id, JSON.stringify(favorites));
    updateFavoritesCount();
}

// ============ КОРЗИНА ============
function renderCart() {
    const cart = getCart();
    const container = document.querySelector('.cart__items');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart__empty">
                <p style="margin-bottom: 20px;">Ваша корзина пуста</p>
                <a href="catalog.html" class="btn btn--primary">Перейти в каталог</a>
            </div>
        `;
        updateCartSummary(0);
        return;
    }

    container.innerHTML = cart.map((item, index) => `
        <div class="cart__item" data-index="${index}">
            <div class="cart__image">■</div>
            <div class="cart__info">
                <h3>${item.name}</h3>
                <p>Артикул: ${item.article}</p>
                <p class="cart__price">${item.price.toLocaleString('ru-RU')} руб.</p>
            </div>
            <div class="cart__qty">
                <button class="qty-minus">−</button>
                <input type="text" value="${item.quantity}" readonly>
                <button class="qty-plus">+</button>
            </div>
            <div class="cart__total">${(item.price * item.quantity).toLocaleString('ru-RU')} руб.</div>
            <button class="cart__remove">Удалить</button>
        </div>
    `).join('');

    // Кнопки +/-
    container.querySelectorAll('.qty-plus').forEach(btn => {
        btn.addEventListener('click', function () {
            const index = parseInt(this.closest('.cart__item').dataset.index);
            const cart = getCart();
            cart[index].quantity++;
            saveCart(cart);
            renderCart();
        });
    });

    container.querySelectorAll('.qty-minus').forEach(btn => {
        btn.addEventListener('click', function () {
            const index = parseInt(this.closest('.cart__item').dataset.index);
            const cart = getCart();
            if (cart[index].quantity > 1) {
                cart[index].quantity--;
                saveCart(cart);
                renderCart();
            }
        });
    });

    container.querySelectorAll('.cart__remove').forEach(btn => {
        btn.addEventListener('click', function () {
            const index = parseInt(this.closest('.cart__item').dataset.index);
            const cart = getCart();
            cart.splice(index, 1);
            saveCart(cart);
            renderCart();
            showToast('Товар удалён из корзины', 'success');
        });
    });

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    updateCartSummary(total);
}

function updateCartSummary(total) {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Расчёт доставки
    const deliveryMethod = document.querySelector('input[name="deliveryMethod"]:checked');
    let deliveryCost = 0;

    if (deliveryMethod) {
        const method = deliveryMethod.value;
        if (method === 'courier') {
            deliveryCost = total >= 5000 ? 0 : 300;
        } else if (method === 'post') {
            deliveryCost = total >= 5000 ? 0 : 500;
        }
    }

    const grandTotal = total + deliveryCost;

    const cartCount = document.getElementById('cartCount');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartDelivery = document.getElementById('cartDelivery');
    const cartTotal = document.getElementById('cartTotal');

    if (cartCount) cartCount.textContent = count;
    if (cartSubtotal) cartSubtotal.textContent = total.toLocaleString('ru-RU') + ' руб.';
    if (cartDelivery) {
        if (deliveryMethod) {
            cartDelivery.textContent = deliveryCost > 0
                ? deliveryCost.toLocaleString('ru-RU') + ' руб.'
                : 'Бесплатно';
        } else {
            cartDelivery.textContent = '—';
        }
    }
    if (cartTotal) cartTotal.textContent = grandTotal.toLocaleString('ru-RU') + ' руб.';

    // Сохраняем выбранный способ доставки
    if (deliveryMethod) {
        localStorage.setItem('sibavto_delivery_method', deliveryMethod.value);
    }
}

// ============ ИНИЦИАЛИЗАЦИЯ ============
document.addEventListener('DOMContentLoaded', function () {

    updateCartCount();
    updateHeaderUserButton();
    updateFavoritesCount();
    updateCompareBadge();

    // ВЫПАДАЮЩЕЕ МЕНЮ ПРОФИЛЯ
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenu = document.querySelector('.user-menu');

    if (userMenuBtn && userMenu) {
        userMenuBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            userMenu.classList.toggle('user-menu--open');
        });

        document.addEventListener('click', function (e) {
            if (!userMenu.contains(e.target)) {
                userMenu.classList.remove('user-menu--open');
            }
        });
    }

    // БРЕНДЫ
    const brandsGrid = document.getElementById('brands-grid');
    if (brandsGrid && window.SIBAVTO_BRANDS) {
        brandsGrid.innerHTML = window.SIBAVTO_BRANDS.map(brand => `
            <a href="catalog.html?brand=${brand.id}" class="brand__card">
                <div class="brand__logo-img">
                    <img src="images/brands/${brand.id}.png" alt="${brand.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="brand__logo-fallback" style="display: none;">${brand.name.charAt(0)}</div>
                </div>
                <div class="brand__name">${brand.name}</div>
            </a>
        `).join('');
    }

    // КОРЗИНА
    if (document.querySelector('.cart__items')) {
        renderCart();

        // ВЫБОР ДОСТАВКИ
        document.querySelectorAll('input[name="deliveryMethod"]').forEach(radio => {
            radio.addEventListener('change', function () {
                const cart = getCart();
                const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
                updateCartSummary(total);
            });
        });

        // Восстановление выбранного способа
        const savedDelivery = localStorage.getItem('sibavto_delivery_method');
        if (savedDelivery) {
            const radio = document.querySelector(`input[name="deliveryMethod"][value="${savedDelivery}"]`);
            if (radio) {
                radio.checked = true;
                const cart = getCart();
                const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
                updateCartSummary(total);
            }
        }
    }

    // ПОИСК
    const searchForm = document.querySelector('.search__form');
    if (searchForm && !document.getElementById('articleInput')) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const query = this.querySelector('.search__input').value.trim();
            if (query.length < 2) {
                showToast('Введите минимум 2 символа', 'error');
                return;
            }
            showToast('Поиск: ' + query, 'success');
            setTimeout(() => window.location.href = 'catalog.html?highlight=' + encodeURIComponent(query), 800);
        });
    }

    // ОБРАТНАЯ СВЯЗЬ
    const contactsForm = document.querySelector('.contacts__form form');
    if (contactsForm) {
        contactsForm.addEventListener('submit', function (e) {
            e.preventDefault();
            showToast('Сообщение отправлено!', 'success');
            this.reset();
        });
    }

    // АВТОРИЗАЦИЯ
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const phone = document.getElementById('loginPhone').value.trim();
            const password = document.getElementById('loginPassword').value;
            const users = JSON.parse(localStorage.getItem('sibavto_users') || '[]');
            const user = users.find(u => u.phone === phone && u.password === password);
            if (user) {
                localStorage.setItem('sibavto_current_user', JSON.stringify({
                    id: user.id, fullName: user.fullName, phone: user.phone, email: user.email
                }));
                showToast('Добро пожаловать, ' + user.fullName + '!', 'success');
                setTimeout(() => window.location.href = 'profile.html', 800);
            } else {
                showToast('Неверный телефон или пароль', 'error');
            }
        });
    }

    // РЕГИСТРАЦИЯ
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const fullName = document.getElementById('regFullName').value.trim();
            const phone = document.getElementById('regPhone').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value;
            const password2 = document.getElementById('regPassword2').value;

            if (password !== password2) { showToast('Пароли не совпадают', 'error'); return; }
            if (password.length < 6) { showToast('Пароль минимум 6 символов', 'error'); return; }

            const users = JSON.parse(localStorage.getItem('sibavto_users') || '[]');
            if (users.find(u => u.phone === phone)) { showToast('Пользователь уже существует', 'error'); return; }

            const newUser = {
                id: Date.now(), fullName, phone, email, password,
                createdAt: new Date().toISOString()
            };
            users.push(newUser);
            localStorage.setItem('sibavto_users', JSON.stringify(users));
            localStorage.setItem('sibavto_current_user', JSON.stringify({
                id: newUser.id, fullName: newUser.fullName, phone: newUser.phone, email: newUser.email
            }));
            showToast('Регистрация успешна!', 'success');
            setTimeout(() => window.location.href = 'profile.html', 800);
        });
    }

    // ПОДПИСКА
    const subscribeForm = document.getElementById('subscribeForm');
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = this.querySelector('input').value.trim();
            if (!email || !email.includes('@')) { showToast('Введите корректный email', 'error'); return; }
            const subscribers = JSON.parse(localStorage.getItem('sibavto_subscribers') || '[]');
            if (subscribers.includes(email)) { showToast('Вы уже подписаны!', 'error'); return; }
            subscribers.push(email);
            localStorage.setItem('sibavto_subscribers', JSON.stringify(subscribers));
            showToast('Спасибо за подписку!', 'success');
            this.reset();
        });
    }
});