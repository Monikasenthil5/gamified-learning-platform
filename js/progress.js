import { auth, db } from '../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';

onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Redirect to login if not authenticated
    window.location.href = 'login.html';
    return;
  }
  
  // Load user progress from database
  const userRef = ref(db, `users/${user.uid}`);
  
  onValue(userRef, (snapshot) => {
    const userData = snapshot.val();
    if (userData) {
      updateProgressUI(userData);
    }
  });
});

function updateProgressUI(userData) {
  // Calculate overall progress (average of all courses)
  const progressValues = [
    userData.progress?.math || 0,
    userData.progress?.word || 0, 
    userData.progress?.science || 0,
    userData.progress?.logic || 0
  ];
  const totalProgress = progressValues.reduce((a, b) => a + b, 0);
  const overallPercent = Math.round((totalProgress / 40) * 100); // 4 courses x 10 levels
  
  // Update overall progress
  document.getElementById('overallPercent').textContent = `${overallPercent}%`;
  document.getElementById('overallMsg').textContent = 
    overallPercent === 0 ? "Welcome! Start your learning journey!" :
    overallPercent < 30 ? "Keep practicing!" :
    overallPercent < 70 ? "Great improvement!" : "Excellent progress!";
  
  // Update subject progress
  updateProgressBar('math', userData.progress?.math || 0);
  updateProgressBar('science', userData.progress?.science || 0);
  updateProgressBar('logic', userData.progress?.logic || 0);
  updateProgressBar('reading', userData.progress?.word || 0); // Map word to reading
  
  // Update parent summary
  const totalLevels = totalProgress;
  const avgScoreGrade = getGrade(totalProgress / 4); // Average per course
  
  document.getElementById('attendance').textContent = `${Math.min(100, Math.round(totalProgress / 2))}%`;
  document.getElementById('levelsCompleted').textContent = totalLevels;
  document.getElementById('avgScore').textContent = avgScoreGrade;
  document.getElementById('behavior').textContent = 
    totalLevels === 0 ? 'New User' :
    totalLevels < 5 ? 'Getting Started' :
    totalLevels < 15 ? 'Good Progress' : 'Excellent';
}

function updateProgressBar(subject, levelProgress) {
  const percent = Math.min(100, Math.max(0, (levelProgress / 10) * 100));
  document.getElementById(`${subject}Bar`).style.width = `${percent}%`;
  document.getElementById(`${subject}Percent`).textContent = `${percent}%`;
}

function getGrade(averageLevels) {
  if (averageLevels >= 8) return 'A';
  if (averageLevels >= 6) return 'B';
  if (averageLevels >= 4) return 'C';
  return 'F';
}

// Your existing nav functions
window.toggleSideNav = function() {
  document.getElementById("sideNav").style.width = "250px";
};

window.closeNav = function() {
  document.getElementById("sideNav").style.width = "0";
};
