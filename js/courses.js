import { auth, db } from '../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';

onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Redirect to login if not authenticated
    window.location.href = 'login.html';
    return;
  }
  
  // Load user progress and update course cards
  const userRef = ref(db, `users/${user.uid}`);
  
  onValue(userRef, (snapshot) => {
    const userData = snapshot.val();
    if (userData) {
      updateCourseCards(userData.progress || {});
    }
  });
});

function updateCourseCards(progress) {
  const courses = ['math', 'word', 'science', 'logic'];
  
  courses.forEach(course => {
    const levels = progress[course] || 0;
    const badge = document.getElementById(`${course}Badge`);
    badge.textContent = `⭐ ${levels}/10`;
    
    // Color badge based on progress
    if (levels >= 10) {
      badge.style.background = '#6BCF9D';
      badge.style.color = 'white';
    } else if (levels >= 5) {
      badge.style.background = '#FFD93D';
    }
  });
}

window.enterCourse = function(courseId) {
  // For now, just alert (replace with actual levels page later)
  alert(`Entering ${courseId.charAt(0).toUpperCase() + courseId.slice(1)} course!\n\nComing Soon: Levels page`);
  
  // Later: window.location.href = `${courseId}-levels.html`;
};

// Your existing nav functions
window.toggleSideNav = function() {
  const nav = document.getElementById("sideNav");
  nav.style.left = nav.style.left === "0px" ? "-240px" : "0px";
};

window.closeNav = function() {
  document.getElementById("sideNav").style.left = "-240px";
};
