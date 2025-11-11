// scripts/sound.js - Generic audio functions
// Global audio objects
const audioPlayers = {};
let currentAudio = null;
let mediaRecorder = null;
let audioChunks = [];
let recordedAudio = {};

// Initialize audio players with provided configuration
function initAudioPlayers(config) {
    for (const [key, path] of Object.entries(config)) {
        audioPlayers[key] = new Audio(path);
        audioPlayers[key].preload = 'metadata';
        
        // Add event listeners for audio state changes
        audioPlayers[key].addEventListener('ended', function() {
            updateAudioStatus(key, 'stopped');
        });
        
        audioPlayers[key].addEventListener('pause', function() {
            updateAudioStatus(key, 'paused');
        });
        
        audioPlayers[key].addEventListener('play', function() {
            updateAudioStatus(key, 'playing');
        });
    }
}

// Play audio function
function playAudio(audioKey) {
    // Stop any currently playing audio
    if (currentAudio && currentAudio !== audioPlayers[audioKey]) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    
    if (audioPlayers[audioKey]) {
        audioPlayers[audioKey].play()
            .then(() => {
                currentAudio = audioPlayers[audioKey];
                updateAudioStatus(audioKey, 'playing');
            })
            .catch(error => {
                console.error('Error playing audio:', error);
                updateAudioStatus(audioKey, 'error');
            });
    }
}

// Pause audio function
function pauseAudio(audioKey) {
    if (audioPlayers[audioKey]) {
        audioPlayers[audioKey].pause();
        updateAudioStatus(audioKey, 'paused');
    }
}

// Stop audio function
function stopAudio(audioKey) {
    if (audioPlayers[audioKey]) {
        audioPlayers[audioKey].pause();
        audioPlayers[audioKey].currentTime = 0;
        updateAudioStatus(audioKey, 'stopped');
    }
}

// Set volume for all audio players
function setGlobalVolume(volume) {
    const volumeLevel = volume / 100;
    for (const key in audioPlayers) {
        if (audioPlayers[key]) {
            audioPlayers[key].volume = volumeLevel;
        }
    }
}

// Update audio status display
// Update audio status with translations
function updateAudioStatus(audioKey, status) {
    let statusElement;
    
    if (audioKey === 'workplace-story') {
        statusElement = document.getElementById('EH-workplace-audio-status');
    } else {
        const baseKey = audioKey.replace('-listen', '');
        statusElement = document.querySelector(`[data-status="${baseKey}-status"]`);
    }
    
    if (statusElement) {
        const statusText = getStatusText(status);
        statusElement.textContent = statusText;
        
        // Update button visibility for main story audio
        if (audioKey === 'workplace-story') {
            const playBtn = document.getElementById('EH-workplace-play-btn');
            const pauseBtn = document.getElementById('EH-workplace-pause-btn');
            
            if (status === 'playing') {
                playBtn.style.display = 'none';
                pauseBtn.style.display = 'flex';
            } else {
                playBtn.style.display = 'flex';
                pauseBtn.style.display = 'none';
            }
        }
    }
}

// Get localized status text
function getStatusText(status) {
    const lang = document.documentElement.lang || 'en';
    const i18n = window.I18N && window.I18N[lang];
    
    if (i18n && i18n.workplace && i18n.workplace.audio && i18n.workplace.audio.status) {
        const statusMap = i18n.workplace.audio.status;
        switch(status) {
            case 'loading': return statusMap.loading;
            case 'playing': return statusMap.playing;
            case 'paused': return statusMap.paused;
            case 'stopped': return statusMap.stopped;
            case 'error': return statusMap.error;
            default: return status;
        }
    }
    
    // Default English fallback
    const defaultStatus = {
        'loading': 'Loading audio...',
        'playing': 'Playing audio...',
        'paused': 'Audio paused',
        'stopped': 'Audio stopped',
        'error': 'Audio not available'
    };
    
    return defaultStatus[status] || status;
}

// Set playback speed for all audio players
function setGlobalPlaybackSpeed(speed) {
    for (const key in audioPlayers) {
        if (audioPlayers[key]) {
            audioPlayers[key].playbackRate = speed;
        }
    }
}

// Recording functions
async function startRecording(recordKey) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            recordedAudio[recordKey] = new Audio(audioUrl);
            
            // Show playback button
            const playbackBtn = document.querySelector(`[data-audio="${recordKey}-playback"]`);
            if (playbackBtn) {
                playbackBtn.style.display = 'flex';
            }
            
            // Update status
            updateRecordingStatus(recordKey, 'finished');
            
            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        updateRecordingStatus(recordKey, 'recording');
        
    } catch (error) {
        console.error('Error starting recording:', error);
        updateRecordingStatus(recordKey, 'error');
    }
}

function stopRecording(recordKey) {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }
}

function playRecording(recordKey) {
    if (recordedAudio[recordKey]) {
        recordedAudio[recordKey].play()
            .then(() => {
                updateRecordingStatus(recordKey, 'playing');
            })
            .catch(error => {
                console.error('Error playing recording:', error);
                updateRecordingStatus(recordKey, 'error');
            });
    }
}

function updateRecordingStatus(recordKey, status) {
    const statusElement = document.querySelector(`[data-status="${recordKey}-status"]`);
    if (statusElement) {
        let statusHTML = '';
        
        switch (status) {
            case 'recording':
                statusHTML = '<span class="EH-workplace-recording-indicator"></span> Recording...';
                break;
            case 'finished':
                statusHTML = 'Recording finished. Click Playback to listen.';
                break;
            case 'playing':
                statusHTML = 'Playing your recording...';
                break;
            case 'error':
                statusHTML = 'Recording error. Please try again.';
                break;
            default:
                statusHTML = '';
        }
        
        statusElement.innerHTML = statusHTML;
    }
}

// Set up event listeners for pronunciation practice
function setupPronunciationListeners() {
    // Listen buttons - support multiple lesson types
    document.querySelectorAll('[class*="-pronunciation-btn"]:not(.record):not(.play-recorded)').forEach(btn => {
        btn.addEventListener('click', function() {
            const audioKey = this.getAttribute('data-audio');
            if (audioKey) {
                playAudio(audioKey);
            } else {
                console.error('No data-audio attribute found on button:', this);
            }
        });
    });
    
    // Record buttons - support multiple lesson types
    document.querySelectorAll('[class*="-pronunciation-btn"].record').forEach(btn => {
        btn.addEventListener('click', function() {
            const audioKey = this.getAttribute('data-audio');
            const recordKey = audioKey.replace('-record', '');
            
            if (this.classList.contains('recording')) {
                // Stop recording
                this.classList.remove('recording');
                this.innerHTML = '<span data-i18n="common.record">Record</span>';
                stopRecording(recordKey);
            } else {
                // Start recording
                this.classList.add('recording');
                this.innerHTML = '<span data-i18n="common.stop">Stop</span>';
                startRecording(recordKey);
            }
        });
    });
    
    // Playback buttons - support multiple lesson types
    document.querySelectorAll('[class*="-pronunciation-btn"].play-recorded').forEach(btn => {
        btn.addEventListener('click', function() {
            const audioKey = this.getAttribute('data-audio');
            const recordKey = audioKey.replace('-playback', '');
            playRecording(recordKey);
        });
    });
}