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

function getCart() { return JSON.parse(localStorage.getItem('sibavto_cart') || '[]'); }
function saveCart(cart) { localStorage.setItem('sibavto_cart', JSON.stringify(cart)); updateCartCount(); }

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badges = document.querySelectorAll('#cartBadge');
    badges.forEach(badge => {
        badge.textContent = count;
        badge.style.transform = 'scale(1.5)';
        setTimeout(() => badge.style.transform = 'scale(1)', 200);
    });
}

function getCurrentUser() { return JSON.parse(localStorage.getItem('sibavto_current_user') || 'null'); }

function requireAuthForCart() {
    const user = getCurrentUser();
    if (!user) {
        showToast('Войдите в аккаунт, чтобы добавлять товары в корзину', 'error');
        setTimeout(() => { window.location.href = 'login.html'; }, 1500);
        return false;
    }
    return true;
}

function updateHeaderUserButton() {
    const user = getCurrentUser();
    const btns = document.querySelectorAll('.header__actions .btn--outline');
    btns.forEach(btn => {
        if (user) { btn.textContent = user.fullName.split(' ')[0]; btn.href = 'profile.html'; }
        else { btn.textContent = 'Войти'; btn.href = 'login.html'; }
    });
}

function getFavorites() {
    const user = getCurrentUser();
    if (!user) return [];
    return JSON.parse(localStorage.getItem('sibavto_favorites_' + user.id) || '[]');
}

function updateFavoritesCount() {
    const count = getFavorites().length;
    const badge = document.getElementById('favoritesBadge');
    if (badge) badge.textContent = count;
}

function updateCompareBadge() {
    const compare = JSON.parse(localStorage.getItem('sibavto_compare') || '[]');
    const badge = document.getElementById('compareBadge');
    if (badge) badge.textContent = compare.length;
}

function toggleFavorite(product) {
    const user = getCurrentUser();
    if (!user) { showToast('Войдите в аккаунт', 'error'); setTimeout(() => window.location.href = 'login.html', 1200); return; }
    const favorites = getFavorites();
    const existingIndex = favorites.findIndex(f => f.article === product.article);
    if (existingIndex === -1) { favorites.push({ id: product.id, name: product.name, article: product.article, price: product.price, image: product.image || '' }); showToast('Добавлено в избранное', 'success'); }
    else { favorites.splice(existingIndex, 1); showToast('Удалено из избранного', 'success'); }
    localStorage.setItem('sibavto_favorites_' + user.id, JSON.stringify(favorites));
    updateFavoritesCount();
}

function renderCart() {
    const cart = getCart();
    const container = document.querySelector('.cart__items');
    if (!container) return;
    if (cart.length === 0) {
        container.innerHTML = `<div class="cart__empty"><p style="margin-bottom: 20px;">Ваша корзина пуста</p><a href="catalog.html" class="btn btn--primary">Перейти в каталог</a></div>`;
        updateCartSummary(0);
        return;
    }
    container.innerHTML = cart.map((item, index) => `
        <div class="cart__item" data-index="${index}">
            <div class="cart__image">■</div>
            <div class="cart__info"><h3>${item.name}</h3><p>Артикул: ${item.article}</p><p class="cart__price">${item.price.toLocaleString('ru-RU')} руб.</p></div>
            <div class="cart__qty"><button class="qty-minus">−</button><input type="text" value="${item.quantity}" readonly><button class="qty-plus">+</button></div>
            <div class="cart__total">${(item.price * item.quantity).toLocaleString('ru-RU')} руб.</div>
            <button class="cart__remove">Удалить</button>
        </div>
    `).join('');
    container.querySelectorAll('.qty-plus').forEach(btn => btn.addEventListener('click', function () { const i = parseInt(this.closest('.cart__item').dataset.index); const c = getCart(); c[i].quantity++; saveCart(c); renderCart(); }));
    container.querySelectorAll('.qty-minus').forEach(btn => btn.addEventListener('click', function () { const i = parseInt(this.closest('.cart__item').dataset.index); const c = getCart(); if (c[i].quantity > 1) { c[i].quantity--; saveCart(c); renderCart(); } }));
    container.querySelectorAll('.cart__remove').forEach(btn => btn.addEventListener('click', function () { const i = parseInt(this.closest('.cart__item').dataset.index); const c = getCart(); c.splice(i, 1); saveCart(c); renderCart(); showToast('Товар удалён из корзины', 'success'); }));
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    updateCartSummary(total);
}

function updateCartSummary(total) {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const deliveryMethod = document.querySelector('input[name="deliveryMethod"]:checked');
    let deliveryCost = 0;
    if (deliveryMethod) {
        const method = deliveryMethod.value;
        if (method === 'courier') deliveryCost = total >= 5000 ? 0 : 300;
        else if (method === 'post') deliveryCost = total >= 5000 ? 0 : 500;
    }
    const grandTotal = total + deliveryCost;
    const cartCount = document.getElementById('cartCount');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartDelivery = document.getElementById('cartDelivery');
    const cartTotal = document.getElementById('cartTotal');
    if (cartCount) cartCount.textContent = count;
    if (cartSubtotal) cartSubtotal.textContent = total.toLocaleString('ru-RU') + ' руб.';
    if (cartDelivery) { if (deliveryMethod) cartDelivery.textContent = deliveryCost > 0 ? deliveryCost.toLocaleString('ru-RU') + ' руб.' : 'Бесплатно'; else cartDelivery.textContent = '—'; }
    if (cartTotal) cartTotal.textContent = grandTotal.toLocaleString('ru-RU') + ' руб.';
    if (deliveryMethod) localStorage.setItem('sibavto_delivery_method', deliveryMethod.value);
}

function renderHomeCards(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !window.SIBAVTO_PRODUCTS) return;
    const items = [...window.SIBAVTO_PRODUCTS].sort(() => 0.5 - Math.random()).slice(0, 4);
    container.innerHTML = items.map(p => {
        const img = (p.images && p.images.length > 0) ? p.images[0] : 'https://via.placeholder.com/400x300/cccccc/ffffff?text=No+Image';
        return `
            <div class="product__card">
                <a href="product.html?id=${p.id}" class="product__link">
                    <div class="product__image-wrapper"><img src="${img}" alt="${p.name}" class="product__image-img" loading="lazy"></div>
                    <h3 class="product__name">${p.name}</h3>
                    <p class="product__article">Артикул: ${p.article}</p>
                </a>
                <p class="product__price">${p.price.toLocaleString('ru-RU')} руб.</p>
                <span class="product__status product__status--${p.status === 'in_stock' ? 'in' : 'order'}">${p.status === 'in_stock' ? 'В наличии' : 'Под заказ'}</span>
            </div>
        `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', function () {
    updateCartCount();
    updateHeaderUserButton();
    updateFavoritesCount();
    updateCompareBadge();

    renderHomeCards('hitsGrid');
    renderHomeCards('newGrid');

    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenu = document.querySelector('.user-menu');
    if (userMenuBtn && userMenu) {
        userMenuBtn.addEventListener('click', function (e) { e.stopPropagation(); userMenu.classList.toggle('user-menu--open'); });
        document.addEventListener('click', function (e) { if (!userMenu.contains(e.target)) userMenu.classList.remove('user-menu--open'); });
    }

    const brandsGrid = document.getElementById('brands-grid');
    if (brandsGrid && window.SIBAVTO_BRANDS) {
        brandsGrid.innerHTML = window.SIBAVTO_BRANDS.map(brand => `
            <a href="catalog.html?brand=${brand.id}" class="brand__card">
                <div class="brand__logo-img"><img src="images/brands/${brand.id}.png" alt="${brand.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><div class="brand__logo-fallback" style="display: none;">${brand.name.charAt(0)}</div></div>
                <div class="brand__name">${brand.name}</div>
            </a>
        `).join('');
    }

    if (document.querySelector('.cart__items')) {
        renderCart();
        document.querySelectorAll('input[name="deliveryMethod"]').forEach(radio => radio.addEventListener('change', function () { const cart = getCart(); const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0); updateCartSummary(total); }));
        const savedDelivery = localStorage.getItem('sibavto_delivery_method');
        if (savedDelivery) { const radio = document.querySelector(`input[name="deliveryMethod"][value="${savedDelivery}"]`); if (radio) { radio.checked = true; const cart = getCart(); const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0); updateCartSummary(total); } }
    }

    const contactsForm = document.querySelector('.contacts__form form');
    if (contactsForm) contactsForm.addEventListener('submit', function (e) { e.preventDefault(); showToast('Сообщение отправлено!', 'success'); this.reset(); });

    // ЛОГИКА ВХОДА
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const phone = document.getElementById('loginPhone').value.trim();
            const password = document.getElementById('loginPassword').value;
            const users = JSON.parse(localStorage.getItem('sibavto_users') || '[]');
            const user = users.find(u => u.phone === phone && u.password === password);
            if (user) {
                localStorage.setItem('sibavto_current_user', JSON.stringify({ id: user.id, fullName: user.fullName, phone: user.phone, email: user.email, role: user.role, entityType: user.entityType }));
                showToast('Добро пожаловать, ' + user.fullName + '!', 'success');
                setTimeout(() => window.location.href = 'profile.html', 800);
            } else { showToast('Неверный телефон или пароль', 'error'); }
        });
    }

    // ВОССТАНОВЛЕНИЕ ПАРОЛЯ
    const forgotBtn = document.getElementById('forgotPasswordBtn');
    const forgotModal = document.getElementById('forgotModal');
    const closeForgot = document.getElementById('closeForgotModal');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    let resetCode = null;
    let resetUserContact = null;

    if (forgotBtn && forgotModal) {
        forgotBtn.addEventListener('click', function(e) { e.preventDefault(); forgotModal.style.display = 'flex'; step1.style.display = 'block'; step2.style.display = 'none'; step3.style.display = 'none'; });
        closeForgot.addEventListener('click', () => { forgotModal.style.display = 'none'; });

        document.getElementById('forgotFormStep1').addEventListener('submit', function(e) {
            e.preventDefault();
            const contact = document.getElementById('forgotContact').value.trim();
            const users = JSON.parse(localStorage.getItem('sibavto_users') || '[]');
            const user = users.find(u => u.phone === contact || u.email === contact);
            if (!user) { showToast('Пользователь не найден', 'error'); return; }
            resetCode = Math.floor(100000 + Math.random() * 900000).toString();
            resetUserContact = contact;
            console.log(`%c[КОД] ${resetCode}`, 'color: #e63946; font-size: 20px; font-weight: bold;');
            showToast(`Код отправлен! (Код: ${resetCode} в F12)`, 'success');
            document.getElementById('sentToDisplay').textContent = contact;
            step1.style.display = 'none'; step2.style.display = 'block';
        });

        document.getElementById('forgotFormStep2').addEventListener('submit', function(e) {
            e.preventDefault();
            const enteredCode = document.getElementById('forgotCode').value.trim();
            if (enteredCode !== resetCode) { showToast('Неверный код', 'error'); return; }
            step2.style.display = 'none'; step3.style.display = 'block';
        });

        document.getElementById('forgotFormStep3').addEventListener('submit', function(e) {
            e.preventDefault();
            const pass1 = document.getElementById('newPassword').value;
            const pass2 = document.getElementById('newPasswordConfirm').value;
            if (pass1 !== pass2) { showToast('Пароли не совпадают', 'error'); return; }
            const users = JSON.parse(localStorage.getItem('sibavto_users') || '[]');
            const userIndex = users.findIndex(u => u.phone === resetUserContact || u.email === resetUserContact);
            if (userIndex !== -1) {
                users[userIndex].password = pass1;
                localStorage.setItem('sibavto_users', JSON.stringify(users));
                showToast('Пароль изменен!', 'success');
                forgotModal.style.display = 'none';
                document.getElementById('loginPhone').value = resetUserContact;
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
            const entityType = document.querySelector('input[name="entityType"]:checked').value;
            const isAdmin = document.getElementById('isAdminReg') ? document.getElementById('isAdminReg').checked : false;
            if (password !== password2) { showToast('Пароли не совпадают', 'error'); return; }
            if (password.length < 6) { showToast('Пароль минимум 6 символов', 'error'); return; }
            const users = JSON.parse(localStorage.getItem('sibavto_users') || '[]');
            if (users.find(u => u.phone === phone)) { showToast('Пользователь уже существует', 'error'); return; }
            const newUser = { id: Date.now(), fullName, phone, email, password, role: isAdmin ? 'admin' : 'client', entityType: entityType, createdAt: new Date().toISOString() };
            users.push(newUser);
            localStorage.setItem('sibavto_users', JSON.stringify(users));
            localStorage.setItem('sibavto_current_user', JSON.stringify({ id: newUser.id, fullName: newUser.fullName, phone: newUser.phone, email: newUser.email, role: newUser.role, entityType: newUser.entityType }));
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