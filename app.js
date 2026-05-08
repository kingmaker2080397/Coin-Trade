import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, doc, onSnapshot, getDoc, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// --- Auth Handling ---
let isLogin = true;
document.getElementById('toggle-auth').onclick = () => {
    isLogin = !isLogin;
    document.getElementById('auth-title').innerText = isLogin ? "GMC TERMINAL" : "REGISTER PILOT";
};

document.getElementById('auth-btn').onclick = async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    try {
        if(isLogin) await signInWithEmailAndPassword(auth, email, pass);
        else await createUserWithEmailAndPassword(auth, email, pass);
    } catch (e) { alert(e.message); }
};

document.getElementById('logout-btn').onclick = () => signOut(auth);

// --- Trading Logic ---
let orderType = 'buy';
window.setOrderType = (t) => {
    orderType = t;
    document.getElementById('buy-btn-toggle').className = t === 'buy' ? 'flex-1 bg-green-600/20 text-green-500 p-2 rounded border border-green-600' : 'flex-1 bg-gray-800 p-2 rounded';
    document.getElementById('sell-btn-toggle').className = t === 'sell' ? 'flex-1 bg-red-600/20 text-red-500 p-2 rounded border border-red-600' : 'flex-1 bg-gray-800 p-2 rounded';
};

document.getElementById('execute-trade-btn').onclick = async () => {
    if(!auth.currentUser) return alert("Login Karo!");
    const price = document.getElementById('trade-price').value;
    const amount = document.getElementById('trade-amount').value;
    
    await addDoc(collection(db, "orders"), {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        price: parseFloat(price),
        amount: parseFloat(amount),
        type: orderType,
        status: "Pending",
        time: serverTimestamp()
    });
    alert("Order Executed!");
};

// --- KYC Handling ---
document.getElementById('kyc-btn').onclick = async () => {
    const file = document.getElementById('kyc-file').files[0];
    if(!file) return alert("Select File!");
    document.getElementById('kyc-status').innerText = "Uploading...";
    
    const fd = new FormData(); fd.append("image", file);
    const res = await fetch("https://api.imgbb.com/1/upload?key=a25b5bea8eb38a1ecf4f04154d85a4bf", {method: "POST", body: fd});
    const data = await res.json();
    
    if(data.success) {
        await addDoc(collection(db, "kyc"), {
            uid: auth.currentUser.uid,
            url: data.data.url,
            status: "Pending",
            time: serverTimestamp()
        });
        document.getElementById('kyc-status').innerText = "Submitted!";
    }
};

// --- Real-time Data Listeners ---
onAuthStateChanged(auth, user => {
    if(user) {
        document.getElementById('login-box').classList.add('hidden');
        document.getElementById('profile-box').classList.remove('hidden');
        document.getElementById('nav-auth-text').innerText = "👤 PROFILE";
        document.getElementById('user-display-email').innerText = user.email;

        // Balance Monitor
        onSnapshot(doc(db, "users", user.uid), (d) => {
            if(d.exists()) document.getElementById('balance').innerText = d.data().balance;
        });

        // Orders Monitor
        const q = query(collection(db, "orders"), where("uid", "==", user.uid));
        onSnapshot(q, (snap) => {
            const hist = document.getElementById('order-history');
            hist.innerHTML = "";
            snap.forEach(d => {
                const o = d.data();
                hist.innerHTML += `<div class="flex justify-between border-b border-gray-800 pb-1">
                    <span class="${o.type === 'buy' ? 'text-green-500' : 'text-red-500'}">${o.type.toUpperCase()}</span>
                    <span>$${o.price}</span>
                    <span class="text-gray-500">${o.status}</span>
                </div>`;
            });
        });
    } else {
        document.getElementById('login-box').classList.remove('hidden');
        document.getElementById('profile-box').classList.add('hidden');
        document.getElementById('nav-auth-text').innerText = "👤 LOGIN";
    }
});
  
