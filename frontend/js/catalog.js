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

    // ============ ИЗБРАННОЕ (вспомогательные функции) ============
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
            favorites.push(product);
            showToast('Добавлено в избранное', 'success');
        } else {
            favorites.splice(existingIndex, 1);
            showToast('Удалено из избранного', 'success');
        }

        localStorage.setItem('sibavto_favorites_' + user.id, JSON.stringify(favorites));

        // Обновляем кнопку на карточке
        const card = document.querySelector(`.product__card[data-article="${product.article}"]`);
        if (card) {
            const btn = card.querySelector('.favorite-btn');
            if (btn) {
                const fav = isFavorite(product.article);
                btn.textContent = fav ? '★' : '☆';
                btn.classList.toggle('favorite-btn--active', fav);
            }
        }

        // Обновляем счётчик в шапке
        updateFavoritesHeaderCount();
    }

    function updateFavoritesHeaderCount() {
        const favorites = getFavorites();
        const count = favorites.length;
        document.querySelectorAll('.header__favorites').forEach(el => {
            el.textContent = 'Избранное' + (count > 0 ? ' (' + count + ')' : '');
        });
    }

    // ============ ПОЛУЧИТЬ ФИЛЬТРЫ ============
    function getFilters() {
        const filters = {
            car: document.querySelector('select[data-filter="car"]')?.value || 'all',
            category: [],
            status: [],
            priceMin: parseInt(document.querySelector('input[data-filter="price-min"]')?.value || 0),
            priceMax: parseInt(document.querySelector('input[data-filter="price-max"]')?.value || 999999),
            sort: document.querySelector('.catalog__sort')?.value || 'popular',
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

    // ============ ПРИМЕНИТЬ ФИЛЬТРЫ ============
    function applyFilters(products, filters) {
        return products.filter(p => {
            if (filters.brand && p.brand !== filters.brand) return false;

            if (filters.car && filters.car !== 'all' && p.car !== filters.car && p.car !== 'все') return false;

            if (filters.category.length > 0 && !filters.category.includes(p.category)) return false;

            if (filters.status.length > 0 && !filters.status.includes(p.status)) return false;

            if (p.price < filters.priceMin || p.price > filters.priceMax) return false;

            return true;
        });
    }

    // ============ СОРТИРОВКА ============
    function sortProducts(products, sort) {
        const sorted = [...products];
        switch (sort) {
            case 'price-asc': return sorted.sort((a, b) => a.price - b.price);
            case 'price-desc': return sorted.sort((a, b) => b.price - a.price);
            case 'name': return sorted.sort((a, b) => a.name.localeCompare(b.name));
            default: return sorted;
        }
    }

    // ============ ОТРИСОВКА ТОВАРОВ ============
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
            const favClass = fav ? 'favorite-btn favorite-btn--active' : 'favorite-btn';
            const favIcon = fav ? '★' : '☆';

            return `
                <div class="product__card ${isHighlighted ? 'product__card--highlight' : ''}" 
                     data-id="${p.id}" 
                     data-article="${p.article}"
                     id="product-${p.id}">
                    <button class="${favClass}" 
                            data-article="${p.article}" 
                            data-id="${p.id}"
                            title="${fav ? 'Удалить из избранного' : 'Добавить в избранное'}">
                        ${favIcon}
                    </button>
                    <div class="product__image">■</div>
                    <h3 class="product__name">${p.name}</h3>
                    <p class="product__article">Артикул: ${p.article}</p>
                    <p class="product__price">${p.price.toLocaleString('ru-RU')} руб.</p>
                    <span class="product__status product__status--${p.status === 'in_stock' ? 'in' : 'order'}">
                        ${p.status === 'in_stock' ? 'В наличии' : 'Под заказ'}
                    </span>
                    <button class="btn btn--primary btn--small add-to-cart" data-id="${p.id}">В корзину</button>
                </div>
            `;
        }).join('');

        if (catalogCount) {
            catalogCount.textContent = 'Найдено: ' + products.length + ' товаров';
        }

        // ============ ОБРАБОТЧИКИ: "В корзину" ============
        productsGrid.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = parseInt(this.dataset.id);
                addToCartById(id);
            });
        });

        // ============ ОБРАБОТЧИКИ: "Избранное" ============
        productsGrid.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                const article = this.dataset.article;
                const id = parseInt(this.dataset.id);

                const product = window.SIBAVTO_PRODUCTS.find(p => p.id === id);
                if (!product) return;

                toggleFavorite({
                    id: product.id,
                    name: product.name,
                    article: product.article,
                    price: product.price
                });
            });
        });

        // ============ ПРОКРУТКА И ПОДСВЕТКА ============
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
                } else {
                    const foundProduct = window.SIBAVTO_PRODUCTS.find(
                        p => p.article.toLowerCase() === highlightArticle.toLowerCase()
                    );

                    if (foundProduct) {
                        document.querySelectorAll('.filters input[type="checkbox"]').forEach(cb => cb.checked = false);
                        document.querySelectorAll('.filters select').forEach(sel => sel.selectedIndex = 0);
                        document.querySelectorAll('.filters input[type="number"]').forEach(inp => inp.value = '');

                        const allProducts = sortProducts(window.SIBAVTO_PRODUCTS, 'popular');
                        renderProducts(allProducts);

                        setTimeout(() => {
                            const card = productsGrid.querySelector('.product__card--highlight');
                            if (card) {
                                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                if (typeof showToast === 'function') {
                                    showToast('Найден товар: ' + highlightArticle, 'success');
                                }
                            }
                        }, 200);
                    } else {
                        if (typeof showToast === 'function') {
                            showToast('Товар с артикулом ' + highlightArticle + ' не найден', 'error');
                        }
                    }
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

        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }

        if (typeof showToast === 'function') {
            showToast('Товар добавлен в корзину', 'success');
        }
    }

    // ============ ЗАГОЛОВОК ПРИ ФИЛЬТРЕ ПО БРЕНДУ ============
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
    updateCatalog();
});