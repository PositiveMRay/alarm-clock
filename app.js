let alarmTime = null;
let alarmTimeout = null;
let radius = null;
let audio = new Audio('/time-in-a-bottle.mp3');
let lastKeyUp = new Date(); // date and time of last keyUp
const keyUpThreshold = 1000; // one thousand milliseconds
let lastKeyTyped = null; // code of the last keyUp event
let keyUpsDetected = 0; // count number of keyups detected to determine if double or tripple tap occured.
const tapThreshold = 300; // 300 milliseconds
let lastTap = 0; // time of last tap // TODO: refactor this to be a Date and use it in the handleTap function.
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
  // TODO: Make a dialog for this.
  let alarmTimeString = prompt("Enter alarm time (HH:MM):");

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
  alarmTime = null;
  alarmTimeout = null;
}

function triggerAlarm() {
  audio.loop = true;
  audio.play();
  sendNotification();
  // Reset the alarm
  alarmTime = null;
  alarmTimeout = null;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
  .then((registration) => console.log('Service worker registered with scope:', registration.scope));
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

function wrapUpTapEvent(clearTapsDetected) {
  if (clearTapsDetected === true) {
    tapsDetected = 0;
  } else {
    tapsDetected += 1;
  }
}
function handleKeyUp(event) {
  const currentTime = new Date();
  
  if (lastKeyUp === 0) {
    lastKeyUp = new Date();
  }

  const keyUpLength =  Math.abs(currentTime.getMilliseconds() - lastKeyUp.getMilliseconds());
  
  try {
    if (keyUpsDetected < 0) {
      throw new Error("keyUpsDetected should not be less than zero.");
    }
  } catch (e) {
    console.log(e.message);
    alert("Your app is corrupted. Please clear the data and reload or reinstall the app.");
    return;
  } // try-catch block
  
  if (keyUpLength < keyUpThreshold && keyUpLength > 0) {
    // process single keypress
    // user requests fullscreen toggle
    if (event.key.toLowerCase() === 'f') {
      event.preventDefault();
      toggleFullScreen();
      keyUpsDetected = 0;
      lastKeyTyped = null;
      lastKeyUp = new Date();
      return;
    } // if key = 'f'

    if (event.key === lastKeyTyped) {
        // process double keyUp
        switch (event.key) {
        case 'a':
        case 'A':
          // user requests alarm set
          event.preventDefault();
          //alert('Setting alarm is not yet implemented.')
          setAlarm();
          break;
        // user requests to stop the alarm.
        case ' ':
        case 's':
        case 'S':
          event.preventDefault();
          stopAlarm();
          break;
        // user requests to snooze the alarm.
        case 'n':
        case 'N':
          event.preventDefault();
          snoozeAlarm();
          break;

        // user requests help dialog.
        case 'Escape':
          event.preventDefault();
          displayHelp();
          break;
        default:
          break;
      }
      lastKeyTyped = null;
      keyUpsDetected = 0;
      lastKeyUp = new Date();
      return;
    } // if keyTyped = lastKeyTyped

    keyUpsDetected += 1;
    lastKeyTyped = event.key;
    lastKeyUp = new Date();
    return;
  } // if keyUpLength < keyUpThreshood
} // handleKeyUp

// Element where double-tap is detected
//const clock = document.querySelector('.clock');

// Action to take on double-tap
function onDoubleTap() {
  stopAlarm();
}

// Action to take on triple-tap
function onTripleTap() {
  displayHelp()
}

function handleTap (event) {
// Event listener for touchstart to detect double-tap
  // TODO: refactor currentTime and lastTap to be just Dates and not new Date().getTime();
  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTap;

  try {
    if (tapsDetected < 0) {
      throw new Error("tapsDetected should not be less than zero.");
    }
  } catch (e) {
    console.log(e.message);
    alert("Your app is corrupted. Please clear the data and reload or reinstall the app.");
    return;
  } // try-catch block

  if (tapLength < tapThreshold && tapLength > 0) {
    if (tapsDetected === 0) {
      wrapUpTapEvent(false);
    }

    // Double-tap detected
    if (tapsDetected === 1) {
      onDoubleTap();
      wrapUpTapEvent(true);
    }
  
    if (tapsDetected === 2) {
      onTripleTap();
      wrapUpTapEvent(true);
    }

    lastTap = currentTime; // TODO: shouldn't I get the new current time?
    return;
  } // if (0 < tapLength < tapThreshold)
}; // handleTap

function setClockFaceRadius() {
  const clockFace = document.querySelector('.face');
  radius = Math.min(clockFace.offsetHeight / 2, clockFace.offsetWidth / 2);
}

function sendNotification() {
  if (Notification.permission === 'granted') {
    new Notification('Alarm', {
      body: 'Your alarm is ringing!',
      icon: '/icon.png',
      badge: '/icon.png' // TODO: Maybe change this badge to blue circle with a white number in it.
    });
  }
}

// Call this function when the page loads or when the window is resized
window.onload = function() {
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log("Notification permission granted.");
      } else {
        console.log("Notification permission was denied.");
      } // if-else
    }); // requestPermission.then(permission)
  } // if 'Notification' in window
  
  const clock = document.querySelector('.clock');
  
  setClockFaceRadius();
  createTicks();
  document.addEventListener('keyup', function (event) {
    handleKeyUp(event);
  });

  clock.addEventListener('touchstart', function (event) {
    handleTap(event);
  });

  displayHelp();

}; // window.onLoad

window.onresize = function() {
  setClockFaceRadius();
  document.getElementById('ticks').innerHTML = ''; // Clear existing ticks
  createTicks(); // Regenerate ticks on window resize
};
