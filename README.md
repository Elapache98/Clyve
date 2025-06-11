# Clyve - PDF Document Analysis

A web application that allows users to upload PDF documents and ask questions about their content using Claude AI.

## Features
- PDF document upload and text extraction
- AI-powered document analysis using Claude
- Interactive chat interface for asking questions about the document

## Setup
1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the backend directory with your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your-api-key-here
   ```
5. Start the backend server:
   ```bash
   cd backend
   python app.py
   ```
6. Open `frontend/index.html` in your browser

## Technologies Used
- Backend: Python, Flask
- Frontend: HTML, CSS, JavaScript
- AI: Anthropic Claude
- PDF Processing: pdfplumber 