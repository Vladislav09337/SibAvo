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
            <div class="profile__empty" style="padding: 80px 20px;">
                <h2>Товар не найден</h2>
                <p style="margin: 16px 0;">Возможно, он был удалён или ссылка неверна.</p>
                <a href="catalog.html" class="btn btn--primary">Перейти в каталог</a>
            </div>
        `;
        return;
    }

    // Обновляем заголовок страницы
    document.title = product.name + ' — SibAvto';

    // ============ ХЛЕБНЫЕ КРОШКИ ============
    function renderBreadcrumbs() {
        const crumbs = [
            { text: 'Главная', href: 'index.html' },
            { text: 'Каталог', href: 'catalog.html' },
            { text: product.category, href: `catalog.html?category=${encodeURIComponent(product.category)}` },
            { text: product.name, href: null }
        ];

        document.getElementById('breadcrumbs').innerHTML = crumbs.map((c, i) => {
            const isLast = i === crumbs.length - 1;
            if (isLast) {
                return `<span class="breadcrumb__current">${c.text}</span>`;
            }
            return `<a href="${c.href}" class="breadcrumb__link">${c.text}</a><span class="breadcrumb__sep">›</span>`;
        }).join('');
    }

    // ============ ОСНОВНАЯ ИНФОРМАЦИЯ ============
    function renderProduct() {
        const container = document.getElementById('productDetail');

        const isFav = isFavorite(product.article);
        const favIcon = isFav ? '★' : '☆';
        const favClass = isFav ? 'favorite-btn favorite-btn--active' : 'favorite-btn';

        const statusText = product.status === 'in_stock' ? 'В наличии' : 'Под заказ';
        const statusClass = product.status === 'in_stock' ? 'in' : 'order';
        const statusDetail = product.status === 'in_stock'
            ? `На складе: ${product.quantity} шт.`
            : 'Доставка 2-5 дней';

        container.innerHTML = `
            <div class="product__gallery">
                <div class="product__main-image">
                    <div class="product__image-placeholder">■</div>
                </div>
                <div class="product__thumbnails">
                    <div class="product__thumb product__thumb--active">■</div>
                    <div class="product__thumb">■</div>
                    <div class="product__thumb">■</div>
                    <div class="product__thumb">■</div>
                </div>
            </div>

            <div class="product__info">
                <div class="product__header">
                    <div class="product__brand">${product.brand}</div>
                    <button class="${favClass}" data-article="${product.article}" title="В избранное">${favIcon}</button>
                </div>

                <h1 class="product__title">${product.name}</h1>

                <div class="product__meta">
                    <span class="product__article-detail">Артикул: <strong>${product.article}</strong></span>
                    <span class="product__category-detail">Категория: <strong>${product.category}</strong></span>
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
                    <button class="btn btn--outline btn--large compare-btn" data-id="${product.id}" style="color: #1a2332; border-color: #1a2332;">
                        Сравнить
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
                    <h3>Описание</h3>
                    <p>${product.name} от производителя ${product.brand} — качественная автозапчасть, совместимая с автомобилями ${product.car === 'все' ? 'различных марок' : product.car}.</p>
                    <p>Все товары SibAvto сертифицированы и имеют официальную гарантию. Продукция ${product.brand} зарекомендовала себя как надёжная и долговечная.</p>
                    <p><strong>Характеристики:</strong></p>
                    <ul>
                        <li>Производитель: ${product.brand}</li>
                        <li>Артикул: ${product.article}</li>
                        <li>Категория: ${product.category}</li>
                        <li>Совместимость: ${product.car === 'все' ? 'Универсальная' : product.car}</li>
                        <li>Гарантия: 12 месяцев</li>
                    </ul>
                </div>
            </div>
        `;

        // Кнопка "В корзину"
        container.querySelector('.add-to-cart-detail').addEventListener('click', function () {
            addToCart(product);
        });

        // Кнопка "Сравнить"
        container.querySelector('.compare-btn').addEventListener('click', function () {
            showToast('Функция сравнения будет добавлена на следующем этапе', 'success');
        });

        // Кнопка "Избранное"
        container.querySelector('.favorite-btn').addEventListener('click', function () {
            toggleFavorite({
                id: product.id,
                name: product.name,
                article: product.article,
                price: product.price
            });

            // Обновляем иконку
            const isFav = isFavorite(product.article);
            this.textContent = isFav ? '★' : '☆';
            this.classList.toggle('favorite-btn--active', isFav);
        });
    }

    // ============ ПОХОЖИЕ ТОВАРЫ ============
    function renderSimilar() {
        const similar = PRODUCTS.filter(p =>
            p.category === product.category && p.id !== product.id
        ).slice(0, 4);

        const container = document.getElementById('similarProducts');

        if (similar.length === 0) {
            container.innerHTML = '<p style="color: #888;">Похожих товаров не найдено</p>';
            return;
        }

        container.innerHTML = similar.map(p => renderProductCard(p)).join('');
        attachCardHandlers(container);
    }

    // ============ НЕДАВНО СМОТРЕЛИ ============
    function renderRecent() {
        const recentIds = JSON.parse(localStorage.getItem('sibavto_recent') || '[]');

        // Добавляем текущий товар в начало
        const filtered = recentIds.filter(id => id !== product.id);
        filtered.unshift(product.id);

        // Ограничиваем 5 товарами
        const limited = filtered.slice(0, 5);
        localStorage.setItem('sibavto_recent', JSON.stringify(limited));

        // Показываем все, кроме текущего (первые 4)
        const otherIds = limited.filter(id => id !== product.id).slice(0, 4);
        const recent = otherIds.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);

        const container = document.getElementById('recentProducts');

        if (recent.length === 0) {
            container.parentElement.style.display = 'none';
            return;
        }

        container.innerHTML = recent.map(p => renderProductCard(p)).join('');
        attachCardHandlers(container);
    }

    // ============ КАРТОЧКА ТОВАРА ============
    function renderProductCard(p) {
        const fav = isFavorite(p.article);
        const favClass = fav ? 'favorite-btn favorite-btn--active' : 'favorite-btn';
        const favIcon = fav ? '★' : '☆';

        return `
            <div class="product__card" data-id="${p.id}" data-article="${p.article}">
                <button class="${favClass}" data-article="${p.article}" data-id="${p.id}" title="В избранное">${favIcon}</button>
                <a href="product.html?id=${p.id}" class="product__link">
                    <div class="product__image">■</div>
                    <h3 class="product__name">${p.name}</h3>
                    <p class="product__article">Артикул: ${p.article}</p>
                </a>
                <p class="product__price">${p.price.toLocaleString('ru-RU')} руб.</p>
                <span class="product__status product__status--${p.status === 'in_stock' ? 'in' : 'order'}">
                    ${p.status === 'in_stock' ? 'В наличии' : 'Под заказ'}
                </span>
                <button class="btn btn--primary btn--small add-to-cart" data-id="${p.id}">В корзину</button>
            </div>
        `;
    }

    // ============ ОБРАБОТЧИКИ ============
    function attachCardHandlers(container) {
        // Добавление в корзину
        container.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                const id = parseInt(this.dataset.id);
                const p = PRODUCTS.find(x => x.id === id);
                if (p) addToCart(p);
            });
        });

        // Избранное
        container.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                const id = parseInt(this.dataset.id);
                const p = PRODUCTS.find(x => x.id === id);
                if (!p) return;

                toggleFavorite({ id: p.id, name: p.name, article: p.article, price: p.price });

                const isFav = isFavorite(p.article);
                this.textContent = isFav ? '★' : '☆';
                this.classList.toggle('favorite-btn--active', isFav);
            });
        });
    }

    // ============ ДОБАВИТЬ В КОРЗИНУ ============
    function addToCart(p) {
        const cart = JSON.parse(localStorage.getItem('sibavto_cart') || '[]');
        const existing = cart.find(item => item.article === p.article);

        if (existing) {
            existing.quantity++;
        } else {
            cart.push({
                name: p.name,
                article: p.article,
                price: p.price,
                quantity: 1
            });
        }

        localStorage.setItem('sibavto_cart', JSON.stringify(cart));
        updateCartCount();
        showToast('Товар добавлен в корзину', 'success');
    }

    // ============ СТАРТ ============
    renderBreadcrumbs();
    renderProduct();
    renderSimilar();
    renderRecent();
});