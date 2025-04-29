// Firebase configuration (your details from the Firebase console)
const firebaseConfig = {
    apiKey: "AIzaSyCBqKO0IiuPzgAsAkJc_etzrc7vWxxAQ0c",
    authDomain: "beyond-goodbye.firebaseapp.com",
    projectId: "beyond-goodbye",
    storageBucket: "beyond-goodbye.firebasestorage.app",
    messagingSenderId: "658341235982",
    appId: "1:658341235982:web:5463846ed7dc4d9676db5f"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Show/hide state dropdown based on country
document.getElementById('q1').addEventListener('change', function() {
    const q1_1Container = document.getElementById('q1_1_container');
    q1_1Container.style.display = this.value === 'Australia' ? 'block' : 'none';
});

// Calculate DLI score
function calculateDLIScore(responses) {
    const dliQuestions = [
        'q16_1', 'q16_2', 'q16_3', 'q16_4',
        'q17_1', 'q17_2', 'q17_3', 'q17_4',
        'q18_1', 'q18_2', 'q18_3', 'q18_4', 'q18_5',
        'q19_1', 'q19_2', 'q19_3', 'q19_4', 'q19_5', 'q19_6', 'q19_7',
        'q20_1', 'q20_2', 'q20_3', 'q20_4', 'q20_5',
        'q21_1', 'q21_2', 'q21_3', 'q21_4'
    ];
    let totalScore = 0;
    dliQuestions.forEach(q => {
        totalScore += parseInt(responses[q] || 0);
    });
    const scaledScore = (totalScore / (dliQuestions.length * 5)) * 10; // Scale to 0-10
    return scaledScore;
}

// Handle survey submission
document.getElementById('dli-survey').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const responses = {};
    formData.forEach((value, key) => {
        responses[key] = value;
    });
    const dliScore = calculateDLIScore(responses);
    const benchmark = 6; // Replace with actual benchmark from Excel sheet
    let feedback = '';
    if (Math.abs(dliScore - benchmark) <= 1) {
        feedback = 'You scored in a range close to or the same as the Australian National Benchmark.';
    } else if (dliScore < benchmark) {
        feedback = 'You scored in a range lower than the Australian National Benchmark.';
    } else {
        feedback = 'You scored in a range higher than the Australian National Benchmark.';
    }
    try {
        await db.collection('surveyResponses').add({ ...responses, dliScore });
        alert(`Survey submitted! Your DLI Score: ${dliScore.toFixed(1)}/10\n${feedback}`);
        e.target.reset(); // Clear the form
    } catch (error) {
        console.error('Error saving responses:', error);
        alert('Error submitting survey. Please try again.');
    }
});

// Handle contact form submission
document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const contactData = {};
    formData.forEach((value, key) => {
        contactData[key] = value;
    });
    try {
        await db.collection('contactMessages').add(contactData);
        alert('Message sent successfully!');
        e.target.reset(); // Clear the form
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Error sending message. Please try again.');
    }
});
