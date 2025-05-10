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

// Calculate scores for each area
function calculateScores(responses) {
    const scores = {};

    // Talking Support (Q16_1 to Q16_4, average of 1-5 scale)
    scores.talkingSupport = (parseInt(responses.q16_1 || 0) + parseInt(responses.q16_2 || 0) +
        parseInt(responses.q16_3 || 0) + parseInt(responses.q16_4 || 0)) / 4;

    // Hands-on Support (Q17_1 to Q17_4, average of 1-5 scale)
    scores.handsOnSupport = (parseInt(responses.q17_1 || 0) + parseInt(responses.q17_2 || 0) +
        parseInt(responses.q17_3 || 0) + parseInt(responses.q17_4 || 0)) / 4;

    // Practical Knowledge (Q19_1 to Q19_7, average of 1-5 scale)
    scores.practicalKnowledge = (parseInt(responses.q19_1 || 0) + parseInt(responses.q19_2 || 0) +
        parseInt(responses.q19_3 || 0) + parseInt(responses.q19_4 || 0) +
        parseInt(responses.q19_5 || 0) + parseInt(responses.q19_6 || 0) + parseInt(responses.q19_7 || 0)) / 7;

    // Experience (Q7 to Q14, yes=1, no=0, average)
    scores.experience = (parseInt(responses.q7 === 'Yes' ? 1 : 0) + parseInt(responses.q8 === 'Yes' ? 1 : 0) +
        parseInt(responses.q9 === 'Yes' ? 1 : 0) + parseInt(responses.q10 === 'Yes' ? 1 : 0) +
        parseInt(responses.q11 === 'Yes' ? 1 : 0) + parseInt(responses.q12 === 'Yes' ? 1 : 0) +
        parseInt(responses.q13 === 'Yes' ? 1 : 0) + parseInt(responses.q14 === 'Yes' ? 1 : 0)) / 8;

    // Knowledge (Q22_1 to Q22_9, average of 1-7 scale)
    scores.knowledge = (parseInt(responses.q22_1 || 0) + parseInt(responses.q22_2 || 0) +
        parseInt(responses.q22_3 || 0) + parseInt(responses.q22_4 || 0) +
        parseInt(responses.q22_5 || 0) + parseInt(responses.q22_6 || 0) +
        parseInt(responses.q22_7 || 0) + parseInt(responses.q22_8 || 0) + parseInt(responses.q22_9 || 0)) / 9;

    // Community Support 1 (Q15_1 to Q15_4, average of 1-4 scale)
    scores.communitySupport1 = (parseInt(responses.q15_1 || 0) + parseInt(responses.q15_2 || 0) +
        parseInt(responses.q15_3 || 0) + parseInt(responses.q15_4 || 0)) / 4;

    // Community Support 2 (Q20_1 to Q20_5 and Q21_1 to Q21_4, average of 1-5 scale)
    scores.communitySupport2 = (parseInt(responses.q20_1 || 0) + parseInt(responses.q20_2 || 0) +
        parseInt(responses.q20_3 || 0) + parseInt(responses.q20_4 || 0) + parseInt(responses.q20_5 || 0) +
        parseInt(responses.q21_1 || 0) + parseInt(responses.q21_2 || 0) +
        parseInt(responses.q21_3 || 0) + parseInt(responses.q21_4 || 0)) / 9;

    // Community Overall (Average of Community Support 1 and 2)
    scores.communityOverall = (scores.communitySupport1 + scores.communitySupport2) / 2;

    // Death Literacy Index (Average of all area scores)
    scores.dliOverall = (scores.talkingSupport + scores.handsOnSupport + scores.practicalKnowledge +
        scores.experience + scores.knowledge + scores.communityOverall) / 6;

    return scores;
}

// Get feedback based on score and range
function getFeedback(area, score, actualScore, ranges) {
    if (score < ranges.lower) {
        return {
            howYouScored: `You scored lower than others in ${area}.`,
            whatThisMeans: `You might not feel very confident in this area yet—and that’s completely okay.`,
            whatYouCanDo: `Try joining a group or learning more about it. Small steps can build your confidence over time.`
        };
    } else if (score >= ranges.lower && score <= ranges.higher) {
        return {
            howYouScored: `Your score is about the same as most people’s in ${area}.`,
            whatThisMeans: `You’re in a solid place, with a good base to build on.`,
            whatYouCanDo: `Keep practicing and stay open to new experiences—it helps you grow.`
        };
    } else {
        return {
            howYouScored: `You scored higher than most people in ${area}.`,
            whatThisMeans: `You seem really comfortable and skilled in this area, which is a strength.`,
            whatYouCanDo: `Consider sharing your knowledge to support others who might need guidance.`
        };
    }
}

// Handle survey submission
document.getElementById('dli-survey').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const responses = {};
    formData.forEach((value, key) => {
        responses[key] = value;
    });

    // Calculate all scores
    const scores = calculateScores(responses);

    // Define ranges from the scoring matrix
    const ranges = {
        talkingSupport: { actual: 5.46, lower: 4.24, higher: 6.68 },
        handsOnSupport: { actual: 4.62, lower: 3.35, higher: 5.89 },
        practicalKnowledge: { actual: 5.04, lower: 3.94, higher: 6.14 },
        experience: { actual: 5.9, lower: 4.75, higher: 7.05 },
        knowledge: { actual: 3.79, lower: 2.50, higher: 5.08 },
        communitySupport1: { actual: 4.15, lower: 2.91, higher: 5.39 },
        communitySupport2: { actual: 5.06, lower: 3.88, higher: 6.24 },
        communityOverall: { actual: 4.6, lower: 3.50, higher: 5.70 },
        dliOverall: { actual: 4.83, lower: 3.86, higher: 5.80 }
    };

    // Get feedback for each area
    const feedback = {
        talkingSupport: getFeedback('Talking Support', scores.talkingSupport, ranges.talkingSupport.actual, ranges.talkingSupport),
        handsOnSupport: getFeedback('Hands-on Support', scores.handsOnSupport, ranges.handsOnSupport.actual, ranges.handsOnSupport),
        practicalKnowledge: getFeedback('Practical Knowledge', scores.practicalKnowledge, ranges.practicalKnowledge.actual, ranges.practicalKnowledge),
        experience: getFeedback('Experience', scores.experience, ranges.experience.actual, ranges.experience),
        knowledge: getFeedback('Knowledge', scores.knowledge, ranges.knowledge.actual, ranges.knowledge),
        communitySupport1: getFeedback('Community Support 1', scores.communitySupport1, ranges.communitySupport1.actual, ranges.communitySupport1),
        communitySupport2: getFeedback('Community Support 2', scores.communitySupport2, ranges.communitySupport2.actual, ranges.communitySupport2),
        communityOverall: getFeedback('Community Overall', scores.communityOverall, ranges.communityOverall.actual, ranges.communityOverall),
        dliOverall: getFeedback('Death Literacy Index', scores.dliOverall, ranges.dliOverall.actual, ranges.dliOverall)
    };

    // Prepare the feedback message
    let feedbackMessage = 'Survey submitted! Here are your results:\n\n';
    for (const [area, fb] of Object.entries(feedback)) {
        feedbackMessage += `${area}:\n- How You Scored: ${fb.howYouScored}\n- What This Means: ${fb.whatThisMeans}\n- What You Can Do: ${fb.whatYouCanDo}\n\n`;
    }
    feedbackMessage += `Your individual scores: Talking Support: ${scores.talkingSupport.toFixed(2)}, Hands-on Support: ${scores.handsOnSupport.toFixed(2)}, Practical Knowledge: ${scores.practicalKnowledge.toFixed(2)}, Experience: ${scores.experience.toFixed(2)}, Knowledge: ${scores.knowledge.toFixed(2)}, Community Support 1: ${scores.communitySupport1.toFixed(2)}, Community Support 2: ${scores.communitySupport2.toFixed(2)}, Community Overall: ${scores.communityOverall.toFixed(2)}, Death Literacy Index: ${scores.dliOverall.toFixed(2)}`;

    try {
        await db.collection('surveyResponses').add({ ...responses, ...scores });
        alert(feedbackMessage);
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
