document.addEventListener('DOMContentLoaded', function() {
  // Загружаем сохраненные избранные при старте
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    // Загружаем сохраненную тему
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Словарь со ссылками на Steam для каждой игры
    const steamLinks = {
        'Spirit of the North': 'https://store.steampowered.com/app/1213700/Spirit_of_the_North/',
        'Stories: The Path of Destinies': 'https://store.steampowered.com/app/439190/Stories_The_Path_of_Destinies/',
        'Fox n Forests': 'https://store.steampowered.com/app/603400/FOX_n_FORESTS/',
        'The First Tree': 'https://store.steampowered.com/app/555150/The_First_Tree/',
        'Super Lucky\'s Tale': 'https://store.steampowered.com/app/847360/New_Super_Luckys_Tale/',
        'Endling: Extinction is Forever': 'https://store.steampowered.com/app/898890/Endling__Extinction_is_Forever/'
    };
    
    // Устанавливаем начальное состояние иконок
    document.querySelectorAll('.game__card').forEach(gameCard => {
        const title = gameCard.querySelector('.game__title').textContent;
        const likeIcon = gameCard.querySelector('.game__icon');
        if (favorites.some(game => game.title === title)) {
            likeIcon.classList.add('active');
        }
    });

    // Функция для добавления игры в избранное
    function addToFavorites(gameCard) {
        const gameData = {
            title: gameCard.querySelector('.game__title').textContent,
            description: gameCard.querySelector('.game__description').textContent,
            image: gameCard.querySelector('.game__image').src,
            meta: gameCard.querySelector('.game__meta').textContent,
            steamLink: steamLinks[gameCard.querySelector('.game__title').textContent]
        };

        let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const likeIcon = gameCard.querySelector('.game__icon');
        
        // Проверяем, есть ли игра в избранном
        const index = favorites.findIndex(game => game.title === gameData.title);
        
        if (index === -1) {
            // Добавляем в избранное
            favorites.push(gameData);
            likeIcon.classList.add('active');
        } else {
            // Убираем из избранного
            favorites.splice(index, 1);
            likeIcon.classList.remove('active');
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    // Обработчик клика по иконке "Нравится"
    document.querySelectorAll('.game__icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            const gameCard = e.target.closest('.game__card');
            if (gameCard) {
                const title = gameCard.querySelector('.game__title').textContent;
                // Находим все сердечки для этой игры и запускаем анимацию сразу
                const iconsToFade = [];
                document.querySelectorAll('.game__card').forEach(card => {
                    if (card.querySelector('.game__title') && card.querySelector('.game__title').textContent === title) {
                        card.querySelectorAll('.game__icon').forEach(ic => {
                            ic.classList.add('icon-fade-out');
                            iconsToFade.push(ic);
                        });
                    }
                });
                // После завершения анимации для всех сердечек, только тогда обновляем избранное
                let faded = 0;
                iconsToFade.forEach(ic => {
                    ic.addEventListener('animationend', () => {
                        ic.style.display = 'none';
                        faded++;
                        if (faded === iconsToFade.length) {
                            addToFavorites(gameCard);
                        }
                    }, { once: true });
                });
            }
        });
    });

    // Функция для отображения избранных игр
    function displayFavorites() {
        const favoritesContainer = document.getElementById('favorites-container');
        if (!favoritesContainer) return;

        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

        if (favorites.length === 0) {
            favoritesContainer.innerHTML = '<p>У вас пока нет избранных игр</p>';
            return;
        }

        favoritesContainer.innerHTML = favorites.map(game => `
            <article class="game__card">
                <a href="${game.steamLink}" target="_blank" class="game__image-link">
                    <img src="${game.image}" alt="${game.title}" class="game__image">
                </a>
                <div class="game__content">
                    <div class="game__header">
                        <h2 class="game__title">${game.title}</h2>
                        <div class="game__icons">
                            <button class="remove-favorite" data-title="${game.title}" title="Удалить из избранного" style="background:none;border:none;padding:0;cursor:pointer;">
                                <img src="images/heart-broken.svg" alt="Удалить из избранного" class="game__icon-broken">
                            </button>
                        </div>
                    </div>
                    <p class="game__description">${game.description}</p>
                    <p class="game__meta">${game.meta}</p>
                </div>
            </article>
        `).join('');

        // Добавляем обработчики для кнопок удаления
        document.querySelectorAll('.remove-favorite').forEach(button => {
            button.addEventListener('click', (e) => {
                // Анимация исчезновения всех разбитых сердечек для этой игры сразу
                const gameTitle = e.target.dataset.title || button.dataset.title;
                const brokenIconsToFade = [];
                document.querySelectorAll('.remove-favorite').forEach(btn => {
                    if ((btn.dataset.title || '') === gameTitle) {
                        btn.querySelectorAll('.game__icon-broken').forEach(ic => {
                            ic.classList.add('icon-fade-out');
                            brokenIconsToFade.push({ic, btn});
                        });
                    }
                });
                // После завершения анимации у всех разбитых сердечек, только тогда удаляем из избранного
                let faded = 0;
                brokenIconsToFade.forEach(({ic, btn}) => {
                    ic.addEventListener('animationend', () => {
                        btn.style.display = 'none';
                        faded++;
                        if (faded === brokenIconsToFade.length) {
                            removeFromFavorites(gameTitle);
                        }
                    }, { once: true });
                });
            });
        });
    }

    // Функция удаления игры из избранного
    function removeFromFavorites(gameTitle) {
        let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        favorites = favorites.filter(game => game.title !== gameTitle);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        
        // Обновляем состояние иконки на главной странице, если она открыта
        const gameCard = document.querySelector(`.game__card:has(.game__title:contains("${gameTitle}"))`);
        if (gameCard) {
            const likeIcon = gameCard.querySelector('.game__icon');
            likeIcon.classList.remove('active');
        }
        
        // Находим и удаляем карточку игры из DOM
        const cardToRemove = document.querySelector(`.game__card:has([data-title="${gameTitle}"])`);
        if (cardToRemove) {
            cardToRemove.remove();
        }
        
        // Проверяем, остались ли еще игры в избранном
        const favoritesContainer = document.getElementById('favorites-container');
        if (favoritesContainer && favorites.length === 0) {
            favoritesContainer.innerHTML = '<p>У вас пока нет избранных игр</p>';
        }
    }

    // Вызываем функцию отображения избранного при загрузке страницы
    displayFavorites();

    // Обработчик переключения темы
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    themeToggle.addEventListener('click', () => {
      body.classList.toggle('dark-theme');
      themeToggle.classList.toggle('dark-theme');
    });

    // Mobile menu
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';

    // Feedback toggle functionality
    const feedbackToggle = document.querySelector('.feedback__toggle');
    const feedbackContent = document.querySelector('.feedback__content');

    feedbackToggle.addEventListener('click', () => {
        feedbackToggle.classList.toggle('active');
        feedbackContent.classList.toggle('active');
    });

    // Form submission handling
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        // Вставьте сюда ваш ключ Web3Forms (получить бесплатно: https://web3forms.com/)
        const WEB3FORMS_ACCESS_KEY = '2429fe20-1b21-42f4-b84f-a83f346e162d';

        feedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = feedbackForm.querySelector('.feedback__button');
            const originalText = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Отправка...';
            }

            try {
                const formData = new FormData(feedbackForm);
                // Обеспечиваем наличие обязательных полей name/email/message
                const name = formData.get('name') || feedbackForm.querySelector('input[placeholder="Ваше имя"]').value.trim();
                const email = formData.get('email') || feedbackForm.querySelector('input[type="email"]').value.trim();
                const message = formData.get('message') || feedbackForm.querySelector('textarea').value.trim();

                if (!name || !email || !message) {
                    alert('Пожалуйста, заполните все поля формы.');
                    return;
                }

                // Добавляем ключ и тему письма
                formData.set('name', name);
                formData.set('email', email);
                formData.set('message', message);
                formData.set('access_key', WEB3FORMS_ACCESS_KEY);
                formData.set('subject', 'Новый отзыв с сайта Fox Games');
                // Доп. поле для получателя (необязательно, т.к. задаётся в кабинете Web3Forms)
                formData.set('to', 'lilia0873.li@gmail.com');

                if (!WEB3FORMS_ACCESS_KEY) {
                    alert('Отправка не настроена: добавьте access_key Web3Forms в script.js.');
                    return;
                }

                const resp = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });

                const data = await resp.json();
                if (resp.ok && data && data.success) {
                    alert('Спасибо! Ваш отзыв отправлен.');
                    feedbackForm.reset();
                } else {
                    const err = (data && (data.message || data.detail)) || 'Не удалось отправить форму.';
                    alert('Ошибка отправки: ' + err);
                }
            } catch (error) {
                console.error('Feedback submit error:', error);
                alert('Произошла ошибка при отправке. Попробуйте позже.');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            }
        });
    }

    // Добавляем ссылки в мобильное меню
    const menuLinks = [
      { text: 'Контакты', href: '#contacts' },
      { text: 'Избранные игры', href: 'favorites.html' },
      { text: 'Отзывы', href: '#feedback' }
    ];

    menuLinks.forEach(link => {
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.text;
      mobileMenu.appendChild(a);
    });

    body.appendChild(mobileMenu);

    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
    });

    // Закрываем меню при клике на ссылку
    mobileMenu.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        menuToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
      }
    });
 
    // Дубликат формы отзывов удалён.
});
