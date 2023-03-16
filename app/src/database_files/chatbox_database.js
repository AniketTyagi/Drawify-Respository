import { app, database } from "./chatbox_firebaseConfig.js";
import firebase from "firebase/app";
import "firebase/database";

// always use await in front of these functions
// ex. await putData(...)

// write data to the database
// path: where the data go, ex. 'users/userid/wesley'
// data: json format
async function putData(path, data) {
  //await firebase.set(firebase.ref(database, path), data);
  await database.ref(path).set(data);
  return;
}

// get data from the specified path
// return json
async function getData(path) {
  var data;
  //await firebase.get(ref(database, path)).then((snapshot) => {
  await database
    .ref()
    .child(path)
    .get()
    .then((snapshot) => {
      if (snapshot.exists()) {
        data = snapshot.val();
      } else {
        console.log("Data Not Found");
      }
    });
  return data;
}

export { putData, getData };
