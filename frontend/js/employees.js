// ============================================================
// Логика страницы сотрудников
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

    const grid = document.getElementById('employeesGrid');
    const searchInput = document.getElementById('employeeSearch');
    const deptFilter = document.getElementById('departmentFilter');

    if (!grid) return;

    const EMPLOYEES = window.SIBAVTO_EMPLOYEES || [];

    // Заполняем список отделов
    const departments = [...new Set(EMPLOYEES.map(e => e.department))];
    departments.forEach(dept => {
        const opt = document.createElement('option');
        opt.value = dept;
        opt.textContent = dept;
        deptFilter.appendChild(opt);
    });

    // ============ ОТРИСОВКА ============
    function render(filtered) {
        if (filtered.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; padding: 60px; text-align: center; color: #888; background: #fff; border-radius: 8px;">
                    <h3>Сотрудники не найдены</h3>
                    <p>Попробуйте изменить параметры поиска</p>
                </div>
            `;
            return;
        }

        // Группировка по отделам
        const grouped = {};
        filtered.forEach(emp => {
            if (!grouped[emp.department]) grouped[emp.department] = [];
            grouped[emp.department].push(emp);
        });

        let html = '';
        Object.keys(grouped).forEach(dept => {
            html += `
                <div class="employees__department">
                    <h2 class="employees__department-title">${dept}</h2>
                    <div class="employees__department-grid">
                        ${grouped[dept].map(emp => `
                            <div class="employee__card">
                                <div class="employee__avatar">${emp.name.charAt(0)}</div>
                                <h3 class="employee__name">${emp.name}</h3>
                                <p class="employee__position">${emp.position}</p>
                                <div class="employee__info">
                                    <p><strong>Опыт:</strong> ${emp.experience}</p>
                                    <p><strong>Телефон:</strong> <a href="tel:${emp.phone.replace(/[^\d+]/g, '')}">${emp.phone}</a></p>
                                    <p><strong>Email:</strong> <a href="mailto:${emp.email}">${emp.email}</a></p>
                                </div>
                                <p class="employee__description">${emp.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
    }

    // ============ ФИЛЬТРАЦИЯ ============
    function filter() {
        const query = (searchInput?.value || '').trim().toLowerCase();
        const dept = deptFilter?.value || 'all';

        let filtered = EMPLOYEES;

        if (dept !== 'all') {
            filtered = filtered.filter(e => e.department === dept);
        }

        if (query) {
            filtered = filtered.filter(e =>
                e.name.toLowerCase().includes(query) ||
                e.position.toLowerCase().includes(query) ||
                e.department.toLowerCase().includes(query) ||
                e.description.toLowerCase().includes(query)
            );
        }

        render(filtered);
    }

    // ============ ОБРАБОТЧИКИ ============
    if (searchInput) searchInput.addEventListener('input', filter);
    if (deptFilter) deptFilter.addEventListener('change', filter);

    // ============ СТАРТ ============
    render(EMPLOYEES);
});