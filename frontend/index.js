document.addEventListener('DOMContentLoaded', () => {
    const pdfFile = document.getElementById('pdfFile');
    const uploadBtn = document.getElementById('uploadBtn');
    const questionInput = document.getElementById('questionInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatMessages = document.getElementById('chatMessages');
    const uploadOverlay = document.getElementById('uploadOverlay');
    const mainContent = document.getElementById('mainContent');
    const pdfViewer = document.getElementById('pdfViewer');
    const changePdfBtn = document.getElementById('changePdfBtn');
    
    let pdfUploaded = false;
    let currentPdfUrl = null;
    let isTyping = false;

    // Function to create a thinking message
    function createThinkingMessage() {
        const thinkingDiv = document.createElement('div');
        thinkingDiv.className = 'message bot-message thinking';
        thinkingDiv.innerHTML = `
            <div class="thinking-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        return thinkingDiv;
    }

    // Function to type out text with animation
    async function typeText(element, text) {
        const words = text.split(' ');
        element.textContent = '';
        
        for (let i = 0; i < words.length; i++) {
            if (i > 0) element.textContent += ' ';
            element.textContent += words[i];
            
            // Random delay between words (30-70ms)
            await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 40));
        }
    }

    // Function to add a message to the chat
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        
        if (isUser) {
            messageDiv.textContent = content;
        } else {
            // For bot messages, we'll start with empty content
            messageDiv.textContent = '';
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        return messageDiv;
    }

    // Function to show PDF preview
    function showPdfPreview(file) {
        if (currentPdfUrl) {
            URL.revokeObjectURL(currentPdfUrl);
        }
        currentPdfUrl = URL.createObjectURL(file);
        pdfViewer.src = currentPdfUrl;
    }

    // Function to handle PDF upload
    async function handleUpload() {
        const file = pdfFile.files[0];
        if (!file) {
            alert('Please select a PDF file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            uploadBtn.disabled = true;
            uploadBtn.textContent = 'Uploading...';
            
            const response = await fetch('http://localhost:5001/check', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (response.ok) {
                pdfUploaded = true;
                showPdfPreview(file);
                uploadOverlay.style.display = 'none';
                mainContent.style.display = 'flex';
                const messageDiv = addMessage('PDF uploaded successfully! You can now ask questions about it.', false);
                await typeText(messageDiv, 'PDF uploaded successfully! You can now ask questions about it.');
                questionInput.disabled = false;
                sendBtn.disabled = false;
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (error) {
            const messageDiv = addMessage(`Error: ${error.message}`, false);
            await typeText(messageDiv, `Error: ${error.message}`);
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload PDF';
        }
    }

    // Function to handle sending questions
    async function handleSend() {
        if (isTyping) return;
        
        const question = questionInput.value.trim();
        if (!question) return;
        if (!pdfUploaded) {
            const messageDiv = addMessage('Please upload a PDF first', false);
            await typeText(messageDiv, 'Please upload a PDF first');
            return;
        }

        // Add user message to chat
        addMessage(question, true);
        questionInput.value = '';
        sendBtn.disabled = true;

        // Add thinking message
        const thinkingMessage = createThinkingMessage();
        chatMessages.appendChild(thinkingMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const response = await fetch('http://localhost:5001/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question })
            });

            const data = await response.json();
            
            if (response.ok) {
                // Remove thinking message
                thinkingMessage.remove();
                
                // Add and type out the response
                isTyping = true;
                const messageDiv = addMessage('', false);
                await typeText(messageDiv, data.answer);
                isTyping = false;
            } else {
                throw new Error(data.error || 'Failed to get response');
            }
        } catch (error) {
            // Remove thinking message
            thinkingMessage.remove();
            
            // Add and type out the error
            isTyping = true;
            const messageDiv = addMessage('', false);
            await typeText(messageDiv, `Error: ${error.message}`);
            isTyping = false;
        } finally {
            sendBtn.disabled = false;
        }
    }

    // Function to show upload overlay
    function showUploadOverlay() {
        uploadOverlay.style.display = 'flex';
        mainContent.style.display = 'none';
        pdfUploaded = false;
        questionInput.disabled = true;
        sendBtn.disabled = true;
        chatMessages.innerHTML = '';
        if (currentPdfUrl) {
            URL.revokeObjectURL(currentPdfUrl);
            currentPdfUrl = null;
        }
    }

    // Event listeners
    uploadBtn.addEventListener('click', handleUpload);
    sendBtn.addEventListener('click', handleSend);
    changePdfBtn.addEventListener('click', showUploadOverlay);
    
    // Handle Enter key in textarea
    questionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    // Initial state
    questionInput.disabled = true;
    sendBtn.disabled = true;
});
