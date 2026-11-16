// ============================================================
// Страница товара
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));

    const PRODUCTS = window.SIBAVTO_PRODUCTS || [];
    const product = PRODUCTS.find(p => p.id === productId);

    if (!product) {
        document.getElementById('productDetail').innerHTML = `
            <div class="profile__empty" style="padding: 80px 20px; text-align: center;">
                <h2>Товар не найден</h2>
                <p style="margin: 16px 0;">ID: ${productId}</p>
                <a href="catalog.html" class="btn btn--primary">Перейти в каталог</a>
            </div>
        `;
        return;
    }

    document.title = product.name + ' — SibAvto';

    // ============ ХЛЕБНЫЕ КРОШКИ ============
    function renderBreadcrumbs() {
        const crumbs = [
            { text: 'Главная', href: 'index.html' },
            { text: 'Каталог', href: 'catalog.html' },
            { text: product.category, href: 'catalog.html' },
            { text: product.name, href: null }
        ];

        document.getElementById('breadcrumbs').innerHTML = crumbs.map((c, i) => {
            const isLast = i === crumbs.length - 1;
            if (isLast) {
                return '<span class="breadcrumb__current">' + c.text + '</span>';
            }
            return '<a href="' + c.href + '" class="breadcrumb__link">' + c.text + '</a><span class="breadcrumb__sep">›</span>';
        }).join('');
    }

    // ============ ПОЛУЧЕНИЕ КАРТИНОК ============
    const imageUrls = (product.images && product.images.length > 0)
        ? product.images
        : ['https://via.placeholder.com/400x300/cccccc/ffffff?text=No+Image'];

    // ============ ОСНОВНАЯ ИНФОРМАЦИЯ ============
    function renderProduct() {
        const container = document.getElementById('productDetail');

        const isFav = typeof isFavorite === 'function' ? isFavorite(product.article) : false;
        const favIcon = isFav ? '❤' : '♡';
        const favClass = isFav ? 'favorite-btn-heart favorite-btn-heart--active' : 'favorite-btn-heart';

        const inCompare = JSON.parse(localStorage.getItem('sibavto_compare') || '[]').includes(product.id);

        const statusText = product.status === 'in_stock' ? 'В наличии' : 'Под заказ';
        const statusClass = product.status === 'in_stock' ? 'in' : 'order';
        const statusDetail = product.status === 'in_stock'
            ? 'На складе: ' + product.quantity + ' шт.'
            : 'Доставка 2-5 дней';

        const html = `
            <div class="product__gallery">
                <div class="product__main-image">
                    <img src="${imageUrls[0]}" alt="${product.name}" class="product__main-image-img" id="mainProductImage" onerror="this.src='https://via.placeholder.com/400x300/cccccc/ffffff?text=No+Image'">
                </div>
                <div class="product__thumbnails" id="productThumbnails">
                    ${imageUrls.map((url, i) => `
                        <div class="product__thumb ${i === 0 ? 'product__thumb--active' : ''}" data-index="${i}">
                            <img src="${url}" alt="${product.name} ${i + 1}" onerror="this.src='https://via.placeholder.com/100x100/cccccc/ffffff?text=${i + 1}'">
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="product__info">
                <div class="product__header">
                    <div class="product__brand">${product.brand}</div>
                    <button class="${favClass}" data-article="${product.article}" data-id="${product.id}" title="В избранное">${favIcon}</button>
                </div>

                <h1 class="product__title">${product.name}</h1>

                <div class="product__meta">
                    <span>Артикул: <strong>${product.article}</strong></span>
                    <span>Категория: <strong>${product.category}</strong></span>
                </div>

                <div class="product__price-block">
                    <div class="product__price-detail">${product.price.toLocaleString('ru-RU')} руб.</div>
                    <div class="product__price-note">Цена за 1 шт.</div>
                </div>

                <div class="product__status-detail product__status-detail--${statusClass}">
                    <strong>${statusText}</strong>
                    <span>${statusDetail}</span>
                </div>

                <div class="product__actions">
                    <button class="btn btn--primary btn--large add-to-cart-detail" data-id="${product.id}">
                        Добавить в корзину
                    </button>
                    <button class="btn btn--outline btn--large compare-btn-detail ${inCompare ? 'compare-btn-detail--active' : ''}" data-id="${product.id}">
                        ${inCompare ? '✔ В сравнении' : '⚖ Сравнить'}
                    </button>
                </div>

                <div class="product__features">
                    <div class="product__feature">
                        <div class="product__feature-title">Совместимость</div>
                        <div class="product__feature-value">${product.car === 'все' ? 'Универсальная' : product.car}</div>
                    </div>
                    <div class="product__feature">
                        <div class="product__feature-title">Бренд</div>
                        <div class="product__feature-value">${product.brand}</div>
                    </div>
                    <div class="product__feature">
                        <div class="product__feature-title">Категория</div>
                        <div class="product__feature-value">${product.category}</div>
                    </div>
                    <div class="product__feature">
                        <div class="product__feature-title">Гарантия</div>
                        <div class="product__feature-value">12 месяцев</div>
                    </div>
                </div>

                <div class="product__description">
                    <h3>Описание товара</h3>
                    <p class="product__description-lead">
                        <strong>${product.name}</strong> от производителя <strong>${product.brand}</strong> — это качественная автозапчасть, которая обеспечит надёжную работу вашего автомобиля.
                    </p>
                    <p>
                        Данный товар прошёл строгий контроль качества и полностью соответствует стандартам производителя. 
                        Он идеально подходит для замены изношенных деталей и восстановления работоспособности систем автомобиля.
                    </p>

                    <h4>Преимущества</h4>
                    <ul class="product__description-list">
                        <li>✅ <strong>Оригинальное качество</strong> — произведено по стандартам ${product.brand}</li>
                        <li>✅ <strong>Долговечность</strong> — срок службы до 5 лет при правильной эксплуатации</li>
                        <li>✅ <strong>Совместимость</strong> — подходит для ${product.car === 'все' ? 'большинства автомобилей' : product.car}</li>
                        <li>✅ <strong>Гарантия</strong> — 12 месяцев от производителя</li>
                        <li>✅ <strong>Сертификация</strong> — все документы и сертификаты в наличии</li>
                    </ul>

                    <h4>Технические характеристики</h4>
                    <div class="product__specs">
                        <div class="product__spec-row"><span class="product__spec-label">Производитель</span><span class="product__spec-value">${product.brand}</span></div>
                        <div class="product__spec-row"><span class="product__spec-label">Артикул</span><span class="product__spec-value">${product.article}</span></div>
                        <div class="product__spec-row"><span class="product__spec-label">Категория</span><span class="product__spec-value">${product.category}</span></div>
                        <div class="product__spec-row"><span class="product__spec-label">Совместимость</span><span class="product__spec-value">${product.car === 'все' ? 'Универсальная' : product.car}</span></div>
                        <div class="product__spec-row"><span class="product__spec-label">Гарантия</span><span class="product__spec-value">12 месяцев</span></div>
                        <div class="product__spec-row"><span class="product__spec-label">Наличие</span><span class="product__spec-value">${product.status === 'in_stock' ? 'На складе (' + product.quantity + ' шт.)' : 'Под заказ'}</span></div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Кнопка "В корзину"
        const addBtn = container.querySelector('.add-to-cart-detail');
        if (addBtn) {
            addBtn.addEventListener('click', function () {
                const cart = JSON.parse(localStorage.getItem('sibavto_cart') || '[]');
                const existing = cart.find(item => item.article === product.article);
                if (existing) {
                    existing.quantity++;
                } else {
                    cart.push({ name: product.name, article: product.article, price: product.price, quantity: 1 });
                }
                localStorage.setItem('sibavto_cart', JSON.stringify(cart));
                const badge = document.getElementById('cartBadge');
                if (badge) badge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
                if (typeof updateCartCount === 'function') updateCartCount();
                if (typeof showToast === 'function') showToast('Товар добавлен в корзину', 'success');
            });
        }

        // Сердце
        const favBtn = container.querySelector('.favorite-btn-heart');
        if (favBtn) {
            favBtn.addEventListener('click', function () {
                const user = JSON.parse(localStorage.getItem('sibavto_current_user') || 'null');
                if (!user) {
                    if (typeof showToast === 'function') showToast('Войдите в аккаунт', 'error');
                    setTimeout(() => window.location.href = 'login.html', 1000);
                    return;
                }

                const favorites = JSON.parse(localStorage.getItem('sibavto_favorites_' + user.id) || '[]');
                const existingIndex = favorites.findIndex(f => f.article === product.article);

                if (existingIndex === -1) {
                    favorites.push({ id: product.id, name: product.name, article: product.article, price: product.price, image: imageUrls[0] });
                    if (typeof showToast === 'function') showToast('Добавлено в избранное', 'success');
                } else {
                    favorites.splice(existingIndex, 1);
                    if (typeof showToast === 'function') showToast('Удалено из избранного', 'success');
                }

                localStorage.setItem('sibavto_favorites_' + user.id, JSON.stringify(favorites));

                const isFavNow = existingIndex === -1;
                this.textContent = isFavNow ? '❤' : '♡';
                this.classList.toggle('favorite-btn-heart--active', isFavNow);

                const badge = document.getElementById('favoritesBadge');
                if (badge) badge.textContent = favorites.length;
            });
        }

        // Сравнение
        const compareBtn = container.querySelector('.compare-btn-detail');
        if (compareBtn) {
            compareBtn.addEventListener('click', function () {
                const compare = JSON.parse(localStorage.getItem('sibavto_compare') || '[]');
                const existingIndex = compare.indexOf(product.id);

                if (existingIndex === -1) {
                    if (compare.length >= 4) {
                        if (typeof showToast === 'function') showToast('Можно сравнить не более 4 товаров', 'error');
                        return;
                    }
                    compare.push(product.id);
                    if (typeof showToast === 'function') showToast('Добавлено в сравнение', 'success');
                    this.innerHTML = '✔ В сравнении';
                    this.classList.add('compare-btn-detail--active');
                } else {
                    compare.splice(existingIndex, 1);
                    if (typeof showToast === 'function') showToast('Удалено из сравнения', 'success');
                    this.innerHTML = '⚖ Сравнить';
                    this.classList.remove('compare-btn-detail--active');
                }

                localStorage.setItem('sibavto_compare', JSON.stringify(compare));
                const badge = document.getElementById('compareBadge');
                if (badge) badge.textContent = compare.length;
            });
        }

        // Галерея
        const mainImage = document.getElementById('mainProductImage');
        const thumbnails = document.querySelectorAll('.product__thumb');

        if (mainImage && thumbnails.length > 0) {
            thumbnails.forEach(thumb => {
                thumb.addEventListener('click', function () {
                    const index = parseInt(this.dataset.index);
                    mainImage.style.opacity = '0';
                    setTimeout(() => {
                        mainImage.src = imageUrls[index];
                        mainImage.style.opacity = '1';
                    }, 150);
                    thumbnails.forEach(t => t.classList.remove('product__thumb--active'));
                    this.classList.add('product__thumb--active');
                });
            });
        }
    }

    // ============ КАРТОЧКА ТОВАРА ============
    function renderCard(p) {
        const img = (p.images && p.images.length > 0) ? p.images[0] : 'https://via.placeholder.com/400x300/cccccc/ffffff?text=No+Image';
        return `
            <div class="product__card" data-id="${p.id}">
                <a href="product.html?id=${p.id}" class="product__link">
                    <div class="product__image-wrapper">
                        <img src="${img}" alt="${p.name}" class="product__image-img" loading="lazy">
                    </div>
                    <h3 class="product__name">${p.name}</h3>
                    <p class="product__article">Артикул: ${p.article}</p>
                </a>
                <p class="product__price">${p.price.toLocaleString('ru-RU')} руб.</p>
                <span class="product__status product__status--${p.status === 'in_stock' ? 'in' : 'order'}">
                    ${p.status === 'in_stock' ? 'В наличии' : 'Под заказ'}
                </span>
            </div>
        `;
    }

    // ============ АНАЛОГИ ============
    function renderAnalogues() {
        const section = document.getElementById('analoguesSection');
        const container = document.getElementById('analoguesProducts');
        if (!container || !section) return;

        const analogues = PRODUCTS.filter(p =>
            p.category === product.category &&
            p.id !== product.id &&
            p.brand !== product.brand
        ).slice(0, 4);

        if (analogues.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        container.innerHTML = analogues.map(p => renderCard(p)).join('');
    }

    // ============ ПОХОЖИЕ ============
    function renderSimilar() {
        const section = document.getElementById('similarSection');
        const container = document.getElementById('similarProducts');
        if (!container || !section) return;

        let similar = PRODUCTS.filter(p =>
            p.category === product.category && p.id !== product.id && p.brand === product.brand
        );

        if (similar.length === 0) {
            similar = PRODUCTS.filter(p => p.id !== product.id && p.brand === product.brand);
        }
        similar = similar.slice(0, 4);

        if (similar.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        container.innerHTML = similar.map(p => renderCard(p)).join('');
    }

    // ============ НЕДАВНО СМОТРЕЛИ ============
    function renderRecent() {
        const section = document.getElementById('recentSection');
        const container = document.getElementById('recentProducts');
        if (!container || !section) return;

        const recentIds = JSON.parse(localStorage.getItem('sibavto_recent') || '[]');
        const filtered = recentIds.filter(id => id !== product.id);
        filtered.unshift(product.id);
        const limited = filtered.slice(0, 5);
        localStorage.setItem('sibavto_recent', JSON.stringify(limited));

        const otherIds = limited.filter(id => id !== product.id).slice(0, 4);
        const recent = otherIds.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);

        if (recent.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        container.innerHTML = recent.map(p => renderCard(p)).join('');
    }

    // ============ СТАРТ ============
    renderBreadcrumbs();
    renderProduct();
    renderAnalogues();
    renderSimilar();
    renderRecent();
});