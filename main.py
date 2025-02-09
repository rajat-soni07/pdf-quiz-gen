from flask import Flask, render_template, request, jsonify
from mira_sdk import MiraClient, Flow
import fitz
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("API_KEY")

app = Flask(__name__)

client = MiraClient(config={"API_KEY": API_KEY})
flow = Flow(source="flow.yaml")

def read_pdf(pdf_path):
    text = ""
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text += page.get_text()
    return text

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        # Handle file upload and processing
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'})
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'})
        if file:
            # Save the file temporarily
            file_path = 'temp.pdf'
            file.save(file_path)
            
            # Process the PDF
            txt = read_pdf(file_path)
            num = 5  # You can make this dynamic if needed
            result = client.flow.test(flow, {"pdf_text": txt, "num_ques": str(num)})['result'].split("-$-")
            summary = result[0].strip().strip('\n')
            questions = []
            for i in range(1, num+1):
                temp = result[i].strip().strip("\n").split("@@@")
                questions.append([q.strip().strip("\n") for q in temp])
            
            return jsonify({'summary': summary, 'questions': questions})
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
