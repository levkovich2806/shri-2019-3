(function () {

  window.addEventListener('load', function () {
    if (!("Notification" in window)) {
      alert("This browser does not support system notifications");
    } else if (window.Notification && Notification.permission !== "granted") {
      Notification.requestPermission(function (status) {
        if (Notification.permission !== status) {
          Notification.permission = status;
        }
      });
    }
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(() => navigator.serviceWorker.ready.then((worker) => {
        //worker.sync.register('syncdata');
      }))
      .catch((err) => console.log(err));
  }

  let reminders = [];
  let storage;

  if (!(window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB)) {
    //Если indexedDB не поддерживается браузером, то можно рализовать функционал через Local Storage
    //Сделал через indexedDB, что бы разобраться с ним :)
    showCalendar();
  } else {
    console.log('This browser supports IndexedDB');
    storage = new idb();
    storage.getAllData()
      .then((data) => {
        console.log(data);
        reminders = data;
        showCalendar();
        checkReminders();
      });
  }

  /**
   * Вызвать метод для добавления/удаления записи из БД 
   *  
   * @param {Object} context
   * @param {Number} day - кол-во дней, за которые необходимо оповестить
   * @param {Number} id - идентификатор события
   */

  // (можно было конечно привязаться к состоянию checkbox (checked), 
  // но считаю, что правильнее что бы именно класс работы с БД проверял новая запись или нет)
  addReminder = (day, id_event) => {
    storage.addDBReminder({
      id_event,
      day,
    });
  }

  /**
   * Проверяем необходимо ли оповещать о каких-либо событиях
   */
  checkReminders = () => {
    reminders.forEach(({ id_event, day }) => {
      const { date, name, location } = getEventData(id_event);

      const eventDate = dateToUnix(date);

      const d = new Date();
      d.setDate(d.getDate() + day);
      setDayStart(d);
      console.log(d.getTime() === eventDate);
      if (d.getTime() === eventDate) {
        showNotify({
          title: "Напоминание",
          options: {
            body: `Напоминаем, что событие ${name}, которое состоится в ${location} наступит через ${day} дня (дней)`,
            icon: "./notification-calendar.png",
          }
        });
      }
    });
  }

  /**
   * Получение объекта события
   * 
   * @param {String} id_event - идентификатор события
   */
  getEventData = (id_event) => {
    return calendarList[id_event];
  };

  /** 
   * Отображение календаря
  */
  showCalendar = () => {
    const content = document.getElementById("content");
    const newDiv = document.createElement('div');
    newDiv.innerHTML = getCalendarData();
    content.appendChild(newDiv);
  };

  /**
   * Получение разметки календаря
   */
  getCalendarData = () => {
    Object.keys(calendarList).sort((c1, c2) => calendarList[c1].date > calendarList[c2].date);
    return Object.keys(calendarList).reduce((accum, key) => {
      const { name, location, date, tags } = calendarList[key];
      //const id = parseInt(key.replace("event", ""));
      accum +=
        `<div class="event">
          <p class="event__title">${name}</p>
          <p class="event__info">${location} - ${date}</p>
          <p class="event__tags">` + tags.map(tag => `<span class="event__tag">${tag}</span>`).join(', ') + `</p>
          <p class="reminder">
            Добавить напоминание за:` +
        getCheckBox(3, key) +
        getCheckBox(7, key) +
        getCheckBox(14, key) +
        ` дня (дней)
          </p>
          <hr />
        </div>`;
      return accum;
    }, "");
  }

  /**
   * Получение элемента активации (деактивации) напоминания
   */
  getCheckBox = (day, key) => {
    const isActive = reminders.some(item => item.id_event === key && item.day === day);
    const checked = isActive ? "checked" : "";
    const ident = `ch_${day}_${key}`;

    return `<label for="${ident}" class="reminder__label"><input id="${ident}" class="reminder__checkbox" type="checkbox" ${checked} onclick="addReminder(${day}, '${key}')">${day}</label>`;
  }

  /**
   * Отображаем уведомление на странице
   * 
   * @param {Object} params - параметры отображения оповещения
   */
  showNotify = (params) => {
    console.log("showNotify", Notification.permission);
    const { title, options } = params;
    if (Notification.permission === "granted") {
      new Notification(title, options);
    }
  }
})();