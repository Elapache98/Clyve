const uploadBtn = document.getElementById('uploadBtn');
const pdfInput = document.getElementById('pdfInput');
const uploadStatus = document.getElementById('uploadStatus');

const chatSection = document.getElementById('chat-section');
const questionInput = document.getElementById('questionInput');
const askBtn = document.getElementById('askBtn');
const answerDiv = document.getElementById('answer');

uploadBtn.addEventListener('click', async () => {
  if (!pdfInput.files.length) {
    alert('Please select a PDF file first.');
    return;
  }
  uploadStatus.textContent = 'Uploading...';
  const file = pdfInput.files[0];
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('http://127.0.0.1:5001/check', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (res.ok) {
      uploadStatus.textContent = data.message;
      chatSection.style.display = 'block';
    } else {
      uploadStatus.textContent = data.error || 'Upload failed.';
    }
  } catch (err) {
    uploadStatus.textContent = 'Error uploading file.';
    console.error(err);
  }
});

askBtn.addEventListener('click', async () => {
  const question = questionInput.value.trim();
  if (!question) {
    alert('Please enter a question.');
    return;
  }
  answerDiv.textContent = 'Thinking...';

  try {
    const res = await fetch('http://127.0.0.1:5001/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question: question })
    });
    const data = await res.json();
    if (res.ok) {
      answerDiv.textContent = data.answer;
    } else {
      answerDiv.textContent = data.error || 'Error getting answer.';
    }
  } catch (err) {
    answerDiv.textContent = 'Error connecting to server.';
    console.error(err);
  }
});
