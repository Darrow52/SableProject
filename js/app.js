/*
  Мобильное меню (бургер)

  Как это устроено:
  - На мобильном (до 767px) список ссылок <nav class="header-menu"> скрыт
    через CSS (display: none) — см. css/responsive.css.
  - Кнопка-бургер добавляет шапке класс "header--open".
  - CSS видит этот класс и показывает меню (display: block),
    а три полоски бургера превращаются в крестик.
  То есть JS здесь только переключает класс, а всё «как выглядит» — в CSS.
*/

// Находим на странице шапку и кнопку-бургер.
// querySelector возвращает ПЕРВЫЙ элемент, подходящий под CSS-селектор.
const header = document.querySelector('.header');
const burger = document.querySelector('.header-burger');

/*
  Функция, которая открывает или закрывает меню.
  isOpen — true (открыть) или false (закрыть).
  Всё переключение собрано в одном месте, чтобы клик, Esc и клик
  по ссылке вели себя одинаково и ничего не рассинхронизировалось.
*/
function setMenuOpen(isOpen) {
  // toggle(класс, условие): если условие true — класс добавится,
  // если false — уберётся. От этого класса зависит CSS меню.
  header.classList.toggle('header--open', isOpen);

  // aria-expanded сообщает скринридеру (программе для незрячих),
  // открыто меню или нет. Атрибут хранит строку, поэтому String(isOpen)
  // превращает true/false в "true"/"false".
  burger.setAttribute('aria-expanded', String(isOpen));

  // У кнопки нет текста, только иконка, поэтому её название задано в aria-label.
  // Меняем его, чтобы скринридер читал правильное действие.
  // Запись "условие ? A : B" значит: если условие верно — A, иначе — B.
  burger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
}

// Клик по бургеру: если меню сейчас открыто — закрываем, если закрыто — открываем.
// contains проверяет, есть ли у шапки класс, а "!" переворачивает результат.
burger.addEventListener('click', () => {
  setMenuOpen(!header.classList.contains('header--open'));
});

// Закрытие меню клавишей Esc — так привыкли пользователи с клавиатурой.
// Слушаем нажатия на всём документе, потому что фокус может быть где угодно.
document.addEventListener('keydown', (event) => {
  // event.key — название нажатой клавиши. Реагируем только на Esc
  // и только когда меню действительно открыто.
  if (event.key === 'Escape' && header.classList.contains('header--open')) {
    setMenuOpen(false);

    // Возвращаем фокус на бургер, чтобы пользователь с клавиатуры
    // не «потерялся» на странице после закрытия меню.
    burger.focus();
  }
});

// После клика по пункту меню закрываем его: пользователь уже выбрал,
// куда идти, и открытое меню только закрывало бы страницу.
// querySelectorAll находит ВСЕ ссылки меню, forEach перебирает их по одной
// и каждой вешает обработчик клика.
header.querySelectorAll('.header-menu-link').forEach((link) => {
  link.addEventListener('click', () => setMenuOpen(false));
});

/*
  Animation

*/

const revealElements = document.querySelectorAll('[data-reveal]');
const STAGGER_STEP = 120;

document.querySelectorAll('[data-reveal-stagger]').forEach((container) => {
  const children = container.querySelectorAll(':scope > [data-reveal]');

  children.forEach((child, index) => {
    child.style.setProperty('--reveal-delay', `${index * STAGGER_STEP}ms`);
  });
});

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -12% 0px',
    threshold: 0,
  });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

/*
  Cashback bar
*/
const cashback = document.querySelector('.cashback');

if (cashback) {
  const cashbackItems = [...cashback.querySelectorAll('.cashback__item')];
  const cashbackVisuals = [...cashback.querySelectorAll('.cashback__visual')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let activeIndex = 0;

  function setActiveCashback(index) {
    activeIndex = index;

    cashbackItems.forEach((item, i) => {
      const isActive = i === index;
      item.classList.toggle('cashback__item--active', isActive);
      item.querySelector('.cashback__trigger').setAttribute('aria-pressed', String(isActive));
    });

    cashbackVisuals.forEach((visual, i) => {
      const isActive = i === index;
      visual.classList.toggle('cashback__visual--active', isActive);
      visual.setAttribute('aria-hidden', String(!isActive));
    });
  }
  cashbackItems.forEach((item, i) => {
    item.querySelector('.cashback__trigger').addEventListener('click', () => {
      setActiveCashback(i);
    });
  });

  cashback.addEventListener('animationend', (event) => {
    if (event.animationName !== 'cashback-progress' || reduceMotion.matches) {
      return;
    }
    setActiveCashback((activeIndex + 1) % cashbackItems.length);
  });


  if ('IntersectionObserver' in window) {
    const cashbackObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        cashback.classList.toggle('cashback--running', entry.isIntersecting);
      });
    }, { threshold: 0.4 }); // секция видна хотя бы на 40%
    cashbackObserver.observe(cashback);
  } else {
    cashback.classList.add('cashback--running');
  }
}
