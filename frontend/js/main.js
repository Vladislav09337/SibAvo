// ============================================================
// SibAvto — основной JavaScript
// ============================================================

// Глобальная функция уведомления
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

// Получить корзину
function getCart() {
    return JSON.parse(localStorage.getItem('sibavto_cart') || '[]');
}

// Сохранить корзину
function saveCart(cart) {
    localStorage.setItem('sibavto_cart', JSON.stringify(cart));
    updateCartCount();
}

// Обновить счётчик корзины
function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.header__icon').forEach(el => {
        if (el.textContent.includes('Корзина')) {
            el.textContent = 'Корзина' + (count > 0 ? ' (' + count + ')' : '');
        }
    });
}

// Получить текущего пользователя
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('sibavto_current_user') || 'null');
}

// Обновить кнопку профиля в шапке
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

// ============ ИЗБРАННОЕ ============
function getFavorites() {
    const user = getCurrentUser();
    if (!user) return [];
    return JSON.parse(localStorage.getItem('sibavto_favorites_' + user.id) || '[]');
}

function saveFavorites(favorites) {
    const user = getCurrentUser();
    if (!user) return;
    localStorage.setItem('sibavto_favorites_' + user.id, JSON.stringify(favorites));
    updateFavoritesCount();
}

function updateFavoritesCount() {
    const favorites = getFavorites();
    const count = favorites.length;
    document.querySelectorAll('.header__favorites').forEach(el => {
        el.textContent = 'Избранное' + (count > 0 ? ' (' + count + ')' : '');
    });
}

function isFavorite(article) {
    return getFavorites().some(f => f.article === article);
}

function toggleFavorite(product) {
    const user = getCurrentUser();
    if (!user) {
        showToast('Войдите в аккаунт, чтобы добавлять в избранное', 'error');
        setTimeout(() => window.location.href = 'login.html', 1200);
        return;
    }

    const favorites = getFavorites();
    const existingIndex = favorites.findIndex(f => f.article === product.article);

    if (existingIndex === -1) {
        favorites.push(product);
        saveFavorites(favorites);
        showToast('Добавлено в избранное', 'success');
    } else {
        favorites.splice(existingIndex, 1);
        saveFavorites(favorites);
        showToast('Удалено из избранного', 'success');
    }

    updateFavoriteButtons();
}

function updateFavoriteButtons() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const article = btn.dataset.article;
        if (isFavorite(article)) {
            btn.textContent = '★';
            btn.classList.add('favorite-btn--active');
        } else {
            btn.textContent = '☆';
            btn.classList.remove('favorite-btn--active');
        }
    });
}

// ============ ИНИЦИАЛИЗАЦИЯ ============
document.addEventListener('DOMContentLoaded', function () {

    updateCartCount();
    updateHeaderUserButton();
    updateFavoritesCount();
    updateFavoriteButtons();

    // ============ ДОБАВЛЕНИЕ В КОРЗИНУ ============
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();

            const card = this.closest('.product__card');
            if (!card) return;

            const name = card.querySelector('.product__name').textContent;
            const article = card.querySelector('.product__article').textContent.replace('Артикул: ', '').trim();
            const priceText = card.querySelector('.product__price').textContent;
            const price = parseInt(priceText.replace(/[^\d]/g, ''));

            const cart = getCart();
            const existing = cart.find(item => item.article === article);

            if (existing) {
                existing.quantity++;
            } else {
                cart.push({ name, article, price, quantity: 1 });
            }

            saveCart(cart);
            showToast('Товар добавлен в корзину', 'success');
        });
    });

    // ============ КНОПКИ ИЗБРАННОГО ============
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.favorite-btn');
        if (!btn) return;
        e.preventDefault();

        const card = btn.closest('.product__card');
        if (!card) return;

        const article = btn.dataset.article || card.querySelector('.product__article')?.textContent.replace('Артикул: ', '').trim();
        const name = card.querySelector('.product__name')?.textContent;
        const priceText = card.querySelector('.product__price')?.textContent;
        const price = parseInt(priceText?.replace(/[^\d]/g, '') || 0);
        const id = card.dataset.id ? parseInt(card.dataset.id) : null;

        if (!article) return;

        toggleFavorite({ id, name, article, price });
    });

    // ============ ПОИСК ПО VIN ============
    const searchForm = document.querySelector('.search__form');
    if (searchForm && !document.getElementById('articleInput')) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const vin = this.querySelector('.search__input').value.trim();
            if (vin.length < 5) {
                showToast('Введите VIN-номер (минимум 5 символов)', 'error');
                return;
            }
            showToast('Поиск по VIN: ' + vin, 'success');
            setTimeout(() => window.location.href = 'catalog.html', 1000);
        });
    }

    // ============ БРЕНДЫ НА ГЛАВНОЙ ============
    const brandsGrid = document.getElementById('brands-grid');
    if (brandsGrid && window.SIBAVTO_BRANDS) {
        brandsGrid.innerHTML = window.SIBAVTO_BRANDS.map(brand => `
            <a href="catalog.html?brand=${brand.id}" class="brand__card">
                <div class="brand__logo">${brand.name.charAt(0)}</div>
                <div class="brand__name">${brand.name}</div>
            </a>
        `).join('');
    }

    // ============ КОРЗИНА ============
    if (document.querySelector('.cart__items')) {
        renderCart();

        function renderCart() {
            const cart = getCart();
            const container = document.querySelector('.cart__items');

            if (cart.length === 0) {
                container.innerHTML = `
                    <div class="cart__empty">
                        <p style="margin-bottom: 20px;">Ваша корзина пуста</p>
                        <a href="catalog.html" class="btn btn--primary">Перейти в каталог</a>
                    </div>
                `;
                updateSummary(0);
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

            container.querySelectorAll('.qty-plus').forEach(btn => {
                btn.addEventListener('click', function () {
                    const index = this.closest('.cart__item').dataset.index;
                    const cart = getCart();
                    cart[index].quantity++;
                    saveCart(cart);
                    renderCart();
                });
            });

            container.querySelectorAll('.qty-minus').forEach(btn => {
                btn.addEventListener('click', function () {
                    const index = this.closest('.cart__item').dataset.index;
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
                    const index = this.closest('.cart__item').dataset.index;
                    const cart = getCart();
                    cart.splice(index, 1);
                    saveCart(cart);
                    renderCart();
                    showToast('Товар удалён из корзины', 'success');
                });
            });

            const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            updateSummary(total);
        }

        function updateSummary(total) {
            const summary = document.querySelector('.cart__summary');
            if (!summary) return;

            const cart = getCart();
            const count = cart.reduce((sum, item) => sum + item.quantity, 0);
            const rows = summary.querySelectorAll('.cart__row');

            if (rows.length >= 3) {
                rows[0].querySelector('span:first-child').textContent = 'Товары (' + count + ' шт.)';
                rows[0].querySelector('span:last-child').textContent = total.toLocaleString('ru-RU') + ' руб.';
                rows[2].querySelector('span:last-child').textContent = total.toLocaleString('ru-RU') + ' руб.';
            }
        }
    }

    // ============ ОБРАТНАЯ СВЯЗЬ ============
    const contactsForm = document.querySelector('.contacts__form form');
    if (contactsForm) {
        contactsForm.addEventListener('submit', function (e) {
            e.preventDefault();
            showToast('Сообщение отправлено! Мы свяжемся с вами', 'success');
            this.reset();
        });
    }

    // ============ АВТОРИЗАЦИЯ (Login) ============
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
                    id: user.id,
                    fullName: user.fullName,
                    phone: user.phone,
                    email: user.email
                }));
                showToast('Добро пожаловать, ' + user.fullName + '!', 'success');
                setTimeout(() => window.location.href = 'profile.html', 800);
            } else {
                showToast('Неверный телефон или пароль', 'error');
            }
        });
    }

    // ============ РЕГИСТРАЦИЯ ============
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const fullName = document.getElementById('regFullName').value.trim();
            const phone = document.getElementById('regPhone').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value;
            const password2 = document.getElementById('regPassword2').value;

            if (password !== password2) {
                showToast('Пароли не совпадают', 'error');
                return;
            }

            if (password.length < 6) {
                showToast('Пароль должен быть минимум 6 символов', 'error');
                return;
            }

            const users = JSON.parse(localStorage.getItem('sibavto_users') || '[]');
            if (users.find(u => u.phone === phone)) {
                showToast('Пользователь с таким телефоном уже существует', 'error');
                return;
            }

            const newUser = {
                id: Date.now(),
                fullName: fullName,
                phone: phone,
                email: email,
                password: password,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('sibavto_users', JSON.stringify(users));

            localStorage.setItem('sibavto_current_user', JSON.stringify({
                id: newUser.id,
                fullName: newUser.fullName,
                phone: newUser.phone,
                email: newUser.email
            }));

            showToast('Регистрация успешна!', 'success');
            setTimeout(() => window.location.href = 'profile.html', 800);
        });
    }
});