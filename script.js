// Game state variables
let currentSentence = "";
let score = 0;
let hasScored = false;
let customSentences = [];
let currentSentenceBank = "default";
let gameStarted = false;
let gameComplete = false;
let ttsSetting = false; 

const sentences = [  
    "How are you feeling today?",  
    "Let me take your temperature first.",  
    "Please let me know if you're in any pain.",  
    "I'll be right back with your medication.",  
    "Let me check your vital signs.",  
    "Do you need anything to make you more comfortable?",  
    "I need to draw some blood for tests.",  
    "Please make sure to rest as much as possible.",  
    "I’ll be administering your medication shortly.",  
    "Let me know if you feel any discomfort.",  
    "Are you allergic to any medications?",  
    "I’ll help you with your physical therapy exercises.",  
    "Please try to stay calm, everything will be fine.",  
    "We need to change your bandage now.",  
    "Your doctor will be here soon to check on you.",  
    "I’ll help you get comfortable in bed.",  
    "I need to update your medical records.",  
    "Don’t hesitate to ask if you need something.",  
    "We’ll be monitoring you closely for the next few hours.",  
    "Please drink plenty of fluids today.",  
    "Are you able to eat something now?",  
    "You’re doing great, just a little more to go.",  
    "Let’s take a walk around the room to help your recovery.",  
    "I’ll adjust your IV drip now.",  
    "Please press this button if you need assistance.",  
    "You’re in good hands, just relax.",  
    "I’m going to check your blood pressure.",  
    "I’ll help you with your breathing exercises.",  
    "Please stay still while I take the x-ray.",  
    "Can you tell me where it hurts?",  
    "We’ll start the procedure in just a moment.",  
    "The results should be back shortly.",  
    "Do you have any questions about your treatment plan?",  
    "We’ll need to monitor your condition over the next few days.",  
    "I’ll be checking on you regularly.",  
    "Let’s get you ready for your test.",  
    "Your next dose of medicine is due in an hour.",  
    "We need to make sure you’re comfortable before the procedure.",  
    "How would you rate your pain level?",  
    "I’ll bring in a blanket for you to stay warm.",  
    "Are you ready for your injection?",  
    "Let’s make sure your IV is secure.",  
    "Please try to take deep breaths.",  
    "I’ll assist you in sitting up slowly.",  
    "We’re going to monitor your recovery closely.",  
    "Let me know if you start feeling dizzy.",  
    "I’ll help you get out of bed in a moment.",  
    "I’m here if you need anything, don’t hesitate to ask.",  
    "Let me check your blood sugar levels now.",  
    "I’ll be administering your pain medication shortly.",  
    "How are you feeling after your treatment?",  
    "You’re doing a great job, keep it up."  
];  


function loadSettings() {
    try {
        const savedBank = localStorage.getItem('sentenceBank');
        const savedSentences = localStorage.getItem('customSentences');
        const savedTTSSetting = localStorage.getItem('ttsSetting');
        
        if (savedBank) {
            currentSentenceBank = savedBank;
            document.getElementById('sentenceSource').value = savedBank;
        }
        
        if (savedSentences) {
            customSentences = JSON.parse(savedSentences);
        }
        
        if (savedTTSSetting !== null) {
            ttsSetting = savedTTSSetting === 'true';
            updateTTSToggleButton();
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        // Reset to defaults if there's an error
        currentSentenceBank = "default";
        customSentences = [];
        ttsSetting = false;
    }
}

function saveSettings() {
    const source = document.getElementById('sentenceSource').value;
    const sentences = document.getElementById('customSentences').value
        .split('\n')
        .filter(s => s.trim());
    
    if (source === 'custom' && sentences.length < 5) {
        alert('Please enter at least 5 sentences for the custom sentence bank.');
        document.getElementById('sentenceSource').value = currentSentenceBank;
        return;
    }
    
    currentSentenceBank = source;
    customSentences = sentences;
    
    try {
        localStorage.setItem('sentenceBank', source);
        localStorage.setItem('customSentences', JSON.stringify(sentences));
        document.getElementById('settingsModal').style.display = 'none';
        
        // Only get a new sentence if the game is in progress and not complete
        if (gameStarted && !gameComplete) {
            newSentence();
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Failed to save settings. Please try again.');
    }
}

function toggleTTS() {
    ttsSetting = !ttsSetting;
    localStorage.setItem('ttsSetting', ttsSetting);
    updateTTSToggleButton();
}

function updateTTSToggleButton() {
    const ttsButton = document.getElementById('ttsToggle');
    if (ttsSetting) {
        ttsButton.textContent = "Voice: ON";
        ttsButton.classList.add('active');
    } else {
        ttsButton.textContent = "Voice: OFF";
        ttsButton.classList.remove('active');
    }
}

// TTS function to speak text
function speakText(text) {
    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower rate for clarity
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = 'en-US';
    
    window.speechSynthesis.speak(utterance);
}

// Speak word function - depends on ttsSetting
function speakWord(text) {
    if (!ttsSetting) return;
    speakText(text);
}

function getCurrentSentences() {
    return currentSentenceBank === 'custom' && customSentences.length > 0 
        ? customSentences 
        : sentences;  
}

function startGame() {
    gameStarted = true;
    gameComplete = false;
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('checkButton').style.display = 'inline';
    document.getElementById('skipButton').style.display = 'inline';
    document.getElementById('settingsButton').style.display = 'none';
    document.getElementById('directions').style.display = 'none';
    score = 0;
    document.getElementById('score').textContent = 'Score: 0';
    newSentence();
}

function newSentence() {
    if (gameComplete) return;
    
    // Show check and skip buttons for the new sentence
    document.getElementById('checkButton').style.display = 'inline';
    document.getElementById('skipButton').style.display = 'inline';
    
    // Hide next sentence and speak sentence buttons
    document.getElementById('nextSentenceButton').style.display = 'none';
    document.getElementById('speakSentenceButton').style.display = 'none';
    
    const sentences = getCurrentSentences();
    const randomIndex = Math.floor(Math.random() * sentences.length);
    currentSentence = sentences[randomIndex];
    
    const words = currentSentence.split(/\s+/);
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    
    const scrambledWordsDiv = document.getElementById('scrambledWords');
    scrambledWordsDiv.innerHTML = '';
    
    shuffledWords.forEach((word, index) => {
        const wordDiv = document.createElement('div');
        wordDiv.className = 'word';
        wordDiv.textContent = word;
        wordDiv.dataset.index = index;
        scrambledWordsDiv.appendChild(wordDiv);
    });
    
    document.getElementById('answerArea').innerHTML = '';
    selectedWords = [];
    hasScored = false;
    document.getElementById('feedback').textContent = '';
}

function checkAnswer() {
    const userAnswer = Array.from(document.getElementById('answerArea').children)
        .map(word => word.textContent)
        .join(' ');
    
    if (userAnswer.toLowerCase() === currentSentence.toLowerCase()) {
        if (!hasScored) {
            score++;
            hasScored = true;
            document.getElementById('score').textContent = `${score}`;
        }
        
        document.getElementById('feedback').textContent = '✨ Correct! ✨';
        
        // Hide check and skip buttons
        document.getElementById('checkButton').style.display = 'none';
        document.getElementById('skipButton').style.display = 'none';
        
        // Show the next sentence and speak sentence buttons
        document.getElementById('nextSentenceButton').style.display = 'inline';
        document.getElementById('speakSentenceButton').style.display = 'inline';
        
        // Mark game as complete but don't show victory modal yet if score is 5
        if (score >= 5) {
            gameComplete = true;
            // We've removed the showVictoryModal() call from here
        }
    } else {
        document.getElementById('feedback').textContent = '❌ Try again! ❌';
    }
}

function speakSentence() {
    // Always speak the sentence regardless of ttsSetting
    speakText(currentSentence);
}

async function showVictoryModal() {
    const modal = document.getElementById("victoryModal");
    const pokemonId = Math.floor(Math.random() * 898) + 1;
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
    const data = await response.json();
    const pokemonImageDiv = document.getElementById("pokemonImage");
    const img = document.createElement("img");
    img.src = data.sprites.other["official-artwork"].front_default;
    img.alt = `${data.name} Pokemon artwork`;
    img.width = 300;
    img.height = 300;
    pokemonImageDiv.innerHTML = "";
    pokemonImageDiv.appendChild(img);
    modal.style.display = "flex";
}

function closeModal() {
    document.getElementById("victoryModal").style.display = "none";
    resetGame();
}

function resetGame() {
    gameStarted = false;
    gameComplete = false;
    score = 0;
    document.getElementById('score').textContent = 'Score: 0';
    document.getElementById('startButton').style.display = 'inline';
    document.getElementById('checkButton').style.display = 'none';
    document.getElementById('skipButton').style.display = 'none';
    document.getElementById('nextSentenceButton').style.display = 'none';
    document.getElementById('speakSentenceButton').style.display = 'none';
    document.getElementById('feedback').textContent = '';
    document.getElementById('scrambledWords').innerHTML = '';
    document.getElementById('answerArea').innerHTML = '';
    document.getElementById('settingsButton').style.display = 'inline';
}

function handleWordSelection(event) {
    if (!gameStarted || gameComplete) return;
    
    const clickedElement = event.target;
    if (!clickedElement.classList.contains('word')) return;
    
    const sourceArea = clickedElement.parentElement.id;
    const targetArea = sourceArea === 'scrambledWords' ? 'answerArea' : 'scrambledWords';
    
    document.getElementById(targetArea).appendChild(clickedElement);
    
    // If moving from scrambled words to answer area, speak the word (controlled by ttsSetting)
    if (sourceArea === 'scrambledWords') {
        speakWord(clickedElement.textContent);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    
    // Event Listeners
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('checkButton').addEventListener('click', checkAnswer);
    document.getElementById('skipButton').addEventListener('click', newSentence);
    
    // Modified the nextSentenceButton event listener to check if victory modal should be shown
    document.getElementById('nextSentenceButton').addEventListener('click', () => {
        if (gameComplete) {
            showVictoryModal(); // Show victory modal when clicking "Next Sentence" after completing 5 sentences
        } else {
            newSentence();
        }
    });
    
    document.getElementById('speakSentenceButton').addEventListener('click', speakSentence);
    document.getElementById('ttsToggle').addEventListener('click', toggleTTS);
    document.getElementById('scrambledWords').addEventListener('click', handleWordSelection);
    document.getElementById('answerArea').addEventListener('click', handleWordSelection);
    
    // Add directions button handler
    document.getElementById('directionsButton').addEventListener('click', () => {
        const directions = document.getElementById('directions');
        directions.style.display = directions.style.display === 'none' ? 'block' : 'none';
    });
    
    document.getElementById('settingsButton').addEventListener('click', () => {
        document.getElementById('settingsModal').style.display = 'block';
        document.getElementById('customSentences').value = customSentences.join('\n');
        document.getElementById('sentenceSource').value = currentSentenceBank;
    });
    
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    
    document.getElementById('closeSettings').addEventListener('click', () => {
        document.getElementById('settingsModal').style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('settingsModal');
        const modalContent = modal.querySelector('.modal-content');
        if (event.target === modal && !modalContent.contains(event.target)) {
            modal.style.display = 'none';
        }
    });
    
    // Initialize TTS button state
    updateTTSToggleButton();
    
    // Check if browser supports speech synthesis
    if (!window.speechSynthesis) {
        document.getElementById('ttsToggle').style.display = 'none';
        document.getElementById('speakSentenceButton').style.display = 'none';
        console.error('Browser does not support speech synthesis');
    }
});
