import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, doc, onSnapshot, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD3H5aQHuX3RTdJgJnSZGYJCRmCI51Mvbg",
    authDomain: "coin-terminal.firebaseapp.com",
    projectId: "coin-terminal",
    storageBucket: "coin-terminal.firebasestorage.app",
    messagingSenderId: "673812925700",
    appId: "1:673812925700:web:680ce7d2706d4474941451"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// AUTH LOGIC
document.getElementById('auth-btn').onclick = async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    try {
        if(document.getElementById('auth-title').innerText.includes("TERMINAL")) await signInWithEmailAndPassword(auth, email, pass);
        else await createUserWithEmailAndPassword(auth, email, pass);
    } catch (e) { alert(e.message); }
};
document.getElementById('logout-btn').onclick = () => signOut(auth);

// FETCH DEPOSIT INFO (FROM ADMIN)
onSnapshot(doc(db, "settings", "payment_info"), (d) => {
    if(d.exists()) document.getElementById('payment-text').innerText = d.data().text;
});

// MONITOR STATE
onAuthStateChanged(auth, user => {
    if(user) {
        document.getElementById('login-box').classList.add('hidden');
        document.getElementById('profile-box').classList.remove('hidden');
        document.getElementById('user-display-email').innerText = user.email;
        document.getElementById('user-display-id').innerText = "UID: " + user.uid;
        document.getElementById('nav-auth-text').innerText = "👤 PROFILE";

        onSnapshot(doc(db, "users", user.uid), (d) => {
            if(d.exists()) document.getElementById('balance').innerText = d.data().balance.toFixed(2);
        });
    } else {
        document.getElementById('login-box').classList.remove('hidden');
        document.getElementById('profile-box').classList.add('hidden');
        document.getElementById('nav-auth-text').innerText = "👤 LOGIN";
    }
});

// LIVE PRICE SIMULATION
setInterval(() => {
    let p = (1.28 + Math.random() * 0.04).toFixed(4);
    if(document.getElementById('live-price')) document.getElementById('live-price').innerText = "$" + p;
}, 3000);
        
