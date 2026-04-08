// LIHGT_DARK modes
// //Load saved theme
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'dark') {
  document.body.classList.add('dark-mode');
}

// THEME TOGGLE
const toggleBtn = document.getElementById('theme-toggle');
if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    // ✅ SAVE preference
    if (document.body.classList.contains('dark-mode')) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  });
  
  if (!localStorage.getItem('theme')) {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
  }
}
}



// NAVIGATION (front page -> darbai section if you're using one-page style)
const darbaiLink = document.querySelector('#darbai-link');
if (darbaiLink) {
  darbaiLink.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('#main-section').style.display = 'none';
    document.querySelector('#darbai-section').style.display = 'block';
  });
}

// darbai-scroll.js
document.addEventListener('DOMContentLoaded', () => {
  const projects = document.getElementById('projects');
  if (!projects) {
    console.warn('darbai-scroll: #projects not found. Make sure you are on darbai.html and #projects exists.');
    return;
  }

  // Make each .project exactly viewport width (helps snapping)
  function setProjectWidths() {
    const slides = projects.querySelectorAll('.project');
    slides.forEach(slide => {
      slide.style.minWidth = window.innerWidth + 'px';
    });
  }
  setProjectWidths();
  window.addEventListener('resize', setProjectWidths);

  // Improve touch support (touch will scroll horizontally by default on the container).
  // Ensure CSS: .projects { overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory; }

  // Wheel -> horizontal scroll (attach to projects so scroll occurs when cursor is over the area)
  let scrollTimeout;
  const multiplier = 1.8; // increase if wheel is too slow (adjust to taste)

  function onWheel(e) {
    // allow normal behavior if modifier keys pressed
    if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;

    // prevent vertical scroll
    e.preventDefault();

    // Normalize delta across devices/browsers
    const rawDelta = e.deltaY !== undefined ? e.deltaY : (e.wheelDelta ? -e.wheelDelta : 0);
    const step = rawDelta * multiplier;

    projects.scrollLeft += step;

    // debounce + snap to nearest slide after user stops scrolling
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const idx = Math.round(projects.scrollLeft / window.innerWidth);
      projects.scrollTo({ left: idx * window.innerWidth, behavior: 'smooth' });
    }, 120);
  }

  // Important: passive:false so preventDefault works
  projects.addEventListener('wheel', onWheel, { passive: false });

  // Keyboard navigation (optional)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      projects.scrollBy({ left: window.innerWidth, behavior: 'smooth' });
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      projects.scrollBy({ left: -window.innerWidth, behavior: 'smooth' });
    }
  });

  // Helpful debug function available in console
  window._debugScrollProjects = () => {
    console.log('projects element:', projects);
    console.log('projects.scrollLeft:', projects.scrollLeft, 'window.innerWidth:', window.innerWidth);
    console.log('slides count:', projects.querySelectorAll('.project').length);
  };
});


// MODEL (only on index page)
const container = document.getElementById('model-container');
if (container) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 5); // keep camera away from model

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(0xeeeeee);
  container.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0x565656, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // Load model
  const loader = new THREE.GLTFLoader();
  let model;
  loader.load(
    'models/tagas.glb',
    (gltf) => {
      model = gltf.scene;
      model.scale.set(2, 2, 2);
      model.position.set(0, 0, 0);
      scene.add(model);
    },
    undefined,
    (error) => console.error('Error loading model:', error)
  );

  // Animate
  function animate() {
    requestAnimationFrame(animate);
    if (model) model.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
  animate();

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

const ring = document.getElementById("ring");
const radius = 600;

// Words to loop through
const words = [" EEHKNAY EEHKNAY EEHKNAY EEHKNAY EEHKNAY EEHKNAY ", "IH IH IH IH IH IH IH IH IH ", "SANŪKNAJ SANGI SANŪKNAJ SANGI SANŪKNAJ SANGI SANŪKNAJ SANGI "];
let wordIndex = 0;
let charIndex = 0;

let letters = [];
let letterElements = [];
let rotation = 0;

function createLetters(text) {
  // Clear previous letters
  ring.innerHTML = "";
  letters = text.split("");
  letterElements = [];

  const angleStep = 360 / letters.length;

  letters.forEach((char, i) => {
    const span = document.createElement("span");
    span.className = "letter";
    span.innerText = char;

    const angle = i * angleStep;
    span.dataset.angle = angle;

    span.style.transform = `
      rotateY(${angle}deg)
      translateZ(${radius}px)
      rotateY(180deg)
    `;

    ring.appendChild(span);
    letterElements.push(span);
  });
}

// Typing effect
function typeLoop() {
  const currentWord = words[wordIndex];
  charIndex++;
  const textToShow = currentWord.slice(0, charIndex);
  createLetters(textToShow);

  if (charIndex < currentWord.length) {
    setTimeout(typeLoop, 100); // typing speed
  } else {
    setTimeout(deleteLoop, 3000); // pause at full word
  }
}

// Deleting effect
function deleteLoop() {
  const currentWord = words[wordIndex];
  charIndex--;
  const textToShow = currentWord.slice(0, charIndex);
  createLetters(textToShow);

  if (charIndex > 0) {
    setTimeout(deleteLoop, 50); // deleting speed
  } else {
    wordIndex = (wordIndex + 1) % words.length; // next word
    setTimeout(typeLoop, 200);
  }
}

// Start typing animation
typeLoop();

// Ring rotation animation
function animate() {
  rotation += 0.4;
  ring.style.transform = `rotateY(${rotation}deg) rotateX(10deg)`;

  letterElements.forEach((letter) => {
    const baseAngle = Number(letter.dataset.angle);
    const totalAngle = baseAngle + rotation;

    const z = Math.cos(totalAngle * Math.PI / 180) * radius;
    const blur = Math.max(0, (z / radius) * 4);

    letter.style.filter = `blur(${blur}px)`;
  });

  requestAnimationFrame(animate);
}

animate();
