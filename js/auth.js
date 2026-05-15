auth.onAuthStateChanged(async user => {
  if (user) {
    document.getElementById('loginBox').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    document.getElementById('userInfo').innerText = `Logged in as: ${user.email}`;
    loadData();
  } else {
    document.getElementById('loginBox').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
  }
});

function login() {
  const e = document.getElementById('email').value;
  const p = document.getElementById('password').value;
  auth.signInWithEmailAndPassword(e, p).catch(err => alert(err.message));
}

function signup() {
  const e = document.getElementById('email').value;
  const p = document.getElementById('password').value;
  auth.createUserWithEmailAndPassword(e, p).then(res => {
    db.collection("users").doc(res.user.uid).set({ email: e, role: "cashier" });
  }).catch(err => alert(err.message));
}

function logout() { auth.signOut(); }
