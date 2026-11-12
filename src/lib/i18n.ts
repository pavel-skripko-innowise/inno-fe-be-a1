export type Messages = {
  siteTitle: string;
  siteDescription: string;
  catalogEyebrow: string;
  catalogTitle: string;
  catalogLead: string;
  catalogDescription: string;
  catalogEmpty: string;
  sectionEmpty: string;
  courseStats: (modules: number, lessons: number) => string;
  allSections: string;
  progress: string;
  searchCourse: string;
  nothingFound: string;
  markDone: string;
  markNotDone: string;
  done: string;
  back: string;
  next: string;
  onThisPage: string;
  lessonContents: string;
  courseMissing: string;
  backToSections: string;
  lessonMissing: string;
  lessonDescription: (course: string) => string;
  courseEmpty: string;
  openMenu: string;
  courseNav: string;
  coursesBrand: string;
  settings: string;
  theme: string;
  light: string;
  dark: string;
  rememberPosition: string;
  rememberPositionHint: string;
  resetPositions: string;
  positionsCleared: string;
  language: string;
  code: string;
  copy: string;
  copied: string;
  copyCode: string;
  missingFile: string;
  diagram: string;
  fullscreen: string;
  zoomIn: string;
  zoomOut: string;
  resetZoom: string;
  diagramError: (message: string) => string;
  drawingDiagram: string;
  pageMissingTitle: string;
  pageMissingBody: string;
  goHome: string;
  pageErrorTitle: string;
  pageErrorBody: string;
  tryAgain: string;
};

const ru: Messages = {
  siteTitle: "Курсы для сотрудников",
  siteDescription: "Удобный просмотр обучающих материалов",
  catalogEyebrow: "Обучение",
  catalogTitle: "Разделы",
  catalogLead: "Выберите раздел и курс, чтобы продолжить с того места, где остановились.",
  catalogDescription: "Разделы обучающих курсов для сотрудников команды.",
  catalogEmpty: "Разделы не найдены. Добавьте папку раздела с config.json в каталог контента.",
  sectionEmpty: "В этом разделе пока нет курсов.",
  courseStats: (modules, lessons) => `${modules} мод. · ${lessons} уроков`,
  allSections: "Все разделы",
  progress: "Прогресс",
  searchCourse: "Поиск по курсу",
  nothingFound: "Ничего не найдено",
  markDone: "Отметить пройденным",
  markNotDone: "Снять отметку",
  done: "Пройдено",
  back: "Назад",
  next: "Далее",
  onThisPage: "На странице",
  lessonContents: "Содержание урока",
  courseMissing: "Курс не найден",
  backToSections: "К разделам",
  lessonMissing: "Урок не найден",
  lessonDescription: (course) => `Урок курса «${course}»`,
  courseEmpty: "В курсе пока нет уроков.",
  openMenu: "Открыть меню",
  courseNav: "Навигация по курсу",
  coursesBrand: "Курсы",
  settings: "Настройки",
  theme: "Тема",
  light: "Светлая",
  dark: "Тёмная",
  rememberPosition: "Сохранять положение",
  rememberPositionHint: "Возвращает к месту, где вы остановились на странице",
  resetPositions: "Сбросить сохранённые положения",
  positionsCleared: "Сохранённые положения сброшены",
  language: "Язык",
  code: "Код",
  copy: "Копировать",
  copied: "Скопировано",
  copyCode: "Скопировать код",
  missingFile: "Файл не найден в курсе",
  diagram: "Диаграмма",
  fullscreen: "На весь экран",
  zoomIn: "Увеличить",
  zoomOut: "Уменьшить",
  resetZoom: "Сбросить масштаб",
  diagramError: (message) => `Ошибка в диаграмме: ${message}`,
  drawingDiagram: "Рисуем диаграмму…",
  pageMissingTitle: "Страница не найдена",
  pageMissingBody: "Такой страницы нет или её переместили.",
  goHome: "На главную",
  pageErrorTitle: "Страница не загрузилась",
  pageErrorBody: "Что-то пошло не так. Обновите страницу или вернитесь на главную.",
  tryAgain: "Попробовать снова",
};

const en: Messages = {
  siteTitle: "Courses for employees",
  siteDescription: "A comfortable way to read the training materials",
  catalogEyebrow: "Training",
  catalogTitle: "Sections",
  catalogLead: "Choose a section and a course to continue where you left off.",
  catalogDescription: "Training sections for the team.",
  catalogEmpty: "No sections found. Add a section folder with config.json to the content directory.",
  sectionEmpty: "This section has no courses yet.",
  courseStats: (modules, lessons) => `${modules} mod. · ${lessons} lessons`,
  allSections: "All sections",
  progress: "Progress",
  searchCourse: "Search the course",
  nothingFound: "Nothing found",
  markDone: "Mark as done",
  markNotDone: "Mark as not done",
  done: "Done",
  back: "Back",
  next: "Next",
  onThisPage: "On this page",
  lessonContents: "Lesson contents",
  courseMissing: "Course not found",
  backToSections: "Back to sections",
  lessonMissing: "Lesson not found",
  lessonDescription: (course) => `Lesson from “${course}”`,
  courseEmpty: "This course has no lessons yet.",
  openMenu: "Open menu",
  courseNav: "Course navigation",
  coursesBrand: "Courses",
  settings: "Settings",
  theme: "Theme",
  light: "Light",
  dark: "Dark",
  rememberPosition: "Remember position",
  rememberPositionHint: "Returns you to the place where you left the page",
  resetPositions: "Reset saved positions",
  positionsCleared: "Saved positions cleared",
  language: "Language",
  code: "Code",
  copy: "Copy",
  copied: "Copied",
  copyCode: "Copy code",
  missingFile: "File not found in the course",
  diagram: "Diagram",
  fullscreen: "Full screen",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  resetZoom: "Reset zoom",
  diagramError: (message) => `Diagram error: ${message}`,
  drawingDiagram: "Drawing the diagram…",
  pageMissingTitle: "Page not found",
  pageMissingBody: "The page you're looking for doesn't exist or has been moved.",
  goHome: "Go home",
  pageErrorTitle: "This page didn't load",
  pageErrorBody: "Something went wrong on our end. You can try refreshing or head back home.",
  tryAgain: "Try again",
};

const catalogs: Record<string, Messages> = { ru, en };

export function messagesFor(locale: string): Messages {
  return catalogs[locale] ?? catalogs.en ?? ru;
}

const labels: Record<string, string> = { ru: "Русский", en: "English" };

export function localeLabel(locale: string) {
  return labels[locale] ?? locale.toUpperCase();
}
