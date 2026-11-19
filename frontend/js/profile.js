// ============================================================
// Логика личного кабинета SibAvto
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

    const currentUser = JSON.parse(localStorage.getItem('sibavto_current_user') || 'null');

    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // ============ ВЫХОД (СРАЗУ, ЧТОБЫ НЕ СЛОМАЛОСЬ) ============
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('sibavto_current_user');
            window.location.href = 'index.html';
        });
    }

    // ============ ОБНОВИТЬ СЧЁТЧИКИ ============
    function updateHeaderFavoritesCount() {
        const favorites = JSON.parse(localStorage.getItem('sibavto_favorites_' + currentUser.id) || '[]');
        const count = favorites.length;
        document.querySelectorAll('.header__favorites').forEach(el => {
            el.textContent = 'Избранное' + (count > 0 ? ' (' + count + ')' : '');
        });
    }

    function updateHeaderCartCount() {
        const cart = JSON.parse(localStorage.getItem('sibavto_cart') || '[]');
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelectorAll('.header__icon').forEach(el => {
            if (el.textContent.includes('Корзина')) {
                el.textContent = 'Корзина' + (count > 0 ? ' (' + count + ')' : '');
            }
        });
    }

    updateHeaderFavoritesCount();
    updateHeaderCartCount();

    // ============ ЗАПОЛНЕНИЕ ДАННЫХ ============
    const profileName = document.getElementById('profileName');
    if (profileName) profileName.textContent = currentUser.fullName;

    const profilePhone = document.getElementById('profilePhone');
    if (profilePhone) profilePhone.textContent = currentUser.phone;

    const profileEmail = document.getElementById('profileEmail');
    if (profileEmail) profileEmail.textContent = currentUser.email;

    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar) profileAvatar.textContent = currentUser.fullName.charAt(0).toUpperCase();

    const userButton = document.getElementById('userButton');
    if (userButton) userButton.textContent = currentUser.fullName.split(' ')[0];

    const editFullName = document.getElementById('editFullName');
    if (editFullName) editFullName.value = currentUser.fullName;

    const editPhone = document.getElementById('editPhone');
    if (editPhone) editPhone.value = currentUser.phone;

    const editEmail = document.getElementById('editEmail');
    if (editEmail) editEmail.value = currentUser.email;

    // ============ СОХРАНЕНИЕ ЛИЧНЫХ ДАННЫХ ============
    const profileForm = document.getElementById('profileInfoForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const newFullName = document.getElementById('editFullName').value.trim();
            const newPhone = document.getElementById('editPhone').value.trim();
            const newEmail = document.getElementById('editEmail').value.trim();

            currentUser.fullName = newFullName;
            currentUser.phone = newPhone;
            currentUser.email = newEmail;
            localStorage.setItem('sibavto_current_user', JSON.stringify(currentUser));

            const users = JSON.parse(localStorage.getItem('sibavto_users') || '[]');
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].fullName = newFullName;
                users[userIndex].phone = newPhone;
                users[userIndex].email = newEmail;
                localStorage.setItem('sibavto_users', JSON.stringify(users));
            }

            if (profileName) profileName.textContent = newFullName;
            if (profilePhone) profilePhone.textContent = newPhone;
            if (profileEmail) profileEmail.textContent = newEmail;
            if (profileAvatar) profileAvatar.textContent = newFullName.charAt(0).toUpperCase();
            if (userButton) userButton.textContent = newFullName.split(' ')[0];

            showToast('Изменения сохранены', 'success');
        });
    }

    // ============ ВКЛАДКИ ============
    function switchTab(tab) {
        document.querySelectorAll('.profile__menu-item').forEach(i => i.classList.remove('profile__menu-item--active'));
        document.querySelectorAll('.profile__tab').forEach(t => t.classList.remove('profile__tab--active'));
        document.querySelector(`.profile__menu-item[data-tab="${tab}"]`)?.classList.add('profile__menu-item--active');
        document.querySelector(`.profile__tab[data-tab="${tab}"]`)?.classList.add('profile__tab--active');
    }

    document.querySelectorAll('.profile__menu-item').forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            switchTab(this.dataset.tab);
        });
    });

    if (window.location.hash === '#favorites') setTimeout(() => switchTab('favorites'), 100);
    if (window.location.hash === '#addresses') setTimeout(() => switchTab('addresses'), 100);

    // ============ УМНЫЙ СТАТУС ЗАКАЗА ============
    function getOrderStatus(order) {
        if (order.status !== 'new') return order.status;
        
        const now = new Date().getTime();
        const created = new Date(order.createdAt).getTime();
        const diffSeconds = Math.floor((now - created) / 1000);

        if (diffSeconds > 20) return 'delivered';
        if (diffSeconds > 10) return 'assembled';
        return 'new';
    }

    function getStatusLabel(status) {
        const labels = {
            'new': 'Новый', 'assembled': 'Собирается',
            'delivered': 'Доставлен', 'cancelled': 'Отменён'
        };
        return labels[status] || status;
    }

    // ============ ЗАКАЗЫ ============
    function renderOrders() {
        const orders = JSON.parse(localStorage.getItem('sibavto_orders_' + currentUser.id) || '[]');
        const container = document.getElementById('ordersList');
        if (!container) return;

        if (orders.length === 0) {
            container.innerHTML = `<div class="profile__empty"><p>У вас пока нет заказов</p><a href="catalog.html" class="btn btn--primary" style="margin-top: 15px;">Перейти в каталог</a></div>`;
            return;
        }

        container.innerHTML = orders.map(order => {
            const currentStatus = getOrderStatus(order);
            return `
                <div class="order__card">
                    <div class="order__header">
                        <div>
                            <h3>Заказ №${order.number}</h3>
                            <p class="order__date">${new Date(order.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <span class="order__status order__status--${currentStatus}">${getStatusLabel(currentStatus)}</span>
                    </div>
                    <div class="order__items">
                        ${order.items.map(item => `<div class="order__item"><span>${item.name} — ${item.quantity} шт.</span><span>${(item.price * item.quantity).toLocaleString('ru-RU')} руб.</span></div>`).join('')}
                    </div>
                    ${order.address ? `<div class="order__address"><strong>Адрес доставки:</strong> ${order.address}</div>` : ''}
                    <div class="order__total"><span>Итого:</span><strong>${order.total.toLocaleString('ru-RU')} руб.</strong></div>
                </div>
            `;
        }).join('');
    }

    renderOrders();

    // ============ ИЗБРАННОЕ ============
    function renderFavorites() {
        const favorites = JSON.parse(localStorage.getItem('sibavto_favorites_' + currentUser.id) || '[]');
        const container = document.getElementById('favoritesList');
        if (!container) return;

        if (favorites.length === 0) {
            container.innerHTML = `<div class="profile__empty"><p>У вас пока нет избранных товаров</p><a href="catalog.html" class="btn btn--primary" style="margin-top: 15px;">Перейти в каталог</a></div>`;
            return;
        }

        container.innerHTML = `<div class="products__grid">${favorites.map(item => {
            const imageUrl = item.image || 'https://via.placeholder.com/400x300/cccccc/ffffff?text=No+Image';
            return `
                <div class="product__card">
                    <a href="product.html?id=${item.id}" class="product__link">
                        <div class="product__image-wrapper"><img src="${imageUrl}" alt="${item.name}" class="product__image-img" loading="lazy"></div>
                        <h3 class="product__name">${item.name}</h3>
                        <p class="product__article">Артикул: ${item.article}</p>
                    </a>
                    <p class="product__price">${item.price.toLocaleString('ru-RU')} руб.</p>
                    <button class="btn btn--primary btn--small add-to-cart-fav" data-id="${item.id}">В корзину</button>
                </div>`;
        }).join('')}</div>`;

        container.querySelectorAll('.add-to-cart-fav').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = parseInt(this.dataset.id);
                const product = favorites.find(f => f.id === id);
                if (product && typeof addToCart === 'function') addToCart(product);
            });
        });
    }
    renderFavorites();

    // ============ АДРЕСА ============
    function getAddresses() {
        return JSON.parse(localStorage.getItem('sibavto_addresses_' + currentUser.id) || '[]');
    }

    function renderAddresses() {
        const container = document.getElementById('addressesList');
        if (!container) return;
        const addresses = getAddresses();

        if (addresses.length === 0) {
            container.innerHTML = `<div class="profile__empty"><p>У вас пока нет сохранённых адресов</p></div>`;
            return;
        }

        container.innerHTML = addresses.map((addr, index) => `
            <div class="address__card">
                <div class="address__card-header">
                    <h3>${addr.label}</h3>
                    <button class="address__delete" data-index="${index}">Удалить</button>
                </div>
                <p class="address__text">${addr.fullAddress}</p>
                ${addr.comment ? `<p class="address__comment">${addr.comment}</p>` : ''}
            </div>
        `).join('');

        container.querySelectorAll('.address__delete').forEach(btn => {
            btn.addEventListener('click', function () {
                const idx = parseInt(this.dataset.index);
                const addresses = getAddresses();
                addresses.splice(idx, 1);
                localStorage.setItem('sibavto_addresses_' + currentUser.id, JSON.stringify(addresses));
                renderAddresses();
            });
        });
    }
    renderAddresses();

    // ============ ФОРМА ДОБАВЛЕНИЯ АДРЕСА ============
    const addressForm = document.getElementById('addressForm');
    if (addressForm) {
        addressForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const label = document.getElementById('addressLabel').value.trim();
            const fullAddress = document.getElementById('addressFull').value.trim();
            const comment = document.getElementById('addressComment').value.trim();
            
            if (!fullAddress) return;

            const addresses = getAddresses();
            addresses.push({ label: label || 'Адрес', fullAddress, comment });
            localStorage.setItem('sibavto_addresses_' + currentUser.id, JSON.stringify(addresses));
            
            this.reset();
            renderAddresses();
            showToast('Адрес сохранён', 'success');
        });
    }
});