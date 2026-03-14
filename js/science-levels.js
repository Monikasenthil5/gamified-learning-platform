// Firebase CDN setup (same config you already use)
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, onValue, update } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyA1lno70d82bnOlBeb0ShRS-PW6cE4PAX8",
  authDomain: "learnapp-683e9.firebaseapp.com",
  projectId: "learnapp-683e9",
  storageBucket: "learnapp-683e9.firebasestorage.app",
  messagingSenderId: "989728103752",
  appId: "1:989728103752:web:c0a228b0d2ef2e6cf3277d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ------- GAME STATE -------
let currentUser = null;
let currentLevel = 1;
let currentCardIndex = 0;
let cards = [];
let scienceProgress = 0;   // levels completed (0–10)
let starsEarned = 0;

// ------- SCIENCE CONTENT: 10 LEVELS (5 teach + 5 Q each) -------
const scienceContent = {
  1: [
    { type: 'teaching', content: '🌟 Everything is made of tiny particles called ATOMS! 🧬' },
    { type: 'teaching', content: '⚡ Atoms have PROTONS (+), ELECTRONS (-), NEUTRONS (0).' },
    { type: 'teaching', content: '🧪 Water = H₂O → 2 Hydrogen + 1 Oxygen atom.' },
    { type: 'teaching', content: '🔬 Matter: SOLID (ice), LIQUID (water), GAS (steam).' },
    { type: 'teaching', content: '🌡️ Heating can change solid → liquid → gas.' },

    { type: 'question', question: 'Everything is made of?', options: ['Atoms', 'Planets', 'Clouds'], correct: 0 },
    { type: 'question', question: 'Water formula?', options: ['CO₂', 'H₂O', 'O₂'], correct: 1 },
    { type: 'question', question: 'Steam is which state?', options: ['Solid', 'Liquid', 'Gas'], correct: 2 },
    { type: 'question', question: 'Electrons have charge?', options: ['Positive', 'Negative', 'Neutral'], correct: 1 },
    { type: 'question', question: 'Ice is?', options: ['Solid', 'Liquid', 'Gas'], correct: 0 }
  ],
  2: [
    { type: 'teaching', content: '🚀 GRAVITY pulls objects towards Earth.' },
    { type: 'teaching', content: '🛼 FRICTION slows moving things like skates.' },
    { type: 'teaching', content: '💨 PUSH and PULL are forces that change motion.' },
    { type: 'teaching', content: '⚖️ Balanced forces → no movement.' },
    { type: 'teaching', content: '🎢 Rollercoasters use gravity + speed.' },

    { type: 'question', question: 'Pulls apples down?', options: ['Friction', 'Gravity', 'Wind'], correct: 1 },
    { type: 'question', question: 'Slows cars?', options: ['Gravity', 'Friction', 'Electricity'], correct: 1 },
    { type: 'question', question: 'Push is a?', options: ['Force', 'Color', 'Sound'], correct: 0 },
    { type: 'question', question: 'Balanced forces mean?', options: ['Speed up', 'No movement', 'Explode'], correct: 1 },
    { type: 'question', question: 'Rollercoasters mainly use?', options: ['Gravity', 'Magnets', 'Steam'], correct: 0 }
  ],
  3: [
    { type: 'teaching', content: '☀️ Sun is a STAR; Earth is a PLANET.' },
    { type: 'teaching', content: '🌕 Moon orbits (goes around) Earth.' },
    { type: 'teaching', content: '🌌 Solar System = Sun + 8 planets.' },
    { type: 'teaching', content: '🪐 Planets move in paths called ORBITS.' },
    { type: 'teaching', content: '🌟 Stars shine because of nuclear fusion.' },

    { type: 'question', question: 'Sun is a?', options: ['Planet', 'Star', 'Moon'], correct: 1 },
    { type: 'question', question: 'Moon orbits?', options: ['Mars', 'Earth', 'Sun'], correct: 1 },
    { type: 'question', question: 'Number of planets?', options: ['7', '8', '9'], correct: 1 },
    { type: 'question', question: 'Planet path name?', options: ['Trail', 'Orbit', 'Track'], correct: 1 },
    { type: 'question', question: 'Stars shine because of?', options: ['Batteries', 'Fusion', 'Fireworks'], correct: 1 }
  ],
  4: [
    { type: 'teaching', content: '🌱 Plants make food using sunlight → Photosynthesis.' },
    { type: 'teaching', content: '🍃 Leaves have green pigment Chlorophyll.' },
    { type: 'teaching', content: '💧 Roots absorb water from soil.' },
    { type: 'teaching', content: '🌸 Flowers can grow into fruits with seeds.' },
    { type: 'teaching', content: '🌬️ Plants give us oxygen to breathe.' },

    { type: 'question', question: 'Plants make food using?', options: ['Sunlight', 'Moonlight', 'Fire'], correct: 0 },
    { type: 'question', question: 'Green pigment name?', options: ['Vitamin', 'Chlorophyll', 'Glucose'], correct: 1 },
    { type: 'question', question: 'Roots mainly?', options: ['Eat', 'Absorb water', 'Sing'], correct: 1 },
    { type: 'question', question: 'Plants give?', options: ['Oxygen', 'Helium', 'Iron'], correct: 0 },
    { type: 'question', question: 'Seeds grow into?', options: ['Stones', 'New plants', 'Clouds'], correct: 1 }
  ],
  5: [
    { type: 'teaching', content: '🧲 Magnets have North and South poles.' },
    { type: 'teaching', content: '🔴 Like poles repel; unlike poles attract.' },
    { type: 'teaching', content: '🧭 Compass uses a magnet to point North.' },
    { type: 'teaching', content: '🌍 Earth itself acts like a big magnet.' },
    { type: 'teaching', content: '🪨 Lodestone is a natural magnet.' },

    { type: 'question', question: 'Like poles?', options: ['Attract', 'Repel', 'Disappear'], correct: 1 },
    { type: 'question', question: 'Compass points?', options: ['South', 'North', 'East'], correct: 1 },
    { type: 'question', question: 'Unlike poles?', options: ['Attract', 'Repel', 'Melt'], correct: 0 },
    { type: 'question', question: 'Earth is like a?', options: ['Battery', 'Magnet', 'Mirror'], correct: 1 },
    { type: 'question', question: 'Natural magnet?', options: ['Lodestone', 'Limestone', 'Sandstone'], correct: 0 }
  ],
  6: [
    { type: 'teaching', content: '⚡ Electricity is the flow of electrons.' },
    { type: 'teaching', content: '🔋 Batteries push electrons around a circuit.' },
    { type: 'teaching', content: '💡 Bulb lights when circuit is complete.' },
    { type: 'teaching', content: '🧤 Rubber is an insulator; copper is a conductor.' },
    { type: 'teaching', content: '🚫 Broken circuit → no light.' },

    { type: 'question', question: 'Electricity is flow of?', options: ['Protons', 'Electrons', 'Neutrons'], correct: 1 },
    { type: 'question', question: 'Battery does?', options: ['Stops flow', 'Pushes electrons', 'Cools wires'], correct: 1 },
    { type: 'question', question: 'Rubber is?', options: ['Conductor', 'Insulator', 'Battery'], correct: 1 },
    { type: 'question', question: 'Complete circuit = bulb?', options: ['Off', 'On', 'Broken'], correct: 1 },
    { type: 'question', question: 'Copper is?', options: ['Insulator', 'Conductor', 'Plant'], correct: 1 }
  ],
  7: [
    { type: 'teaching', content: '🌈 Light travels in straight lines.' },
    { type: 'teaching', content: '🪞 Mirrors reflect light; lenses bend light.' },
    { type: 'teaching', content: '☀️ Sunlight is white but has many colors.' },
    { type: 'teaching', content: '👁️ Eyes see objects when light reflects into them.' },
    { type: 'teaching', content: '📦 Shadows form when light is blocked.' },

    { type: 'question', question: 'Light travels?', options: ['Curvy', 'Straight', 'Zig-zag'], correct: 1 },
    { type: 'question', question: 'Mirror does?', options: ['Absorb', 'Reflect', 'Hide'], correct: 1 },
    { type: 'question', question: 'Shadow is?', options: ['Extra light', 'No light', 'Color'], correct: 1 },
    { type: 'question', question: 'Eyes need?', options: ['Sound', 'Light', 'Heat'], correct: 1 },
    { type: 'question', question: 'Lenses?', options: ['Bend light', 'Stop light', 'Make sound'], correct: 0 }
  ],
  8: [
    { type: 'teaching', content: '🔊 Sound is caused by vibrations.' },
    { type: 'teaching', content: '🎵 Fast vibrations → high pitch, slow → low pitch.' },
    { type: 'teaching', content: '📢 Loudness depends on size of vibrations.' },
    { type: 'teaching', content: '🌊 Sound needs air, water or solids to travel.' },
    { type: 'teaching', content: '🚀 Sound cannot travel in space (vacuum).' },

    { type: 'question', question: 'Sound is?', options: ['Vibration', 'Light', 'Color'], correct: 0 },
    { type: 'question', question: 'Fast vibrations?', options: ['High pitch', 'Low pitch', 'No sound'], correct: 0 },
    { type: 'question', question: 'Sound needs?', options: ['Vacuum', 'Medium', 'Nothing'], correct: 1 },
    { type: 'question', question: 'In space sound?', options: ['Travels', 'Does not travel', 'Is louder'], correct: 1 },
    { type: 'question', question: 'Loud sound?', options: ['Small vibration', 'Big vibration', 'No vibration'], correct: 1 }
  ],
  9: [
    { type: 'teaching', content: '🫀 Heart pumps blood around body.' },
    { type: 'teaching', content: '🫁 Lungs help us breathe oxygen.' },
    { type: 'teaching', content: '🦴 Bones support our body.' },
    { type: 'teaching', content: '🧠 Brain controls body and thoughts.' },
    { type: 'teaching', content: '💪 Muscles help us move.' },

    { type: 'question', question: 'Heart belongs to?', options: ['Circulatory system', 'Digestive', 'Nervous'], correct: 0 },
    { type: 'question', question: 'Lungs give?', options: ['Food', 'Oxygen', 'Light'], correct: 1 },
    { type: 'question', question: 'Bones?', options: ['Support', 'Think', 'Breathe'], correct: 0 },
    { type: 'question', question: 'Brain controls?', options: ['Only legs', 'Whole body', 'Only heart'], correct: 1 },
    { type: 'question', question: 'Muscles help?', options: ['See', 'Move', 'Smell'], correct: 1 }
  ],
  10: [
    { type: 'teaching', content: '🎉 You finished Science Space levels!' },
    { type: 'teaching', content: '🔬 Science explains how the world works.' },
    { type: 'teaching', content: '🧪 Asking questions leads to discoveries.' },
    { type: 'teaching', content: '🌍 Science helps solve real problems.' },
    { type: 'teaching', content: '🚀 Keep exploring and learning more!' },

    { type: 'question', question: 'Science helps?', options: ['Confuse', 'Explain world', 'Hide truth'], correct: 1 },
    { type: 'question', question: 'Questions lead to?', options: ['Nothing', 'Discoveries', 'Sleep'], correct: 1 },
    { type: 'question', question: 'Finished all levels means?', options: ['Science Master', 'Beginner', 'Nothing'], correct: 0 },
    { type: 'question', question: 'Science can?', options: ['Solve problems', 'Create problems only', 'Only entertain'], correct: 0 },
    { type: 'question', question: 'You should?', options: ['Stop learning', 'Keep exploring', 'Forget science'], correct: 1 }
  ]
};

// ---------- AUTH + PROGRESS ----------
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  currentUser = user;
  setupLevelButtons();
  loadProgress();
});

function loadProgress() {
  const userRef = ref(db, `users/${currentUser.uid}`);
  onValue(userRef, (snap) => {
    const data = snap.val() || {};
    scienceProgress = data.progress?.science || 0;
    const score = data.score || 0;
    document.getElementById('scienceStars')?.innerText = score;
    updateLevelUI();
  });
}

// ---------- LEVEL BUTTONS ----------
function setupLevelButtons() {
  document.querySelectorAll('.level-btn').forEach(btn => {
    const level = parseInt(btn.dataset.level);
    btn.addEventListener('click', () => openLevel(level));
  });
}

function updateLevelUI() {
  document.querySelectorAll('.level-btn').forEach(btn => {
    const level = parseInt(btn.dataset.level);
    btn.classList.toggle('locked', level > scienceProgress + 1);
    btn.classList.toggle('completed', level <= scienceProgress);
  });

  document.getElementById('currentLevelInfo')?.innerText = scienceProgress + 1;
}

// ---------- OPEN / SHOW CARDS ----------
function openLevel(level) {
  if (level > scienceProgress + 1) {
    alert(`🔒 Finish Level ${scienceProgress} first!`);
    return;
  }

  currentLevel = level;
  cards = scienceContent[level] || [];
  currentCardIndex = 0;
  starsEarned = 0;
  document.getElementById('starsCounter').innerText = starsEarned;
  showCard();
}

function showCard() {
  if (currentCardIndex >= cards.length) {
    completeLevel();
    return;
  }

  const card = cards[currentCardIndex];
  document.getElementById('cardType').textContent =
    card.type === 'teaching' ? '📚 Learning' : '❓ Quiz Time';
  document.getElementById('cardBody').innerHTML =
    card.type === 'teaching'
      ? `<div class="teaching">${card.content}</div>`
      : buildQuestionHTML(card);

  updateNavButtons();
  document.getElementById('cardModal').style.display = 'block';
}

function buildQuestionHTML(card) {
  return `
    <p style="font-size:22px;margin-bottom:16px;">${card.question}</p>
    <div style="display:flex;flex-direction:column;gap:10px;">
      ${card.options
        .map(
          (opt, i) =>
            `<button class="option-btn" data-index="${i}">${opt}</button>`
        )
        .join('')}
    </div>
  `;
}

// ---------- ANSWERS ----------
function handleOptionClick(e) {
  const btn = e.target.closest('.option-btn');
  if (!btn) return;

  const selected = parseInt(btn.dataset.index);
  const card = cards[currentCardIndex];
  const correct = card.correct;

  document
    .querySelectorAll('.option-btn')
    .forEach((b, i) => {
      b.disabled = true;
      if (i === correct) {
        b.style.background = '#6BCF9D';
      } else if (i === selected && i !== correct) {
        b.style.background = '#FF6B6B';
      }
    });

  if (selected === correct) {
    starsEarned++;
    document.getElementById('starsCounter').innerText = starsEarned;
  }

  setTimeout(() => {
    currentCardIndex++;
    showCard();
  }, 1000);
}

document.addEventListener('click', handleOptionClick);

// ---------- NAV ----------
function nextCard() {
  if (currentCardIndex < cards.length - 1) {
    currentCardIndex++;
    showCard();
  }
}
function prevCard() {
  if (currentCardIndex > 0) {
    currentCardIndex--;
    showCard();
  }
}

function updateNavButtons() {
  const prev = document.querySelector('.prev');
  const next = document.querySelector('.next');
  if (!prev || !next) return;

  prev.disabled = currentCardIndex === 0;
  next.disabled = currentCardIndex >= cards.length - 1;
}

// ---------- COMPLETE LEVEL ----------
function completeLevel() {
  const stars = Math.min(5, starsEarned);

  const userRef = ref(db, `users/${currentUser.uid}`);
  onValue(
    userRef,
    (snap) => {
      const data = snap.val() || {};
      const newScore = (data.score || 0) + stars;
      const newBadges =
        currentLevel % 3 === 0 ? (data.badges || 0) + 1 : data.badges || 0;

      const updates = {};
      updates[`users/${currentUser.uid}/progress/science`] = Math.max(
        currentLevel,
        scienceProgress
      );
      updates[`users/${currentUser.uid}/score`] = newScore;
      updates[`users/${currentUser.uid}/badges`] = newBadges;

      update(ref(db), updates);
    },
    { onlyOnce: true }
  );

  alert(
    `🎉 Level ${currentLevel} Complete!\n⭐ Stars this level: ${stars}/5`
  );

  document.getElementById('cardModal').style.display = 'none';
}

// ---------- GLOBAL for HTML buttons ----------
window.nextCard = nextCard;
window.prevCard = prevCard;
window.closeCard = () =>
  (document.getElementById('cardModal').style.display = 'none');
