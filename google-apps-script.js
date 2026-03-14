// ============================================================
// Google Apps Script для записи данных RSVP формы в Google Sheets
// 
// ИНСТРУКЦИЯ ПО УСТАНОВКЕ:
//
// 1. Создайте новую Google Таблицу (https://sheets.new)
//
// 2. В первой строке (заголовки) впишите:
//    A1: Дата
//    B1: ФИО
//    C1: Контакт
//    D1: Присутствие
//    E1: Кол-во гостей
//    F1: Речь
//
// 3. Откройте: Extensions (Расширения) > Apps Script
//
// 4. Удалите весь код по умолчанию и вставьте этот файл целиком
//
// 5. Нажмите кнопку "Run" (▶) рядом с функцией initialSetup
//    — подтвердите разрешения Google
//
// 6. Нажмите Deploy > New deployment
//    — Select type: Web app
//    — Execute as: Me (ваш аккаунт)
//    — Who has access: Anyone (Все)
//    — Нажмите Deploy
//
// 7. Скопируйте URL (он будет вида https://script.google.com/macros/s/XXXX/exec)
//
// 8. Вставьте этот URL в index.html в переменную GOOGLE_SCRIPT_URL
//
// ВАЖНО: Если вы измените этот скрипт после деплоя,
// нужно создать НОВЫЙ деплоймент (Deploy > New deployment),
// иначе изменения не подхватятся.
// ============================================================

const SHEET_NAME = 'Sheet1'; // TODO: Измените если лист называется иначе
const scriptProp = PropertiesService.getScriptProperties();

/**
 * Начальная настройка — запустите эту функцию один раз вручную
 */
function initialSetup() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  scriptProp.setProperty('key', activeSpreadsheet.getId());
}

/**
 * Обработчик POST-запросов от формы
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));
    const sheet = doc.getSheetByName(SHEET_NAME);

    // Добавляем строку с данными
    const newRow = [
      new Date().toLocaleString('ru-RU'),  // Дата
      e.parameter.fullName,                 // ФИО
      e.parameter.contact,                  // Контакт
      e.parameter.attendance,               // Присутствие
      e.parameter.guestCount || '',         // Кол-во гостей
      e.parameter.speech || '',             // Речь
    ];

    sheet.appendRow(newRow);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', row: sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

/**
 * Обработчик GET-запросов (для тестирования)
 */
function doGet(e) {
  return ContentService
    .createTextOutput('RSVP Web App работает! Используйте POST для отправки данных.')
    .setMimeType(ContentService.MimeType.TEXT);
}
