// ============================================================
// Логика каталога и фильтров
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

    const urlParams = new URLSearchParams(window.location.search);
    const brandFilter = urlParams.get('brand');
    const highlightArticle = urlParams.get('highlight');

    const productsGrid = document.querySelector('.products__grid');
    const catalogCount = document.querySelector('.catalog__count');
    const pageTitle = document.querySelector('.page__title');

    if (!productsGrid) return;

    // ============ ИЗБРАННОЕ ============
    function getFavorites() {
        const user = JSON.parse(localStorage.getItem('sibavto_current_user') || 'null');
        if (!user) return [];
        return JSON.parse(localStorage.getItem('sibavto_favorites_' + user.id) || '[]');
    }

    function isFavorite(article) {
        return getFavorites().some(f => f.article === article);
    }

    function toggleFavorite(product) {
        const user = JSON.parse(localStorage.getItem('sibavto_current_user') || 'null');

        if (!user) {
            showToast('Войдите в аккаунт, чтобы добавлять в избранное', 'error');
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
                image: product.image || 'https://via.placeholder.com/400x300/cccccc/ffffff?text=No+Image'
            });
            showToast('Добавлено в избранное', 'success');
        } else {
            favorites.splice(existingIndex, 1);
            showToast('Удалено из избранного', 'success');
        }

        localStorage.setItem('sibavto_favorites_' + user.id, JSON.stringify(favorites));
        updateFavoritesHeaderCount();
    }

    function updateFavoritesHeaderCount() {
        const favorites = getFavorites();
        const count = favorites.length;

        document.querySelectorAll('.header__favorites').forEach(el => {
            el.textContent = 'Избранное' + (count > 0 ? ' (' + count + ')' : '');
        });

        const badge = document.getElementById('favoritesBadge');
        if (badge) {
            badge.textContent = count;
        }
    }

    // ============ СРАВНЕНИЕ ============
    function getCompare() {
        return JSON.parse(localStorage.getItem('sibavto_compare') || '[]');
    }

    function saveCompare(ids) {
        localStorage.setItem('sibavto_compare', JSON.stringify(ids));
        updateCompareBadge();
    }

    function updateCompareBadge() {
        const count = getCompare().length;
        const badge = document.getElementById('compareBadge');
        if (badge) {
            badge.textContent = count;
        }
    }

    function toggleCompare(id) {
        const compare = getCompare();
        const existingIndex = compare.indexOf(id);

        if (existingIndex === -1) {
            if (compare.length >= 4) {
                showToast('Можно сравнить не более 4 товаров', 'error');
                return;
            }
            compare.push(id);
            showToast('Добавлено в сравнение', 'success');
        } else {
            compare.splice(existingIndex, 1);
            showToast('Удалено из сравнения', 'success');
        }

        saveCompare(compare);
        updateCatalog();
    }

    function isInCompare(id) {
        return getCompare().includes(id);
    }

    // ============ ФИЛЬТРЫ ============
    function getFilters() {
        const carEl = document.querySelector('select[data-filter="car"]');
        const priceMinEl = document.querySelector('input[data-filter="price-min"]');
        const priceMaxEl = document.querySelector('input[data-filter="price-max"]');
        const sortEl = document.querySelector('.catalog__sort');

        const filters = {
            car: carEl ? carEl.value : 'all',
            category: [],
            status: [],
            priceMin: parseInt(priceMinEl ? priceMinEl.value : 0) || 0,
            priceMax: parseInt(priceMaxEl ? priceMaxEl.value : 999999) || 999999,
            sort: sortEl ? sortEl.value : 'popular',
            brand: brandFilter || ''
        };

        document.querySelectorAll('input[data-filter="category"]:checked').forEach(cb => {
            filters.category.push(cb.value);
        });

        document.querySelectorAll('input[data-filter="status"]:checked').forEach(cb => {
            filters.status.push(cb.value);
        });

        return filters;
    }

    // ============ ПРИМЕНЕНИЕ ФИЛЬТРОВ ============
    function applyFilters(products, filters) {
        return products.filter(p => {
            // Марка авто — из URL (?brand=toyota)
            if (filters.brand && filters.brand !== 'all') {
                if (p.car !== 'все' && p.car.toLowerCase() !== filters.brand.toLowerCase()) return false;
            }

            // Марка авто — из селекта
            if (filters.car && filters.car !== 'all' && p.car !== filters.car && p.car !== 'все') return false;

            // Категория
            if (filters.category.length > 0 && !filters.category.includes(p.category)) return false;

            // Наличие
            if (filters.status.length > 0 && !filters.status.includes(p.status)) return false;

            // Цена
            if (p.price < filters.priceMin || p.price > filters.priceMax) return false;

            return true;
        });
    }

    function sortProducts(products, sort) {
        const sorted = [...products];
        switch (sort) {
            case 'price-asc': return sorted.sort((a, b) => a.price - b.price);
            case 'price-desc': return sorted.sort((a, b) => b.price - a.price);
            case 'name': return sorted.sort((a, b) => a.name.localeCompare(b.name));
            default: return sorted;
        }
    }

    // ============ ОТРИСОВКА ============
    function renderProducts(products) {
        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; padding: 60px; text-align: center; color: #888; background: #fff; border-radius: 8px;">
                    <h3 style="margin-bottom: 10px;">Ничего не найдено</h3>
                    <p>Попробуйте изменить параметры фильтрации</p>
                </div>
            `;
            if (catalogCount) catalogCount.textContent = 'Найдено: 0 товаров';
            return;
        }

        productsGrid.innerHTML = products.map(p => {
            const isHighlighted = highlightArticle && p.article.toLowerCase() === highlightArticle.toLowerCase();
            const fav = isFavorite(p.article);
            const inCompare = isInCompare(p.id);
            const imageUrl = (p.images && p.images.length > 0)
                ? p.images[0]
                : 'https://via.placeholder.com/400x300/cccccc/ffffff?text=No+Image';

            return `
                <div class="product__card ${isHighlighted ? 'product__card--highlight' : ''}" 
                     data-id="${p.id}" 
                     data-article="${p.article}"
                     id="product-${p.id}">
                    <a href="product.html?id=${p.id}" class="product__link">
                        <div class="product__image-wrapper">
                            <img src="${imageUrl}" alt="${p.name}" class="product__image-img" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300/cccccc/ffffff?text=No+Image'">
                        </div>
                        <h3 class="product__name">${p.name}</h3>
                        <p class="product__article">Артикул: ${p.article}</p>
                    </a>
                    <p class="product__price">${p.price.toLocaleString('ru-RU')} руб.</p>
                    <div class="product__status-row">
                        <span class="product__status product__status--${p.status === 'in_stock' ? 'in' : 'order'}">
                            ${p.status === 'in_stock' ? 'В наличии' : 'Под заказ'}
                        </span>
                        <button class="favorite-btn-heart ${fav ? 'favorite-btn-heart--active' : ''}" 
                                data-article="${p.article}" 
                                data-id="${p.id}"
                                title="${fav ? 'Удалить из избранного' : 'Добавить в избранное'}">
                            ${fav ? '❤' : '♡'}
                        </button>
                    </div>
                    <div class="product__actions-buttons">
                        <button class="btn btn--primary btn--small add-to-cart" data-id="${p.id}">В корзину</button>
                        <button class="compare-btn ${inCompare ? 'compare-btn--active' : ''}" 
                                data-id="${p.id}" 
                                title="${inCompare ? 'Убрать из сравнения' : 'Сравнить'}">
                            ${inCompare ? '✔' : '⚖'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        if (catalogCount) {
            catalogCount.textContent = 'Найдено: ' + products.length + ' товаров';
        }

        // В корзину
        productsGrid.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                addToCartById(parseInt(this.dataset.id));
            });
        });

        // Сердце
        productsGrid.querySelectorAll('.favorite-btn-heart').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                const id = parseInt(this.dataset.id);
                const product = window.SIBAVTO_PRODUCTS.find(p => p.id === id);
                if (!product) return;

                toggleFavorite({
                    id: product.id,
                    name: product.name,
                    article: product.article,
                    price: product.price,
                    image: product.images ? product.images[0] : ''
                });

                const isFav = isFavorite(product.article);
                this.textContent = isFav ? '❤' : '♡';
                this.classList.toggle('favorite-btn-heart--active', isFav);
            });
        });

        // Сравнение
        productsGrid.querySelectorAll('.compare-btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                toggleCompare(parseInt(this.dataset.id));
            });
        });

        // Подсветка
        if (highlightArticle) {
            setTimeout(() => {
                const targetCard = productsGrid.querySelector('.product__card--highlight');
                if (targetCard) {
                    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    if (typeof showToast === 'function') {
                        showToast('Найден товар: ' + highlightArticle, 'success');
                    }
                    setTimeout(() => {
                        targetCard.classList.remove('product__card--highlight');
                    }, 5000);
                }
            }, 200);
        }
    }

    // ============ ДОБАВИТЬ В КОРЗИНУ ============
    function addToCartById(id) {
        const product = window.SIBAVTO_PRODUCTS.find(p => p.id === id);
        if (!product) return;

        const cart = JSON.parse(localStorage.getItem('sibavto_cart') || '[]');
        const existing = cart.find(item => item.article === product.article);

        if (existing) {
            existing.quantity++;
        } else {
            cart.push({
                name: product.name,
                article: product.article,
                price: product.price,
                quantity: 1
            });
        }

        localStorage.setItem('sibavto_cart', JSON.stringify(cart));

        const cartBadge = document.getElementById('cartBadge');
        if (cartBadge) {
            const total = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartBadge.textContent = total;
        }

        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }

        if (typeof showToast === 'function') {
            showToast('Товар добавлен в корзину', 'success');
        }
    }

    // ============ ЗАГОЛОВОК ============
    function updateTitle() {
        if (!pageTitle) return;

        if (brandFilter && window.SIBAVTO_BRANDS) {
            const brand = window.SIBAVTO_BRANDS.find(b => b.id === brandFilter);
            if (brand) {
                pageTitle.textContent = 'Запчасти ' + brand.name;
                document.title = brand.name + ' — SibAvto';

                const backLink = document.createElement('a');
                backLink.href = 'catalog.html';
                backLink.textContent = '← Все товары';
                backLink.style.cssText = 'display: inline-block; margin-bottom: 20px; color: #e63946; font-size: 15px;';
                pageTitle.parentNode.insertBefore(backLink, pageTitle);
            }
        }
    }

    // ============ ОБНОВИТЬ КАТАЛОГ ============
    function updateCatalog() {
        const filters = getFilters();
        let products = applyFilters(window.SIBAVTO_PRODUCTS, filters);
        products = sortProducts(products, filters.sort);
        renderProducts(products);
    }

    // ============ ОБРАБОТЧИКИ ============
    document.querySelectorAll('select[data-filter="car"]').forEach(sel => {
        sel.addEventListener('change', updateCatalog);
    });

    const sortSelect = document.querySelector('.catalog__sort');
    if (sortSelect) sortSelect.addEventListener('change', updateCatalog);

    document.querySelectorAll('input[data-filter="category"]').forEach(cb => {
        cb.addEventListener('change', updateCatalog);
    });

    document.querySelectorAll('input[data-filter="status"]').forEach(cb => {
        cb.addEventListener('change', updateCatalog);
    });

    const applyBtn = document.querySelector('.filters .btn--primary');
    if (applyBtn) {
        applyBtn.addEventListener('click', function (e) {
            e.preventDefault();
            updateCatalog();
            if (typeof showToast === 'function') {
                showToast('Фильтры применены', 'success');
            }
        });
    }

    const resetBtn = document.querySelector('.filters__reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelectorAll('.filters input[type="checkbox"]').forEach(cb => cb.checked = false);
            document.querySelectorAll('.filters select').forEach(sel => sel.selectedIndex = 0);
            document.querySelectorAll('.filters input[type="number"]').forEach(inp => inp.value = '');
            updateCatalog();
        });
    }

    // ============ СТАРТ ============
    updateTitle();
    updateFavoritesHeaderCount();
    updateCompareBadge();
    updateCatalog();
});