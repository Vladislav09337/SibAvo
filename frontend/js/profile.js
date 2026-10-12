// ============================================================
// Логика личного кабинета SibAvto
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

    const currentUser = JSON.parse(localStorage.getItem('sibavto_current_user') || 'null');

    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // ============ ЗАПОЛНЕНИЕ ДАННЫХ ============
    document.getElementById('profileName').textContent = currentUser.fullName;
    document.getElementById('profilePhone').textContent = currentUser.phone;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profileAvatar').textContent = currentUser.fullName.charAt(0).toUpperCase();

    const userButton = document.getElementById('userButton');
    if (userButton) userButton.textContent = currentUser.fullName.split(' ')[0];

    document.getElementById('editFullName').value = currentUser.fullName;
    document.getElementById('editPhone').value = currentUser.phone;
    document.getElementById('editEmail').value = currentUser.email;

    // ============ ОБНОВИТЬ СЧЁТЧИК В ШАПКЕ ============
    function updateHeaderFavoritesCount() {
        const favorites = JSON.parse(localStorage.getItem('sibavto_favorites_' + currentUser.id) || '[]');
        const count = favorites.length;
        document.querySelectorAll('.header__favorites').forEach(el => {
            el.textContent = 'Избранное' + (count > 0 ? ' (' + count + ')' : '');
        });
    }

    // ============ ОБНОВИТЬ СЧЁТЧИК КОРЗИНЫ ============
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

    // ============ СОХРАНЕНИЕ ЛИЧНЫХ ДАННЫХ ============
    document.getElementById('profileInfoForm').addEventListener('submit', function (e) {
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

        document.getElementById('profileName').textContent = newFullName;
        document.getElementById('profilePhone').textContent = newPhone;
        document.getElementById('profileEmail').textContent = newEmail;
        document.getElementById('profileAvatar').textContent = newFullName.charAt(0).toUpperCase();
        if (userButton) userButton.textContent = newFullName.split(' ')[0];

        showToast('Изменения сохранены', 'success');
    });

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

    // Проверка хэша
    if (window.location.hash === '#favorites') {
        setTimeout(() => switchTab('favorites'), 100);
    }
    if (window.location.hash === '#addresses') {
        setTimeout(() => switchTab('addresses'), 100);
    }

    // ============ ЗАКАЗЫ ============
    function renderOrders() {
        const orders = JSON.parse(localStorage.getItem('sibavto_orders_' + currentUser.id) || '[]');
        const container = document.getElementById('ordersList');

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="profile__empty">
                    <p>У вас пока нет заказов</p>
                    <a href="catalog.html" class="btn btn--primary" style="margin-top: 15px;">Перейти в каталог</a>
                </div>
            `;
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="order__card">
                <div class="order__header">
                    <div>
                        <h3>Заказ №${order.number}</h3>
                        <p class="order__date">${new Date(order.createdAt).toLocaleDateString('ru-RU', {
                            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}</p>
                    </div>
                    <span class="order__status order__status--${order.status}">${getStatusLabel(order.status)}</span>
                </div>
                <div class="order__items">
                    ${order.items.map(item => `
                        <div class="order__item">
                            <span>${item.name} — ${item.quantity} шт.</span>
                            <span>${(item.price * item.quantity).toLocaleString('ru-RU')} руб.</span>
                        </div>
                    `).join('')}
                </div>
                ${order.address ? `<div class="order__address"><strong>Адрес доставки:</strong> ${order.address}</div>` : ''}
                <div class="order__total">
                    <span>Итого:</span>
                    <strong>${order.total.toLocaleString('ru-RU')} руб.</strong>
                </div>
            </div>
        `).join('');
    }

    function getStatusLabel(status) {
        const labels = {
            'new': 'Новый', 'confirmed': 'Подтверждён', 'paid': 'Оплачен',
            'assembled': 'Собран', 'shipped': 'Отправлен', 'delivered': 'Доставлен',
            'cancelled': 'Отменён'
        };
        return labels[status] || status;
    }

    renderOrders();

    // ============ ИЗБРАННОЕ ============
    function renderFavorites() {
        const favorites = JSON.parse(localStorage.getItem('sibavto_favorites_' + currentUser.id) || '[]');
        const container = document.getElementById('favoritesList');

        if (favorites.length === 0) {
            container.innerHTML = `
                <div class="profile__empty">
                    <p>У вас пока нет избранных товаров</p>
                    <a href="catalog.html" class="btn btn--primary" style="margin-top: 15px;">Перейти в каталог</a>
                </div>
            `;
            updateHeaderFavoritesCount();
            return;
        }

        container.innerHTML = `
            <div class="products__grid">
                ${favorites.map(item => `
                    <div class="product__card" data-article="${item.article}">
                        <button class="favorite-btn favorite-btn--active" data-article="${item.article}" title="Удалить из избранного">★</button>
                        <div class="product__image">■</div>
                        <h3 class="product__name">${item.name}</h3>
                        <p class="product__article">Артикул: ${item.article}</p>
                        <p class="product__price">${item.price.toLocaleString('ru-RU')} руб.</p>
                        <button class="btn btn--primary btn--small add-to-cart-fav" data-id="${item.id}">В корзину</button>
                    </div>
                `).join('')}
            </div>
        `;

        // Кнопки "В корзину"
        container.querySelectorAll('.add-to-cart-fav').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = parseInt(this.dataset.id);
                const product = favorites.find(f => f.id === id);
                if (!product) return;

                const cart = JSON.parse(localStorage.getItem('sibavto_cart') || '[]');
                const existing = cart.find(item => item.article === product.article);
                if (existing) {
                    existing.quantity++;
                } else {
                    cart.push({ name: product.name, article: product.article, price: product.price, quantity: 1 });
                }
                localStorage.setItem('sibavto_cart', JSON.stringify(cart));
                showToast('Товар добавлен в корзину', 'success');
                updateHeaderCartCount();
            });
        });

        // Удаление из избранного
        container.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const article = this.dataset.article;
                const favs = JSON.parse(localStorage.getItem('sibavto_favorites_' + currentUser.id) || '[]');
                const filtered = favs.filter(f => f.article !== article);
                localStorage.setItem('sibavto_favorites_' + currentUser.id, JSON.stringify(filtered));
                showToast('Удалено из избранного', 'success');
                renderFavorites();
                updateHeaderFavoritesCount();
            });
        });

        updateHeaderFavoritesCount();
    }

    renderFavorites();

    // ============ АДРЕСА ДОСТАВКИ ============
    function getAddresses() {
        return JSON.parse(localStorage.getItem('sibavto_addresses_' + currentUser.id) || '[]');
    }

    function saveAddresses(addresses) {
        localStorage.setItem('sibavto_addresses_' + currentUser.id, JSON.stringify(addresses));
    }

    function renderAddresses() {
        const addresses = getAddresses();
        const container = document.getElementById('addressesList');

        if (!container) return;

        if (addresses.length === 0) {
            container.innerHTML = `
                <div class="profile__empty">
                    <p>У вас пока нет сохранённых адресов</p>
                    <p style="font-size: 13px; color: #aaa; margin-top: 8px;">Добавьте адрес через форму выше</p>
                </div>
            `;
            return;
        }

        container.innerHTML = addresses.map((addr, index) => `
            <div class="address__card">
                <div class="address__card-header">
                    <h3>${addr.label}</h3>
                    <button class="address__delete" data-index="${index}" title="Удалить адрес">Удалить</button>
                </div>
                <p class="address__text">${addr.fullAddress}</p>
                ${addr.comment ? `<p class="address__comment">Комментарий: ${addr.comment}</p>` : ''}
                <button class="btn btn--outline btn--small address__use" data-index="${index}" style="color: #1a2332; border-color: #1a2332; margin-top: 10px;">
                    Использовать для доставки
                </button>
            </div>
        `).join('');

        // Удаление
        container.querySelectorAll('.address__delete').forEach(btn => {
            btn.addEventListener('click', function () {
                if (!confirm('Удалить этот адрес?')) return;
                const index = parseInt(this.dataset.index);
                const addresses = getAddresses();
                addresses.splice(index, 1);
                saveAddresses(addresses);
                showToast('Адрес удалён', 'success');
                renderAddresses();
            });
        });

        // Использовать
        container.querySelectorAll('.address__use').forEach(btn => {
            btn.addEventListener('click', function () {
                const index = parseInt(this.dataset.index);
                const addresses = getAddresses();
                const address = addresses[index];

                localStorage.setItem('sibavto_selected_address', JSON.stringify(address));
                showToast('Адрес выбран: ' + address.label, 'success');
                setTimeout(() => window.location.href = 'checkout.html', 800);
            });
        });
    }

    renderAddresses();

    // Добавление адреса
    const addressForm = document.getElementById('addressForm');
    if (addressForm) {
        addressForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const label = document.getElementById('addressLabel').value.trim();
            const city = document.getElementById('addressCity').value.trim();
            const street = document.getElementById('addressStreet').value.trim();
            const apt = document.getElementById('addressApt').value.trim();
            const comment = document.getElementById('addressComment').value.trim();

            if (!label || !city || !street) {
                showToast('Заполните обязательные поля', 'error');
                return;
            }

            const fullAddress = `${city}, ${street}${apt ? ', ' + apt : ''}`;

            const addresses = getAddresses();
            addresses.push({ label, city, street, apt, comment, fullAddress });
            saveAddresses(addresses);

            this.reset();
            showToast('Адрес добавлен', 'success');
            renderAddresses();
        });
    }

    // ============ ВЫХОД ============
    document.getElementById('logoutBtn').addEventListener('click', function () {
        if (confirm('Вы уверены, что хотите выйти?')) {
            localStorage.removeItem('sibavto_current_user');
            showToast('Вы вышли из аккаунта', 'success');
            setTimeout(() => window.location.href = 'index.html', 800);
        }
    });

    // ============ НАСТРОЙКИ ============
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function () {
            const settings = {
                notifyOrders: document.getElementById('notifyOrders').checked,
                notifyPromo: document.getElementById('notifyPromo').checked,
                notifyNew: document.getElementById('notifyNew').checked
            };
            localStorage.setItem('sibavto_settings_' + currentUser.id, JSON.stringify(settings));
            showToast('Настройки сохранены', 'success');
        });
    }
});