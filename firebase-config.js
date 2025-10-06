// firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyCyz4Nrvcnf0MF_99fLKPMsrJ9dIzuRHG4",
  authDomain: "oficina-sistema-cc2cd.firebaseapp.com",
  databaseURL: "https://oficina-sistema-cc2cd-default-rtdb.firebaseio.com/",
  projectId: "oficina-sistema-cc2cd",
  storageBucket: "oficina-sistema-cc2cd.appspot.com",
  messagingSenderId: "1034638142539",
  appId: "1:1034638142539:web:4b63c09b30b86838eff1ce"
};


firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

function protegerPagina() {
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = 'index.html';
    }
  });
}

function logout() {
  if (confirm('Deseja sair?')) {
    auth.signOut().then(() => window.location.href = 'index.html');
  }
}
