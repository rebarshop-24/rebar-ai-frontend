const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');

function addMessage(role, content) {
  const div = document.createElement('div');
  div.className = 'message ' + role;
  div.textContent = content;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  addMessage('user', text);
  userInput.value = '';

  fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: text }] })
  })
    .then(res => res.json())
    .then(data => addMessage('ai', data.reply))
    .catch(err => addMessage('ai', 'Error: ' + err.message));
}

function uploadFile() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  if (!file) return;

  addMessage('user', `Uploaded file: ${file.name}`);

  const formData = new FormData();
  formData.append('file', file);

  fetch('/api/parse-drawing', {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(data => addMessage('ai', data.reply))
    .catch(err => addMessage('ai', 'Upload error: ' + err.message));
}

function startListening() {
  if (!('webkitSpeechRecognition' in window)) {
    alert('Speech Recognition not supported');
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    userInput.value = text;
    sendMessage();
  };

  recognition.onerror = (event) => {
    addMessage('ai', 'Voice error: ' + event.error);
  };

  recognition.start();
}