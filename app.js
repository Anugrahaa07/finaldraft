let recorder;
//let audioChunks = [];

const statusText = document.getElementById("status");
const sosBtn = document.getElementById("sosBtn");
// ...existing code...



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
  // Get emergency contacts
  let contacts = JSON.parse(localStorage.getItem("emergencyContacts")) || [];
  let phoneNumber = contacts.length > 0 ? contacts[0] : document.getElementById('contact').value || localStorage.getItem("emergencyContact");
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
    document.getElementById("sosStatus").innerText = "Recording audio evidence…";
    document.getElementById("sosBtn").innerText = "🛑 STOP SOS";
    document.getElementById("sendSmsBtn").style.display = "inline-block";
  } else {
    stopRecording();
    sosActive = false;
    document.getElementById("sosStatus").innerText = "Tap to activate emergency mode";
    document.getElementById("sosBtn").innerText = "🚨 SOS";
    document.getElementById("sendSmsBtn").style.display = "none";
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


function saveMedicalInfo() {
  const name = document.getElementById('name').value;
  const age = document.getElementById('age').value;
  const blood = document.getElementById('blood').value;
  const condition = document.getElementById('condition').value;
  const allergy = document.getElementById('allergy').value;

  const medicalInfo = {
    name,
    age,
    blood,
    condition,
    allergy
  };
  localStorage.setItem('medicalInfo', JSON.stringify(medicalInfo));
  alert("Medical info saved!");
  updateMedicalInputs();
}

function updateMedicalInputs() {
  const data = JSON.parse(localStorage.getItem('medicalInfo'));
  if (!data) return;
  document.getElementById('name').value = data.name || '';
  document.getElementById('age').value = data.age || '';
  document.getElementById('blood').value = data.blood || '';
  document.getElementById('condition').value = data.condition || '';
  document.getElementById('allergy').value = data.allergy || '';
}

function showMedicalInfo() {
  // No display box, just keep data in localStorage
}

function saveMood(mood) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;
  let moods = JSON.parse(localStorage.getItem("moods")) || {};
  moods[dateStr] = mood;
  localStorage.setItem("moods", JSON.stringify(moods));
  alert("Mood saved!");
  showMoodSummary();
}

function showMoodSummary() {
  let moods = JSON.parse(localStorage.getItem("moods")) || {};
  let summary = "<table style='width:100%;border-collapse:collapse;'>";
  summary += "<tr><th style='text-align:left;'>Date</th><th style='text-align:left;'>Mood</th></tr>";
  let hasData = false;
  for (let date in moods) {
    summary += `<tr><td>${date}</td><td style='font-size:2rem;'>${moods[date]}</td></tr>`;
    hasData = true;
  }
  summary += "</table>";
  moodResult.innerHTML = hasData ? summary : "<span style='color:#888;'>No mood data yet</span>";
}

function getEmergencyContact() {
  const contact = document.getElementById('contact').value;
  if (!contact) {
    alert("Please enter an emergency contact number!");
    return null;
  }
  return contact;
}

function saveEmergencyContact() {
  const contact = document.getElementById("contact").value;
  if (!contact) {
    alert("Please enter an emergency contact number!");
    return;
  }
  let contacts = JSON.parse(localStorage.getItem("emergencyContacts")) || [];
  if (contacts.includes(contact)) {
    alert("Contact already saved!");
    updateContactList();
    return;
  }
  contacts.push(contact);
  localStorage.setItem("emergencyContacts", JSON.stringify(contacts));
  updateContactList();
  alert("Emergency contact saved!");
}

function updateContactList() {
  let contacts = JSON.parse(localStorage.getItem("emergencyContacts")) || [];
  const list = document.getElementById("contactList");
  if (!list) return;
  if (contacts.length === 0) {
    list.innerHTML = '<li style="color:#888;">No emergency contacts saved.</li>';
    return;
  }
  list.innerHTML = contacts.map((c, i) => `
    <li style="display:flex;align-items:center;gap:8px;">
      <span style="flex:1;">${c}</span>
      <button onclick='editContact(${i})' title='Edit' style='background:#f1c40f;border:none;border-radius:4px;padding:4px 8px;cursor:pointer;color:#222;font-weight:600;'>✏️</button>
      <button onclick='deleteContact(${i})' title='Delete' style='background:#e74c3c;border:none;border-radius:4px;padding:4px 8px;cursor:pointer;color:#fff;font-weight:600;'>🗑️</button>
    </li>`).join("");
}

function editContact(index) {
  let contacts = JSON.parse(localStorage.getItem("emergencyContacts")) || [];
  const newContact = prompt("Edit contact:", contacts[index]);
  if (newContact && newContact.trim()) {
    contacts[index] = newContact.trim();
    localStorage.setItem("emergencyContacts", JSON.stringify(contacts));
    updateContactList();
  }
}

function deleteContact(index) {
  let contacts = JSON.parse(localStorage.getItem("emergencyContacts")) || [];
  contacts.splice(index, 1);
  localStorage.setItem("emergencyContacts", JSON.stringify(contacts));
  updateContactList();
}

window.onload = () => {

  const savedContact = localStorage.getItem("emergencyContact");
  if (savedContact) {
    document.getElementById("contact").value = savedContact;
  }

  const savedAudio = localStorage.getItem("sos_audio");
  if (savedAudio) {
    document.getElementById("playback").src = savedAudio;
  }
  updateContactList();
  restoreMedicalInfo();
  updateMedicalInputs();
  // Restore medical info
  //showMedicalInfo();
  showMoodSummary();
};
