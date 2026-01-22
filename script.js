const columns = document.querySelectorAll('.column');
const trash = document.getElementById('trash');
const addBtn = document.getElementById('addCardBtn');

let draggedCard = null;

// ---------- СОЗДАНИЕ КАРТОЧКИ ----------
function createCard(text, columnName) {
  const card = document.createElement('div');
  card.className = 'card';
  card.draggable = true;
  card.textContent = text;

  addDragEvents(card);

  document.querySelector(`[data-column="${columnName}"]`).appendChild(card);
  saveState();
}

// ---------- DRAG EVENTS ----------
function addDragEvents(card) {
  card.addEventListener('dragstart', () => {
    draggedCard = card;
    card.classList.add('dragging');
  });

  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
    draggedCard = null;
    saveState();
  });
}

// ---------- КОЛОНКИ + ПЛАВНОЕ ВСТАВЛЕНИЕ ----------
columns.forEach(column => {
  column.addEventListener('dragover', e => {
    e.preventDefault();
    const after = getDragAfterElement(column, e.clientY);
    if (!after) {
      column.appendChild(draggedCard);
    } else {
      column.insertBefore(draggedCard, after);
    }
  });
});

// ---------- КОРЗИНА ----------
trash.addEventListener('dragover', e => e.preventDefault());
trash.addEventListener('drop', () => {
  if (draggedCard) {
    draggedCard.remove();
    saveState();
  }
});

// ---------- СОРТИРОВКА ----------
function getDragAfterElement(container, y) {
  const cards = [...container.querySelectorAll('.card:not(.dragging)')];

  return cards.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;

    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    }
    return closest;
  }, { offset: -Infinity }).element;
}

// ---------- ДОБАВЛЕНИЕ КАРТОЧКИ ----------
addBtn.addEventListener('click', () => {
  const text = prompt('Название карточки');
  if (text) createCard(text, 'todo');
});

// ---------- LOCAL STORAGE ----------
function saveState() {
  const data = {};
  columns.forEach(col => {
    const name = col.dataset.column;
    data[name] = [...col.querySelectorAll('.card')].map(card => card.textContent);
  });
  localStorage.setItem('board', JSON.stringify(data));
}

function loadState() {
  const data = JSON.parse(localStorage.getItem('board'));
  if (!data) {
    createCard('Сделать ДЗ', 'todo');
    createCard('Выучить JS', 'todo');
    createCard('Проект', 'progress');
    return;
  }

  Object.keys(data).forEach(col => {
    data[col].forEach(text => createCard(text, col));
  });
}

loadState();
