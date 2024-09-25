let alarmTime = null;
let alarmTimeout = null;
let radius = null;
let audio = new Audio('/time-in-a-bottle.mp3');
let lastKeyUp = 0; // time of last keyUp
let lastKeyTyped = null; // code of the last keyUp event
let keyUpsDetected = 0; // count number of keyups detected to determine if double or tripple tap occured.
let lastTap = 0; // time of last tap
let tapsDetected = 0; // count number of taps detected to determine if double or tripple tap occured.

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

setClockFaceRadius();

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
  let alarmTimeString = prompt("Enter alarm time (HH:MM):");

  //const alarmInput = document.getElementById('alarmTime').value;
  //if (!alarmInput) {
  //  alert('Please select a valid time for the alarm.');
  //  return;
  //}

  const now = new Date();
  //const alarmDate = new Date(`${now.toDateString()} ${alarmInput}`);
  const alarmDate = new Date(`${now.toDateString()} ${alarmTimeString}`);

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

function snoozeAlarm() {
  alert("Snooze feature under development.")
  return;
  // Get the alarm input value (in HH:MM format)
  const alarmInputField = document.getElementById('alarmTime');
  const alarmInput = alarmInputField.value;

  if (!alarmInput) {
    alert('Please set a valid alarm time before snoozing!');
    return;
  }

  // Get the current date and parse the alarm input time (HH:MM)
  const now = new Date();
  const [hours, minutes] = alarmInput.split(':').map(Number); // Split the HH:MM input into hours and minutes
  const alarmDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

  // Add 10 minutes to the alarm time
  alarmDate.setMinutes(alarmDate.getMinutes() + 10);

  // Update the input field with the new time in HH:MM format
  const newAlarmTime = alarmDate.toTimeString().slice(0, 5); // Extract HH:MM
  alarmInputField.value = newAlarmTime;

  // Call setAlarm() to set the new alarm
  setAlarm();
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

function displayHelp() {
  const message = "single 'f' Key - toggle fullscreen mode\n" +
    "double 'a' - set alarm\n" +
    "double 'n' - snooze (n is for 'nap') for x minutes (enter minutes followed by 'Enter' key)\n" +
    "double 's' - stop the alarm (same as double 'spacebar'\n" +
    "double 'spacebar' - stop alarm\n" +
    "double 'Esc' - display this dialog\n" +
    "double tap - stop alarm\n" +
    "triple tap - display this dialog";
  alert(message);
}

function wrapUpKeyUpEvent(clearKeyUpsDetected = false, keyTyped = null) {
  if (clearKeyUpsDetected) {
    keyUpsDetected = 0;
  } else {
    keyUpsDetected += 1;
  }
  lastKeyTyped = keyTyped;
}

function wrapUpTapEvent(clearTapsDetected = false) {
  if (clearTapsDetected) {
    tapsDetected = 0;
  } else {
    tapsDetected += 1;
  }
}

// Add an event listener to detect key press 'F'
document.addEventListener('keyup', function (event) {
  const currentTime = new Date().getTime();
  const keyUpLength = currentTime - lastKeyUp;

  try {
    if (keyUpsDetected < 0) {
      throw new Error("keyUpsDetected should not be less than zero.");
    }
  } catch (e) {
    console.log(e.message);
    alert("Your app is corrupted. Please clear the data and reload or reinstall the app.");
    return;
  } // try-catch block
  
  if (keyUpLength < 300 && keyUpLength > 0) {
    lastKeyUp = currentTime; // reset timer for next keypress.

    // process single keypress
    // user requests fullscreen toggle
    if (event.key === 'f' || event.key === 'F') {
      event.preventDefault();
      toggleFullScreen();
      wrapUpKeyUpEvent(true); // clearKeyUpsDetected = true, keyTyped defaults to null
      return;
    }

    // 'f'/'F' key not pressed, so continue processing first keyUp event.
    if (keyUpsDetected === 0) {
      // store info for text keyUp
      event.preventDefault();
      wrapUpKeyUpEvent(false, event.key);
      return;
    }

    if (keyUpsDetected === 1) {
      if (event.key === lastKeyTyped) {
        // TODO: process double keyUp
        // user requests alarm set
        if (event.key === 'a' || event.key === 'A') {
          event.preventDefault();
          wrapUpKeyUpEvent(true); // keyTyped defaults to null.
          alert('Setting alarm is not yet implemented.')
          return;
        }

        // user requests to stop the alarm.
        if (event.key === 'Space' || event.key === 's' || event.key === 'S') {
          event.preventDefault();
          stopAlarm();
          wrapUpKeyUpEvent(true); // keyTyped defaults to null.
          return;
        }

        // user requests help dialog.
        if (event.key === 'Escape') {
          event.preventDefault();
          displayHelp();
          wrapUpKeyUpEvent(true); // keyTyped defaults to null.
          return;
        }
    } // if (event.key === lastKeyTyped)
    } // if keyUpsDetected === 0)
  } // if (0 < keyUpLength < 300)
}); // EventListener(keyUp)

// Element where double-tap is detected
const clock = document.querySelector('.clock');

// Action to take on double-tap
function onDoubleTap() {
  stopAlarm();
}

// Action to take on triple-tap
function onTripleTap() {
  displayHelp()
}

// Event listener for touchstart to detect double-tap
clock.addEventListener('touchstart', function(event) {
  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTap;
  lastTap = currentTime;

  try {
    if (tapsDetected < 0) {
      throw new Error("tapsDetected should not be less than zero.");
    }
  } catch (e) {
    console.log(e.message);
    alert("Your app is corrupted. Please clear the data and reload or reinstall the app.");
    return;
  } // try-catch block

  if (tapLength < 300 && tapLength > 0) {
    if (tapsDetected === 0) {
      wrapUpTapEvent(false);
      return;
    }

    // Double-tap detected
    if (tapsDetected === 1) {
      onDoubleTap();
      wrapUpTapEvent(true);
      return;
    }

    onTripleTap();
    wrapUpTapEvent(true);
    return;
  } // if (0 < tapLength < 300)
}); // EventListener(touchStart)

function setClockFaceRadius() {
  const clockFace = document.querySelector('.face');
  radius = Math.min(clockFace.offsetHeight / 2, clockFace.offsetWidth / 2);
}
// Call this function when the page loads or when the window is resized
window.onload = function() {
  setClockFaceRadius();
  createTicks();
};

window.onresize = function() {
  setClockFaceRadius();
  document.getElementById('ticks').innerHTML = ''; // Clear existing ticks
  createTicks(); // Regenerate ticks on window resize
};