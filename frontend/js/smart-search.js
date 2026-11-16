// ============================================================
// УМНЫЙ ПОИСК: артикул / название / VIN
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('smartSearchForm');
    const input = document.getElementById('smartSearchInput');
    const suggestions = document.getElementById('smartSuggestions');
    const hint = document.getElementById('smartHint');
    const vinResultBox = document.getElementById('vinResultBox');

    if (!form || !input) return;

    const PRODUCTS = window.SIBAVTO_PRODUCTS || [];
    let activeIndex = -1;
    let currentSuggestions = [];

    // ============ БАЗА VIN (WMI → Марка) ============
    const WMI_MAP = {
        'JTD': 'Toyota', 'JTE': 'Toyota', 'JTM': 'Toyota', 'JTN': 'Toyota', 'JT2': 'Toyota', 'JT3': 'Toyota', '4T1': 'Toyota', '5TD': 'Toyota',
        'WVW': 'Volkswagen', 'WV1': 'Volkswagen', 'WV2': 'Volkswagen', '3VW': 'Volkswagen', 'XW8': 'Volkswagen', '1VW': 'Volkswagen',
        'KNA': 'Kia', 'KNB': 'Kia', 'KND': 'Kia', 'KNF': 'Kia', 'U5Y': 'Kia', 'XWK': 'Kia',
        'KMH': 'Hyundai', 'KMF': 'Hyundai', 'KM8': 'Hyundai', '5NP': 'Hyundai',
        'JN1': 'Nissan', 'JN8': 'Nissan', '1N4': 'Nissan', '3N1': 'Nissan', 'SJN': 'Nissan',
        'JM1': 'Mazda', 'JM3': 'Mazda', 'JMZ': 'Mazda', '4F2': 'Mazda',
        'TMB': 'Skoda', 'TM9': 'Skoda',
        'VF1': 'Renault', 'VF2': 'Renault', 'VF6': 'Renault',
        'XTA': 'Lada', 'XTT': 'Lada', 'XTU': 'Lada',
        'WBA': 'BMW', 'WBS': 'BMW', 'WDB': 'BMW', '4US': 'BMW', '5UX': 'BMW'
    };

    // ============ ГОДЫ (10-й символ VIN) ============
    const YEAR_MAP = {
        'Y': 2000, '1': 2001, '2': 2002, '3': 2003, '4': 2004, '5': 2005, '6': 2006, '7': 2007, '8': 2008, '9': 2009,
        'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014, 'F': 2015, 'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019,
        'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023, 'R': 2024, 'S': 2025, 'T': 2026,
        'V': 1997, 'W': 1998, 'X': 1999
    };

    // ============ СТРАНЫ (1-й символ VIN) ============
    const COUNTRY_MAP = {
        'J': 'Япония', 'W': 'Германия', 'K': 'Южная Корея', '1': 'США', '4': 'США', '5': 'США',
        'V': 'Франция / Испания', 'X': 'Россия / СНГ', 'Z': 'Италия', 'S': 'Великобритания',
        'T': 'Швейцария', '3': 'Мексика', '9': 'Бразилия'
    };

    // ============ ПРОВЕРКА VIN ============
    function isVIN(str) {
        const clean = str.toUpperCase().trim();
        if (clean.length !== 17) return false;
        if (/[IOQ]/i.test(clean)) return false;
        return /^[A-HJ-NPR-Z0-9]{17}$/i.test(clean);
    }

    // ============ ДЕКОДИРОВАНИЕ VIN ============
    function decodeVIN(vin) {
        const wmi = vin.substring(0, 3).toUpperCase();
        const yearChar = vin.charAt(9).toUpperCase();
        const firstChar = vin.charAt(0).toUpperCase();

        return {
            brand: WMI_MAP[wmi] || null,
            year: YEAR_MAP[yearChar] || null,
            country: COUNTRY_MAP[firstChar] || 'Не определена'
        };
    }

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

    // ============ ПОИСК ТОВАРОВ ============
    function searchProducts(query) {
        if (!query || query.length < 2) return [];
        const lowerQuery = query.toLowerCase();

        return PRODUCTS.filter(item => {
            return item.article.toLowerCase().includes(lowerQuery)
                || item.name.toLowerCase().includes(lowerQuery)
                || (item.category && item.category.toLowerCase().includes(lowerQuery));
        }).slice(0, 10);
    }

    // ============ ПОКАЗАТЬ ПОДСКАЗКИ ============
    function showSuggestions(items, query) {
        currentSuggestions = items;
        activeIndex = -1;

        if (items.length === 0) {
            suggestions.classList.remove('smart-search__suggestions--open');
            return;
        }

        suggestions.innerHTML = items.map((item, i) => `
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

        suggestions.classList.add('smart-search__suggestions--open');

        suggestions.querySelectorAll('.suggestion__item').forEach(el => {
            el.addEventListener('click', function () {
                const id = parseInt(this.dataset.id);
                const product = PRODUCTS.find(p => p.id === id);
                if (product) {
                    input.value = product.article;
                    hideSuggestions();
                    window.location.href = 'product.html?id=' + product.id;
                }
            });
        });
    }

    function hideSuggestions() {
        suggestions.classList.remove('smart-search__suggestions--open');
        activeIndex = -1;
    }

    // ============ ПОКАЗАТЬ РЕЗУЛЬТАТ VIN ============
    function showVINResult(vin) {
        const data = decodeVIN(vin);

        if (!data.brand) {
            vinResultBox.style.display = 'block';
            vinResultBox.className = 'vin-result-box vin-result-box--warning';
            vinResultBox.innerHTML = `
                <div class="vin-result-box__header">
                    <span class="vin-result-box__icon">⚠️</span>
                    <div>
                        <strong>VIN не распознан</strong>
                        <p style="font-size: 14px; color: #856404; margin: 4px 0 0;">Возможно, это редкая марка или ошибка в VIN.</p>
                    </div>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px;">
                    <a href="tel:+73831234567" class="btn btn--primary">📞 Позвонить эксперту</a>
                    <a href="contacts.html" class="btn btn--outline" style="color:#1a2332; border-color:#1a2332;">Написать</a>
                </div>
            `;
            return;
        }

        // ФИЛЬТРАЦИЯ ТОВАРОВ ПО МАРКЕ АВТО (p.car)
        const brandProducts = PRODUCTS.filter(p => 
            p.car && (p.car.toLowerCase() === data.brand.toLowerCase() || p.car === 'все')
        ).slice(0, 4);

        vinResultBox.style.display = 'block';
        vinResultBox.className = 'vin-result-box vin-result-box--success';
        vinResultBox.innerHTML = `
            <div class="vin-result-box__header">
                <span class="vin-result-box__icon">✅</span>
                <div>
                    <strong>VIN распознан!</strong>
                    <p class="vin-result-box__vin">${vin}</p>
                </div>
            </div>
            <div class="vin-result-box__details">
                <div class="vin-result-box__detail">
                    <span class="vin-result-box__label">Марка</span>
                    <span class="vin-result-box__value">${data.brand}</span>
                </div>
                <div class="vin-result-box__detail">
                    <span class="vin-result-box__label">Год</span>
                    <span class="vin-result-box__value">${data.year || '—'}</span>
                </div>
                <div class="vin-result-box__detail">
                    <span class="vin-result-box__label">Страна</span>
                    <span class="vin-result-box__value">${data.country}</span>
                </div>
            </div>
            <div style="margin-top: 16px;">
                <a href="catalog.html?brand=${data.brand.toLowerCase()}" class="btn btn--primary">
                    Смотреть все запчасти для ${data.brand} →
                </a>
            </div>
            ${brandProducts.length > 0 ? `
                <h3 style="margin: 24px 0 16px; font-size: 18px; color: #1a2332;">🎯 Подходящие запчасти</h3>
                <div class="products__grid">
                    ${brandProducts.map(p => {
                        const img = (p.images && p.images.length > 0) ? p.images[0] : 'https://via.placeholder.com/400x300/cccccc/ffffff?text=No+Image';
                        return `
                            <div class="product__card">
                                <a href="product.html?id=${p.id}" class="product__link">
                                    <div class="product__image-wrapper">
                                        <img src="${img}" alt="${p.name}" class="product__image-img" loading="lazy">
                                    </div>
                                    <h3 class="product__name">${p.name}</h3>
                                    <p class="product__article">Артикул: ${p.article}</p>
                                </a>
                                <p class="product__price">${p.price.toLocaleString('ru-RU')} руб.</p>
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : ''}
        `;

        vinResultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // ============ ВВОД ============
    input.addEventListener('input', function () {
        const query = this.value.trim();
        vinResultBox.style.display = 'none';

        if (query.length < 2) {
            hideSuggestions();
            hint.style.display = 'block';
            return;
        }

        hint.style.display = 'none';

        if (query.length >= 15) {
            const cleanVin = query.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/gi, '');
            if (isVIN(cleanVin)) {
                suggestions.innerHTML = `
                    <div class="suggestion__item suggestion__item--vin" data-vin="${cleanVin}">
                        <div class="suggestion__article">🚗 VIN-код: ${cleanVin}</div>
                        <div class="suggestion__name">Нажмите, чтобы подобрать запчасти по VIN</div>
                    </div>
                `;
                suggestions.classList.add('smart-search__suggestions--open');

                suggestions.querySelector('.suggestion__item--vin').addEventListener('click', function () {
                    const vin = this.dataset.vin;
                    input.value = vin;
                    hideSuggestions();
                    showVINResult(vin);
                });
                return;
            }
        }

        const found = searchProducts(query);

        if (found.length === 0) {
            suggestions.innerHTML = `
                <div class="suggestion__item" style="cursor: default; color: #888;">
                    Ничего не найдено по запросу "${query}"
                </div>
            `;
            suggestions.classList.add('smart-search__suggestions--open');
            return;
        }

        showSuggestions(found, query);
    });

    // ============ КЛАВИАТУРА ============
    input.addEventListener('keydown', function (e) {
        const items = suggestions.querySelectorAll('.suggestion__item');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = Math.min(activeIndex + 1, items.length - 1);
            items.forEach((el, i) => el.classList.toggle('suggestion__item--active', i === activeIndex));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = Math.max(activeIndex - 1, -1);
            items.forEach((el, i) => el.classList.toggle('suggestion__item--active', i === activeIndex));
        } else if (e.key === 'Enter') {
            if (activeIndex >= 0 && currentSuggestions[activeIndex]) {
                e.preventDefault();
                window.location.href = 'product.html?id=' + currentSuggestions[activeIndex].id;
            }
        } else if (e.key === 'Escape') {
            hideSuggestions();
        }
    });

    // ============ КЛИК ВНЕ ============
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.smart-search__wrapper')) {
            hideSuggestions();
        }
    });

    // ============ ОТПРАВКА ФОРМЫ ============
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const query = input.value.trim();
        if (query.length < 2) {
            if (typeof showToast === 'function') showToast('Введите минимум 2 символа', 'error');
            return;
        }

        if (isVIN(query.toUpperCase())) {
            hideSuggestions();
            showVINResult(query.toUpperCase());
            return;
        }

        const found = searchProducts(query);
        if (found.length > 0) {
            window.location.href = 'catalog.html?highlight=' + encodeURIComponent(query);
        } else {
            if (typeof showToast === 'function') showToast('Ничего не найдено', 'error');
        }
    });
});