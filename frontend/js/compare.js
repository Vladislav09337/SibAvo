// ============================================================
// Сравнение товаров
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

    const PRODUCTS = window.SIBAVTO_PRODUCTS || [];
    const container = document.getElementById('compareContent');
    if (!container) return;

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

    // ============ АНАЛИЗ: КТО ЛУЧШЕ ============
    function analyzeProducts(products) {
        const analysis = {};

        // Минимальная цена
        const minPrice = Math.min(...products.map(p => p.price));
        // Максимальное наличие
        const maxQuantity = Math.max(...products.map(p => p.quantity));

        products.forEach(p => {
            const isCheapest = p.price === minPrice;
            const isMostInStock = p.quantity === maxQuantity && p.quantity > 0;
            const isInStock = p.status === 'in_stock';

            // Подсчёт баллов
            let score = 0;
            if (isCheapest) score += 2;
            if (isMostInStock) score += 1;
            if (isInStock) score += 1;

            analysis[p.id] = {
                isCheapest,
                isMostInStock,
                isInStock,
                score
            };
        });

        // Лучший выбор
        const maxScore = Math.max(...Object.values(analysis).map(a => a.score));
        products.forEach(p => {
            analysis[p.id].isBest = analysis[p.id].score === maxScore && maxScore > 0;
        });

        return analysis;
    }

    // ============ ОТРИСОВКА ============
    function renderCompare() {
        const compareIds = getCompare();
        const products = compareIds.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);

        if (products.length === 0) {
            container.innerHTML = `
                <div class="profile__empty" style="padding: 80px 20px; text-align: center; background: #fff; border-radius: 8px;">
                    <div style="font-size: 64px; margin-bottom: 16px;">⚖</div>
                    <h2 style="margin-bottom: 12px;">Список сравнения пуст</h2>
                    <p style="color: #888; margin-bottom: 24px;">Добавьте товары для сравнения — нажмите «Сравнить» на карточке товара.</p>
                    <a href="catalog.html" class="btn btn--primary">Перейти в каталог</a>
                </div>
            `;
            return;
        }

        const analysis = analyzeProducts(products);

        container.innerHTML = `
            <div class="compare__toolbar">
                <span>Сравнивается товаров: <strong>${products.length}</strong></span>
                <div class="compare__toolbar-actions">
                    <a href="catalog.html" class="btn btn--outline btn--small" style="color: #1a2332; border-color: #1a2332; margin-right: 8px;">+ Добавить товар</a>
                    <button class="btn btn--outline btn--small" id="clearCompare" style="color: #e63946; border-color: #e63946;">Очистить всё</button>
                </div>
            </div>

            <div class="compare__summary">
    <div class="compare__summary-title">💡 Рекомендация</div>
    <div class="compare__summary-cards">
        ${products.map(p => {
            const a = analysis[p.id];
            const isBest = a.isBest;
            
            return `
                <div class="compare__summary-card ${isBest ? 'compare__summary-card--best' : ''}">
                    ${isBest ? '<div class="compare__summary-crown">⭐</div>' : ''}
                    <div class="compare__summary-name">${p.name}</div>
                    <div class="compare__summary-tags">
                        ${a.isBest ? '<span class="compare__tag compare__tag--best">Лучший выбор</span>' : ''}
                        ${a.isCheapest ? '<span class="compare__tag compare__tag--green">Дешевле</span>' : ''}
                        ${a.isMostInStock ? '<span class="compare__tag compare__tag--blue">Больше всего</span>' : ''}
                        ${!a.isBest && !a.isCheapest && !a.isMostInStock ? '<span class="compare__tag">Без преимуществ</span>' : ''}
                    </div>
                    <div class="compare__summary-price">${p.price.toLocaleString('ru-RU')} руб.</div>
                </div>
            `;
        }).join('')}
    </div>
</div>

            <div class="compare__table-wrapper">
                <table class="compare__table">
                    <thead>
                        <tr>
                            <th class="compare__field-header">Характеристика</th>
                            ${products.map(p => {
                                const a = analysis[p.id];
                                return `
                                    <th class="compare__product-header ${a.isBest ? 'compare__product-header--best' : ''}">
                                        <button class="compare__remove" data-id="${p.id}" title="Убрать из сравнения">✕</button>
                                        ${a.isBest ? '<div class="compare__best-badge">⭐ Лучший выбор</div>' : ''}
                                        <a href="product.html?id=${p.id}" class="compare__product-link">
                                            <div class="compare__product-image">
                                                <img src="${p.image || 'https://via.placeholder.com/400x300/cccccc/ffffff?text=No+Image'}" alt="${p.name}">
                                            </div>
                                            <div class="compare__product-name">${p.name}</div>
                                        </a>
                                        <button class="btn btn--primary btn--small add-to-cart-compare" data-id="${p.id}" style="margin-top: 12px;">В корзину</button>
                                    </th>
                                `;
                            }).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="compare__field">Цена</td>
                            ${products.map(p => {
                                const a = analysis[p.id];
                                return `<td class="compare__price ${a.isCheapest ? 'compare__price--best' : ''}">
                                    ${p.price.toLocaleString('ru-RU')} руб.
                                    ${a.isCheapest ? '<span class="compare__tag compare__tag--green">Дешевле</span>' : ''}
                                </td>`;
                            }).join('')}
                        </tr>
                        <tr>
                            <td class="compare__field">Бренд</td>
                            ${products.map(p => `<td>${p.brand}</td>`).join('')}
                        </tr>
                        <tr>
                            <td class="compare__field">Артикул</td>
                            ${products.map(p => `<td>${p.article}</td>`).join('')}
                        </tr>
                        <tr>
                            <td class="compare__field">Категория</td>
                            ${products.map(p => `<td>${p.category}</td>`).join('')}
                        </tr>
                        <tr>
                            <td class="compare__field">Совместимость</td>
                            ${products.map(p => `<td>${p.car === 'все' ? 'Универсальная' : p.car}</td>`).join('')}
                        </tr>
                        <tr>
                            <td class="compare__field">Наличие</td>
                            ${products.map(p => {
                                const a = analysis[p.id];
                                return `<td class="${a.isMostInStock ? 'compare__cell--best' : ''}">
                                    ${p.status === 'in_stock' ? 'В наличии (' + p.quantity + ' шт.)' : 'Под заказ'}
                                    ${a.isMostInStock ? '<span class="compare__tag compare__tag--green">Больше всего</span>' : ''}
                                </td>`;
                            }).join('')}
                        </tr>
                        <tr>
                            <td class="compare__field">Гарантия</td>
                            ${products.map(p => `<td>12 месяцев</td>`).join('')}
                        </tr>
                        <tr>
                            <td class="compare__field">Рейтинг</td>
                            ${products.map(p => {
                                const a = analysis[p.id];
                                const stars = '⭐'.repeat(Math.min(a.score, 5));
                                return `<td class="compare__rating">${stars || '—'}</td>`;
                            }).join('')}
                        </tr>
                    </tbody>
                </table>
            </div>
        `;

        // Удаление
        container.querySelectorAll('.compare__remove').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = parseInt(this.dataset.id);
                saveCompare(getCompare().filter(x => x !== id));
                renderCompare();
            });
        });

        // Очистить всё
        const clearBtn = document.getElementById('clearCompare');
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                if (!confirm('Очистить список сравнения?')) return;
                saveCompare([]);
                renderCompare();
            });
        }

        // В корзину
        container.querySelectorAll('.add-to-cart-compare').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = parseInt(this.dataset.id);
                const product = PRODUCTS.find(p => p.id === id);
                if (!product) return;

                const cart = JSON.parse(localStorage.getItem('sibavto_cart') || '[]');
                const existing = cart.find(item => item.article === product.article);
                if (existing) {
                    existing.quantity++;
                } else {
                    cart.push({ name: product.name, article: product.article, price: product.price, quantity: 1 });
                }
                localStorage.setItem('sibavto_cart', JSON.stringify(cart));
                if (typeof updateCartCount === 'function') updateCartCount();
                if (typeof showToast === 'function') showToast('Товар добавлен в корзину', 'success');
            });
        });
    }

    updateCompareBadge();
    renderCompare();
});