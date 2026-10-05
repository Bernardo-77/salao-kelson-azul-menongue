/**
 * ============================================================
 * FIREBASE CONFIGURATION (COMPAT VERSION)
 * Salão Kelson - Menongue
 * ============================================================
 * Versão COMPAT — funciona sem módulos ES6
 * ============================================================
 */

// ===== CONFIGURAÇÃO =====
var firebaseConfig = {
  apiKey: "AIzaSyBm2f2flEnDSlarY06rQQytYq2dSEE_hNw",
  authDomain: "salao-kellson-menongue.firebaseapp.com",
  projectId: "salao-kellson-menongue",
  storageBucket: "salao-kellson-menongue.firebasestorage.app",
  messagingSenderId: "59279069994",
  appId: "1:59279069994:web:a70b522f3a0d0288cc0453"
};

// ===== INICIALIZAR =====
firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();
var auth = firebase.auth();

// ===== EXPOR GLOBALMENTE =====
window.FirebaseApp = {
  app: firebase.app(),
  db: db,
  auth: auth,
  // Aliases úteis
  firestore: firebase.firestore,
  authModule: firebase.auth,
};

console.log('✅ Firebase inicializado (compat)!');
console.log('📦 Projeto:', firebaseConfig.projectId);