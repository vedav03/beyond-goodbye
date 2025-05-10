document.addEventListener('DOMContentLoaded', () => {
    // Show/hide state dropdown based on country
    document.getElementById('q1').addEventListener('change', function() {
        const q1_1Container = document.getElementById('q1_1_container');
        q1_1Container.style.display = this.value === 'Australia' ? 'block' : 'none';
    });

    // Calculate scores for each area
    function calculateScores(responses) {
        const scores = {};
        scores.talkingSupport = (parseInt(responses.q16_1 || 0) + parseInt(responses.q16_2 || 0) +
            parseInt(responses.q16_3 || 0) + parseInt(responses.q16_4 || 0)) / 4;
        scores.handsOnSupport = (parseInt(responses.q17_1 || 0) + parseInt(responses.q17_2 || 0) +
            parseInt(responses.q17_3 || 0) + parseInt(responses.q17_4 || 0)) / 4;
        scores.practicalKnowledge = (parseInt(responses.q19_1 || 0) + parseInt(responses.q19_2 || 0) +
            parseInt(responses.q19_3 || 0) + parseInt(responses.q19_4 || 0) +
            parseInt(responses.q19_5 || 0) + parseInt(responses.q19_6 || 0) + parseInt(responses.q19_7 || 0)) / 7;
        scores.experience = (parseInt(responses.q7 === 'Yes' ? 1 : 0) + parseInt(responses.q8 === 'Yes' ? 1 : 0) +
            parseInt(responses.q9 === 'Yes' ? 1 : 0) + parseInt(responses.q10 === 'Yes' ? 1 : 0) +
            parseInt(responses.q11 === 'Yes' ? 1 : 0) + parseInt(responses.q12 === 'Yes' ? 1 : 0) +
            parseInt(responses.q13 === 'Yes' ? 1 : 0) + parseInt(responses.q14 === 'Yes' ? 1 : 0)) / 8;
        scores.knowledge = (parseInt(responses.q22_1 || 0) + parseInt(responses.q22_2 || 0) +
            parseInt(responses.q22_3 || 0) + parseInt(responses.q22_4 || 0) +
            parseInt(responses.q22_5 || 0) + parseInt(responses.q22_6 || 0) +
            parseInt(responses.q22_7 || 0) + parseInt(responses.q22_8 || 0) + parseInt(responses.q22_9 || 0)) / 9;
        scores.communitySupport1 = (parseInt(responses.q15_1 || 0) + parseInt(responses.q15_2 || 0) +
            parseInt(responses.q15_3 || 0) + parseInt(responses.q15_4 || 0)) / 4;
        scores.communitySupport2 = (parseInt(responses.q20_1 || 0) + parseInt(responses.q20_2 || 0) +
            parseInt(responses.q20_3 || 0) + parseInt(responses.q20_4 || 0) + parseInt(responses.q20_5 || 0) +
            parseInt(responses.q21_1 || 0) + parseInt(responses.q21_2 || 0) +
            parseInt(responses.q21_3 || 0) + parseInt(responses.q21_4 || 0)) / 9;
        scores.communityOverall = (scores.communitySupport1 + scores.communitySupport2) / 2;
        scores.dliOverall = (scores.talkingSupport + scores.handsOnSupport + scores.practicalKnowledge +
            scores.experience + scores.knowledge + scores.communityOverall) / 6;
        return scores;
    }

    // Get feedback based on score and range
    function getFeedback(area, score, actualScore, ranges) {
        if (score < ranges.lower) return { howYouScored: `You scored lower than others in ${area}.`, whatThisMeans: `You might not feel confident yet—and that’s okay.`, whatYouCanDo: `Try learning more or joining a group.` };
        else if (score >= ranges.lower && score <= ranges.higher) return { howYouScored: `Your score is similar to most in ${area}.`, whatThisMeans: `You have a solid base.`, whatYouCanDo: `Keep practicing.` };
        else return { howYouScored: `You scored higher than most in ${area}.`, whatThisMeans: `You’re skilled here.`, whatYouCanDo: `Share your knowledge.` };
    }

    // Handle survey submission
    document.getElementById('dli-survey').addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Form submission prevented');
        const formData = new FormData(e.target);
        const responses = {};
        formData.forEach((value, key) => responses[key] = value);

        const scores = calculateScores(responses);
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

        let feedbackMessage = 'Survey submitted! Here are your results:\n\n';
        for (const [area, fb] of Object.entries(feedback)) {
            feedbackMessage += `${area}:\n- How You Scored: ${fb.howYouScored}\n- What This Means: ${fb.whatThisMeans}\n- What You Can Do: ${fb.whatYouCanDo}\n\n`;
        }
        feedbackMessage += `Your scores: ${JSON.stringify(scores)}`;

        try {
            await window.db.collection('surveyResponses').add({ ...responses, ...scores });
            alert(feedbackMessage);
            e.target.reset();
        } catch (error) {
            console.error('Error:', error);
            alert('Error submitting. Check console.');
        }
    });

    // Handle contact form submission
    document.getElementById('contact-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const contactData = {};
        formData.forEach((value, key) => contactData[key] = value);
        try {
            await window.db.collection('contactMessages').add(contactData);
            alert('Message sent!');
            e.target.reset();
        } catch (error) {
            console.error('Error:', error);
            alert('Error sending. Check console.');
        }
    });
});
