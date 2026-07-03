const DB_NAME = "PresenzeManpowerDB";
const DB_VERSION = 1;
const STORE_NAME = "days";

let db = null;

export async function initDB() {

    return new Promise((resolve, reject) => {

        const request = indexedDB.open(
            DB_NAME,
            DB_VERSION
        );

        request.onerror = () => {
            reject("Errore apertura database");
        };

        request.onsuccess = () => {

            db = request.result;

            console.log("Database aperto");

            resolve(db);
        };

        request.onupgradeneeded = (event) => {

            const database = event.target.result;

            if (
                !database.objectStoreNames.contains(
                    STORE_NAME
                )
            ) {

                database.createObjectStore(
                    STORE_NAME,
                    {
                        keyPath: "date"
                    }
                );
            }
        };
    });
}
export async function saveDay(dayData){

    return new Promise((resolve,reject)=>{

        const transaction =
            db.transaction(
                STORE_NAME,
                "readwrite"
            );

        const store =
            transaction.objectStore(
                STORE_NAME
            );

        const request =
            store.put(dayData);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            reject();
        };

    });

}
export async function getDay(date){

    return new Promise((resolve,reject)=>{

        const transaction =
            db.transaction(
                STORE_NAME,
                "readonly"
            );

        const store =
            transaction.objectStore(
                STORE_NAME
            );

        const request =
            store.get(date);

        request.onsuccess = () => {
            resolve(
                request.result
            );
        };

        request.onerror = () => {
            reject();
        };

    });

}
export async function getSavedDates() {

    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction(
                STORE_NAME,
                "readonly"
            );

        const store =
            transaction.objectStore(
                STORE_NAME
            );

        const request =
            store.getAllKeys();

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject();
        };

    });
}
export async function deleteDay(date){

    return new Promise((resolve,reject)=>{

        const transaction =
            db.transaction(
                STORE_NAME,
                "readwrite"
            );

        const store =
            transaction.objectStore(
                STORE_NAME
            );

        const request =
            store.delete(date);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            reject();
        };

    });

}
export async function getAllDays(){

    return new Promise((resolve,reject)=>{

        const transaction =
            db.transaction(
                STORE_NAME,
                "readonly"
            );

        const store =
            transaction.objectStore(
                STORE_NAME
            );

        const request =
            store.getAll();

        request.onsuccess = () => {
            resolve(
                request.result
            );
        };

        request.onerror = () => {
            reject();
        };

    });

}