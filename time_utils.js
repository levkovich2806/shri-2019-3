/**
 * Установка дату в начало суток
 * 
 * @param {Date} d - дата
 */
function setDayStart(d) {
  d.setHours(0, 0, 0, 0);
}

/**
 * Преобразовать дату в Timestamp
 * 
 * @param {String} date - дата в формету dd.mm.YYYY
 */
function dateToUnix(date) {
  const [eday, emonth, eyear] = date.split(".");
  return new Date(eyear, emonth - 1, eday).getTime();
}
