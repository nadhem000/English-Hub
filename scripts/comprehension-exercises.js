// comprehension-exercises.js - Reusable exercise module for comprehension lessons

const ComprehensionExercises = {
    // Configuration for each lesson
    lessons: {},
    
    // Register a new lesson with its configuration
    registerLesson: function(lessonId, config) {
        this.lessons[lessonId] = {
            ...config,
            audio: null,
            isPlaying: false,
            progressInterval: null
        };
    },
    
    // Initialize a lesson
    initLesson: function(lessonId) {
        const lesson = this.lessons[lessonId];
        if (!lesson) {
            console.error(`Lesson "${lessonId}" not registered`);
            return;
        }
        
        // Wait for DOM to be ready for audio elements
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initAudio(lessonId);
                this.setupTrueFalse(lessonId);
                this.setupFillBlanks(lessonId);
                this.setupSentenceOrdering(lessonId);
                this.setupAllExercisesChecking(lessonId);
            });
        } else {
            this.initAudio(lessonId);
            this.setupTrueFalse(lessonId);
            this.setupFillBlanks(lessonId);
            this.setupSentenceOrdering(lessonId);
            this.setupAllExercisesChecking(lessonId);
        }
        
        console.log(`Lesson "${lessonId}" initialized successfully`);
    },
    
    // Audio handling
    initAudio: function(lessonId) {
    const lesson = this.lessons[lessonId];
    
    // Check if audio elements exist
    const playBtn = document.getElementById(`EH-${lessonId}-play-btn`);
    const pauseBtn = document.getElementById(`EH-${lessonId}-pause-btn`);
    const stopBtn = document.getElementById(`EH-${lessonId}-stop-btn`);
    const volumeBtn = document.getElementById(`EH-${lessonId}-volume-btn`);
    const volumeSlider = document.getElementById(`EH-${lessonId}-volume-slider`);
    const speedBtn = document.getElementById(`EH-${lessonId}-speed-btn`);
    const progressSlider = document.getElementById(`EH-${lessonId}-progress-slider`);
    const progressThumb = document.getElementById(`EH-${lessonId}-progress-thumb`);
    const progressBackground = document.getElementById(`EH-${lessonId}-progress-background`);
    
    if (!playBtn) {
        console.warn(`Audio play button for lesson "${lessonId}" not found`);
        return;
    }
    
    // Initialize audio
    lesson.audio = new Audio(lesson.audioPath || '');
    lesson.audio.volume = 1;
    lesson.audio.playbackRate = 1;
    
    // Helper functions
    const updateProgressBar = () => {
        if (lesson.audio && lesson.audio.duration) {
            const progress = (lesson.audio.currentTime / lesson.audio.duration) * 100;
            const progressBar = document.getElementById(`EH-${lessonId}-progress-bar`);
            const progressSlider = document.getElementById(`EH-${lessonId}-progress-slider`);
            const progressThumb = document.getElementById(`EH-${lessonId}-progress-thumb`);
            
            if (progressBar) {
                progressBar.style.width = progress + '%';
            }
            if (progressSlider) {
                progressSlider.value = progress;
            }
            if (progressThumb) {
                progressThumb.style.left = progress + '%';
                progressThumb.style.display = 'block';
            }
        }
    };
    
    const updateTimeDisplay = () => {
        if (lesson.audio) {
            const currentTime = this.formatTime(lesson.audio.currentTime);
            const duration = this.formatTime(lesson.audio.duration || 0);
            const timeDisplay = document.getElementById(`EH-${lessonId}-time-display`);
            if (timeDisplay) {
                timeDisplay.textContent = `${currentTime} / ${duration}`;
            }
        }
    };
    
    const updateVolumeIcon = () => {
    if (volumeBtn) {
        const icon = volumeBtn.querySelector('.EH-comprehension-audio-icon');
        if (lesson.audio.volume === 0) {
            icon.textContent = '🔇';
        } else if (lesson.audio.volume < 0.3) {
            icon.textContent = '🔈';
        } else if (lesson.audio.volume < 0.6) {
            icon.textContent = '🔉';
        } else {
            icon.textContent = '🔊';
        }
    }
};
    
    // Audio event listeners
    lesson.audio.addEventListener('loadedmetadata', updateTimeDisplay);
    
    lesson.audio.addEventListener('timeupdate', () => {
        updateProgressBar();
        updateTimeDisplay();
    });
    
    lesson.audio.addEventListener('ended', () => {
        lesson.isPlaying = false;
        if (playBtn) {
            playBtn.textContent = '▶ Play';
        }
        clearInterval(lesson.progressInterval);
    });
    
    // Button event listeners
    playBtn.addEventListener('click', () => {
    if (lesson.isPlaying) {
        lesson.audio.pause();
        playBtn.querySelector('.EH-comprehension-audio-icon').textContent = '▶';
        lesson.isPlaying = false;
        clearInterval(lesson.progressInterval);
    } else {
        lesson.audio.play()
            .then(() => {
                playBtn.querySelector('.EH-comprehension-audio-icon').textContent = '⏸';
                lesson.isPlaying = true;
                lesson.progressInterval = setInterval(updateProgressBar, 100);
            })
            .catch(error => {
                console.error('Error playing audio:', error);
            });
    }
});
    
    if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
        lesson.audio.pause();
        lesson.isPlaying = false;
        playBtn.querySelector('.EH-comprehension-audio-icon').textContent = '▶';
        clearInterval(lesson.progressInterval);
    });
}

if (stopBtn) {
    stopBtn.addEventListener('click', () => {
        lesson.audio.pause();
        lesson.audio.currentTime = 0;
        lesson.isPlaying = false;
        playBtn.querySelector('.EH-comprehension-audio-icon').textContent = '▶';
        updateProgressBar();
        updateTimeDisplay();
        clearInterval(lesson.progressInterval);
    });
}
    
    // Volume control
    if (volumeBtn) {
        volumeBtn.addEventListener('click', () => {
            if (lesson.audio.volume > 0) {
                lesson.audio.volume = 0;
                if (volumeSlider) volumeSlider.value = 0;
            } else {
                lesson.audio.volume = 1;
                if (volumeSlider) volumeSlider.value = 1;
            }
            updateVolumeIcon();
        });
    }
    
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function() {
            lesson.audio.volume = parseFloat(this.value);
            updateVolumeIcon();
        });
    }
    
    // Speed control
    const speedOptions = document.getElementById(`EH-${lessonId}-speed-options`);
    if (speedOptions) {
        speedOptions.querySelectorAll('.EH-audio-speed-option').forEach(option => {
            option.addEventListener('click', function() {
                const speed = parseFloat(this.dataset.speed);
                lesson.audio.playbackRate = speed;
                speedBtn.textContent = `${speed}x`;
                
                // Update selected state
                speedOptions.querySelectorAll('.EH-audio-speed-option').forEach(opt => {
                    opt.dataset.selected = "false";
                });
                this.dataset.selected = "true";
            });
        });
    }
    
    if (speedBtn) {
    speedBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const speedOptions = document.getElementById(`EH-${lessonId}-speed-options`);
        if (speedOptions) {
            const isVisible = speedOptions.style.display === 'flex';
            speedOptions.style.display = isVisible ? 'none' : 'flex';
        }
    });
    
    // Update speed button display
    const updateSpeedDisplay = () => {
        if (speedBtn) {
            speedBtn.querySelector('.EH-comprehension-audio-icon').textContent = `${lesson.audio.playbackRate}x`;
        }
    };
    
    // Initial display
    updateSpeedDisplay();
    
    // Update when speed changes
    if (speedOptions) {
        speedOptions.querySelectorAll('.EH-audio-speed-option').forEach(option => {
            option.addEventListener('click', function() {
                const speed = parseFloat(this.dataset.speed);
                lesson.audio.playbackRate = speed;
                updateSpeedDisplay();
                
                // Update selected state
                speedOptions.querySelectorAll('.EH-audio-speed-option').forEach(opt => {
                    opt.dataset.selected = "false";
                });
                this.dataset.selected = "true";
            });
        });
    }
}
    
    // Close speed options when clicking elsewhere
    document.addEventListener('click', (e) => {
        if (speedOptions && !speedOptions.contains(e.target) && e.target !== speedBtn) {
            speedOptions.style.display = 'none';
        }
    });
    
    // Progress bar seeking
    if (progressSlider) {
        progressSlider.addEventListener('input', function() {
            if (lesson.audio && lesson.audio.duration) {
                const seekTime = (this.value / 100) * lesson.audio.duration;
                lesson.audio.currentTime = seekTime;
            }
        });
    }
    
    // Click on progress background to seek
    if (progressBackground) {
        progressBackground.addEventListener('click', (e) => {
            if (lesson.audio && lesson.audio.duration) {
                const rect = progressBackground.getBoundingClientRect();
                const clickPosition = (e.clientX - rect.left) / rect.width;
                const seekTime = clickPosition * lesson.audio.duration;
                lesson.audio.currentTime = seekTime;
                
                // Update progress bar immediately
                const progress = clickPosition * 100;
                const progressBar = document.getElementById(`EH-${lessonId}-progress-bar`);
                if (progressBar) progressBar.style.width = progress + '%';
                if (progressSlider) progressSlider.value = progress;
                if (progressThumb) {
                    progressThumb.style.left = progress + '%';
                    progressThumb.style.display = 'block';
                }
            }
        });
    }
    
    // Draggable progress thumb
    if (progressThumb && progressBackground) {
        let isDragging = false;
        
        const startDragging = (e) => {
            isDragging = true;
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDragging);
            e.preventDefault();
        };
        
        const drag = (e) => {
            if (isDragging && lesson.audio && lesson.audio.duration) {
                const rect = progressBackground.getBoundingClientRect();
                let clickPosition = (e.clientX - rect.left) / rect.width;
                clickPosition = Math.max(0, Math.min(1, clickPosition));
                
                const seekTime = clickPosition * lesson.audio.duration;
                lesson.audio.currentTime = seekTime;
                
                // Update progress bar immediately
                const progress = clickPosition * 100;
                const progressBar = document.getElementById(`EH-${lessonId}-progress-bar`);
                if (progressBar) progressBar.style.width = progress + '%';
                if (progressSlider) progressSlider.value = progress;
                progressThumb.style.left = progress + '%';
            }
        };
        
        const stopDragging = () => {
            isDragging = false;
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', stopDragging);
        };
        
        progressThumb.addEventListener('mousedown', startDragging);
    }
    
    // Initialize volume icon
    updateVolumeIcon();
},
    
    // Format time helper
    formatTime: function(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    
    // True/False setup
    setupTrueFalse: function(lessonId) {
        const trueFalseButtons = document.querySelectorAll(`.EH-comprehension-true-false-option`);
        trueFalseButtons.forEach(button => {
            button.addEventListener('click', function() {
                const questionContainer = this.closest('.EH-comprehension-true-false-question');
                const buttons = questionContainer.querySelectorAll('.EH-comprehension-true-false-option');
                
                // Remove selected class from all buttons in this question
                buttons.forEach(btn => {
                    btn.classList.remove('selected-true', 'selected-false');
                });
                
                // Add selected class to clicked button
                if (this.dataset.answer === 'true') {
                    this.classList.add('selected-true');
                } else {
                    this.classList.add('selected-false');
                }
            });
        });
    },
    
    // Fill in the blanks setup
    setupFillBlanks: function(lessonId) {
        const blankInputs = document.querySelectorAll('.EH-comprehension-blank-input');
        blankInputs.forEach(input => {
            input.addEventListener('input', function() {
                this.classList.remove('correct', 'incorrect');
            });
        });
    },
    
    // Sentence ordering setup - FIXED VERSION
setupSentenceOrdering: function(lessonId) {
    const orderingList = document.getElementById('ordering-list');
    if (!orderingList) return;
    
    // Make items draggable
    const items = orderingList.querySelectorAll('.EH-comprehension-ordering-item');
    let draggedItem = null;
    
    items.forEach(item => {
        item.setAttribute('draggable', 'true');
        
        item.addEventListener('dragstart', function(e) {
            draggedItem = this;
            setTimeout(() => this.classList.add('dragging'), 0);
            e.dataTransfer.setData('text/plain', '');
        });
        
        item.addEventListener('dragend', function() {
            this.classList.remove('dragging');
            draggedItem = null;
        });
    });
    
    // Handle drag over - FIXED
    orderingList.addEventListener('dragover', function(e) {
        e.preventDefault();
        const afterElement = getDragAfterElement(this, e.clientY);
        
        if (afterElement == null) {
            this.appendChild(draggedItem);
        } else {
            this.insertBefore(draggedItem, afterElement);
        }
    });
    
    // Helper function - FIXED
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.EH-comprehension-ordering-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
},
    
    // Check all exercises
    setupAllExercisesChecking: function(lessonId) {
        const lesson = this.lessons[lessonId];
        if (!lesson) return;
        
        const checkAllBtn = document.getElementById('EH-park-check-all');
        if (!checkAllBtn) return;
        
        checkAllBtn.addEventListener('click', function() {
            let totalScore = 0;
            let maxScore = 0;
            
            // 1. Check multiple choice questions
            for (let i = 1; i <= lesson.mcQuestions; i++) {
                maxScore++;
                const questionId = `park-q${i}`;
                const correctAnswer = lesson.correctAnswers[questionId];
                const selectedOption = document.querySelector(`input[name="${questionId}"]:checked`);
                const feedbackElement = document.getElementById(`${questionId}-feedback`);
                
                if (selectedOption) {
                    if (selectedOption.value === correctAnswer) {
                        totalScore++;
                        if (feedbackElement) {
                            feedbackElement.textContent = '✓ Correct!';
                            feedbackElement.className = 'EH-comprehension-answer-feedback correct';
                        }
                    } else {
                        if (feedbackElement) {
                            feedbackElement.textContent = '✗ Incorrect.';
                            feedbackElement.className = 'EH-comprehension-answer-feedback incorrect';
                        }
                    }
                } else {
                    if (feedbackElement) {
                        feedbackElement.textContent = 'Please select an answer.';
                        feedbackElement.className = 'EH-comprehension-answer-feedback incorrect';
                    }
                }
                if (feedbackElement) {
                    feedbackElement.style.display = 'block';
                }
            }
            
            // 2. Check True/False questions
            const tfQuestions = document.querySelectorAll('.EH-comprehension-true-false-question');
            tfQuestions.forEach((question, index) => {
                maxScore++;
                const questionId = `tf${index + 1}`;
                const correctAnswer = lesson.correctAnswers[questionId];
                const selectedButton = question.querySelector('.EH-comprehension-true-false-option.selected-true, .EH-comprehension-true-false-option.selected-false');
                const feedbackElement = document.getElementById(`${questionId}-feedback`);
                
                if (selectedButton) {
                    if (selectedButton.dataset.answer === correctAnswer) {
                        totalScore++;
                        if (feedbackElement) {
                            feedbackElement.textContent = '✓ Correct!';
                            feedbackElement.className = 'EH-comprehension-answer-feedback correct';
                        }
                    } else {
                        if (feedbackElement) {
                            feedbackElement.textContent = '✗ Incorrect.';
                            feedbackElement.className = 'EH-comprehension-answer-feedback incorrect';
                        }
                    }
                } else {
                    if (feedbackElement) {
                        feedbackElement.textContent = 'Please select an answer.';
                        feedbackElement.className = 'EH-comprehension-answer-feedback incorrect';
                    }
                }
                if (feedbackElement) {
                    feedbackElement.style.display = 'block';
                }
            });
            
            // 3. Check Fill in the Blanks
            const fillQuestions = lesson.fillBlanks || [];
            fillQuestions.forEach((fill, fillIndex) => {
                let fillScore = 0;
                fill.ids.forEach((inputId, answerIndex) => {
                    const input = document.getElementById(inputId);
                    if (input) {
                        const userAnswer = input.value.trim().toLowerCase();
                        const correctAnswer = fill.answers[answerIndex].toLowerCase();
                        
                        if (userAnswer === correctAnswer) {
                            fillScore++;
                            input.classList.add('correct');
                            input.classList.remove('incorrect');
                        } else {
                            input.classList.add('incorrect');
                            input.classList.remove('correct');
                        }
                    }
                });
                
                maxScore += fill.ids.length;
                totalScore += fillScore;
                
                const feedbackElement = document.getElementById(fill.feedbackId);
                if (feedbackElement) {
                    feedbackElement.textContent = `${fillScore}/${fill.ids.length} correct`;
                    feedbackElement.className = fillScore === fill.ids.length ? 
                        'EH-comprehension-answer-feedback correct' : 
                        'EH-comprehension-answer-feedback incorrect';
                    feedbackElement.style.display = 'block';
                }
            });
            
            // 4. Check Sentence Ordering
            const orderingItems = document.querySelectorAll('#ordering-list .EH-comprehension-ordering-item');
            if (orderingItems.length > 0) {
                const userOrder = Array.from(orderingItems).map(item => item.dataset.order);
                const correctOrder = lesson.correctAnswers.ordering;
                
                let orderingScore = 0;
                userOrder.forEach((order, index) => {
                    if (order === correctOrder[index]) {
                        orderingScore++;
                    }
                });
                
                maxScore += correctOrder.length;
                totalScore += orderingScore;
                
                const orderingFeedback = document.getElementById('ordering-feedback');
                if (orderingFeedback) {
                    orderingFeedback.textContent = `${orderingScore}/${correctOrder.length} in correct order`;
                    orderingFeedback.className = orderingScore === correctOrder.length ? 
                        'EH-comprehension-answer-feedback correct' : 
                        'EH-comprehension-answer-feedback incorrect';
                    orderingFeedback.style.display = 'block';
                }
            }
            
            // Update score display
            const scoreValue = document.getElementById('EH-park-score-value');
            const scoreFeedback = document.getElementById('EH-park-score-feedback');
            const scoreDisplay = document.getElementById('EH-park-score-display');
            
            if (scoreValue) {
                scoreValue.textContent = `${totalScore}/${maxScore}`;
            }
            
            // Set feedback based on score percentage
            if (scoreFeedback) {
                const percentage = (totalScore / maxScore) * 100;
                if (percentage >= 90) {
                    scoreFeedback.textContent = 'Excellent! Perfect score! You understood the story very well.';
                    scoreFeedback.setAttribute('data-i18n-comprehension', 'parkLesson.scoreFeedback.excellent');
                } else if (percentage >= 70) {
                    scoreFeedback.textContent = 'Good job! You understood most of the story.';
                    scoreFeedback.setAttribute('data-i18n-comprehension', 'parkLesson.scoreFeedback.good');
                } else if (percentage >= 50) {
                    scoreFeedback.textContent = 'Not bad! You might want to read the story again.';
                    scoreFeedback.setAttribute('data-i18n-comprehension', 'parkLesson.scoreFeedback.average');
                } else {
                    scoreFeedback.textContent = 'Try reading the story again and pay attention to the details.';
                    scoreFeedback.setAttribute('data-i18n-comprehension', 'parkLesson.scoreFeedback.needsImprovement');
                }
                
                // Apply translations
                if (window.TranslationManager && TranslationManager.systems.comprehension) {
                    const currentLang = TranslationManager.systems.comprehension.currentLang || 'en';
                    TranslationManager.updateSystem('comprehension', currentLang);
                }
            }
            
            if (scoreDisplay) {
                scoreDisplay.style.display = 'block';
                scoreDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    },
    
    // Reset all exercises for a lesson
    resetLesson: function(lessonId) {
        const lesson = this.lessons[lessonId];
        if (!lesson) return;
        
        // Reset audio
        if (lesson.audio) {
            lesson.audio.pause();
            lesson.audio.currentTime = 0;
            lesson.isPlaying = false;
            clearInterval(lesson.progressInterval);
            
            const playBtn = document.getElementById(`EH-${lessonId}-play-btn`);
            if (playBtn) {
    playBtn.querySelector('.EH-comprehension-audio-icon').textContent = '▶';
}
            
            const progressBar = document.getElementById(`EH-${lessonId}-progress-bar`);
            if (progressBar) {
                progressBar.style.width = '0%';
            }
            
            const timeDisplay = document.getElementById(`EH-${lessonId}-time-display`);
            if (timeDisplay) {
                timeDisplay.textContent = '0:00 / 0:00';
            }
        }
        
// Reset volume and speed
if (lesson.audio) {
    lesson.audio.volume = 1;
    lesson.audio.playbackRate = 1;
    
    const volumeSlider = document.getElementById(`EH-${lessonId}-volume-slider`);
    if (volumeSlider) volumeSlider.value = 1;
    
    const speedBtn = document.getElementById(`EH-${lessonId}-speed-btn`);
    if (speedBtn) speedBtn.textContent = '1x';
    
    const speedOptions = document.getElementById(`EH-${lessonId}-speed-options`);
    if (speedOptions) {
        speedOptions.querySelectorAll('.EH-audio-speed-option').forEach(opt => {
            opt.dataset.selected = (opt.dataset.speed === '1') ? 'true' : 'false';
        });
    }
}
        // Reset multiple choice
        for (let i = 1; i <= lesson.mcQuestions; i++) {
            const questionId = `park-q${i}`;
            const radioInputs = document.querySelectorAll(`input[name="${questionId}"]`);
            radioInputs.forEach(input => input.checked = false);
            const feedback = document.getElementById(`${questionId}-feedback`);
            if (feedback) {
                feedback.style.display = 'none';
                feedback.textContent = '';
            }
        }
        
        // Reset true/false
        const tfButtons = document.querySelectorAll('.EH-comprehension-true-false-option');
        tfButtons.forEach(btn => {
            btn.classList.remove('selected-true', 'selected-false');
        });
        
        const tfFeedbacks = document.querySelectorAll('[id$="-feedback"]');
        tfFeedbacks.forEach(fb => {
            if (fb.id.includes('tf')) {
                fb.style.display = 'none';
                fb.textContent = '';
            }
        });
        
        // Reset fill in blanks
        const blankInputs = document.querySelectorAll('.EH-comprehension-blank-input');
        blankInputs.forEach(input => {
            input.value = '';
            input.classList.remove('correct', 'incorrect');
        });
        
        const fillFeedbacks = document.querySelectorAll('[id^="fill"][id$="-feedback"]');
        fillFeedbacks.forEach(fb => {
            fb.style.display = 'none';
            fb.textContent = '';
        });
        
        // Reset ordering
        const orderingList = document.getElementById('ordering-list');
        if (orderingList) {
            const items = Array.from(orderingList.children);
            items.sort((a, b) => {
                const numA = parseInt(a.querySelector('.EH-comprehension-ordering-number').textContent);
                const numB = parseInt(b.querySelector('.EH-comprehension-ordering-number').textContent);
                return numA - numB;
            });
            items.forEach(item => orderingList.appendChild(item));
        }
        
        const orderingFeedback = document.getElementById('ordering-feedback');
        if (orderingFeedback) {
            orderingFeedback.style.display = 'none';
            orderingFeedback.textContent = '';
        }
        
        // Hide score display
        const scoreDisplay = document.getElementById('EH-park-score-display');
        if (scoreDisplay) {
            scoreDisplay.style.display = 'none';
        }
        
        console.log(`Lesson "${lessonId}" reset`);
    }
};

// Make it globally available
window.ComprehensionExercises = ComprehensionExercises;