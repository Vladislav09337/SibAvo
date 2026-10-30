// ============================================================
// FAQ — аккордеон и фильтр
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

    const faqList = document.getElementById('faqList');
    if (!faqList) return;

    // Аккордеон
    document.querySelectorAll('.faq__question').forEach(btn => {
        btn.addEventListener('click', function () {
            const item = this.closest('.faq__item');
            const isOpen = item.classList.contains('faq__item--open');

            document.querySelectorAll('.faq__item').forEach(i => i.classList.remove('faq__item--open'));

            if (!isOpen) {
                item.classList.add('faq__item--open');
            }
        });
    });

    // Фильтр по категориям
    document.querySelectorAll('.faq__category').forEach(btn => {
        btn.addEventListener('click', function () {
            const category = this.dataset.category;

            document.querySelectorAll('.faq__category').forEach(b => b.classList.remove('faq__category--active'));
            this.classList.add('faq__category--active');

            document.querySelectorAll('.faq__item').forEach(item => {
                if (category === 'all' || item.dataset.category === category) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
});