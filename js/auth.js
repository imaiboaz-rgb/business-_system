function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.signInWithEmailAndPassword(email, password)
        .catch(error => alert(error.message));
}

function signup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.createUserWithEmailAndPassword(email, password)
        .then(res => {
            db.collection("users").doc(res.user.uid).set({
                email: email,
                role: "cashier",
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .catch(error => alert(error.message));
}

function logout() {
    auth.signOut();
}

auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('loginBox').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        document.getElementById('userInfo').innerText = `User: ${user.email}`;
        loadData();
    } else {
        document.getElementById('loginBox').classList.remove('hidden');
        document.getElementById('app').classList.add('hidden');
    }
});
