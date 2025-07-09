const firebaseConfig = {
  apiKey: "AIzaSyBB-PEtapGv0S6B_Xt1A-6dTMjvO5ASrNc",
  authDomain: "osmanlicaogren-57ff0.firebaseapp.com",
  projectId: "osmanlicaogren-57ff0",
  storageBucket: "osmanlicaogren-57ff0.appspot.com",
  messagingSenderId: "55078200434",
  appId: "1:55078200434:web:f933fe5178daaf63210eeb",
  measurementId: "G-58MD9BL1TY"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();