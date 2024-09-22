let alarmTime = null;
let alarmTimeout = null;
let radius = null;
let audio = new Audio('/time-in-a-bottle.mp3');
let lastTap = 0;

function createTicks() {
  const tickContainer = document.getElementById('ticks');
  
  for (let i = 0; i < 60; i++) {
    const tick = document.createElement('div');
    tick.classList.add('tick');

    // For hour ticks (every 5th tick)
    if (i % 5 === 0) {
      tick.classList.add('hour-tick');
    }

    // Positioning the tick marks in a circular pattern
    const angle = (i / 60) * 360;
    tick.style.transform = `rotate(${angle}deg) translateY(-${radius - 20}px)`;
    tickContainer.appendChild(tick);
  }
}

setClockRadius();

// Call this function when the page loads
createTicks();

// Clock Functionality
function updateClock() {
  const now = new Date();
  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours();

  const secondHand = document.getElementById('second-hand');
  const minuteHand = document.getElementById('minute-hand');
  const hourHand = document.getElementById('hour-hand');

  // Calculate the degrees for each hand
  const secondDegrees = ((seconds / 60) * 360) - 90;
  const minuteDegrees = ((minutes / 60) * 360) - 90;
  const hourDegrees = ((hours / 12) * 360) + ((minutes / 60) * 30) - 90;

  secondHand.style.transform = `rotate(${secondDegrees}deg)`;
  minuteHand.style.transform = `rotate(${minuteDegrees}deg)`;
  hourHand.style.transform = `rotate(${hourDegrees}deg)`;
}

setInterval(updateClock, 1000);

// Alarm Functionality
function setAlarm() {
  const alarmInput = document.getElementById('alarmTime').value;
  if (!alarmInput) {
    alert('Please select a valid time for the alarm.');
    return;
  }

  const now = new Date();
  const alarmDate = new Date(`${now.toDateString()} ${alarmInput}`);

  if (alarmDate < now) {
    alarmDate.setDate(now.getDate() + 1);  // Set for next day if time has passed
  }

  const timeToAlarm = alarmDate - now;

  if (alarmTimeout) {
    clearTimeout(alarmTimeout);  // Clear any existing alarm
  }

  alarmTimeout = setTimeout(triggerAlarm, timeToAlarm);
  alert(`Alarm set for ${alarmDate.toLocaleTimeString()}`);
}

function stopAlarm() {
    audio.pause();
    audio.loop = false;
    audio.currentTime = 0;
    alarmTimeout = null;
}

function triggerAlarm() {
  audio.loop = true;
  audio.play();
  // Reset the alarm
  alarmTimeout = null;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
  .then(() => console.log('Service Worker Registered'));
}

// Function to toggle fullscreen mode
function toggleFullScreen() {
  const element = document.documentElement; // Full screen the entire page

  if (!document.fullscreenElement) { // If not in fullscreen mode
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) { // Firefox
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) { // Chrome, Safari, and Opera
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) { // IE/Edge
      element.msRequestFullscreen();
    }
  } else { // If already in fullscreen mode, exit it
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { // Firefox
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { // Chrome, Safari, and Opera
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // IE/Edge
      document.msExitFullscreen();
    }
  }
}

// Add an event listener to detect key press 'F'
document.addEventListener('keydown', function (event) {
  if (event.key === 'f' || event.key === 'F') {
    event.preventDefault();
    toggleFullScreen();
  }
  if (event.key == 's' || event.key == 'S') {
    event.preventDefault();
    stopAlarm();
  }
});

// Element where double-tap is detected
const clock = document.querySelector('.clock');

// Event listener for touchstart to detect double-tap
clock.addEventListener('touchstart', function(event) {
  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTap;

  if (tapLength < 300 && tapLength > 0) {
    // Double-tap detected
    onDoubleTap();
  }

  lastTap = currentTime;
});

// Action to take on double-tap
function onDoubleTap() {
  stopAlarm();
}

function setClockRadius() {
    const clock = document.querySelector('.clock');
    radius = Math.min(clock.offsetHeight / 2, clock.offsetWidth / 2);
}
// Call this function when the page loads or when the window is resized
window.onload = function() {
    setClockRadius();
    createTicks();
};

window.onresize = function() {
    setClockRadius();
  document.getElementById('ticks').innerHTML = ''; // Clear existing ticks
  createTicks(); // Regenerate ticks on window resize
};