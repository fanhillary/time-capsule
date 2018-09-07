var firebase = require("firebase");
require("firebase/firestore");

var config = {
  apiKey: "AIzaSyAZ-BIQg2MqIomZ1ubmXYhw7w1GcU7XCT8",
  authDomain: "time-capsule-62e6a.firebaseapp.com",
  databaseURL: "https://time-capsule-62e6a.firebaseio.com",
  projectId: "time-capsule-62e6a",
  storageBucket: "time-capsule-62e6a.appspot.com",
  messagingSenderId: "334923332666"
  };

firebase.initializeApp(config);
export const auth = firebase.auth();
export const db = firebase.firestore();
export default firebase;
