// scripts.js

// Обёртка для избежания конфликтов с другими библиотеками или скриптами
(function () {
    "use strict";

    document.addEventListener('DOMContentLoaded', function () {
        // Список міст
        const cities = ['Киев', 'Харьков', 'Одесса', 'Днепр', 'Львов'];

        const cityDropdownButton = document.getElementById('cityDropdown');
        const cityDropdownMenu = document.getElementById('cityDropdownMenu');

        // Додаємо міста до випадаючого меню
        cities.forEach(function (city) {
            const cityItem = document.createElement('a');
            cityItem.classList.add('block', 'px-4', 'py-2', 'text-pantone-7536c', 'hover:bg-pantone-7536c', 'hover:text-pantone-432c');
            cityItem.textContent = city;
            cityItem.href = '#';
            cityItem.addEventListener('click', function (e) {
                e.preventDefault();
                setCity(city);
                toggleDropdown(cityDropdownMenu);
            });
            cityDropdownMenu.appendChild(cityItem);
        });

        // Функція для встановлення вибраного міста
        function setCity(city) {
            cityDropdownButton.textContent = city;
            // Зберегти вибране місто в localStorage
            localStorage.setItem('selectedCity', city);
            // Оновити пошук або інші елементи сторінки відповідно до вибраного міста
            updateCityInForm(city);
        }

        // Оновлюємо приховане поле форми при зміні міста
        function updateCityInForm(city) {
            const cityInput = document.getElementById('cityInput');
            if (cityInput) {
                cityInput.value = city;
            }
        }

        // Перевіряємо, чи є раніше вибране місто
        const savedCity = localStorage.getItem('selectedCity');
        if (savedCity) {
            setCity(savedCity);
        } else {
            // Визначаємо місцезнаходження користувача
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function (position) {
                        // Використовуємо API для отримання міста за координатами
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;

                        // Використовуємо зворотне геокодування через зовнішній API
                        fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
                        )
                            .then((response) => response.json())
                            .then((data) => {
                                const city =
                                    data.address.city ||
                                    data.address.town ||
                                    data.address.village;
                                if (city && cities.includes(city)) {
                                    setCity(city);
                                } else {
                                    setCity('Виберіть місто');
                                }
                            })
                            .catch((error) => {
                                console.error('Помилка при отриманні міста:', error);
                                setCity('Виберіть місто');
                            });
                    },
                    function (error) {
                        console.error('Помилка геолокації:', error);
                        setCity('Виберіть місто');
                    }
                );
            } else {
                // Геолокація не підтримується
                setCity('Виберіть місто');
            }
        }

        // Функціональність перемикання мови
        const currentLanguageSpan = document.getElementById('currentLanguage');
        const languageDropdownMenu = document.getElementById('languageDropdownMenu');
        const languageDropdownItems = languageDropdownMenu.querySelectorAll('.dropdown-item[data-lang]');

        // Функція встановлення мови
        function setLanguage(lang) {
            currentLanguageSpan.textContent = lang;
            localStorage.setItem('selectedLanguage', lang);
            updatePageLanguage(lang);
        }

        // Додаємо обробники подій для пунктів меню
        languageDropdownItems.forEach(function (item) {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                const lang = this.getAttribute('data-lang');
                setLanguage(lang);
                toggleDropdown(languageDropdownMenu);
            });
        });

        // Перевіряємо збережену мову
        const savedLanguage = localStorage.getItem('selectedLanguage') || 'UA';
        setLanguage(savedLanguage);

        // Функція оновлення контенту сторінки
        function updatePageLanguage(lang) {
            const translations = {
                'UA': {
                    'search_placeholder': 'Пошук по назві процедури',
                    'search_button': 'Пошук',
                    'or_select_master': 'або виберіть необхідного майстра',
                    'apply_button': 'Заповнити заявку',
                    'form_name_label': "Ім'я",
                    'form_phone_label': "Телефон",
                    'form_service_label': "Послуга",
                    'form_submit_button': "Заповнити заявку"
                    // Додайте інші переклади...
                },
                'RU': {
                    'search_placeholder': 'Поиск по названию процедуры',
                    'search_button': 'Поиск',
                    'or_select_master': 'или выберите необходимого мастера',
                    'apply_button': 'Заполнить заявку',
                    'form_name_label': "Имя",
                    'form_phone_label': "Телефон",
                    'form_service_label': "Услуга",
                    'form_submit_button': "Заполнить заявку"
                    // Додайте інші переклади...
                },
                'EN': {
                    'search_placeholder': 'Search by procedure name',
                    'search_button': 'Search',
                    'or_select_master': 'or select the required master',
                    'apply_button': 'Fill out the application',
                    'form_name_label': "Name",
                    'form_phone_label': "Phone",
                    'form_service_label': "Service",
                    'form_submit_button': "Fill out the application"
                    // Додайте інші переклади...
                }
            };

            // Оновлюємо текстові елементи на сторінці
            const searchInput = document.querySelector('input[name="query"]');
            const searchButton = document.querySelector('button[type="submit"]');
            const orSelectMasterText = document.querySelector('h5');
            const applyButton = document.querySelector('.banner-text .btn');

            // Оновлення форми заявки
            const formNameLabel = document.querySelector('label[for="name"]');
            const formPhoneLabel = document.querySelector('label[for="phone"]');
            const formServiceLabel = document.querySelector('label[for="service"]');
            const formSubmitButton = document.querySelector('button[type="submit"]');

            if (searchInput && translations[lang]['search_placeholder']) {
                searchInput.setAttribute('placeholder', translations[lang]['search_placeholder']);
            }

            if (searchButton && translations[lang]['search_button']) {
                searchButton.textContent = translations[lang]['search_button'];
            }

            if (orSelectMasterText && translations[lang]['or_select_master']) {
                orSelectMasterText.textContent = translations[lang]['or_select_master'];
            }

            if (applyButton && translations[lang]['apply_button']) {
                applyButton.textContent = translations[lang]['apply_button'];
            }

            // Оновлення форми заявки
            if (formNameLabel && translations[lang]['form_name_label']) {
                formNameLabel.textContent = translations[lang]['form_name_label'];
            }

            if (formPhoneLabel && translations[lang]['form_phone_label']) {
                formPhoneLabel.textContent = translations[lang]['form_phone_label'];
            }

            if (formServiceLabel && translations[lang]['form_service_label']) {
                formServiceLabel.textContent = translations[lang]['form_service_label'];
            }

            if (formSubmitButton && translations[lang]['form_submit_button']) {
                formSubmitButton.textContent = translations[lang]['form_submit_button'];
            }

            // Додайте оновлення інших елементів відповідно до вибраної мови
        }

        // Функція для переключення видимості випадаючого меню
        function toggleDropdown(menu) {
            menu.classList.toggle('hidden');
        }

        // Закриття випадаючих меню при кліку поза ними
        window.addEventListener('click', function (e) {
            const cityMenu = document.getElementById('cityDropdownMenu');
            const languageMenu = document.getElementById('languageDropdownMenu');

            if (!cityMenu.contains(e.target) && !e.target.matches('#cityDropdown')) {
                cityMenu.classList.add('hidden');
            }

            if (!languageMenu.contains(e.target) && !e.target.matches('#languageDropdown')) {
                languageMenu.classList.add('hidden');
            }
        });

        // Валідація форм з класом 'needs-validation'
        const forms = document.querySelectorAll('.needs-validation');

        Array.prototype.slice.call(forms)
            .forEach(function (form) {
                form.addEventListener('submit', function (event) {
                    if (!form.checkValidity()) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    form.classList.add('was-validated');
                }, false);
            });
    })();
