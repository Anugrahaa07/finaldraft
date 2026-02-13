let recorder;
//let audioChunks = [];

const statusText = document.getElementById("status");
const sosBtn = document.getElementById("sosBtn");

sosBtn.addEventListener("click", activateSOS);

function activateSOS() {
  document.body.classList.add("dark");   // screen goes dark
  startRecording();                      // audio evidence
  getLocationAndSendSMS();               // 📍 + SMS
}


function startRecording() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      recorder = new MediaRecorder(stream);
      recorder.start();

      recorder.ondataavailable = e => audioChunks.push(e.data);
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks);
        console.log("Audio recorded:", audioBlob);
      };
    })
    .catch(() => {
      statusText.innerText = "Microphone access denied";
    });
}

function getLocation() {
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      sendSOS(latitude, longitude);
    }
  );
}


function speak(text) {
  const msg = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(msg);
}

function useCard(message) {
  // Put text into textarea
  const box = document.getElementById("ttsText");
  box.value = message;

  // Speak it
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.rate = 0.9;
  speechSynthesis.speak(utterance);
}

function sendSOS(latitude, longitude) {
  fetch("https://your-backend-url/sos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Emergency! Child needs help.",
      lat: latitude,
      lon: longitude
    })
  });
}
function getLocationAndSendSMS() {
  // Get the emergency number entered by the user
  const phoneNumber = document.getElementById('contact').value;
  
  if (!phoneNumber) {
    alert("Please enter an emergency contact number!");
    return; // Stop if no number entered
  }

  // Get current location
  navigator.geolocation.getCurrentPosition(
    position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const message =
        "🚨 EMERGENCY ALERT 🚨\n" +
        "I need help.\n" +
        "This is my location:\n" +
        "https://maps.google.com/?q=" + lat + "," + lon;

      // Open SMS app with prefilled message
      window.location.href = "sms:" + phoneNumber + "?body=" + encodeURIComponent(message);
    },
    () => {
      alert("Location access denied");
    }
  );
}

function speakText() {
  const text = document.getElementById("ttsText").value;

  if (!text) {
    alert("Please enter text");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;   // slower for clarity
  utterance.pitch = 1;
  utterance.volume = 1;

  speechSynthesis.speak(utterance);
}
let mediaRecorder;
let audioChunks = [];
let sosActive = false;

async function toggleSOS() {
  if (!sosActive) {
    startRecording();
    sosActive = true;

    // 👇 ADD THIS HERE
    document.getElementById("sosStatus").innerText =
      "Recording audio evidence…";

    document.getElementById("sosBtn").innerText = "🛑 STOP SOS";
  } else {
    stopRecording();
    sosActive = false;

    // 👇 AND THIS HERE
    document.getElementById("sosStatus").innerText =
      "Tap to activate emergency mode";

    document.getElementById("sosBtn").innerText = "🚨 SOS";
  }
}


// START RECORDING
async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];

  mediaRecorder.ondataavailable = event => {
    audioChunks.push(event.data);
  };

  mediaRecorder.onstop = saveRecording;

  mediaRecorder.start();
}

// STOP + SAVE
function stopRecording() {
  if (mediaRecorder) {
    mediaRecorder.stop();
  }
}

// SAVE LOCALLY
function saveRecording() {
  const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
  const audioURL = URL.createObjectURL(audioBlob);

  document.getElementById("playback").src = audioURL;

  // Save to local storage (as base64)
  const reader = new FileReader();
  reader.readAsDataURL(audioBlob);
  reader.onloadend = () => {
    localStorage.setItem("sos_audio", reader.result);
  };
}
window.onload = () => {
  const savedAudio = localStorage.getItem("sos_audio");
  if (savedAudio) {
    document.getElementById("playback").src = savedAudio;
  }
};

function saveMedicalInfo() {
  const medicalData = {
    name: name.value,
    age: age.value,
    blood: blood.value,
    condition: condition.value,
    allergy: allergy.value,
    contact: contact.value
  };

  localStorage.setItem("medicalInfo", JSON.stringify(medicalData));
  alert("Medical info saved!");
}

function showMedicalInfo() {
  const data = JSON.parse(localStorage.getItem("medicalInfo"));
  if (!data) return alert("No medical info found");

  medicalCard.innerHTML = `
    <h3>🚑 Emergency Medical Info</h3>
    <p><b>Name:</b> ${data.name}</p>
    <p><b>Age:</b> ${data.age}</p>
    <p><b>Blood Group:</b> ${data.blood}</p>
    <p><b>Condition:</b> ${data.condition}</p>
    <p><b>Allergies:</b> ${data.allergy}</p>
    <p><b>Contact:</b> ${data.contact}</p>
  `;

  medicalCard.classList.remove("hidden");
}
 function saveMood(mood) {
  const today = new Date().toISOString().slice(0, 10);
  let moods = JSON.parse(localStorage.getItem("moods")) || {};

  moods[today] = mood;
  localStorage.setItem("moods", JSON.stringify(moods));

  alert("Mood saved!");
}

function showMoodSummary() {
  let moods = JSON.parse(localStorage.getItem("moods")) || {};
  let summary = "";

  for (let date in moods) {
    summary += `${date}: ${moods[date]}<br>`;
  }

  moodResult.innerHTML = summary || "No mood data yet";
}

function getEmergencyContact() {
  const contact = document.getElementById('contact').value;
  if (!contact) {
    alert("Please enter an emergency contact number!");
    return null;
  }
  return contact;
}

function saveMedicalInfo() {
  const contact = document.getElementById('contact').value;
  if (contact) {
    localStorage.setItem('emergencyContact', contact);
  }
  alert("Medical info saved!");
}

// And when using SOS:
function getEmergencyContact() {
  return localStorage.getItem('emergencyContact') || "";
}
