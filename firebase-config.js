// firebase-config.js
// Configuração centralizada do Firebase para todo o sistema

const firebaseConfig = {
apiKey: “AIzaSyCyz4Nrvcnf0MF_99fLKPMsrJ9dIzuRHG4”,
authDomain: “oficina-sistema-cc2cd.firebaseapp.com”,
databaseURL: “https://oficina-sistema-cc2cd-default-rtdb.firebaseio.com/”,
projectId: “oficina-sistema-cc2cd”,
storageBucket: “oficina-sistema-cc2cd.appspot.com”,
messagingSenderId: “1034638142539”,
appId: “1:1034638142539:web:4b63c09b30b86838eff1ce”
};

// Inicializar Firebase (apenas uma vez)
if (!firebase.apps.length) {
firebase.initializeApp(firebaseConfig);
}

// Exportar instâncias globais
const auth = firebase.auth();
const database = firebase.database();

// Função de proteção de página (redireciona se não autenticado)
function protegerPagina() {
auth.onAuthStateChanged(user => {
if (!user) {
console.log(‘Usuário não autenticado. Redirecionando…’);
window.location.href = ‘index.html’;
}
});
}

// Função de logout
function logout() {
if (confirm(‘Deseja realmente sair do sistema?’)) {
auth.signOut().then(() => {
window.location.href = ‘index.html’;
}).catch(error => {
alert(’Erro ao sair: ’ + error.message);
});
}
}

// Tradução de erros do Firebase
function traduzirErroFirebase(errorCode) {
const erros = {
‘auth/invalid-credential’: ‘Credenciais inválidas. Verifique seu e-mail e senha.’,
‘auth/user-not-found’: ‘Usuário não encontrado.’,
‘auth/wrong-password’: ‘Senha incorreta.’,
‘auth/email-already-in-use’: ‘Este e-mail já está em uso.’,
‘auth/weak-password’: ‘A senha precisa ter no mínimo 6 caracteres.’,
‘auth/popup-closed-by-user’: ‘Login cancelado.’,
‘auth/network-request-failed’: ‘Erro de rede. Verifique sua conexão.’,
‘auth/too-many-requests’: ‘Muitas tentativas. Tente novamente mais tarde.’
};
return erros[errorCode] || ‘Erro inesperado. Tente novamente.’;
}

console.log(‘✅ Firebase configurado e pronto!’);