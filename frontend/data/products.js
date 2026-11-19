// ============================================================
// База данных товаров SibAvto (30 товаров, 10 брендов)
// ============================================================

const BRANDS = [
    { id: 'bosch', name: 'Bosch' },
    { id: 'denso', name: 'Denso' },
    { id: 'mann', name: 'Mann-Filter' },
    { id: 'ngk', name: 'NGK' },
    { id: 'brembo', name: 'Brembo' },
    { id: 'sachs', name: 'Sachs' },
    { id: 'hella', name: 'Hella' },
    { id: 'varta', name: 'Varta' },
    { id: 'mobil', name: 'Mobil' },
    { id: 'castrol', name: 'Castrol' }
];

const PRODUCTS = [
    // ======================== BOSCH (3) ========================
    {
        id: 1,
        brand: 'bosch',
        name: 'Тормозные колодки передние Bosch',
        article: 'BOS-0986AB1234',
        category: 'Тормозная система',
        price: 3500,
        quantity: 15,
        status: 'in_stock',
        car: 'Toyota',
        images: [
            'images/products/product-1/1.jpg',
            'images/products/product-1/2.jpg',
            'images/products/product-1/3.jpg',
            'images/products/product-1/4.jpg'
        ]
    },
    {
        id: 2,
        brand: 'bosch',
        name: 'Тормозной диск передний Bosch',
        article: 'BOS-0986479',
        category: 'Тормозная система',
        price: 5500,
        quantity: 10,
        status: 'in_stock',
        car: 'Toyota',
        images: ['images/products/product-2/1.jpg', 'images/products/product-2/2.jpg', 'images/products/product-2/3.jpg', 'images/products/product-2/4.jpg']
    },
    {
        id: 3,
        brand: 'bosch',
        name: 'Аккумулятор Bosch 70Ah',
        article: 'BOS-S5',
        category: 'Электрика',
        price: 9500,
        quantity: 4,
        status: 'in_stock',
        car: 'Skoda',
        images: ['images/products/product-3/1.jpg', 'images/products/product-3/2.jpg', 'images/products/product-3/3.jpg', 'images/products/product-3/4.jpg']
    },

    // ======================== DENSO (3) ========================
    {
        id: 4,
        brand: 'denso',
        name: 'Свечи зажигания Denso (комплект 4 шт.)',
        article: 'DEN-90919-01253',
        category: 'Электрика',
        price: 1200,
        quantity: 30,
        status: 'in_stock',
        car: 'Toyota',
        images: ['images/products/product-4/1.jpg', 'images/products/product-4/2.jpg', 'images/products/product-4/3.jpg', 'images/products/product-4/4.jpg']
    },
    {
        id: 5,
        brand: 'denso',
        name: 'Свеча зажигания Denso иридиевая',
        article: 'DEN-IK20',
        category: 'Электрика',
        price: 950,
        quantity: 45,
        status: 'in_stock',
        car: 'Kia',
        images: ['images/products/product-5/1.jpg', 'images/products/product-5/2.jpg', 'images/products/product-5/3.jpg', 'images/products/product-5/4.jpg']
    },
    {
        id: 6,
        brand: 'denso',
        name: 'Датчик кислорода Denso',
        article: 'DEN-234-4138',
        category: 'Электрика',
        price: 4200,
        quantity: 8,
        status: 'in_stock',
        car: 'Mazda',
        images: ['images/products/product-6/1.jpg', 'images/products/product-6/2.jpg', 'images/products/product-6/3.jpg', 'images/products/product-6/4.jpg']
    },

    // ======================== MANN-FILTER (3) ========================
    {
        id: 7,
        brand: 'mann',
        name: 'Масляный фильтр Mann-Filter',
        article: 'MAN-W9142',
        category: 'Фильтры',
        price: 450,
        quantity: 50,
        status: 'in_stock',
        car: 'Volkswagen',
        images: ['images/products/product-7/1.jpg', 'images/products/product-7/2.jpg', 'images/products/product-7/3.jpg', 'images/products/product-7/4.jpg']
    },
    {
        id: 8,
        brand: 'mann',
        name: 'Воздушный фильтр Mann',
        article: 'MAN-C25114',
        category: 'Фильтры',
        price: 750,
        quantity: 35,
        status: 'in_stock',
        car: 'Toyota',
        images: ['images/products/product-8/1.jpg', 'images/products/product-8/2.jpg', 'images/products/product-8/3.jpg', 'images/products/product-8/4.jpg']
    },
    {
        id: 9,
        brand: 'mann',
        name: 'Салонный фильтр Mann угольный',
        article: 'MAN-CUK26009',
        category: 'Фильтры',
        price: 890,
        quantity: 40,
        status: 'in_stock',
        car: 'Kia',
        images: ['images/products/product-9/1.jpg', 'images/products/product-9/2.jpg', 'images/products/product-9/3.jpg', 'images/products/product-9/4.jpg']
    },

    // ======================== NGK (3) ========================
    {
        id: 10,
        brand: 'ngk',
        name: 'Свеча зажигания NGK иридиевая',
        article: 'NGK-IFR6T11',
        category: 'Электрика',
        price: 850,
        quantity: 25,
        status: 'in_stock',
        car: 'Kia',
        images: ['images/products/product-10/1.jpg', 'images/products/product-10/2.jpg', 'images/products/product-10/3.jpg', 'images/products/product-10/4.jpg']
    },
    {
        id: 11,
        brand: 'ngk',
        name: 'Свеча зажигания NGK стандарт',
        article: 'NGK-BKR6EIX',
        category: 'Электрика',
        price: 650,
        quantity: 30,
        status: 'in_stock',
        car: 'Hyundai',
        images: ['images/products/product-11/1.jpg', 'images/products/product-11/2.jpg', 'images/products/product-11/3.jpg', 'images/products/product-11/4.jpg']
    },
    {
        id: 12,
        brand: 'ngk',
        name: 'Свеча зажигания NGK платиновая',
        article: 'NGK-PFR6B',
        category: 'Электрика',
        price: 1200,
        quantity: 15,
        status: 'in_stock',
        car: 'Toyota',
        images: ['images/products/product-12/1.jpg', 'images/products/product-12/2.jpg', 'images/products/product-12/3.jpg', 'images/products/product-12/4.jpg']
    },

    // ======================== BREMBO (3) ========================
    {
        id: 13,
        brand: 'brembo',
        name: 'Тормозные колодки Brembo',
        article: 'BREM-P85020',
        category: 'Тормозная система',
        price: 4200,
        quantity: 8,
        status: 'in_stock',
        car: 'Kia',
        images: ['images/products/product-13/1.jpg', 'images/products/product-13/2.jpg', 'images/products/product-13/3.jpg', 'images/products/product-13/4.jpg']
    },
    {
        id: 14,
        brand: 'brembo',
        name: 'Тормозной диск Brembo',
        article: 'BREM-09A41511',
        category: 'Тормозная система',
        price: 6800,
        quantity: 5,
        status: 'in_stock',
        car: 'Hyundai',
        images: ['images/products/product-14/1.jpg', 'images/products/product-14/2.jpg', 'images/products/product-14/3.jpg', 'images/products/product-14/4.jpg']
    },
    {
        id: 15,
        brand: 'brembo',
        name: 'Тормозной суппорт Brembo',
        article: 'BREM-F50',
        category: 'Тормозная система',
        price: 28500,
        quantity: 2,
        status: 'on_order',
        car: 'BMW',
        images: ['images/products/product-15/1.jpg', 'images/products/product-15/2.jpg', 'images/products/product-15/3.jpg', 'images/products/product-15/4.jpg']
    },

    // ======================== SACHS (3) ========================
    {
        id: 16,
        brand: 'sachs',
        name: 'Амортизатор передний Sachs',
        article: 'SACH-314567',
        category: 'Подвеска',
        price: 7200,
        quantity: 12,
        status: 'in_stock',
        car: 'Toyota',
        images: ['images/products/product-16/1.jpg', 'images/products/product-16/2.jpg', 'images/products/product-16/3.jpg', 'images/products/product-16/4.jpg']
    },
    {
        id: 17,
        brand: 'sachs',
        name: 'Амортизатор задний Sachs',
        article: 'SACH-315678',
        category: 'Подвеска',
        price: 6500,
        quantity: 8,
        status: 'in_stock',
        car: 'Volkswagen',
        images: ['images/products/product-17/1.jpg', 'images/products/product-17/2.jpg', 'images/products/product-17/3.jpg', 'images/products/product-17/4.jpg']
    },
    {
        id: 18,
        brand: 'sachs',
        name: 'Комплект сцепления Sachs',
        article: 'SACH-3000950',
        category: 'Трансмиссия',
        price: 15800,
        quantity: 4,
        status: 'in_stock',
        car: 'Volkswagen',
        images: ['images/products/product-18/1.jpg', 'images/products/product-18/2.jpg', 'images/products/product-18/3.jpg', 'images/products/product-18/4.jpg']
    },

    // ======================== HELLA (3) ========================
    {
        id: 19,
        brand: 'hella',
        name: 'Лампа H7 галогенная Hella',
        article: 'HEL-H7',
        category: 'Электрика',
        price: 550,
        quantity: 40,
        status: 'in_stock',
        car: 'Kia',
        images: ['images/products/product-19/1.jpg', 'images/products/product-19/2.jpg', 'images/products/product-19/3.jpg', 'images/products/product-19/4.jpg']
    },
    {
        id: 20,
        brand: 'hella',
        name: 'Лампа H4 Hella',
        article: 'HEL-H4',
        category: 'Электрика',
        price: 480,
        quantity: 35,
        status: 'in_stock',
        car: 'Lada',
        images: ['images/products/product-20/1.jpg', 'images/products/product-20/2.jpg', 'images/products/product-20/3.jpg', 'images/products/product-20/4.jpg']
    },
    {
        id: 21,
        brand: 'hella',
        name: 'Противотуманная фара Hella',
        article: 'HEL-1NL008',
        category: 'Электрика',
        price: 4200,
        quantity: 6,
        status: 'in_stock',
        car: 'Toyota',
        images: ['images/products/product-21/1.jpg', 'images/products/product-21/2.jpg', 'images/products/product-21/3.jpg', 'images/products/product-21/4.jpg']
    },

    // ======================== VARTA (3) ========================
    {
        id: 22,
        brand: 'varta',
        name: 'Аккумулятор Varta 60Ah',
        article: 'VAR-A15',
        category: 'Электрика',
        price: 7800,
        quantity: 6,
        status: 'in_stock',
        car: 'Lada',
        images: ['images/products/product-22/1.jpg', 'images/products/product-22/2.jpg', 'images/products/product-22/3.jpg', 'images/products/product-22/4.jpg']
    },
    {
        id: 23,
        brand: 'varta',
        name: 'Аккумулятор Varta 74Ah',
        article: 'VAR-D59',
        category: 'Электрика',
        price: 9200,
        quantity: 5,
        status: 'in_stock',
        car: 'Volkswagen',
        images: ['images/products/product-23/1.jpg', 'images/products/product-23/2.jpg', 'images/products/product-23/3.jpg', 'images/products/product-23/4.jpg']
    },
    {
        id: 24,
        brand: 'varta',
        name: 'Аккумулятор Varta 90Ah',
        article: 'VAR-G14',
        category: 'Электрика',
        price: 12500,
        quantity: 3,
        status: 'in_stock',
        car: 'Toyota',
        images: ['images/products/product-24/1.jpg', 'images/products/product-24/2.jpg', 'images/products/product-24/3.jpg', 'images/products/product-24/4.jpg']
    },

    // ======================== MOBIL (3) ========================
    {
        id: 25,
        brand: 'mobil',
        name: 'Масло Mobil 5W-40 (4л)',
        article: 'MOB-5W40',
        category: 'Масла',
        price: 3800,
        quantity: 30,
        status: 'in_stock',
        car: 'все',
        images: ['images/products/product-25/1.jpg', 'images/products/product-25/2.jpg', 'images/products/product-25/3.jpg', 'images/products/product-25/4.jpg']
    },
    {
        id: 26,
        brand: 'mobil',
        name: 'Масло Mobil 5W-30 (4л)',
        article: 'MOB-5W30',
        category: 'Масла',
        price: 3600,
        quantity: 25,
        status: 'in_stock',
        car: 'все',
        images: ['images/products/product-26/1.jpg', 'images/products/product-26/2.jpg', 'images/products/product-26/3.jpg', 'images/products/product-26/4.jpg']
    },
    {
        id: 27,
        brand: 'mobil',
        name: 'Масло Mobil 0W-40 (4л)',
        article: 'MOB-0W40',
        category: 'Масла',
        price: 4200,
        quantity: 18,
        status: 'in_stock',
        car: 'BMW',
        images: ['images/products/product-27/1.jpg', 'images/products/product-27/2.jpg', 'images/products/product-27/3.jpg', 'images/products/product-27/4.jpg']
    },

    // ======================== CASTROL (3) ========================
    {
        id: 28,
        brand: 'castrol',
        name: 'Масло Castrol 5W-30 (4л)',
        article: 'CAS-5W30',
        category: 'Масла',
        price: 4200,
        quantity: 25,
        status: 'in_stock',
        car: 'Volkswagen',
        images: ['images/products/product-28/1.jpg', 'images/products/product-28/2.jpg', 'images/products/product-28/3.jpg', 'images/products/product-28/4.jpg']
    },
    {
        id: 29,
        brand: 'castrol',
        name: 'Масло Castrol 5W-40 (4л)',
        article: 'CAS-5W40',
        category: 'Масла',
        price: 4000,
        quantity: 28,
        status: 'in_stock',
        car: 'все',
        images: ['images/products/product-29/1.jpg', 'images/products/product-29/2.jpg', 'images/products/product-29/3.jpg', 'images/products/product-29/4.jpg']
    },
    {
        id: 30,
        brand: 'castrol',
        name: 'Тормозная жидкость Castrol DOT4',
        article: 'CAS-DOT4',
        category: 'Жидкости',
        price: 950,
        quantity: 25,
        status: 'in_stock',
        car: 'все',
        images: ['images/products/product-30/1.jpg', 'images/products/product-30/2.jpg', 'images/products/product-30/3.jpg', 'images/products/product-30/4.jpg']
    }
];

window.SIBAVTO_BRANDS = BRANDS;
window.SIBAVTO_PRODUCTS = PRODUCTS;