
/**
 * Класс работы с IndexedDB
 * @class
 */
function idb() {
  const DB_NAME = "calendar";
  const STORE_NAME = "reminder";

  /**
   * Подключение к БД
   */
  this.connectDB = (callback) => {
    const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    const request = indexedDB.open(DB_NAME, 1);

    request.onsuccess = () => {
      console.log("onsuccess");
      callback(request.result);
    }
    request.onupgradeneeded = (e) => {
      console.log("onupgradeneeded");
      e.currentTarget.result.createObjectStore(STORE_NAME, { keyPath: "key", autoIncrement: true, });
      this.connectDB(callback);
    }
  }

  /**
   * Получить список всех записей
   */
  this.getAllData = () => {
    return new Promise((resolved, rejected) =>
      this.connectDB((db) => {
        let rows = [];
        const store = db.transaction([STORE_NAME], "readonly").objectStore(STORE_NAME);

        if (store.mozGetAll)
          store.mozGetAll().onsuccess = function (e) {
            resolved(e.target.result);
          };
        else {
          store.openCursor().onsuccess = function (e) {
            const cursor = e.target.result;
            if (cursor) {
              rows.push(cursor.value);
              cursor.continue();
            } else
              resolved(rows);
          }
        }
      })
    )
  }

  /**
   * Проверка новая запись или нет и исходя из этого добавялем или удаляем запись из БД
   * 
   * @param {Object} data - параметры оповещения
   */
  this.addDBReminder = (data) => {
    this.getAllData().then((dbData) => {
      const { id_event, day } = data;
      let existRecord;

      dbData.some(item => {
        if (item.id_event === id_event && item.day === day) {
          return existRecord = item;
        }
      });

      if (existRecord)
        this.delDBRecord(existRecord.key);
      else
        this.addDBRecord(data);
    });
  }

  /**
   * Добавить запись в БД
   * 
   * @param {Object} data - параметры оповещения
   */
  this.addDBRecord = (data) => {
    this.connectDB((db) => {
      const request = db.transaction([STORE_NAME], "readwrite").objectStore(STORE_NAME).add(data);
      request.onerror = this.logerr;
      request.onsuccess = function () {
        console.log("Record add in DB:", data);
      }
    });
  }

  /**
   * Удалить запись из БД
   * 
   * @param {String} key - идентификатор оповещения
   */
  this.delDBRecord = (key) => {
    this.connectDB((db) => {
      const request = db.transaction([STORE_NAME], "readwrite").objectStore(STORE_NAME).delete(key);
      request.onerror = this.logerr;
      request.onsuccess = function () {
        console.log("Record delete from DB:", key);
      }
    });
  }

  /**
   * Логирование ошибок
   * 
   * @param {Object} err - ошибка
   */
  this.logerr = (err) => {
    console.log(err);
  }

}

// const DB_NAME = "calendar";
// const STORE_NAME = "reminder";

// const connectDB = (func) => {
//   const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
//   const request = indexedDB.open(DB_NAME, 1);
//   request.onerror = logerr;
//   request.onsuccess = function () {
//     func(request.result);
//   }
//   request.onupgradeneeded = function (e) {
//     e.currentTarget.result.createObjectStore(STORE_NAME, { keyPath: "key", autoIncrement: true, });
//     connectDB(func);
//   }
// }

// const getAllData = (func) => {
//   connectDB(function (db) {
//     let rows = [];
//     const store = db.transaction([STORE_NAME], "readonly").objectStore(STORE_NAME);

//     if (store.mozGetAll)
//       store.mozGetAll().onsuccess = function (e) {
//         func(e.target.result);
//       };
//     else
//       store.openCursor().onsuccess = function (e) {
//         const cursor = e.target.result;
//         if (cursor) {
//           rows.push(cursor.value);
//           cursor.continue();
//         }
//         else {
//           func(rows);
//         }
//       };
//   });
// }

// const addDBRecord = (data) => {
//   connectDB(function (db) {
//     const request = db.transaction([STORE_NAME], "readwrite").objectStore(STORE_NAME).add(data);
//     request.onerror = logerr;
//     request.onsuccess = function () {
//       return request.result;
//     }
//   });
// }

// const addDBReminder = (data) => {
//   getAllData((dbData) => {
//     let existRecord;

//     dbData.some(item => {
//       if (item.id_event === data.id_event && item.day === data.day) {
//         return existRecord = item;
//       }
//     });

//     if (existRecord)
//       delDBRecord(existRecord.key);
//     else
//       addDBRecord(data);
//   });
// }

// const delDBRecord = (key) => {
//   connectDB(function (db) {
//     const request = db.transaction([STORE_NAME], "readwrite").objectStore(STORE_NAME).delete(key);
//     request.onerror = logerr;
//     request.onsuccess = function () {
//       console.log("Record delete from DB:", key);
//     }
//   });
// }

// function logerr(err) {
//   console.log(err);
// }