import { auth, db } from '../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';

onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Redirect to login if not authenticated
    window.location.href = 'login.html';
    return;
  }
  
  // Load user profile from database
  const userRef = ref(db, `users/${user.uid}`);
  
  onValue(userRef, (snapshot) => {
    const userData = snapshot.val();
    if (userData) {
      updateProfileUI(userData);
    }
  });
});

function updateProfileUI(userData) {
  // Avatar and personal info
  document.getElementById('userAvatar').src = userData.avatarUrl || 'assets/images/avatar1.avif';
  document.getElementById('userName').textContent = `Hello, ${userData.username || 'Student'} 👋`;
  
  // Format DOB
  const dob = new Date(userData.dob).toLocaleDateString('en-GB');
  document.getElementById('userDob').textContent = `Date of Birth: ${dob}`;
  
  // Stats
  document.getElementById('userScore').textContent = userData.score || 0;
  document.getElementById('userStreak').textContent = `${userData.streak || 0} Days`;
  document.getElementById('userBadges').textContent = userData.badges || 0;
  
  // Course progress bars
  const progressPercent = (value) => Math.min(100, Math.max(0, (value / 10) * 100)); // Assuming 10 levels max
  
  document.getElementById('mathProgress').style.width = `${progressPercent(userData.progress?.math || 0)}%`;
  document.getElementById('scienceProgress').style.width = `${progressPercent(userData.progress?.science || 0)}%`;
  document.getElementById('logicProgress').style.width = `${progressPercent(userData.progress?.logic || 0)}%`;
}
