let ques = NaN;
let currentQuestionIndex = 0;
let userAnswers = {}; // Store user-selected answers

document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('pdfFile');
    const uploadButton = document.getElementById('upload');

    fileInput.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            // Hide the label and input field
            document.getElementById('ask').style.display = 'none';

            // Display the selected file name (replace existing)
            let fileNameDisplay = document.getElementById('fileName');
            if (!fileNameDisplay) {
                fileNameDisplay = document.createElement('p');
                fileNameDisplay.id = 'fileName';
                document.body.insertBefore(fileNameDisplay, uploadButton);
            }
            fileNameDisplay.textContent = `Selected File: ${file.name}`;

            // Show the upload button
            uploadButton.style.display = 'block';
        }
    });
});

async function uploadPDF() {
    const fileInput = document.getElementById('pdfFile');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a PDF file');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await axios.post('/', formData);
        const { summary, questions } = response.data;
        ques = questions;
        currentQuestionIndex = 0;
        userAnswers = {}; // Reset previous answers
        displaySummary(summary);
        displayQuestion(currentQuestionIndex);
    } catch (error) {
        console.error('Error:', error);
    }
}

function displaySummary(summary) {
    document.getElementById('summary').innerHTML = `<h2>Summary</h2><p>${summary}</p>`;
}

function displayQuestion(index) {
    const questions = ques;
    if (index >= questions.length) {
        document.getElementById('quiz').innerHTML = `<button onclick="submitQuiz()">Submit Quiz</button>`;
        return;
    }

    const q = questions[index];

    document.getElementById('quiz').innerHTML = `
        <h2>Question ${index + 1}</h2>
        <p>${q[0]}</p>
        <div class="options">
            <label><input type="radio" name="q" value="a" onclick="saveAnswer(${index}, 'a')"> ${q[1]}</label><br>
            <label><input type="radio" name="q" value="b" onclick="saveAnswer(${index}, 'b')"> ${q[2]}</label><br>
            <label><input type="radio" name="q" value="c" onclick="saveAnswer(${index}, 'c')"> ${q[3]}</label><br>
            <label><input type="radio" name="q" value="d" onclick="saveAnswer(${index}, 'd')"> ${q[4]}</label><br>
        </div>
        <button onclick="nextQuestion()">Next</button>
    `;

    // Restore previously selected answer if exists
    if (userAnswers[index]) {
        document.querySelector(`input[name="q"][value="${userAnswers[index]}"]`).checked = true;
    }
}

function saveAnswer(index, answer) {
    userAnswers[index] = answer;
}

function nextQuestion() {
    currentQuestionIndex++;
    displayQuestion(currentQuestionIndex);
}

function submitQuiz() {
    const questions = ques;
    let score = 0;
    let resultHtml = "<h2>Quiz Results</h2>";

    questions.forEach((q, index) => {
        const selectedAnswer = userAnswers[index] || "Not Answered";
        const correctAnswer = q[5]; // Correct option (e.g., "a", "b", "c", "d")
        const explanation = q[6]; // Explanation provided

        if (selectedAnswer === correctAnswer) {
            score++;
        }

        // Generate options with correct and chosen answer highlighted
        let optionsHtml = "";
        ["a", "b", "c", "d"].forEach((opt, i) => {
            let className = "";
            if (opt === correctAnswer) className = "correct";
            if (opt === selectedAnswer && selectedAnswer !== correctAnswer) className = "incorrect";

            optionsHtml += `
                <p class="${className}">
                    ${q[i + 1]}
                    ${selectedAnswer === opt ? " (Your Choice)" : ""}
                </p>
            `;
        });

        // Display question, answers, explanation, and highlights
        resultHtml += `
            <div class="result-box">
                <p><strong>Question ${index + 1}:</strong> ${q[0]}</p>
                ${optionsHtml}
                <p><strong>Explanation:</strong> ${explanation}</p>
            </div>
        `;
    });

    resultHtml = `<h2>Your Score: ${score}/${questions.length}</h2>` + resultHtml;
    document.getElementById('quiz').innerHTML = resultHtml;
}
