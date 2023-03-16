import { app, database } from "./firebaseConfig.js"
import { ref, set, get } from "firebase/database"

// always use await in front of these functions
// ex. await putData(...)

// write data to the database
// path: where the data go, ex. 'users/userid/wesley'
// data: json format
async function putData(path, data) {
    await set(ref(database, path), data);
    return;
};

// get data from the specified path
// return json
async function getData(path) {
    var data;
    await get(ref(database, path)).then((snapshot) => {
        if (snapshot.exists()) {
            data = snapshot.val();
        } else {
            console.log("Data Not Found");
        }
    });
    return data;
};

export { putData, getData };
