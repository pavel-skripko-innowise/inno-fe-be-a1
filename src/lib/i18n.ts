export type Messages = {
  siteTitle: string;
  siteDescription: string;
  catalogEyebrow: string;
  catalogTitle: string;
  catalogLead: string;
  catalogDescription: string;
  catalogEmpty: string;
  sectionEmpty: string;
  modulesCount: (count: number) => string;
  lessonsCount: (count: number) => string;
  continueLearning: string;
  continueAction: string;
  startAction: string;
  courseDone: string;
  allSections: string;
  progress: string;
  lessonsDone: (done: number, total: number) => string;
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
  introduction: string;
  courseProgram: string;
  courseNoModules: string;
  moduleListItem: (index: number, lessons: number) => string;
  moduleChoose: string;
  moduleCounter: (current: number, total: number) => string;
  moduleOpenFirst: string;
  moduleNoPage: string;
  previousModule: string;
  nextModule: string;
  moduleMissing: string;
  openMenu: string;
  courseNav: string;
  toggleMenu: string;
  toggleLessons: string;
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

function ruPlural(count: number, one: string, few: string, many: string) {
  const tens = count % 100;
  const units = count % 10;
  if (tens >= 11 && tens <= 14) return many;
  if (units === 1) return one;
  if (units >= 2 && units <= 4) return few;
  return many;
}

const ru: Messages = {
  siteTitle: "Курсы для сотрудников",
  siteDescription: "Удобный просмотр обучающих материалов",
  catalogEyebrow: "Обучение",
  catalogTitle: "Разделы",
  catalogLead: "Выберите раздел и курс, чтобы продолжить с того места, где остановились.",
  catalogDescription: "Разделы обучающих курсов для сотрудников команды.",
  catalogEmpty: "Разделы не найдены. Добавьте папку раздела с config.json в каталог контента.",
  sectionEmpty: "В этом разделе пока нет курсов.",
  modulesCount: (count) => `${count} ${ruPlural(count, "модуль", "модуля", "модулей")}`,
  lessonsCount: (count) => `${count} ${ruPlural(count, "урок", "урока", "уроков")}`,
  continueLearning: "Продолжить обучение",
  continueAction: "Продолжить",
  startAction: "Начать",
  courseDone: "Пройден",
  allSections: "Все разделы",
  progress: "Прогресс",
  lessonsDone: (done, total) => `Пройдено ${done} из ${total}`,
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
  introduction: "Введение",
  courseProgram: "Программа курса",
  courseNoModules: "В этом курсе пока нет модулей.",
  moduleListItem: (index, lessons) => `Модуль ${index} · ${lessons} материалов`,
  moduleChoose: "Выберите модуль, чтобы открыть его материалы.",
  moduleCounter: (current, total) => `Модуль ${current} из ${total}`,
  moduleOpenFirst: "Перейти к первому материалу",
  moduleNoPage: "Материалы этого модуля собраны в список. Выберите тему, чтобы открыть её.",
  previousModule: "Предыдущий модуль",
  nextModule: "Следующий модуль",
  moduleMissing: "Модуль не найден",
  openMenu: "Открыть меню",
  courseNav: "Навигация по курсу",
  toggleMenu: "Свернуть или развернуть меню",
  toggleLessons: "Показать или скрыть уроки",
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
  catalogEmpty:
    "No sections found. Add a section folder with config.json to the content directory.",
  sectionEmpty: "This section has no courses yet.",
  modulesCount: (count) => `${count} ${count === 1 ? "module" : "modules"}`,
  lessonsCount: (count) => `${count} ${count === 1 ? "lesson" : "lessons"}`,
  continueLearning: "Continue learning",
  continueAction: "Continue",
  startAction: "Start",
  courseDone: "Completed",
  allSections: "All sections",
  progress: "Progress",
  lessonsDone: (done, total) => `${done} of ${total} done`,
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
  introduction: "Introduction",
  courseProgram: "Course program",
  courseNoModules: "This course has no modules yet.",
  moduleListItem: (index, lessons) => `Module ${index} · ${lessons} materials`,
  moduleChoose: "Choose a module to open its materials.",
  moduleCounter: (current, total) => `Module ${current} of ${total}`,
  moduleOpenFirst: "Open the first material",
  moduleNoPage: "The materials in this module are listed below. Choose a topic to open it.",
  previousModule: "Previous module",
  nextModule: "Next module",
  moduleMissing: "Module not found",
  openMenu: "Open menu",
  courseNav: "Course navigation",
  toggleMenu: "Collapse or expand the menu",
  toggleLessons: "Show or hide lessons",
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
