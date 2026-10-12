// ============================================================
// Интеграции с Авито и Дром
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

    const PRODUCTS = window.SIBAVTO_PRODUCTS || [];

    // ============ УТИЛИТЫ ============
    function formatTime(date) {
        return new Date(date).toLocaleString('ru-RU', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    function addLog(message, type = 'info') {
        const logWindow = document.getElementById('logWindow');
        const time = new Date().toLocaleTimeString('ru-RU');
        const line = document.createElement('p');
        line.className = 'log__line log__line--' + type;
        line.textContent = `[${time}] ${message}`;
        logWindow.appendChild(line);
        logWindow.scrollTop = logWindow.scrollHeight;
    }

    // ============ СТАТИСТИКА ============
    document.getElementById('totalProducts').textContent = PRODUCTS.length;

    // ============ ИСТОРИЯ СИНХРОНИЗАЦИЙ ============
    function getSyncHistory() {
        return JSON.parse(localStorage.getItem('sibavto_sync_history') || '[]');
    }

    function addSyncHistory(platform, count, success) {
        const history = getSyncHistory();
        history.unshift({
            platform,
            count,
            success,
            date: new Date().toISOString()
        });
        // Храним последние 20 записей
        if (history.length > 20) history.length = 20;
        localStorage.setItem('sibavto_sync_history', JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        const history = getSyncHistory();
        const container = document.getElementById('syncHistory');

        if (history.length === 0) {
            container.innerHTML = `
                <div class="profile__empty">
                    <p>История пуста. Нажмите «Синхронизировать» для первой выгрузки.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <table class="history__table">
                <thead>
                    <tr>
                        <th>Площадка</th>
                        <th>Дата и время</th>
                        <th>Товаров</th>
                        <th>Статус</th>
                    </tr>
                </thead>
                <tbody>
                    ${history.map(item => `
                        <tr>
                            <td>
                                <span class="platform__badge platform__badge--${item.platform.toLowerCase()}">
                                    ${item.platform}
                                </span>
                            </td>
                            <td>${formatTime(item.date)}</td>
                            <td>${item.count} шт.</td>
                            <td>
                                ${item.success
                                    ? '<span class="status__badge status__badge--success">Успешно</span>'
                                    : '<span class="status__badge status__badge--error">Ошибка</span>'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderHistory();

    // ============ ФИЛЬТРАЦИЯ ТОВАРОВ ============
    function getFilteredProducts() {
        const onlyInStock = document.getElementById('setInStock').checked;
        const withOnOrder = document.getElementById('setOnOrder').checked;
        const withPrice = document.getElementById('setWithPrice').checked;

        const selectedBrands = [];
        document.querySelectorAll('.brand-checkbox:checked').forEach(cb => {
            selectedBrands.push(cb.value);
        });

        return PRODUCTS.filter(p => {
            // Наличие
            if (onlyInStock && !withOnOrder) {
                if (p.status !== 'in_stock') return false;
            } else if (!onlyInStock && !withOnOrder) {
                return false;
            }

            // Цена
            if (withPrice && (!p.price || p.price <= 0)) return false;

            // Бренды
            if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;

            return true;
        });
    }

    // ============ ГЕНЕРАЦИЯ XML-ФИДА ============
    function generateXML(platform) {
        const products = getFilteredProducts();
        const margin = platform === 'Avito'
            ? parseInt(document.getElementById('avitoMargin').value) || 0
            : parseInt(document.getElementById('dromMargin').value) || 0;

        const now = new Date().toISOString();

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;

        if (platform === 'Avito') {
            // Формат Avito Autoload
            xml += `<Ads formatVersion="3" target="Avito.ru">\n`;
            xml += `  <Date>${now}</Date>\n`;

            products.forEach(p => {
                const price = Math.round(p.price * (1 + margin / 100));
                xml += `  <Ad>\n`;
                xml += `    <Id>${p.id}</Id>\n`;
                xml += `    <Category>Запчасти и аксессуары</Category>\n`;
                xml += `    <GoodsType>Оригинальный</GoodsType>\n`;
                xml += `    <Title>${escapeXml(p.name)}</Title>\n`;
                xml += `    <Description>${escapeXml(p.name)}. Артикул: ${p.article}. Бренд: ${p.brand}. Совместимость: ${p.car}</Description>\n`;
                xml += `    <Price>${price}</Price>\n`;
                xml += `    <Condition>Новое</Condition>\n`;
                xml += `    <Availability>${p.status === 'in_stock' ? 'В наличии' : 'Под заказ'}</Availability>\n`;
                xml += `    <OEM>${p.article}</OEM>\n`;
                xml += `    <Brand>${p.brand}</Brand>\n`;
                xml += `  </Ad>\n`;
            });

            xml += `</Ads>\n`;
        } else {
            // Формат Drom Parts
            xml += `<drom_parts>\n`;
            xml += `  <generated>${now}</generated>\n`;
            xml += `  <shop>SibAvto</shop>\n`;
            xml += `  <parts>\n`;

            products.forEach(p => {
                const price = Math.round(p.price * (1 + margin / 100));
                xml += `    <part>\n`;
                xml += `      <id>${p.id}</id>\n`;
                xml += `      <article>${p.article}</article>\n`;
                xml += `      <name>${escapeXml(p.name)}</name>\n`;
                xml += `      <brand>${p.brand}</brand>\n`;
                xml += `      <category>${p.category}</category>\n`;
                xml += `      <price>${price}</price>\n`;
                xml += `      <availability>${p.status === 'in_stock' ? 'in_stock' : 'order'}</availability>\n`;
                xml += `      <quantity>${p.quantity}</quantity>\n`;
                xml += `      <compatibility>${p.car}</compatibility>\n`;
                xml += `    </part>\n`;
            });

            xml += `  </parts>\n`;
            xml += `</drom_parts>\n`;
        }

        return { xml, count: products.length };
    }

    function escapeXml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    function downloadXML(platform, filename) {
        const { xml, count } = generateXML(platform);

        if (count === 0) {
            showToast('Нет товаров для выгрузки. Проверьте фильтры', 'error');
            addLog(`[${platform}] Нет товаров для выгрузки`, 'error');
            return;
        }

        // Создаём Blob и скачиваем
        const blob = new Blob([xml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast(`${platform}: XML-фид скачан (${count} товаров)`, 'success');
        addLog(`[${platform}] Сгенерирован XML-фид: ${count} товаров`, 'success');
        addSyncHistory(platform, count, true);
    }

    // ============ СИНХРОНИЗАЦИЯ (ИМИТАЦИЯ) ============
    function simulateSync(platform) {
        const progressBox = document.getElementById(platform.toLowerCase() + 'Progress');
        const progressFill = document.getElementById(platform.toLowerCase() + 'ProgressFill');
        const progressText = document.getElementById(platform.toLowerCase() + 'ProgressText');

        const { count } = generateXML(platform);

        if (count === 0) {
            showToast('Нет товаров для синхронизации', 'error');
            addLog(`[${platform}] Синхронизация отменена: нет товаров`, 'error');
            return;
        }

        progressBox.style.display = 'block';
        progressFill.style.width = '0%';
        progressText.textContent = 'Подключение к ' + platform + '...';

        const steps = [
            { percent: 15, text: 'Проверка авторизации...' },
            { percent: 30, text: 'Генерация XML-фида...' },
            { percent: 50, text: 'Отправка данных на ' + platform + '...' },
            { percent: 70, text: 'Обработка на стороне ' + platform + '...' },
            { percent: 85, text: 'Обновление остатков...' },
            { percent: 100, text: 'Синхронизация завершена!' }
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (i >= steps.length) {
                clearInterval(interval);

                setTimeout(() => {
                    progressBox.style.display = 'none';
                    progressFill.style.width = '0%';

                    const time = formatTime(new Date());
                    document.getElementById(platform.toLowerCase() + 'LastSync').textContent = time;
                    document.getElementById(platform.toLowerCase() + 'Count').textContent = count;

                    showToast(`${platform}: успешно выгружено ${count} товаров`, 'success');
                    addLog(`[${platform}] Синхронизация завершена: ${count} товаров`, 'success');

                    addSyncHistory(platform, count, true);

                    // Обновляем общий счётчик
                    const activeFeeds = document.querySelectorAll('.status__dot--online').length;
                    document.getElementById('activeFeeds').textContent = activeFeeds;
                    document.getElementById('lastSyncTime').textContent = time;

                }, 500);

                return;
            }

            const step = steps[i];
            progressFill.style.width = step.percent + '%';
            progressText.textContent = step.text;
            addLog(`[${platform}] ${step.text}`, 'info');
            i++;
        }, 500);
    }

    // ============ ОБРАБОТЧИКИ ============
    document.getElementById('avitoGenerate').addEventListener('click', function () {
        downloadXML('Avito', 'avito-feed-sibavto.xml');
    });

    document.getElementById('dromGenerate').addEventListener('click', function () {
        downloadXML('Drom', 'drom-feed-sibavto.xml');
    });

    document.getElementById('avitoSync').addEventListener('click', function () {
        simulateSync('Avito');
    });

    document.getElementById('dromSync').addEventListener('click', function () {
        simulateSync('Drom');
    });

    // ============ ПРИМЕРЫ ============
    addLog('Доступные площадки: Авито, Дром', 'info');
    addLog('Товаров в каталоге: ' + PRODUCTS.length, 'info');

});