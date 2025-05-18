// Helper function to wait for Firebase initialization
async function waitForFirebase() {
    return new Promise((resolve, reject) => {
        const maxAttempts = 50; // Try for 5 seconds (50 * 100ms)
        let attempts = 0;

        const checkFirebase = setInterval(() => {
            if (window.db) {
                clearInterval(checkFirebase);
                resolve(window.db);
            } else if (attempts >= maxAttempts) {
                clearInterval(checkFirebase);
                reject(new Error('Firebase initialization timed out. Please refresh the page and try again.'));
            }
            attempts++;
        }, 100); // Check every 100ms
    });
}

// Show/hide state dropdown based on country
document.getElementById('q1').addEventListener('change', function() {
    const q1_1Container = document.getElementById('q1_1_container');
    q1_1Container.style.display = this.value === 'Australia' ? 'block' : 'none';
});

// Calculate scaled mean score for a set of questions
function calculateScaledMean(responses, questions, maxScore) {
    let totalScore = 0;
    questions.forEach(q => {
        totalScore += parseInt(responses[q] || 0);
    });
    return (totalScore / (questions.length * maxScore)) * 10; // Scale to 0-10
}

// Scoring matrix with ranges and feedback
const scoringMatrix = {
    "Talking Support": {
        questions: ['q16_1', 'q16_2', 'q16_3', 'q16_4'],
        maxScore: 5,
        ranges: {
            lower: 4.24,
            higher: 6.68
        },
        feedback: {
            Lower: {
                yourScore: "You scored lower than most people when it comes to talking about death and dying.",
                howYouScored: "You might not feel very confident talking about death yet—and that’s completely okay.",
                whatThisMeans: "Try joining a group or workshop where people talk openly about end-of-life topics. It’s a great way to build comfort."
            },
            Similar: {
                yourScore: "Your score is about the same as most people’s.",
                howYouScored: "You're about as comfortable talking about death as most people. That’s a solid place to be.",
                whatThisMeans: "Keep having open conversations when the opportunity comes up—it helps create a more supportive space for everyone."
            },
            Higher: {
                yourScore: "You scored higher than most people in talking about death and dying.",
                howYouScored: "You seem really comfortable talking about end-of-life matters, which is a real strength.",
                whatThisMeans: "Use that comfort to gently support others who may find these conversations difficult. You can help make these talks feel safer."
            }
        }
    },
    "Hands-on Support": {
        questions: ['q17_1', 'q17_2', 'q17_3', 'q17_4'],
        maxScore: 5,
        ranges: {
            lower: 3.35,
            higher: 5.89
        },
        feedback: {
            Lower: {
                yourScore: "You scored lower than others in hands-on care.",
                howYouScored: "You may not have had much experience helping someone physically at the end of life. That’s very common.",
                whatThisMeans: "You could look into volunteering, or even just learn basic care skills—it can help build confidence over time."
            },
            Similar: {
                yourScore: "Your score is in line with the average when it comes to hands-on support.",
                howYouScored: "You’ve had some hands-on experience, about the same as most people.",
                whatThisMeans: "Share what you’ve learned, and look for chances to build on your skills when you feel ready."
            },
            Higher: {
                yourScore: "You scored higher than most people in hands-on support.",
                howYouScored: "You’ve clearly had experience helping someone directly, and that’s really valuable.",
                whatThisMeans: "Consider mentoring others or getting involved in your community’s end-of-life care efforts. Your experience can make a difference."
            }
        }
    },
    "Practical Knowledge (Overall)": {
        questions: [
            'q16_1', 'q16_2', 'q16_3', 'q16_4',
            'q17_1', 'q17_2', 'q17_3', 'q17_4',
            'q18_1', 'q18_2', 'q18_3', 'q18_4', 'q18_5',
            'q19_1', 'q19_2', 'q19_3', 'q19_4', 'q19_5', 'q19_6', 'q19_7',
            'q20_1', 'q20_2', 'q20_3', 'q20_4', 'q20_5',
            'q21_1', 'q21_2', 'q21_3', 'q21_4'
        ],
        maxScore: 5,
        ranges: {
            lower: 3.94,
            higher: 6.14
        },
        feedback: {
            Lower: {
                yourScore: "You scored lower than others in overall practical knowledge.",
                howYouScored: "You might not feel super confident supporting someone through dying yet, and that’s totally normal.",
                whatThisMeans: "Start small—maybe offer practical help to someone or learn more about what’s involved in end-of-life care."
            },
            Similar: {
                yourScore: "Your score is similar to others’ in practical knowledge.",
                howYouScored: "You’ve got a solid base of experience, right in line with others.",
                whatThisMeans: "Keep building on what you know, and don’t hesitate to step in when you see someone needs support."
            },
            Higher: {
                yourScore: "You scored higher than most in practical knowledge.",
                howYouScored: "You’ve got strong practical knowledge. You know what to do and how to be there for someone.",
                whatThisMeans: "Think about sharing what you know—others could really benefit from your experience."
            }
        }
    },
    "Experience": {
        questions: ['q18_1', 'q18_2', 'q18_3', 'q18_4', 'q18_5'],
        maxScore: 5,
        ranges: {
            lower: 4.75,
            higher: 7.05
        },
        feedback: {
            Lower: {
                yourScore: "You scored lower than others in experience with death and dying.",
                howYouScored: "You may not have had many personal or professional experiences with death or dying.",
                whatThisMeans: "Consider listening to others' stories, or gently reflect on your own feelings. That’s a good starting point."
            },
            Similar: {
                yourScore: "Your experience score is about average.",
                howYouScored: "Your experiences are about average—enough to give you a sense of what death and dying can be like.",
                whatThisMeans: "Stay open to learning from your own experiences and those around you. It builds wisdom."
            },
            Higher: {
                yourScore: "You scored higher than others in experience.",
                howYouScored: "You’ve had more exposure to death and dying than most. That gives you valuable perspective.",
                whatThisMeans: "You might find yourself naturally supporting others—your lived experience is a real asset."
            }
        }
    },
    "Knowledge": {
        questions: ['q19_1', 'q19_2', 'q19_3', 'q19_4', 'q19_5', 'q19_6', 'q19_7'],
        maxScore: 5,
        ranges: {
            lower: 2.50,
            higher: 5.08
        },
        feedback: {
            Lower: {
                yourScore: "You scored lower than others in death-related knowledge.",
                howYouScored: "You might not feel very informed about end-of-life care or services right now.",
                whatThisMeans: "Learning even just a bit more—like what options exist—can help you feel more prepared and confident."
            },
            Similar: {
                yourScore: "Your knowledge score is about the same as others’.",
                howYouScored: "You’ve got a good, solid base of knowledge—enough to understand what’s going on.",
                whatThisMeans: "Keep asking questions and exploring. It’ll help you and those you care about."
            },
            Higher: {
                yourScore: "You scored higher than most people in knowledge about end-of-life matters.",
                howYouScored: "You know quite a lot about death-related matters. That’s a powerful tool.",
                whatThisMeans: "Consider helping others understand what you’ve learned—many people are looking for someone who can guide them."
            }
        }
    },
    "Community Support 1": {
        questions: ['q20_1', 'q20_2', 'q20_3', 'q20_4', 'q20_5'],
        maxScore: 5,
        ranges: {
            lower: 2.91,
            higher: 5.39
        },
        feedback: {
            Lower: {
                yourScore: "You scored lower than others in feeling supported by your community.",
                howYouScored: "You might feel like your community doesn’t offer much support around death and dying.",
                whatThisMeans: "Think about ways you can connect with others—there may be more support out there than it seems."
            },
            Similar: {
                yourScore: "Your score is typical when it comes to perceived community support.",
                howYouScored: "Your experience with community support is similar to most people’s.",
                whatThisMeans: "Look for ways to strengthen those ties—community can be a big help during difficult times."
            },
            Higher: {
                yourScore: "You scored higher than most in community support.",
                howYouScored: "You feel like your community is pretty supportive, which is wonderful.",
                whatThisMeans: "Help keep that support going by getting involved and welcoming others in."
            }
        }
    },
    "Community Support 2": {
        questions: ['q21_1', 'q21_2', 'q21_3', 'q21_4'],
        maxScore: 5,
        ranges: {
            lower: 3.88,
            higher: 6.24
        },
        feedback: {
            Lower: {
                yourScore: "You scored lower in how engaged your community feels around end-of-life care.",
                howYouScored: "It might feel like your community isn’t very involved in end-of-life care.",
                whatThisMeans: "You could explore local initiatives or even start conversations that help get more people engaged."
            },
            Similar: {
                yourScore: "Your community engagement score is similar to most people’s.",
                howYouScored: "Your community’s involvement seems about average.",
                whatThisMeans: "Keep encouraging participation—it helps everyone feel less alone."
            },
            Higher: {
                yourScore: "You scored higher than others in community engagement.",
                howYouScored: "You feel your community really steps up when it comes to end-of-life care.",
                whatThisMeans: "You can help others feel confident joining in too—your example can inspire more engagement."
            }
        }
    },
    "Community (Overall)": {
        questions: [
            'q15_1', 'q15_2', 'q15_3', 'q15_4',
            'q20_1', 'q20_2', 'q20_3', 'q20_4', 'q20_5',
            'q21_1', 'q21_2', 'q21_3', 'q21_4'
        ],
        maxScoreMap: {
            'q15_1': 4, 'q15_2': 4, 'q15_3': 4, 'q15_4': 4,
            'q20_1': 5, 'q20_2': 5, 'q20_3': 5, 'q20_4': 5, 'q20_5': 5,
            'q21_1': 5, 'q21_2': 5, 'q21_3': 5, 'q21_4': 5
        },
        ranges: {
            lower: 3.50,
            higher: 5.70
        },
        feedback: {
            Lower: {
                yourScore: "You scored lower than others overall in community-related support.",
                howYouScored: "You might not feel very supported by your community around death-related matters.",
                whatThisMeans: "See if there are community groups or events that can help build that support. Small actions make a big difference."
            },
            Similar: {
                yourScore: "Your overall community score is similar to others’.",
                howYouScored: "Your sense of community support is about the same as others’.",
                whatThisMeans: "Keep showing up and being part of the conversation—it helps the whole community grow stronger."
            },
            Higher: {
                yourScore: "You scored higher than others in overall community support.",
                howYouScored: "You see your community as supportive and engaged around dying and grieving. That’s a real strength.",
                whatThisMeans: "Share what’s working—others might be looking for ideas to build similar support in their own communities."
            }
        }
    },
    "Death Literacy Index (Overall)": {
        questions: [
            'q16_1', 'q16_2', 'q16_3', 'q16_4',
            'q17_1', 'q17_2', 'q17_3', 'q17_4',
            'q18_1', 'q18_2', 'q18_3', 'q18_4', 'q18_5',
            'q19_1', 'q19_2', 'q19_3', 'q19_4', 'q19_5', 'q19_6', 'q19_7',
            'q20_1', 'q20_2', 'q20_3', 'q20_4', 'q20_5',
            'q21_1', 'q21_2', 'q21_3', 'q21_4'
        ],
        maxScore: 5,
        ranges: {
            lower: 3.86,
            higher: 5.80
        },
        feedback: {
            Lower: {
                yourScore: "You scored lower than others on the overall Death Literacy Index.",
                howYouScored: "You may not feel very comfortable or knowledgeable about death yet, but that can change with time.",
                whatThisMeans: "Start with one step—talk to someone, read something, or reflect on what death means to you. It all adds up."
            },
            Similar: {
                yourScore: "Your score is about average across all areas of death literacy.",
                howYouScored: "You’re in a similar place to most people—there’s a good base, and room to grow.",
                whatThisMeans: "Keep learning, talking, and staying open—it’s a journey that grows with you."
            },
            Higher: {
                yourScore: "You scored higher than most people on the Death Literacy Index.",
                howYouScored: "You seem to have a strong level of comfort, knowledge, and experience. That’s a real gift.",
                whatThisMeans: "Think about how you can support others on their journey—you have a lot to offer."
            }
        }
    }
};

// Generate feedback for each area
function generateFeedback(responses) {
    let feedbackHtml = '';
    for (const area in scoringMatrix) {
        const { questions, maxScore, ranges, feedback, maxScoreMap } = scoringMatrix[area];
        let score;

        if (maxScoreMap) {
            // For areas like Community (Overall) with mixed max scores
            let totalScore = 0;
            let totalPossible = 0;
            questions.forEach(q => {
                const qScore = parseInt(responses[q] || 0);
                const qMax = maxScoreMap[q];
                totalScore += qScore;
                totalPossible += qMax;
            });
            score = (totalScore / totalPossible) * 10; // Scale to 0-10
        } else {
            // For areas with uniform max scores
            score = calculateScaledMean(responses, questions, maxScore);
        }

        let range;
        if (score < ranges.lower) {
            range = 'Lower';
        } else if (score > ranges.higher) {
            range = 'Higher';
        } else {
            range = 'Similar';
        }

        const fb = feedback[range];
        feedbackHtml += `
            <div class="area">
                <h3>${area}</h3>
                <p><strong>Your Score:</strong> ${score.toFixed(1)}/10</p>
                <p><strong>How You Scored:</strong> ${fb.yourScore}</p>
                <p><strong>What This Means:</strong> ${fb.howYouScored}</p>
                <p><strong>What You Can Do:</strong> ${fb.whatThisMeans}</p>
            </div>
        `;
    }
    return feedbackHtml;
}

// Handle survey submission
document.getElementById('dli-survey').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const responses = {};
    formData.forEach((value, key) => {
        responses[key] = value;
    });

    try {
        // Wait for Firebase to be ready
        const db = await waitForFirebase();

        // Save responses to Firebase
        await db.collection('surveyResponses').add(responses);

        // Generate and display feedback
        const feedbackContent = document.getElementById('feedback-content');
        feedbackContent.innerHTML = generateFeedback(responses);
        document.getElementById('feedback').style.display = 'block';

        // Scroll to feedback section
        document.getElementById('feedback').scrollIntoView({ behavior: 'smooth' });

        // Clear the form
        e.target.reset();
    } catch (error) {
        console.error('Error saving responses:', error);
        alert(error.message || 'Error submitting survey. Please try again.');
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
        // Wait for Firebase to be ready
        const db = await waitForFirebase();

        // Save contact message to Firebase
        await db.collection('contactMessages').add(contactData);
        alert('Message sent successfully!');
        e.target.reset();
    } catch (error) {
        console.error('Error sending message:', error);
        alert(error.message || 'Error sending message. Please try again.');
    }
});
