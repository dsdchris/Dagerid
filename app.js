// app.js

// =====================
// Variables globales
// =====================
let books = JSON.parse(localStorage.getItem('books')) || [];
let progressLogs = JSON.parse(localStorage.getItem('progressLogs')) || {};
let achievements = JSON.parse(localStorage.getItem('achievements')) || [];
let userStats = JSON.parse(localStorage.getItem('userStats')) || {
  booksRead: 0,
  pagesRead: 0,
  totalDays: 0,
  startDates: {}
};
let userProfile = JSON.parse(localStorage.getItem('userProfile')) || {
  name: '',
  nickname: '',
};
let darkMode = localStorage.getItem('darkMode') === 'true';

let currentBookIdForProgress = null;

// =====================
// Funciones de inicialización
// =====================
function init() {
  applyTheme();
  loadProfileInfo();
  setupEventListeners();
  renderDashboard();
}

function setupEventListeners() {
  // Navegación principal (escritorio)
  document.getElementById('nav-dashboard').addEventListener('click', () => showSection('dashboard'));
  document.getElementById('nav-libros').addEventListener('click', () => showSection('libros'));
  document.getElementById('nav-logros').addEventListener('click', () => showSection('logros'));
  document.getElementById('nav-estadisticas').addEventListener('click', () => showSection('estadisticas'));
  document.getElementById('nav-perfil').addEventListener('click', () => showSection('perfil'));

  // Navegación móvil (menú desplegable)
  document.getElementById('nav-dashboard-m').addEventListener('click', () => { toggleMobileMenu(false); showSection('dashboard'); });
  document.getElementById('nav-libros-m').addEventListener('click', () => { toggleMobileMenu(false); showSection('libros'); });
  document.getElementById('nav-logros-m').addEventListener('click', () => { toggleMobileMenu(false); showSection('logros'); });
  document.getElementById('nav-estadisticas-m').addEventListener('click', () => { toggleMobileMenu(false); showSection('estadisticas'); });
  document.getElementById('nav-perfil-m').addEventListener('click', () => { toggleMobileMenu(false); showSection('perfil'); });

  // Botón hamburguesa
  document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    toggleMobileMenu();
  });

  // Formulario Agregar libro
  document.getElementById('add-book-form').addEventListener('submit', handleAddBook);

  // Formulario Editar libro
  document.getElementById('edit-book-form').addEventListener('submit', handleEditBook);

  // Botones de cierre de modales
  // Agregar libro
  document.querySelectorAll('#modal-add-book button[onclick="closeAddBookModal()"]').forEach(btn => {
    btn.addEventListener('click', closeAddBookModal);
  });
  // Editar libro
  document.querySelectorAll('#modal-edit-book button[onclick="closeEditBookModal()"]').forEach(btn => {
    btn.addEventListener('click', closeEditBookModal);
  });
  // Actualizar progreso
  document.querySelectorAll('#modal-update-progress button[onclick="closeUpdateProgressModal()"]').forEach(btn => {
    btn.addEventListener('click', closeUpdateProgressModal);
  });
  // Logro desbloqueado
  document.querySelectorAll('#modal-achievement button[onclick="closeAchievementModal()"]').forEach(btn => {
    btn.addEventListener('click', closeAchievementModal);
  });

  // Botón perfil: guardar datos
  document.getElementById('btn-save-profile').addEventListener('click', saveProfileInfo);

  // Botón Toggle Tema
  document.getElementById('toggle-theme').addEventListener('click', () => {
    darkMode = !darkMode;
    applyTheme();
  });
}

// =====================
// Funciones de UI: navegación y visibilidad de secciones
// =====================
function showSection(id) {
  ['dashboard', 'libros', 'logros', 'estadisticas', 'perfil'].forEach(sec => {
    document.getElementById(sec).classList.add('hidden');
  });
  document.getElementById(id).classList.remove('hidden');

  // Volver a renderizar la sección activa
  if (id === 'dashboard') renderDashboard();
  if (id === 'libros') renderBooks();
  if (id === 'logros') renderAchievements();
  if (id === 'estadisticas') renderStatistics();
  if (id === 'perfil') { /* no requiere render extra */ }
}

// Mostrar/Ocultar menú móvil
function toggleMobileMenu(forceState = null) {
  const menu = document.getElementById('mobile-menu');
  if (forceState === true) {
    menu.classList.remove('hidden');
  } else if (forceState === false) {
    menu.classList.add('hidden');
  } else {
    menu.classList.toggle('hidden');
  }
}

// =====================
// Agregar / Editar / Borrar libros
// =====================
function handleAddBook(e) {
  e.preventDefault();
  const title = document.getElementById('book-title').value.trim();
  const author = document.getElementById('book-author').value.trim();
  const pages = parseInt(document.getElementById('book-pages').value);
  const genre = document.getElementById('book-genre').value.trim();
  const cover = document.getElementById('book-cover').value.trim();

  const id = Date.now().toString();
  const newBook = {
    id,
    title,
    author,
    pages,
    genre,
    cover,
    currentPage: 0,
    createdAt: new Date().toISOString(),
    finishedAt: null
  };
  books.push(newBook);
  localStorage.setItem('books', JSON.stringify(books));
  progressLogs[id] = [];
  localStorage.setItem('progressLogs', JSON.stringify(progressLogs));

  addRecentActivity(`Agregaste el libro "${title}"`);
  checkAchievements();

  closeAddBookModal();
  renderBooks();
  renderDashboard();
}

function openAddBookModal() {
  document.getElementById('modal-add-book').classList.remove('hidden');
  clearAddBookForm();
}

function closeAddBookModal() {
  document.getElementById('modal-add-book').classList.add('hidden');
  clearAddBookForm();
}

function clearAddBookForm() {
  document.getElementById('add-book-form').reset();
  document.getElementById('api-status').textContent = '';
}

// Editar libro
function openEditBookModal(bookId) {
  const book = books.find(b => b.id === bookId);
  if (!book) return;
  document.getElementById('edit-book-id').value = book.id;
  document.getElementById('edit-book-title').value = book.title;
  document.getElementById('edit-book-author').value = book.author;
  document.getElementById('edit-book-pages').value = book.pages;
  document.getElementById('edit-book-genre').value = book.genre;
  document.getElementById('edit-book-cover').value = book.cover;

  document.getElementById('modal-edit-book').classList.remove('hidden');
}

function closeEditBookModal() {
  document.getElementById('modal-edit-book').classList.add('hidden');
}

function handleEditBook(e) {
  e.preventDefault();
  const id = document.getElementById('edit-book-id').value;
  const title = document.getElementById('edit-book-title').value.trim();
  const author = document.getElementById('edit-book-author').value.trim();
  const pages = parseInt(document.getElementById('edit-book-pages').value);
  const genre = document.getElementById('edit-book-genre').value.trim();
  const cover = document.getElementById('edit-book-cover').value.trim();

  const book = books.find(b => b.id === id);
  if (!book) return;

  // Si se redujo el número total de páginas por debajo de currentPage, ajustamos currentPage
  if (pages < book.currentPage) {
    book.currentPage = pages;
  }

  book.title = title;
  book.author = author;
  book.pages = pages;
  book.genre = genre;
  book.cover = cover;

  localStorage.setItem('books', JSON.stringify(books));
  addRecentActivity(`Editaste el libro "${title}"`);

  closeEditBookModal();
  renderBooks();
  renderDashboard();
}

function deleteBook(bookId) {
  if (!confirm('¿Estás seguro de eliminar este libro? Esta acción no se puede deshacer.')) return;
  const bookIndex = books.findIndex(b => b.id === bookId);
  if (bookIndex === -1) return;
  const removed = books.splice(bookIndex, 1)[0];
  delete progressLogs[bookId];
  localStorage.setItem('books', JSON.stringify(books));
  localStorage.setItem('progressLogs', JSON.stringify(progressLogs));
  addRecentActivity(`Eliminaste el libro "${removed.title}"`);
  renderBooks();
  renderDashboard();
}

// =====================
// Buscar Info desde Google Books API
// =====================
function fetchBookInfo() {
  const title = document.getElementById('book-title').value.trim();
  if (!title) return;
  const statusEl = document.getElementById('api-status');
  statusEl.textContent = 'Buscando...';

  fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:"${encodeURIComponent(title)}"`)
    .then(res => res.json())
    .then(data => {
      if (data.totalItems > 0) {
        const info = data.items[0].volumeInfo;
        document.getElementById('book-title').value = info.title || title;
        document.getElementById('book-author').value = (info.authors && info.authors.join(', ')) || '';
        document.getElementById('book-pages').value = info.pageCount || '';
        document.getElementById('book-genre').value = (info.categories && info.categories[0]) || '';
        document.getElementById('book-cover').value = (info.imageLinks && info.imageLinks.thumbnail) || '';
        statusEl.textContent = 'Información cargada desde API.';
      } else {
        statusEl.textContent = 'No se encontró el libro. Ingresa información manualmente.';
      }
    })
    .catch(err => {
      console.error(err);
      statusEl.textContent = 'Error al obtener datos de la API.';
    });
}

// =====================
// Renderización de secciones
// =====================

// Dashboard
function renderDashboard() {
  const container = document.getElementById('active-books-dashboard');
  container.innerHTML = '';

  // Tarjetas de libros activos
  books.filter(b => !b.finishedAt).forEach(book => {
    const porcentaje = ((book.currentPage / book.pages) * 100).toFixed(1);

    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl shadow-md p-4 flex flex-col justify-between hover:shadow-lg transition';

    card.innerHTML = `
      <div>
        <img src="${book.cover || 'https://img.icons8.com/ios-filled/100/000000/book.png'}" alt="Portada" class="w-full h-40 object-cover rounded-lg mb-4" />
        <h3 class="text-lg font-semibold">${book.title}</h3>
        <p class="text-gray-600">${book.author || 'Autor desconocido'}</p>
      </div>
      <div class="mt-4">
        <div class="flex items-center justify-between">
          <span>${porcentaje || 0}%</span>
          <span>${book.currentPage}/${book.pages}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3 mt-1">
          <div class="bg-green-600 h-3 rounded-full" style="width: ${porcentaje}%; transition: width 0.5s;"></div>
        </div>
      </div>
      <div class="mt-4 flex space-x-2">
        <button onclick="openUpdateProgressModal('${book.id}')" class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Actualizar</button>
        <button onclick="openEditBookModal('${book.id}')" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Editar</button>
        <button onclick="deleteBook('${book.id}')" class="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Borrar</button>
      </div>
    `;
    container.appendChild(card);
  });

  // Card para agregar nuevo libro
  const addCard = document.createElement('div');
  addCard.id = 'add-book-card';
  addCard.className = 'flex items-center justify-center border-2 border-dashed border-gray-400 rounded-2xl h-48 hover:border-gray-600 cursor-pointer';
  addCard.setAttribute('onclick', 'openAddBookModal()');
  addCard.innerHTML = `
    <div class="text-center text-gray-500">
      <div class="text-4xl">+</div>
      <div class="mt-2">Agregar libro</div>
    </div>
  `;
  container.appendChild(addCard);
}

// Mis Libros
function renderBooks() {
  const activeContainer = document.getElementById('active-books-list');
  const finishedContainer = document.getElementById('finished-books-list');
  activeContainer.innerHTML = '';
  finishedContainer.innerHTML = '';

  books.forEach(book => {
    if (!book.finishedAt) {
      const porcentaje = ((book.currentPage / book.pages) * 100).toFixed(1);

      const card = document.createElement('div');
      card.className = 'bg-white rounded-2xl shadow-md p-4 flex flex-col hover:shadow-lg transition';
      card.innerHTML = `
        <div class="flex items-center space-x-4">
          <img src="${book.cover || 'https://img.icons8.com/ios-filled/80/000000/book.png'}" alt="Portada" class="w-16 h-20 object-cover rounded-lg" />
          <div class="flex-1">
            <h3 class="text-lg font-semibold">${book.title}</h3>
            <p class="text-gray-600">${book.author || 'Autor desconocido'}</p>
            <p class="text-sm text-gray-700 mt-1">${porcentaje}% completado</p>
          </div>
        </div>
        <div class="mt-4 flex space-x-2">
          <button onclick="openUpdateProgressModal('${book.id}')" class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Actualizar</button>
          <button onclick="openEditBookModal('${book.id}')" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Editar</button>
          <button onclick="deleteBook('${book.id}')" class="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Borrar</button>
        </div>
      `;
      activeContainer.appendChild(card);
    } else {
      const item = document.createElement('div');
      item.className = 'bg-white rounded-lg shadow-md p-4 flex justify-between items-center';
      item.innerHTML = `
        <div class="flex items-center space-x-4">
          <img src="${book.cover || 'https://img.icons8.com/ios-filled/60/000000/book.png'}" alt="Portada" class="w-12 h-16 object-cover rounded-lg" />
          <div>
            <h3 class="text-lg font-semibold">${book.title}</h3>
            <p class="text-gray-600">${book.author || 'Autor desconocido'}</p>
          </div>
        </div>
        <span class="text-gray-700">Terminado: ${new Date(book.finishedAt).toLocaleDateString()}</span>
      `;
      finishedContainer.appendChild(item);
    }
  });
}

// =====================
// Modal Actualizar Progreso
// =====================
function openUpdateProgressModal(bookId) {
  currentBookIdForProgress = bookId;
  const book = books.find(b => b.id === bookId);
  document.getElementById('update-progress-title').textContent = `Actualizar progreso: ${book.title}`;
  document.getElementById('progress-pages-info').textContent = `${book.currentPage}/${book.pages}`;
  document.getElementById('current-page-input').value = book.currentPage;
  document.getElementById('progress-error').classList.add('hidden');
  document.getElementById('modal-update-progress').classList.remove('hidden');
}

function closeUpdateProgressModal() {
  document.getElementById('modal-update-progress').classList.add('hidden');
  currentBookIdForProgress = null;
}

function submitProgressUpdate() {
  const input = document.getElementById('current-page-input');
  const val = parseInt(input.value);
  const book = books.find(b => b.id === currentBookIdForProgress);
  if (!book) return;

  if (val < 0 || val > book.pages) {
    document.getElementById('progress-error').classList.remove('hidden');
    return;
  }
  document.getElementById('progress-error').classList.add('hidden');

  const prevPage = book.currentPage;
  book.currentPage = val;

  const today = new Date().toISOString().split('T')[0];
  if (!progressLogs[book.id]) progressLogs[book.id] = [];
  progressLogs[book.id].push({ date: today, page: val });
  localStorage.setItem('progressLogs', JSON.stringify(progressLogs));

  // Si termina el libro
  if (val === book.pages && !book.finishedAt) {
    book.finishedAt = new Date().toISOString();
    userStats.booksRead += 1;
    userStats.totalDays += calculateDaysDifference(book.createdAt, book.finishedAt);
    addRecentActivity(`Terminaste el libro "${book.title}"`);
  } else {
    addRecentActivity(`Actualizaste "${book.title}" a la página ${val}`);
  }
  localStorage.setItem('books', JSON.stringify(books));

  // Actualizar páginas leídas totales
  const pagesAdded = val - prevPage;
  if (pagesAdded > 0) {
    userStats.pagesRead += pagesAdded;
    if (!userStats.startDates[today]) userStats.startDates[today] = 0;
    userStats.startDates[today] += pagesAdded;
  }
  localStorage.setItem('userStats', JSON.stringify(userStats));

  checkAchievements();
  closeUpdateProgressModal();
  renderBooks();
  renderDashboard();
}

// =====================
// Funciones auxiliares
// =====================

// Calcular diferencia en días
function calculateDaysDifference(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate - startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Actividades recientes
function addRecentActivity(text) {
  const ul = document.getElementById('recent-activities');
  const li = document.createElement('li');
  li.textContent = `${new Date().toLocaleDateString()}: ${text}`;
  ul.prepend(li);
  if (ul.children.length > 5) ul.removeChild(ul.lastChild);
}

// =====================
// Sistema de Logros
// =====================
const achievementDefinitions = [
  { id: 'primer-capitulo',        name: 'Primer capítulo',           condition: () => books.length >= 1,                                                          icon: 'https://img.icons8.com/?size=100&id=Fqihn9MGe0kQ&format=png&color=000000' },
  { id: 'devora-paginas',         name: 'Devora páginas',            condition: () => userStats.booksRead >= 5,                                                    icon: 'https://img.icons8.com/emoji/96/000000/fire.png' },
  { id: 'ojos-sabio',             name: 'Ojos de sabio',             condition: () => userStats.booksRead >= 10,                                                   icon: 'https://img.icons8.com/emoji/96/000000/owl-emoji.png' },
  { id: 'mente-infinita',         name: 'Mente infinita',            condition: () => userStats.booksRead >= 20,                                                   icon: 'https://img.icons8.com/?size=100&id=RZ3Ux64yROj8&format=png&color=000000' },
  { id: 'biblioteca-andante',      name: 'Biblioteca andante',        condition: () => userStats.booksRead >= 50,                                                   icon: 'https://img.icons8.com/?size=100&id=hSXbLeVb1Tht&format=png&color=000000' },
  { id: 'explorador-mundos',      name: 'Explorador de mundos',      condition: () => new Set(books.map(b => b.genre).filter(g => g)).size >= 3,                     icon: 'https://img.icons8.com/emoji/96/000000/globe-showing-americas-emoji.png' },
  { id: 'lector-nocturno',        name: 'Lector nocturno',           condition: () => checkConsecutiveDays(7),                                                      icon: 'https://img.icons8.com/?size=100&id=IWI3acCVFuif&format=png&color=000000' },
  { id: 'desconectado-mundo',     name: 'Desconectado del mundo',    condition: () => checkOneDayFinish(),                                                         icon: 'https://img.icons8.com/emoji/96/000000/sunrise-emoji.png' },
  { id: 'anotador-ideas',         name: 'Anotador de ideas',         condition: () => books.filter(b => !b.finishedAt).length >= 3,                                icon: 'https://img.icons8.com/emoji/96/000000/memo-emoji.png' },
  { id: 'mentilibros-pro-max',    name: 'Mentilibros pro max',       condition: () => checkBooksInOneDay(12),                                                       icon: 'https://img.icons8.com/?size=100&id=7TMR1q33FS7K&format=png&color=000000' },
];

function checkAchievements() {
  achievementDefinitions.forEach(def => {
    if (def.condition() && !achievements.includes(def.id)) {
      achievements.push(def.id);
      localStorage.setItem('achievements', JSON.stringify(achievements));
      showAchievementModal(def);
    }
  });
  renderAchievements();
}

function showAchievementModal(def) {
  document.getElementById('achievement-icon').src = def.icon;
  document.getElementById('achievement-text').textContent = `¡Has desbloqueado: ${def.name}!`;
  document.getElementById('modal-achievement').classList.remove('hidden');
}

function closeAchievementModal() {
  document.getElementById('modal-achievement').classList.add('hidden');
}

// Verificar días consecutivos con lectura
function checkConsecutiveDays(n) {
  const dates = Object.keys(userStats.startDates).sort();
  if (dates.length === 0) return false;
  let maxStreak = 1;
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (curr - prev) / (1000 * 60 * 60 * 24);
    if (diff === 1 && userStats.startDates[dates[i]] > 0) {
      streak++;
    } else {
      streak = 1;
    }
    if (streak > maxStreak) maxStreak = streak;
  }
  return maxStreak >= n;
}

// Verificar si se terminó al menos un libro en un día
function checkOneDayFinish() {
  const finishDates = books.filter(b => b.finishedAt).map(b => b.finishedAt.split('T')[0]);
  const counts = finishDates.reduce((acc, date) => { acc[date] = (acc[date] || 0) + 1; return acc; }, {});
  return Object.values(counts).some(count => count >= 1);
}

// Verificar cuántos libros se terminaron en un mismo día
function checkBooksInOneDay(x) {
  const finishDates = books.filter(b => b.finishedAt).map(b => b.finishedAt.split('T')[0]);
  const counts = finishDates.reduce((acc, date) => { acc[date] = (acc[date] || 0) + 1; return acc; }, {});
  return Object.values(counts).some(count => count >= x);
}

// Render Logros
function renderAchievements() {
  const grid = document.getElementById('achievements-grid');
  grid.innerHTML = '';
  achievementDefinitions.forEach(def => {
    const div = document.createElement('div');
    const unlocked = achievements.includes(def.id);
    div.className = `flex flex-col items-center p-4 rounded-lg ${unlocked ? 'bg-green-100' : 'bg-gray-200 opacity-50'}`;
    div.innerHTML = `
      <img src="${def.icon}" alt="${def.name}" class="w-20 h-20 ${unlocked ? '' : 'grayscale'} mb-2" />
      <span class="font-semibold">${def.name}</span>
    `;
    grid.appendChild(div);
  });
}

// =====================
// Estadísticas
// =====================
function renderStatistics() {
  document.getElementById('stats-books-read').textContent = userStats.booksRead;
  document.getElementById('stats-pages-read').textContent = userStats.pagesRead;
  const avg = userStats.booksRead > 0 ? (userStats.totalDays / userStats.booksRead).toFixed(1) : 0;
  document.getElementById('stats-avg-days').textContent = avg;

  // Gráfica de páginas por día (últimos 7 días)
  const ctx = document.getElementById('pages-chart').getContext('2d');
  const last7 = getLastNDays(7);
  const dataValues = last7.map(date => userStats.startDates[date] || 0);

  // Destruye el gráfico previo si existía (para renderizar de nuevo)
  if (window.pagesChartInstance) {
    window.pagesChartInstance.destroy();
  }
  window.pagesChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: last7,
      datasets: [{
        label: 'Páginas leídas',
        data: dataValues
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  // Mostrar libros finalizados recientes
  const recentList = document.getElementById('recent-finished-list');
  recentList.innerHTML = '';
  const finished = books
    .filter(b => b.finishedAt)
    .sort((a, b) => new Date(b.finishedAt) - new Date(a.finishedAt))
    .slice(0, 5);

  finished.forEach(book => {
    const li = document.createElement('li');
    li.className = 'flex items-center space-x-4 bg-white p-2 rounded-lg shadow-sm';
    li.innerHTML = `
      <img src="${book.cover || 'https://img.icons8.com/ios-filled/60/000000/book.png'}" alt="Portada" class="w-12 h-16 object-cover rounded-lg" />
      <div>
        <h3 class="font-semibold">${book.title}</h3>
        <p class="text-gray-600">Terminado: ${new Date(book.finishedAt).toLocaleDateString()}</p>
      </div>
    `;
    recentList.appendChild(li);
  });
}

// Obtener últimos N días en formato ISO (YYYY-MM-DD)
function getLastNDays(n) {
  const result = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push(d.toISOString().split('T')[0]);
  }
  return result;
}

// =====================
// Perfil de Usuario
// =====================
function loadProfileInfo() {
  if (userProfile.name) {
    document.getElementById('input-user-name').value = userProfile.name;
    document.getElementById('display-user-name').textContent = userProfile.name;
  }
  if (userProfile.nickname) {
    document.getElementById('input-user-nickname').value = userProfile.nickname;
    document.getElementById('display-user-nickname').textContent = `“${userProfile.nickname}”`;
  }
}

function saveProfileInfo() {
  const name = document.getElementById('input-user-name').value.trim();
  const nickname = document.getElementById('input-user-nickname').value.trim();

  userProfile.name = name;
  userProfile.nickname = nickname;
  localStorage.setItem('userProfile', JSON.stringify(userProfile));

  document.getElementById('display-user-name').textContent = name || 'Usuario';
  document.getElementById('display-user-nickname').textContent = nickname ? `“${nickname}”` : '“Apodo”';

  addRecentActivity('Perfil actualizado');
  alert('Perfil guardado correctamente.');
}

// =====================
// Tema Claro / Oscuro
// =====================
function applyTheme() {
  if (darkMode) {
    document.documentElement.classList.add('dark');
    document.body.classList.add('bg-gray-900', 'text-gray-100');
    document.getElementById('toggle-theme').textContent = 'Cambiar a Modo Claro';
  } else {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('bg-gray-900', 'text-gray-100');
    document.getElementById('toggle-theme').textContent = 'Cambiar a Modo Oscuro';
  }
  localStorage.setItem('darkMode', darkMode);
}

// =====================
// Búsqueda en Google Books (desde Add Book)
// =====================
// (Ya declarado arriba: fetchBookInfo)

// =====================
// Inicializar todo al cargar la página
// =====================
window.addEventListener('DOMContentLoaded', init);
