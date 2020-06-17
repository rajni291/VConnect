import * as firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/storage';
import 'firebase/auth';        // for authentication
import 'firebase/storage';     // for storage
import 'firebase/database';    // for realtime database
import 'firebase/firestore';   // for cloud firestore
import 'firebase/messaging';   // for cloud messaging
import 'firebase/functions'; 

const config = {
  apiKey: "AIzaSyBbky3M6rr6Tcn26Q2a1S7_FjJznm7el-Y",
  databaseURL: "https://we-connect-fc203.firebaseio.com",
  projectId: "we-connect-fc203"
};
firebase.initializeApp(config);

export default firebase;