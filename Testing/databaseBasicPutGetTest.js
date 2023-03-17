import { app, database } from "./firebaseConfig.js"
import { putData, getData } from "./database.js"

// should be used with database.js and firebaseConfig.js

// This script tests the basic put and get functionality of the database
// It puts the data below into database, get it from database, and then print it to the terminal

const data = {
    "users": {
      "alex": {
        "name": "Alex",
        "contacts": 123
      }
    }
  }
await putData('test3/hello', data);
const get = await getData('test3/hello');
console.log(get);

process.exit(0);
