import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber
import anthropic

# Print current working directory
print(f"Current working directory: {os.getcwd()}")

# Load environment variables from .env file
load_dotenv()

# Debug: Print the API key (first few characters for security)
api_key = os.getenv("ANTHROPIC_API_KEY")
print(f"API Key loaded: {'Yes' if api_key else 'No'}")
print(f"API Key starts with: {api_key[:8] if api_key else 'None'}")
print(f"Environment variables: {dict(os.environ)}")

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes (development only)

pdf_text = ""  # Global variable to store the extracted PDF text

@app.route('/')
def home():
    return "Server is running!"

@app.route('/check', methods=['POST'])
def check_compliance():
    global pdf_text
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    try:
        with pdfplumber.open(file) as pdf:
            texts = [page.extract_text() for page in pdf.pages if page.extract_text()]
            pdf_text = "\n".join(texts)
        return jsonify({"message": "PDF uploaded and processed successfully!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/chat', methods=['POST'])
def chat():
    global pdf_text
    data = request.get_json()
    print(f"Received data: {data}")  # Debug log
    question = data.get("question")
    if not question:
        print("No question provided in request")  # Debug log
        return jsonify({"error": "No question provided"}), 400
    if not pdf_text:
        print("No PDF text available")  # Debug log
        return jsonify({"answer": "No PDF has been uploaded yet."}), 400

    prompt = f"Based on this PDF content:\n{pdf_text[:4000]}\n\nQ: {question}\nA:"
    print(f"Generated prompt: {prompt[:100]}...")  # Debug log

    try:
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=1000,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        answer = response.content[0].text
        return jsonify({"answer": answer})
    except Exception as e:
        print(f"Error in chat route: {str(e)}")  # Debug log
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
