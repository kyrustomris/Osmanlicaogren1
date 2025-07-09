// Oturum açma, kayıt, çıkış, premium kontrol
async function register() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    await db.collection("users").doc(userCredential.user.uid).set({
      premium: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert('Kayıt başarılı!');
  } catch (error) {
    alert(error.message);
  }
}

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try {
    await auth.signInWithEmailAndPassword(email, password);
    alert('Giriş başarılı!');
  } catch (error) {
    alert(error.message);
  }
}

function logout() {
  auth.signOut().then(() => {
    alert('Çıkış yapıldı!');
    window.location.reload();
  });
}

// Premium durumu kontrol et ve ekrana yansıt
async function checkPremiumStatus(user) {
  if (!user) {
    document.getElementById('user-info').innerText = "Giriş yok";
    hidePremiumBadge();
    return;
  }
  const userDoc = await db.collection("users").doc(user.uid).get();
  if (userDoc.exists && userDoc.data().premium) {
    showPremiumBadge();
  } else {
    hidePremiumBadge();
  }
}

function showPremiumBadge() {
  const badge = document.getElementById('premiumBadge');
  if (badge) badge.classList.remove('d-none');
}

function hidePremiumBadge() {
  const badge = document.getElementById('premiumBadge');
  if (badge) badge.classList.add('d-none');
}

// Premium şifre kontrolü (örnek: 1234567890)
async function activatePremium() {
  const password = document.getElementById('premiumPassword').value;
  const user = auth.currentUser;
  if (!user) return alert("Önce giriş yapmalısın!");
  if (password === "1234567890") {
    await db.collection("users").doc(user.uid).update({ premium: true });
    alert("Premium aktif edildi!");
    showPremiumBadge();
    // Premium modal vs kapatmak gerekiyorsa burada kapat
  } else {
    alert("Hatalı şifre!");
  }
}

async function deactivatePremium() {
  const user = auth.currentUser;
  if (!user) return alert("Önce giriş yapmalısın!");
  await db.collection("users").doc(user.uid).update({ premium: false });
  alert("Premium üyeliğiniz sonlandırıldı.");
  hidePremiumBadge();
}

// Giriş durumu değiştikçe arayüze yansıt
auth.onAuthStateChanged(async user => {
  if (user) {
    document.getElementById('user-info').innerText = "Giriş yapan: " + user.email;
    checkPremiumStatus(user);
    window.currentUser = user; // app.js için
    if (window.osmanlicaApp) window.osmanlicaApp.firebaseReady();
  } else {
    document.getElementById('user-info').innerText = "Giriş yok";
    hidePremiumBadge();
    window.currentUser = null;
    if (window.osmanlicaApp) window.osmanlicaApp.firebaseReady();
  }
});

// Premium giriş/çıkış butonları auth.js'de DOMContentLoaded ile bağlandı
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('premiumLoginBtn');
  const logoutBtn = document.getElementById('premiumLogoutBtn');
  if (loginBtn) loginBtn.onclick = activatePremium;
  if (logoutBtn) logoutBtn.onclick = deactivatePremium;
});