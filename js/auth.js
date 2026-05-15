function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
            document.getElementById('loginBox').classList.add('hidden');
            document.getElementById('app').classList.remove('hidden');
        })
        .catch(error => alert(error.message));
}

function signup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            const user = userCredential.user;
            db.collection('users').doc(user.uid).set({
                email: email,
                name: email.split('@')[0],
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            alert("Account created!");
        })
        .catch(error => alert(error.message));
}

function logout() {
    firebase.auth().signOut().then(() => location.reload());
}
