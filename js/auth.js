// Global Firebase access
const { auth, db } = window.firebase;
const { createUserWithEmailAndPassword, signInWithEmailAndPassword } = firebase.auth;
const { ref, set } = firebase.database;

// Login Form
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = 'home.html';
  } catch (error) {
    alert('Login failed: ' + error.message);
  }
});

// Signup Form (WITH NAME)
document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;
  const dob = document.getElementById('signupDob').value;
  const avatarInput = document.querySelector('input[name="avatar"]:checked');
  
  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }
  
  if (!avatarInput) {
    alert('Please select an avatar!');
    return;
  }
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save COMPLETE profile with NAME
    await set(ref(db, `users/${user.uid}`), {
      name: name,
      username: name.split(' ')[0], // First name for "Hello, Aarav"
      email: email,
      dob: dob,
      avatarUrl: avatarInput.value,
      score: 0,
      streak: 0,
      badges: 0,
      progress: { math: 0, word: 0, science: 0, logic: 0 },
      createdAt: new Date().toISOString()
    });
    
    alert(`Welcome ${name}! Please login.`);
    window.location.href = 'login.html';
  } catch (error) {
    alert('Signup failed: ' + error.message);
  }
});
