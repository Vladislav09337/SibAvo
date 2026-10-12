// ============================================================
// Чат с ботом SibAvto
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

    // ============ СОЗДАНИЕ WIDGET ============
    const chatHTML = `
        <div class="chat-widget" id="chatWidget">
            <button class="chat-toggle" id="chatToggle" title="Чат с помощником">
                <span class="chat-toggle-icon">💬</span>
            </button>

            <div class="chat-window" id="chatWindow">
                <div class="chat-header">
                    <div class="chat-header-info">
                        <div class="chat-avatar">S</div>
                        <div>
                            <div class="chat-header-name">Помощник SibAvto</div>
                            <div class="chat-header-status">
                                <span class="chat-status-dot"></span> Онлайн
                            </div>
                        </div>
                    </div>
                    <button class="chat-close" id="chatClose">✕</button>
                </div>

                <div class="chat-messages" id="chatMessages"></div>

                <div class="chat-quick-replies" id="chatQuickReplies">
                    <button class="quick-reply" data-text="Как подобрать запчасть по VIN?">Подбор по VIN</button>
                    <button class="quick-reply" data-text="Сколько стоит доставка?">Доставка</button>
                    <button class="quick-reply" data-text="Как оплатить заказ?">Оплата</button>
                    <button class="quick-reply" data-text="Есть ли гарантия?">Гарантия</button>
                </div>

                <form class="chat-input-form" id="chatForm">
                    <input type="text" id="chatInput" placeholder="Напишите сообщение..." autocomplete="off">
                    <button type="submit" class="chat-send">➤</button>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatHTML);

    const widget = document.getElementById('chatWidget');
    const toggle = document.getElementById('chatToggle');
    const window_ = document.getElementById('chatWindow');
    const closeBtn = document.getElementById('chatClose');
    const messages = document.getElementById('chatMessages');
    const form = document.getElementById('chatForm');
    const input = document.getElementById('chatInput');
    const quickReplies = document.getElementById('chatQuickReplies');

    // ============ СОСТОЯНИЕ ============
    let isOpen = false;
    let history = JSON.parse(localStorage.getItem('sibavto_chat_history') || '[]');

    // ============ ОТКРЫТИЕ/ЗАКРЫТИЕ ============
    toggle.addEventListener('click', () => {
        isOpen = !isOpen;
        window_.classList.toggle('chat-window--open', isOpen);
        toggle.classList.toggle('chat-toggle--hidden', isOpen);
        if (isOpen) {
            input.focus();
            scrollToBottom();
        }
    });

    closeBtn.addEventListener('click', () => {
        isOpen = false;
        window_.classList.remove('chat-window--open');
        toggle.classList.remove('chat-toggle--hidden');
    });

    // ============ ПРИВЕТСТВИЕ ============
    if (history.length === 0) {
        addBotMessage('Здравствуйте! Я помощник SibAvto 🤖\n\nМогу помочь с подбором запчастей, доставкой и оплатой. Что вас интересует?');
    } else {
        history.forEach(msg => {
            if (msg.type === 'user') addUserMessage(msg.text, false);
            else addBotMessage(msg.text, false);
        });
        scrollToBottom();
    }

    // ============ БАЗА ОТВЕТОВ БОТА ============
    const botResponses = [
        {
            keywords: ['vin', 'вин', 'подбор', 'подобрать', 'номер кузова'],
            answer: 'Подбор по VIN-номеру — самый точный способ!\n\n📌 Введите VIN в поле поиска на главной странице\n📌 Или введите артикул запчасти\n\nЕсли не знаете VIN — свяжитесь с нашим экспертом: +7 (383) 123-45-67'
        },
        {
            keywords: ['доставка', 'доставить', 'курьер', 'привез'],
            answer: 'Доставка SibAvto:\n\n🚗 Самовывоз — бесплатно (г. Новосибирск, ул. Автозаводская, 15)\n📦 Курьер по Новосибирску — 300 руб., в день заказа\n🚚 По России — от 500 руб., 3-7 дней\n\nБесплатная доставка при заказе от 5000 руб.!'
        },
        {
            keywords: ['оплата', 'оплатить', 'карта', 'наличн', 'платеж'],
            answer: 'Способы оплаты:\n\n💳 Онлайн картой Visa/MasterCard/МИР\n💵 Наличными при получении\n💳 Картой курьеру\n\nВсе платежи защищены. Чек приходит на email сразу после оплаты.'
        },
        {
            keywords: ['гарантия', 'вернуть', 'возврат', 'брак'],
            answer: 'Гарантия SibAvto:\n\n✅ Официальная гарантия от производителя (6-24 мес.)\n✅ Возврат в течение 14 дней\n✅ Замена брака без вопросов\n\nМы лицензированный продавец — все документы выдаём официально.'
        },
        {
            keywords: ['скидка', 'акция', 'промокод', 'дешевле'],
            answer: 'Акции SibAvto:\n\n🎁 Скидка 5% при первом заказе (промокод: FIRST5)\n🎁 Бесплатная доставка от 5000 руб.\n🎁 Скидки на оптовые заказы\n\nПодпишитесь на рассылку — узнавайте об акциях первыми!'
        },
        {
            keywords: ['телефон', 'контакт', 'позвонить', 'связь'],
            answer: 'Наши контакты:\n\n📞 +7 (383) 123-45-67\n📧 info@sibavto.ru\n📍 г. Новосибирск, ул. Автозаводская, 15\n\nРежим работы:\nПн-Пт: 9:00-19:00\nСб: 10:00-17:00\nВс: выходной'
        },
        {
            keywords: ['оригинал', 'аналог', 'качеств', 'бренд'],
            answer: 'Мы предлагаем:\n\n🔵 Оригинальные запчасти (Bosch, Denso, NGK...)\n🟢 Качественные аналоги (Febi, Blue Print, KYB...)\n🟡 Бюджетные варианты\n\nПоможем подобрать оптимальный вариант по цене и качеству!'
        },
        {
            keywords: ['наличи', 'есть', 'склад', 'срок'],
            answer: 'Наличие товара:\n\n✅ Товары со статусом "В наличии" — отправим в день заказа\n⏳ Товары "Под заказ" — доставим за 2-5 дней\n\nТочные сроки зависят от поставщика. Уточнить можно у менеджера.'
        },
        {
            keywords: ['привет', 'здравствуй', 'добрый', 'хай', 'hello'],
            answer: 'Здравствуйте! 👋\n\nЧем могу помочь? Могу рассказать про:\n• Подбор запчастей\n• Доставку\n• Оплату\n• Гарантию\n\nПросто напишите вопрос или выберите кнопку ниже.'
        },
        {
            keywords: ['спасибо', 'благодар', 'класс', 'отлично'],
            answer: 'Всегда рад помочь! 😊\n\nЕсли появятся ещё вопросы — пишите. Хорошего дня и удачи на дорогах! 🚗'
        },
        {
            keywords: ['пока', 'до свидания', 'бб', 'бай'],
            answer: 'До встречи! 👋\n\nВозвращайтесь — мы всегда рады помочь с автозапчастями. Удачи на дорогах! 🚗'
        }
    ];

    // ============ ОПРЕДЕЛЕНИЕ ОТВЕТА ============
    function getBotResponse(message) {
        const lower = message.toLowerCase();

        for (const response of botResponses) {
            for (const keyword of response.keywords) {
                if (lower.includes(keyword)) {
                    return response.answer;
                }
            }
        }

        return 'Хм, не совсем понял вопрос 🤔\n\nМогу помочь с:\n• Подбором запчастей (по VIN или артикулу)\n• Доставкой\n• Оплатой\n• Гарантией и возвратом\n• Контактами\n\nПопробуйте спросить по-другому или позвоните: +7 (383) 123-45-67';
    }

    // ============ ДОБАВЛЕНИЕ СООБЩЕНИЙ ============
    function addBotMessage(text, save = true) {
        const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

        const html = `
            <div class="chat-message chat-message--bot">
                <div class="chat-message-avatar">S</div>
                <div class="chat-message-content">
                    <div class="chat-message-text">${escapeHtml(text).replace(/\n/g, '<br>')}</div>
                    <div class="chat-message-time">${time}</div>
                </div>
            </div>
        `;

        messages.insertAdjacentHTML('beforeend', html);

        if (save) {
            history.push({ type: 'bot', text, time: Date.now() });
            saveHistory();
        }

        scrollToBottom();
    }

    function addUserMessage(text, save = true) {
        const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

        const html = `
            <div class="chat-message chat-message--user">
                <div class="chat-message-content">
                    <div class="chat-message-text">${escapeHtml(text)}</div>
                    <div class="chat-message-time">${time}</div>
                </div>
            </div>
        `;

        messages.insertAdjacentHTML('beforeend', html);

        if (save) {
            history.push({ type: 'user', text, time: Date.now() });
            saveHistory();
        }

        scrollToBottom();
    }

    function saveHistory() {
        // Ограничиваем историю 50 сообщениями
        if (history.length > 50) history = history.slice(-50);
        localStorage.setItem('sibavto_chat_history', JSON.stringify(history));
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function scrollToBottom() {
        setTimeout(() => {
            messages.scrollTop = messages.scrollHeight;
        }, 50);
    }

    // ============ ПОКАЗАТЬ "ПЕЧАТАЕТ..." ============
    function showTyping() {
        const html = `
            <div class="chat-message chat-message--bot chat-typing" id="chatTyping">
                <div class="chat-message-avatar">S</div>
                <div class="chat-message-content">
                    <div class="chat-typing-dots">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>
        `;
        messages.insertAdjacentHTML('beforeend', html);
        scrollToBottom();
    }

    function hideTyping() {
        const typing = document.getElementById('chatTyping');
        if (typing) typing.remove();
    }

    // ============ ОТПРАВКА СООБЩЕНИЯ ============
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const text = input.value.trim();
        if (!text) return;

        addUserMessage(text);
        input.value = '';

        showTyping();

        // Имитация задержки "печатает..."
        const delay = 600 + Math.random() * 800;
        setTimeout(() => {
            hideTyping();
            const response = getBotResponse(text);
            addBotMessage(response);
        }, delay);
    });

    // ============ БЫСТРЫЕ ОТВЕТЫ ============
    quickReplies.addEventListener('click', function (e) {
        const btn = e.target.closest('.quick-reply');
        if (!btn) return;

        const text = btn.dataset.text;
        addUserMessage(text);

        showTyping();
        setTimeout(() => {
            hideTyping();
            const response = getBotResponse(text);
            addBotMessage(response);
        }, 600);
    });
});