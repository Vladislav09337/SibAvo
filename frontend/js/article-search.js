// ============================================================
// Живой поиск по артикулу запчасти
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

    const input = document.getElementById('articleInput');
    const suggestionsBox = document.getElementById('articleSuggestions');
    const resultBox = document.getElementById('articleResult');
    const form = document.getElementById('articleSearchForm');

    if (!input) return;

    // Товары из data/products.js
    const PRODUCTS = window.SIBAVTO_PRODUCTS || [];

    let activeIndex = -1;
    let currentSuggestions = [];

    // ============ ПОДСВЕТКА СОВПАДЕНИЙ ============
    function highlightMatch(text, query) {
        if (!query) return text;

        const lowerText = text.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const index = lowerText.indexOf(lowerQuery);

        if (index === -1) return text;

        const before = text.slice(0, index);
        const match = text.slice(index, index + query.length);
        const after = text.slice(index + query.length);

        return `${before}<mark class="match">${match}</mark>${after}`;
    }

    // ============ ПОИСК ПО АРТИКУЛУ / НАЗВАНИЮ ============
    function searchProducts(query) {
        if (!query || query.length < 2) return [];

        const lowerQuery = query.toLowerCase();

        return PRODUCTS.filter(item => {
            return item.article.toLowerCase().includes(lowerQuery)
                || item.name.toLowerCase().includes(lowerQuery);
        }).slice(0, 10);
    }

    // ============ ПОКАЗАТЬ ПОДСКАЗКИ ============
    function showSuggestions(suggestions) {
        currentSuggestions = suggestions;
        activeIndex = -1;

        if (suggestions.length === 0) {
            suggestionsBox.classList.remove('search__suggestions--open');
            return;
        }

        const query = input.value.trim();

        suggestionsBox.innerHTML = suggestions.map((item, i) => `
            <div class="suggestion__item" data-index="${i}" data-id="${item.id}">
                <div class="suggestion__article">${highlightMatch(item.article, query)}</div>
                <div class="suggestion__name">${highlightMatch(item.name, query)}</div>
                <div class="suggestion__meta">
                    <span>${item.category}</span>
                    <span class="suggestion__price">${item.price.toLocaleString('ru-RU')} руб.</span>
                    <span class="suggestion__status suggestion__status--${item.status === 'in_stock' ? 'in' : 'order'}">
                        ${item.status === 'in_stock' ? 'В наличии' : 'Под заказ'}
                    </span>
                </div>
            </div>
        `).join('');

        suggestionsBox.classList.add('search__suggestions--open');

        suggestionsBox.querySelectorAll('.suggestion__item').forEach(el => {
            el.addEventListener('click', function () {
                const id = parseInt(this.dataset.id);
                const product = PRODUCTS.find(p => p.id === id);
                if (product) {
                    input.value = product.article;
                    hideSuggestions();
                    showProductResult(product);
                }
            });
        });
    }

    // ============ СКРЫТЬ ПОДСКАЗКИ ============
    function hideSuggestions() {
        suggestionsBox.classList.remove('search__suggestions--open');
        activeIndex = -1;
    }

    // ============ ПОКАЗАТЬ НАЙДЕННЫЙ ТОВАР ============
    function showProductResult(product) {
        resultBox.className = 'search__result search__result--show';
        resultBox.innerHTML = `
            <div class="search__result-header">
                <div>
                    <div class="search__result-article">Артикул: ${product.article}</div>
                    <div class="search__result-name">${product.name}</div>
                    <div class="search__result-brand">${product.category}${product.car && product.car !== 'все' ? ' · ' + product.car : ''}</div>
                </div>
                <div class="search__result-price">${product.price.toLocaleString('ru-RU')} руб.</div>
            </div>
            <div class="search__result-info">
                <div class="search__result-info-item">
                    <h4>Наличие</h4>
                    <p>${product.status === 'in_stock' ? 'В наличии (' + product.quantity + ' шт.)' : 'Под заказ'}</p>
                </div>
                <div class="search__result-info-item">
                    <h4>Категория</h4>
                    <p>${product.category}</p>
                </div>
                <div class="search__result-info-item">
                    <h4>Совместимость</h4>
                    <p>${product.car === 'все' ? 'Универсальная' : product.car}</p>
                </div>
            </div>
            <div class="search__result-actions">
                <button class="btn btn--primary add-to-cart-from-search" data-id="${product.id}">
                    Добавить в корзину
                </button>
<a href="catalog.html?highlight=${encodeURIComponent(product.article)}" class="btn btn--outline" style="color: #1a2332; border-color: #1a2332;">
    Показать в каталоге
</a>
            </div>
        `;

        // Кнопка "В корзину"
        resultBox.querySelector('.add-to-cart-from-search').addEventListener('click', function () {
            addToCart(product);
        });

        if (typeof showToast === 'function') {
            showToast('Товар найден: ' + product.name, 'success');
        }
    }

    // ============ ДОБАВИТЬ В КОРЗИНУ ============
    function addToCart(product) {
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

        // Обновить счётчик в шапке
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }

        if (typeof showToast === 'function') {
            showToast('Товар добавлен в корзину', 'success');
        }
    }

    // ============ НЕ НАЙДЕНО ============
    function showNotFound(query) {
        resultBox.className = 'search__notfound search__notfound--show';
        resultBox.innerHTML = `
            По запросу <strong>${query}</strong> ничего не найдено.<br>
            Проверьте артикул или позвоните нам: <strong>+7 (383) 123-45-67</strong>
        `;
    }

    // ============ ВВОД ============
    input.addEventListener('input', function () {
        const query = this.value.trim();

        resultBox.className = 'search__result';

        if (query.length < 2) {
            hideSuggestions();
            return;
        }

        const suggestions = searchProducts(query);

        if (suggestions.length === 0) {
            suggestionsBox.innerHTML = `
                <div class="suggestion__item" style="cursor: default; color: #888;">
                    Ничего не найдено по запросу "${query}"
                </div>
            `;
            suggestionsBox.classList.add('search__suggestions--open');
            return;
        }

        showSuggestions(suggestions);
    });

    // ============ КЛАВИАТУРА ============
    input.addEventListener('keydown', function (e) {
        const items = suggestionsBox.querySelectorAll('.suggestion__item');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = Math.min(activeIndex + 1, items.length - 1);
            updateActive(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = Math.max(activeIndex - 1, -1);
            updateActive(items);
        } else if (e.key === 'Enter') {
            if (activeIndex >= 0 && currentSuggestions[activeIndex]) {
                e.preventDefault();
                const product = currentSuggestions[activeIndex];
                input.value = product.article;
                hideSuggestions();
                showProductResult(product);
            }
        } else if (e.key === 'Escape') {
            hideSuggestions();
        }
    });

    function updateActive(items) {
        items.forEach((el, i) => {
            el.classList.toggle('suggestion__item--active', i === activeIndex);
        });

        if (activeIndex >= 0 && items[activeIndex]) {
            items[activeIndex].scrollIntoView({ block: 'nearest' });
        }
    }

    // ============ КЛИК ВНЕ ============
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.search__wrapper')) {
            hideSuggestions();
        }
    });

    // ============ ОТПРАВКА ФОРМЫ ============
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const query = input.value.trim();

        if (query.length < 2) {
            if (typeof showToast === 'function') {
                showToast('Введите артикул (минимум 2 символа)', 'error');
            }
            return;
        }

        hideSuggestions();

        const product = PRODUCTS.find(p =>
            p.article.toLowerCase() === query.toLowerCase()
        );

        if (product) {
            showProductResult(product);
        } else {
            const suggestions = searchProducts(query);
            if (suggestions.length > 0) {
                showProductResult(suggestions[0]);
            } else {
                showNotFound(query);
            }
        }
    });
});