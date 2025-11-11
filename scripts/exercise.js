// scripts/exercise.js - Unified exercise functions for all lessons

// Global exercise checking function
function ExerciseType1Possibilities3CheckAnswers(correctAnswers, totalQuestions, prefix = 'EH-exercise-type1-possibilities3') {
    let score = 0;
    
    // Auto-detect lesson type for styling
    let optionClass = 'EH-workplace-option'; // default
    if (document.querySelector('.EH-schoolplay-option')) {
        optionClass = 'EH-schoolplay-option';
    } else if (document.querySelector('.EH-grammar-option')) {
        optionClass = 'EH-grammar-option';
    }
    // Add more lesson types as needed
    
    // Reset all status indicators and styling
    for (let i = 1; i <= totalQuestions; i++) {
        const statusElement = document.getElementById(`${prefix}-q${i}-status`);
        if (statusElement) {
            statusElement.textContent = '';
            statusElement.className = `${prefix}-answer-status`;
        }
        
        // Reset option styling - use detected class
        const options = document.querySelectorAll(`input[name="${prefix}-q${i}"]`);
        options.forEach(option => {
            const optionDiv = option.closest(`.${optionClass}`);
            if (optionDiv) {
                optionDiv.className = optionClass;
            }
        });
    }
    
    // Check each question
    for (const question in correctAnswers) {
        const correctAnswer = correctAnswers[question];
        const selectedOption = document.querySelector(`input[name="${question}"]:checked`);
        const statusElement = document.getElementById(`${question}-status`);
        
        if (selectedOption) {
            if (selectedOption.value === correctAnswer) {
                score++;
                if (statusElement) {
                    statusElement.textContent = 'Correct!';
                    statusElement.className = `${prefix}-answer-status ${prefix}-correct-answer`;
                }
                
                // Highlight correct option
                const correctOption = document.querySelector(`input[name="${question}"][value="${correctAnswer}"]`);
                if (correctOption) {
                    const correctOptionDiv = correctOption.closest(`.${optionClass}`);
                    if (correctOptionDiv) {
                        correctOptionDiv.className = `${optionClass} ${prefix}-option correct`;
                    }
                }
            } else {
                if (statusElement) {
                    statusElement.textContent = 'Incorrect';
                    statusElement.className = `${prefix}-answer-status ${prefix}-incorrect-answer`;
                }
                
                // Highlight incorrect option
                const incorrectOptionDiv = selectedOption.closest(`.${optionClass}`);
                if (incorrectOptionDiv) {
                    incorrectOptionDiv.className = `${optionClass} ${prefix}-option incorrect`;
                }
                
                // Highlight correct option
                const correctOption = document.querySelector(`input[name="${question}"][value="${correctAnswer}"]`);
                if (correctOption) {
                    const correctOptionDiv = correctOption.closest(`.${optionClass}`);
                    if (correctOptionDiv) {
                        correctOptionDiv.className = `${optionClass} ${prefix}-option correct`;
                    }
                }
            }
        } else {
            if (statusElement) {
                statusElement.textContent = 'Not answered';
                statusElement.className = `${prefix}-answer-status`;
            }
            
            // Highlight correct option
            const correctOption = document.querySelector(`input[name="${question}"][value="${correctAnswer}"]`);
            if (correctOption) {
                const correctOptionDiv = correctOption.closest(`.${optionClass}`);
                if (correctOptionDiv) {
                    correctOptionDiv.className = `${optionClass} ${prefix}-option correct`;
                }
            }
        }
    }
    
    // Display score
    const scoreValue = document.getElementById(`${prefix}-score-value`);
    const scoreDisplay = document.getElementById(`${prefix}-score-display`);
    const scoreFeedback = document.getElementById(`${prefix}-score-feedback`);
    
    if (scoreValue) scoreValue.textContent = `${score}/${totalQuestions}`;
    if (scoreDisplay) scoreDisplay.style.display = 'block';
    
    // Provide feedback based on score
    if (scoreFeedback) {
        if (score === totalQuestions) {
            scoreFeedback.textContent = 'Excellent! You got all the answers correct!';
        } else if (score >= totalQuestions * 0.7) {
            scoreFeedback.textContent = 'Good job! You did well on this exercise.';
        } else if (score >= totalQuestions * 0.5) {
            scoreFeedback.textContent = 'Not bad, but you might want to review the material again.';
        } else {
            scoreFeedback.textContent = 'You might want to review the material and try again.';
        }
    }
    
    return score;
}

// Global exercise initialization function
function ExerciseType1Possibilities3Init(correctAnswers, totalQuestions, prefix = 'EH-exercise-type1-possibilities3') {
    const checkButton = document.getElementById(`${prefix}-check-answers`);
    if (checkButton) {
        checkButton.addEventListener('click', function() {
            ExerciseType1Possibilities3CheckAnswers(correctAnswers, totalQuestions, prefix);
        });
    }
}

// Support for different exercise types
function ExerciseType1Possibilities3Reset(totalQuestions, prefix = 'EH-exercise-type1-possibilities3') {
    // Auto-detect lesson type for styling
    let optionClass = 'EH-workplace-option'; // default
    if (document.querySelector('.EH-schoolplay-option')) {
        optionClass = 'EH-schoolplay-option';
    } else if (document.querySelector('.EH-grammar-option')) {
        optionClass = 'EH-grammar-option';
    }
    
    for (let i = 1; i <= totalQuestions; i++) {
        // Clear selections
        const options = document.querySelectorAll(`input[name="${prefix}-q${i}"]`);
        options.forEach(option => {
            option.checked = false;
        });
        
        // Reset status
        const statusElement = document.getElementById(`${prefix}-q${i}-status`);
        if (statusElement) {
            statusElement.textContent = '';
            statusElement.className = `${prefix}-answer-status`;
        }
        
        // Reset option styling
        options.forEach(option => {
            const optionDiv = option.closest(`.${optionClass}`);
            if (optionDiv) {
                optionDiv.className = optionClass;
            }
        });
    }
    
    // Hide score display
    const scoreDisplay = document.getElementById(`${prefix}-score-display`);
    if (scoreDisplay) {
        scoreDisplay.style.display = 'none';
    }
}