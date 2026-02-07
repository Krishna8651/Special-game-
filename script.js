// Game Configuration
const CONFIG = {
    totalHearts: 10,
    heartAnimations: ['heartbeat', 'float', 'bounce', 'pulse'],
    messages: [
        "My love for you is a journey starting at forever and ending at never. You are my today and all of my tomorrows. Every moment with you feels like a beautiful dream I never want to wake up from. ❤️",
        
        "In your eyes, I found my home. In your heart, I found my love. In your soul, I found my mate. With you, I found my forever. You are the reason I believe in magic. 🌹",
        
        "Loving you is not just a feeling; it's my favorite thing to do every single day. You make my world brighter just by being in it. Your smile is my sunshine. ✨",
        
        "If I had to choose between breathing and loving you, I would use my last breath to tell you I love you. You are my everything, my always and forever. 💖",
        
        "With every heartbeat, I love you more. With every breath, I need you more. You are the missing piece I never knew I was searching for. My soul recognized yours. 🫀",
        
        "You are the sun in my morning, the moon in my night, and the stars in my sky. My world revolves around you, and I wouldn't have it any other way. Forever yours. ☀️",
        
        "I fall in love with you more every day - with your smile, your laugh, your kindness, and the way you make me feel like I'm the only person in the world. Always and forever. 🌟",
        
        "Your love is the poetry my heart writes every day. Each word, each line, each verse speaks of you. You are my favorite chapter in the story of my life. 📖",
        
        "In a sea of people, my eyes will always search for you. In a room full of voices, my ears will always listen for you. You are my anchor and my compass. 🌊",
        
        "You are not just my love; you are my peace, my joy, my strength, and my happiness. With you, every day is Valentine's Day. Forever and always. 💝"
    ]
};

// Game State
let gameState = {
    collectedHearts: 0,
    currentLevel: 1,
    gameStarted: false,
    gameCompleted: false,
    startTime: null,
    timerInterval: null,
    currentMessageIndex: 0,
    hintsUsed: 0,
    totalTime: 0,
    heartPositions: []
};

// DOM Elements
const elements = {
    heartsCount: document.getElementById('hearts-count'),
    levelCount: document.getElementById('level-count'),
    timer: document.getElementById('timer'),
    currentMessage: document.getElementById('current-message'),
    heartsGrid: document.getElementById('hearts-grid'),
    progressBar: document.getElementById('progress-bar'),
    progressText: document.getElementById('progress-text'),
    messageRevealContainer: document.getElementById('message-reveal-container'),
    specialMessage: document.getElementById('special-message'),
    finalHearts: document.getElementById('final-hearts'),
    finalTime: document.getElementById('final-time'),
    finalLevel: document.getElementById('final-level'),
    
    // Buttons
    startBtn: document.getElementById('start-btn'),
    hintBtn: document.getElementById('hint-btn'),
    resetBtn: document.getElementById('reset-btn'),
    nextMessageBtn: document.getElementById('next-message-btn'),
    shareBtn: document.getElementById('share-btn'),
    saveBtn: document.getElementById('save-btn')
};

// Initialize Game
function initGame() {
    resetGameState();
    createHeartsGrid();
    updateUI();
    createFloatingHearts();
    
    // Set initial message
    elements.currentMessage.innerHTML = `
        <div class="message-content">
            <p class="welcome-message">Welcome to the Love Message Game! 💕</p>
            <p class="game-instruction">Find and collect all ${CONFIG.totalHearts} hearts to reveal a beautiful love message.</p>
            <div class="message-ornament">
                <i class="fas fa-heart"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-heart"></i>
            </div>
        </div>
    `;
}

// Reset Game State
function resetGameState() {
    gameState = {
        collectedHearts: 0,
        currentLevel: 1,
        gameStarted: false,
        gameCompleted: false,
        startTime: null,
        timerInterval: null,
        currentMessageIndex: Math.floor(Math.random() * CONFIG.messages.length),
        hintsUsed: 0,
        totalTime: 0,
        heartPositions: []
    };
    
    // Hide message reveal container
    elements.messageRevealContainer.classList.remove('revealed');
    
    // Enable start button
    elements.startBtn.disabled = false;
    elements.startBtn.innerHTML = '<span class="btn-icon"><i class="fas fa-play-circle"></i></span><span class="btn-text">Start Game</span>';
    
    // Clear timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

// Create Hearts Grid
function createHeartsGrid() {
    elements.heartsGrid.innerHTML = '';
    gameState.heartPositions = [];
    
    for (let i = 0; i < CONFIG.totalHearts; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart-cell';
        heart.dataset.index = i;
        
        // Create heart icon with random animation
        const animation = CONFIG.heartAnimations[Math.floor(Math.random() * CONFIG.heartAnimations.length)];
        heart.innerHTML = `<i class="fas fa-heart ${animation}"></i>`;
        
        // Store position for hint system
        gameState.heartPositions.push({
            element: heart,
            collected: false,
            position: {
                x: Math.random() * 80 + 10,
                y: Math.random() * 80 + 10
            }
        });
        
        // Add click event
        heart.addEventListener('click', () => collectHeart(i, heart));
        
        // Add hover effect
        heart.addEventListener('mouseenter', () => {
            if (!heart.classList.contains('collected') && gameState.gameStarted) {
                heart.style.transform = 'translateY(-5px) scale(1.05)';
                heart.style.borderColor = 'var(--primary-pink)';
            }
        });
        
        heart.addEventListener('mouseleave', () => {
            if (!heart.classList.contains('collected') && gameState.gameStarted) {
                heart.style.transform = '';
                heart.style.borderColor = '';
            }
        });
        
        elements.heartsGrid.appendChild(heart);
    }
}

// Start Game
function startGame() {
    if (gameState.gameStarted || gameState.gameCompleted) return;
    
    gameState.gameStarted = true;
    gameState.startTime = new Date();
    
    // Update UI
    elements.startBtn.disabled = true;
    elements.startBtn.innerHTML = '<span class="btn-icon"><i class="fas fa-gamepad"></i></span><span class="btn-text">Game Started</span>';
    
    // Update message
    elements.currentMessage.innerHTML = `
        <div class="message-content">
            <p class="game-instruction">Find and click all ${CONFIG.totalHearts} hidden hearts! 💖</p>
            <p class="progress-info">Each heart reveals part of a beautiful love message...</p>
        </div>
    `;
    
    // Start timer
    startTimer();
    
    // Enable heart interactions
    document.querySelectorAll('.heart-cell').forEach(heart => {
        heart.style.cursor = 'pointer';
    });
    
    // Create initial heart effects
    createHeartEffects();
}

// Collect Heart
function collectHeart(index, heartElement) {
    if (!gameState.gameStarted || gameState.gameCompleted || 
        gameState.heartPositions[index].collected) return;
    
    // Mark as collected
    gameState.heartPositions[index].collected = true;
    gameState.collectedHearts++;
    
    // Add collected class
    heartElement.classList.add('collected');
    heartElement.style.cursor = 'default';
    
    // Create collection effect
    createCollectionEffect(heartElement);
    
    // Update progress
    updateProgress();
    
    // Update message with partial reveal
    updatePartialMessage();
    
    // Check if game is completed
    if (gameState.collectedHearts >= CONFIG.totalHearts) {
        completeGame();
    }
}

// Update Progress
function updateProgress() {
    const progress = (gameState.collectedHearts / CONFIG.totalHearts) * 100;
    
    // Update progress bar
    elements.progressBar.style.width = `${progress}%`;
    
    // Update progress text
    elements.progressText.textContent = `${Math.round(progress)}%`;
    
    // Update hearts count
    elements.heartsCount.textContent = gameState.collectedHearts;
}

// Update Partial Message
function updatePartialMessage() {
    const message = CONFIG.messages[gameState.currentMessageIndex];
    const words = message.split(' ');
    const progress = gameState.collectedHearts / CONFIG.totalHearts;
    const wordsToShow = Math.max(3, Math.floor(words.length * progress));
    
    const partialText = words.slice(0, wordsToShow).join(' ') + '...';
    
    elements.currentMessage.innerHTML = `
        <div class="message-content">
            <p class="progress-info">Heart ${gameState.collectedHearts} of ${CONFIG.totalHearts} collected! 💕</p>
            <p class="partial-message"><em>"${partialText}"</em></p>
            <div class="message-ornament">
                <i class="fas fa-heart"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-heart"></i>
            </div>
        </div>
    `;
}

// Complete Game
function completeGame() {
    gameState.gameCompleted = true;
    gameState.totalTime = calculateElapsedTime();
    
    // Stop timer
    clearInterval(gameState.timerInterval);
    
    // Show celebration
    showCelebration();
    
    // Update final stats
    elements.finalHearts.textContent = gameState.collectedHearts;
    elements.finalTime.textContent = formatTime(gameState.totalTime);
    elements.finalLevel.textContent = gameState.currentLevel;
    
    // Display the complete message
    elements.specialMessage.textContent = CONFIG.messages[gameState.currentMessageIndex];
    
    // Show message reveal container with animation
    setTimeout(() => {
        elements.messageRevealContainer.classList.add('revealed');
        
        // Scroll to reveal container
        elements.messageRevealContainer.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
        });
        
        // Create confetti
        createConfetti();
    }, 1000);
    
    // Update current message
    elements.currentMessage.innerHTML = `
        <div class="message-content">
            <p class="celebration-message" style="color: var(--gold); font-weight: bold;">
                <i class="fas fa-trophy"></i> Congratulations! All hearts collected!
            </p>
            <p class="revelation-info">Your special love message has been revealed below! 💝</p>
        </div>
    `;
}

// Show Celebration
function showCelebration() {
    // Create floating hearts celebration
    for (let i = 0; i < 30; i++) {
        createFloatingHeart(true);
    }
    
    // Play celebration sound (visual)
    createCelebrationEffects();
}

// Start Timer
function startTimer() {
    gameState.startTime = new Date();
    
    gameState.timerInterval = setInterval(() => {
        const elapsedTime = calculateElapsedTime();
        elements.timer.textContent = formatTime(elapsedTime);
    }, 1000);
}

// Calculate Elapsed Time
function calculateElapsedTime() {
    if (!gameState.startTime) return 0;
    
    const currentTime = new Date();
    return Math.floor((currentTime - gameState.startTime) / 1000);
}

// Format Time
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Update UI
function updateUI() {
    elements.heartsCount.textContent = gameState.collectedHearts;
    elements.levelCount.textContent = gameState.currentLevel;
    elements.timer.textContent = '00:00';
    elements.progressBar.style.width = '0%';
    elements.progressText.textContent = '0%';
}

// Create Collection Effect
function createCollectionEffect(heartElement) {
    const rect = heartElement.getBoundingClientRect();
    
    // Create sparkles
    for (let i = 0; i < 8; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'collection-sparkle';
        sparkle.innerHTML = '✨';
        
        sparkle.style.position = 'fixed';
        sparkle.style.left = `${rect.left + rect.width / 2}px`;
        sparkle.style.top = `${rect.top + rect.height / 2}px`;
        sparkle.style.fontSize = '1.2rem';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '1000';
        sparkle.style.opacity = '1';
        
        // Random direction and animation
        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 50;
        const duration = 0.5 + Math.random() * 0.5;
        
        sparkle.style.transition = `all ${duration}s ease-out`;
        
        document.body.appendChild(sparkle);
        
        // Trigger animation
        setTimeout(() => {
            sparkle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
            sparkle.style.opacity = '0';
        }, 10);
        
        // Remove after animation
        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.remove();
            }
        }, duration * 1000);
    }
}

// Create Heart Effects
function createHeartEffects() {
    // Make hearts pulse gently
    document.querySelectorAll('.heart-cell').forEach((heart, index) => {
        setTimeout(() => {
            heart.style.animation = 'pulse 2s infinite';
        }, index * 100);
    });
}

// Create Floating Hearts
function createFloatingHearts(isCelebration = false) {
    const count = isCelebration ? 50 : 20;
    
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'floating-heart-particle';
            heart.innerHTML = isCelebration ? '💖' : '💗';
            
            // Random properties
            const size = isCelebration ? 
                (1 + Math.random() * 2) + 'rem' : 
                (0.5 + Math.random() * 1) + 'rem';
            const left = Math.random() * 100;
            const duration = isCelebration ? 
                (2 + Math.random() * 2) : 
                (5 + Math.random() * 5);
            const delay = Math.random() * 2;
            
            heart.style.position = 'fixed';
            heart.style.left = `${left}vw`;
            heart.style.top = '100vh';
            heart.style.fontSize = size;
            heart.style.opacity = '0.7';
            heart.style.pointerEvents = 'none';
            heart.style.zIndex = '999';
            heart.style.filter = 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.5))';
            
            // Apply animation
            heart.style.animation = `floatUp ${duration}s ease-in ${delay}s forwards`;
            
            document.body.appendChild(heart);
            
            // Remove after animation
            setTimeout(() => {
                if (heart.parentNode) {
                    heart.remove();
                }
            }, (duration + delay) * 1000);
        }, i * 100);
    }
}

// Create Celebration Effects
function createCelebrationEffects() {
    // Add CSS for celebration effects
    if (!document.getElementById('celebration-styles')) {
        const style = document.createElement('style');
        style.id = 'celebration-styles';
        style.textContent = `
            .floating-heart-particle {
                animation: floatUp 5s ease-in forwards;
            }
            
            @keyframes floatUp {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100vh) rotate(360deg);
                    opacity: 0;
                }
            }
            
            .collection-sparkle {
                animation: sparklePop 0.5s ease-out forwards;
            }
            
            @keyframes sparklePop {
                0% {
                    transform: scale(0);
                    opacity: 1;
                }
                50% {
                    transform: scale(1.2);
                    opacity: 1;
                }
                100% {
                    transform: scale(1);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Create Confetti
function createConfetti() {
    const colors = ['#ff6b9d', '#ff8eb4', '#ffd166', '#a855f7', '#00b4d8', '#ffffff'];
    const confettiContainer = document.getElementById('confetti-container') || createConfettiContainer();
    
    for (let i = 0; i < 150; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 10 + 5;
            const left = Math.random() * 100;
            const animationDuration = Math.random() * 3 + 2;
            const animationDelay = Math.random() * 1;
            const shape = Math.random() > 0.5 ? 'circle' : 'square';
            
            confetti.style.position = 'fixed';
            confetti.style.width = `${size}px`;
            confetti.style.height = `${size}px`;
            confetti.style.backgroundColor = color;
            confetti.style.left = `${left}vw`;
            confetti.style.top = '-50px';
            confetti.style.borderRadius = shape === 'circle' ? '50%' : '0';
            confetti.style.opacity = '0.8';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '1000';
            
            // Add animation
            confetti.style.animation = `confettiFall ${animationDuration}s ease-in ${animationDelay}s forwards`;
            
            confettiContainer.appendChild(confetti);
            
            // Remove after animation
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.remove();
                }
            }, (animationDuration + animationDelay) * 1000);
        }, i * 20);
    }
}

function createConfettiContainer() {
    const container = document.createElement('div');
    container.id = 'confetti-container';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '1000';
    
    // Add confetti animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes confettiFall {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(container);
    return container;
}

// Show Hint
function showHint() {
    if (!gameState.gameStarted || gameState.gameCompleted || gameState.hintsUsed >= 3) return;
    
    gameState.hintsUsed++;
    
    // Find uncollected hearts
    const uncollectedHearts = gameState.heartPositions.filter(h => !h.collected);
    
    if (uncollectedHearts.length > 0) {
            // Pick a random uncollected heart
    const randomIndex = Math.floor(Math.random() * uncollectedHearts.length);
    const heart = uncollectedHearts[randomIndex];
    
    // Highlight the heart
    heart.element.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.8)';
    heart.element.style.borderColor = 'var(--gold)';
    heart.element.style.transform = 'scale(1.2)';
    heart.element.style.zIndex = '10';
    
    // Create hint effect
    createHintEffect(heart.element);
    
    // Update message
    elements.currentMessage.innerHTML = `
        <div class="message-content">
            <p class="hint-message" style="color: var(--gold);">
                <i class="fas fa-lightbulb"></i> Hint: Check the glowing golden heart!
            </p>
            <p class="hint-count">Hints used: ${gameState.hintsUsed}/3</p>
        </div>
    `;
    
    // Remove highlight after 2 seconds
    setTimeout(() => {
        heart.element.style.boxShadow = '';
        heart.element.style.borderColor = '';
        heart.element.style.transform = '';
        heart.element.style.zIndex = '';
    }, 2000);
}

// Create Hint Effect
function createHintEffect(heartElement) {
    const ring = document.createElement('div');
    ring.className = 'hint-ring';
    ring.style.position = 'absolute';
    ring.style.width = '120px';
    ring.style.height = '120px';
    ring.style.border = '3px solid var(--gold)';
    ring.style.borderRadius = '50%';
    ring.style.opacity = '0.7';
    ring.style.animation = 'ripple 1.5s ease-out';
    
    heartElement.appendChild(ring);
    
    setTimeout(() => {
        if (ring.parentNode) {
            ring.remove();
        }
    }, 1500);
}

// Next Love Message
function nextLoveMessage() {
    // Move to next message
    gameState.currentMessageIndex = (gameState.currentMessageIndex + 1) % CONFIG.messages.length;
    gameState.currentLevel++;
    
    // Reset and start new game
    initGame();
    startGame();
}

// Share Message
function shareMessage() {
    const message = CONFIG.messages[gameState.currentMessageIndex];
    const shareText = `I just unlocked this beautiful love message in the Love Message Game! 💕\n\n"${message.substring(0, 100)}..."\n\nTry it yourself!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Love Message Game',
            text: shareText,
            url: window.location.href
        });
    } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(shareText + '\n\nPlay the game: ' + window.location.href)
            .then(() => {
                // Show success message
                const originalText = elements.shareBtn.innerHTML;
                elements.shareBtn.innerHTML = '<i class="fas fa-check"></i><span>Copied!</span>';
                elements.shareBtn.style.background = 'linear-gradient(135deg, #00b09b, #96c93d)';
                
                setTimeout(() => {
                    elements.shareBtn.innerHTML = originalText;
                    elements.shareBtn.style.background = '';
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                alert('Please manually copy the message to share.');
            });
    }
}

// Save Message
function saveMessage() {
    const message = CONFIG.messages[gameState.currentMessageIndex];
    const messageData = {
        message: message,
        date: new Date().toLocaleDateString(),
        time: elements.timer.textContent,
        hearts: gameState.collectedHearts,
        level: gameState.currentLevel
    };
    
    // Save to localStorage
    const savedMessages = JSON.parse(localStorage.getItem('loveMessages') || '[]');
    savedMessages.push(messageData);
    localStorage.setItem('loveMessages', JSON.stringify(savedMessages));
    
    // Show success message
    const originalText = elements.saveBtn.innerHTML;
    elements.saveBtn.innerHTML = '<i class="fas fa-check"></i><span>Saved!</span>';
    elements.saveBtn.style.background = 'linear-gradient(135deg, #00b09b, #96c93d)';
    
    setTimeout(() => {
        elements.saveBtn.innerHTML = originalText;
        elements.saveBtn.style.background = '';
    }, 2000);
}

// Event Listeners
function setupEventListeners() {
    elements.startBtn.addEventListener('click', startGame);
    elements.hintBtn.addEventListener('click', showHint);
    elements.resetBtn.addEventListener('click', initGame);
    elements.nextMessageBtn.addEventListener('click', nextLoveMessage);
    elements.shareBtn.addEventListener('click', shareMessage);
    elements.saveBtn.addEventListener('click', saveMessage);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space' && !gameState.gameCompleted) {
            event.preventDefault();
            if (!gameState.gameStarted) {
                startGame();
            } else {
                showHint();
            }
        }
        
        if (event.code === 'KeyN' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            nextLoveMessage();
        }
        
        if (event.code === 'KeyR' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            initGame();
        }
    });
    
    // Touch support
    document.addEventListener('touchstart', function() {}, { passive: true });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    setupEventListeners();
    
    // Add CSS for additional animations
    const additionalStyles = document.createElement('style');
    additionalStyles.textContent = `
        .heart-cell .heartbeat {
            animation: heartbeat 1.5s infinite;
        }
        
        .heart-cell .float {
            animation: float 3s ease-in-out infinite;
        }
        
        .heart-cell .bounce {
            animation: bounce 2s infinite;
        }
        
        .heart-cell .pulse {
            animation: pulse 2s infinite;
        }
        
        @keyframes ripple {
            0% {
                transform: scale(0.8);
                opacity: 0.7;
            }
            100% {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(additionalStyles);
});

// ====== FOOTER FUNCTIONALITY ======
// Footer Functionality
function initFooter() {
    // Set current year
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Initialize footer stats
    updateFooterStats();
    
    // Setup back to top button
    setupBackToTop();
    
    // Setup social links
    setupSocialLinks();
    
    // Setup footer animations
    setupFooterAnimations();
}

// Update Footer Stats
function updateFooterStats() {
    // Load stats from localStorage
    const stats = JSON.parse(localStorage.getItem('loveGameStats')) || {
        totalGames: 0,
        totalHearts: 0,
        totalTime: 0,
        totalLevels: 0
    };
    
    // Update DOM elements
    document.getElementById('total-games').textContent = stats.totalGames;
    document.getElementById('total-hearts').textContent = stats.totalHearts;
    document.getElementById('total-time').textContent = formatTime(stats.totalTime);
    document.getElementById('total-levels').textContent = stats.totalLevels;
    
    // Update saved messages count
    const savedMessages = JSON.parse(localStorage.getItem('loveMessages') || '[]');
    document.querySelector('.count-number').textContent = savedMessages.length;
}

// Update Game Stats
function updateGameStats(hearts, time, level) {
    const stats = JSON.parse(localStorage.getItem('loveGameStats')) || {
        totalGames: 0,
        totalHearts: 0,
        totalTime: 0,
        totalLevels: 0
    };
    
    stats.totalGames++;
    stats.totalHearts += hearts;
    stats.totalTime += time;
    stats.totalLevels = Math.max(stats.totalLevels, level);
    
    localStorage.setItem('loveGameStats', JSON.stringify(stats));
    updateFooterStats();
}

// Setup Back to Top
function setupBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Show/hide button based on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.style.opacity = '1';
            backToTopBtn.style.visibility = 'visible';
        } else {
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.visibility = 'hidden';
        }
    });
}

// Setup Social Links
function setupSocialLinks() {
    const shareOptions = document.querySelectorAll('.share-option');
    
    shareOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            
            const message = CONFIG.messages[gameState.currentMessageIndex];
            const shareText = `I found this beautiful love message in the Love Message Game! 💕\n\n"${message.substring(0, 80)}..."`;
            
            if (option.querySelector('.fa-twitter')) {
                // Twitter share
                const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`;
                window.open(twitterUrl, '_blank');
            }
            else if (option.querySelector('.fa-facebook')) {
                // Facebook share
                const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`;
                window.open(facebookUrl, '_blank');
            }
            else if (option.querySelector('.fa-envelope')) {
                // Email share
                const subject = 'Beautiful Love Message I Found!';
                const body = `${shareText}\n\nCheck out the game: ${window.location.href}`;
                window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            }
            else if (option.querySelector('.fa-link')) {
                // Copy link
                navigator.clipboard.writeText(`${shareText}\n\nPlay the game: ${window.location.href}`)
                    .then(() => {
                        showNotification('Link copied to clipboard! 💝');
                    })
                    .catch(err => {
                        console.error('Failed to copy: ', err);
                        alert('Please copy the link manually.');
                    });
            }
        });
    });
}

// Setup Footer Animations
function setupFooterAnimations() {
    // Create continuous heart animations
    setInterval(() => {
        createFloatingHeart();
    }, 3000);
}

// Create Floating Heart
function createFloatingHeart() {
    const container = document.querySelector('.floating-hearts');
    if (!container) return;
    
    const heart = document.createElement('div');
    heart.className = 'heart-icon';
    heart.innerHTML = '<i class="fas fa-heart"></i>';
    
    const left = Math.random() * 100;
    const duration = 15 + Math.random() * 10;
    const size = 0.8 + Math.random() * 0.7;
    
    heart.style.left = `${left}%`;
    heart.style.fontSize = `${size}rem`;
    heart.style.animationDuration = `${duration}s`;
    heart.style.color = `rgba(255, 107, 157, ${0.1 + Math.random() * 0.3})`;
    
    container.appendChild(heart);
    
    // Remove after animation
    setTimeout(() => {
        if (heart.parentNode) {
            heart.remove();
        }
    }, duration * 1000);
}

// Show Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'footer-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, var(--primary-pink), var(--dark-pink));
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Add CSS for animation
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// View Saved Messages
function setupViewMessages() {
    const viewBtn = document.querySelector('.view-messages-btn');
    if (viewBtn) {
        viewBtn.addEventListener('click', () => {
            showSavedMessagesModal();
        });
    }
}

// Show Saved Messages Modal
function showSavedMessagesModal() {
    const savedMessages = JSON.parse(localStorage.getItem('loveMessages') || '[]');
    
    if (savedMessages.length === 0) {
        showNotification('No saved messages yet! Complete a game first. 💝');
        return;
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'saved-messages-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="
            background: linear-gradient(135deg, rgba(26, 11, 46, 0.95), rgba(42, 21, 83, 0.95));
            border-radius: 20px;
            padding: 30px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            border: 2px solid rgba(255, 107, 157, 0.3);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        ">
            <div class="modal-header" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid rgba(255, 107, 157, 0.2);
            ">
                <h3 style="
                    color: var(--light-pink);
                    font-size: 1.8rem;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                ">
                    <i class="fas fa-bookmark"></i>
                    Saved Love Messages (${savedMessages.length})
                </h3>
                <button class="close-modal" style="
                    background: none;
                    border: none;
                    color: var(--light-pink);
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 10px;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                ">&times;</button>
            </div>
            
            <div class="messages-list" style="
                display: flex;
                flex-direction: column;
                gap: 20px;
            ">
                ${savedMessages.map((msg, index) => `
                    <div class="saved-message" style="
                        background: rgba(255, 255, 255, 0.05);
                        border-radius: 15px;
                        padding: 20px;
                        border: 1px solid rgba(255, 107, 157, 0.1);
                        transition: all 0.3s ease;
                    ">
                        <div class="message-header" style="
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 15px;
                        ">
                            <span style="
                                color: var(--primary-pink);
                                font-size: 0.9rem;
                                display: flex;
                                align-items: center;
                                gap: 10px;
                            ">
                                <i class="fas fa-calendar"></i>
                                ${msg.date}
                            </span>
                            <span style="
                                color: var(--light-pink);
                                font-size: 0.9rem;
                                display: flex;
                                align-items: center;
                                gap: 10px;
                            ">
                                <i class="fas fa-clock"></i>
                                ${msg.time}
                            </span>
                        </div>
                        <p class="message-text" style="
                            color: var(--light-pink);
                            line-height: 1.6;
                            font-style: italic;
                        ">${msg.message.substring(0, 150)}${msg.message.length > 150 ? '...' : ''}</p>
                        <div class="message-footer" style="
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-top: 15px;
                            padding-top: 15px;
                            border-top: 1px solid rgba(255, 255, 255, 0.1);
                        ">
                            <span style="
                                color: var(--gold);
                                font-size: 0.9rem;
                                display: flex;
                                align-items: center;
                                gap: 5px;
                            ">
                                <i class="fas fa-heart"></i>
                                ${msg.hearts} hearts
                            </span>
                            <span style="
                                color: var(--light-purple);
                                font-size: 0.9rem;
                                display: flex;
                                align-items: center;
                                gap: 5px;
                            ">
                                <i class="fas fa-crown"></i>
                                Level ${msg.level}
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>
            
                            <div class="modal-footer" style="
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    text-align: center;
                ">
                    <p style="color: var(--light-pink); font-size: 0.9rem;">
                        These messages are saved in your browser's local storage.
                    </p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeModal(modal);
        });
    }
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
    
    // Close with Escape key
    const closeModalHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal(modal);
            document.removeEventListener('keydown', closeModalHandler);
        }
    };
    document.addEventListener('keydown', closeModalHandler);
}

// Close Modal Function
function closeModal(modal) {
    if (!modal) return;
    
    modal.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
        if (modal.parentNode) {
            modal.remove();
        }
    }, 300);
}

// Add fadeOut animation to styles
function addModalAnimations() {
    if (!document.getElementById('modal-animations')) {
        const style = document.createElement('style');
        style.id = 'modal-animations';
        style.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            .saved-messages-modal {
                animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize Footer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    setupEventListeners();
    initFooter();
    setupViewMessages();
    addModalAnimations();
    
    // Add CSS for additional animations
    const additionalStyles = document.createElement('style');
    additionalStyles.textContent = `
        .heart-cell .heartbeat {
            animation: heartbeat 1.5s infinite;
        }
        
        .heart-cell .float {
            animation: float 3s ease-in-out infinite;
        }
        
        .heart-cell .bounce {
            animation: bounce 2s infinite;
        }
        
        .heart-cell .pulse {
            animation: pulse 2s infinite;
        }
        
        @keyframes ripple {
            0% {
                transform: scale(0.8);
                opacity: 0.7;
            }
            100% {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        /* Modal styles */
        .saved-message {
            transition: all 0.3s ease;
        }
        
        .saved-message:hover {
            transform: translateY(-5px);
            border-color: rgba(255, 107, 157, 0.3) !important;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }
        
        .close-modal:hover {
            background: rgba(255, 107, 157, 0.1) !important;
            color: var(--primary-pink) !important;
        }
    `;
    document.head.appendChild(additionalStyles);
});

// Update stats when game is completed
function updateFooterOnGameComplete(hearts, time, level) {
    updateGameStats(hearts, time, level);
    updateFooterStats();
    
    // Show achievement notification
    if (level > 1) {
        showAchievementNotification(level);
    }
}

// Show Achievement Notification
function showAchievementNotification(level) {
    const achievements = [
        { level: 3, message: "🎉 Level 3 Master! Keep going! 🏆" },
        { level: 5, message: "🌟 Love Expert! 5 levels completed! ✨" },
        { level: 10, message: "💝 True Romantic! 10 levels of love! ❤️" }
    ];
    
    const achievement = achievements.find(a => a.level === level);
    if (achievement) {
        showNotification(achievement.message);
    }
}

// Complete Game (Final Version)
function completeGame() {
    if (gameState.gameCompleted) return;
    
    gameState.gameCompleted = true;
    gameState.totalTime = calculateElapsedTime();
    
    // Stop timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    
    // Show celebration
    showCelebration();
    
    // Update final stats in reveal container
    elements.finalHearts.textContent = gameState.collectedHearts;
    elements.finalTime.textContent = formatTime(gameState.totalTime);
    elements.finalLevel.textContent = gameState.currentLevel;
    
    // Display the complete message
    const message = CONFIG.messages[gameState.currentMessageIndex];
    elements.specialMessage.textContent = message;
    
    // Highlight the message with animation
    setTimeout(() => {
        elements.specialMessage.style.animation = 'pulse 2s ease-in-out';
    }, 500);
    
    // Show message reveal container with animation
    setTimeout(() => {
        elements.messageRevealContainer.classList.add('revealed');
        
        // Scroll to reveal container
        elements.messageRevealContainer.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        // Create confetti celebration
        createConfetti();
        
        // Update footer stats
        updateFooterOnGameComplete(
            gameState.collectedHearts, 
            gameState.totalTime, 
            gameState.currentLevel
        );
        
        // Auto-save the message
        autoSaveMessage(message);
        
    }, 1000);
    
    // Update current message
    elements.currentMessage.innerHTML = `
        <div class="message-content">
            <p class="celebration-message" style="color: var(--gold); font-weight: bold;">
                <i class="fas fa-trophy"></i> Congratulations! All hearts collected!
            </p>
            <p class="revelation-info">Your special love message has been revealed below! 💝</p>
        </div>
    `;
    
    // Enable next message button
    elements.nextMessageBtn.disabled = false;
}

// Auto Save Message
function autoSaveMessage(message) {
    const messageData = {
        message: message,
        date: new Date().toLocaleDateString(),
        time: elements.timer.textContent,
        hearts: gameState.collectedHearts,
        level: gameState.currentLevel,
        autoSaved: true
    };
    
    // Save to localStorage
    const savedMessages = JSON.parse(localStorage.getItem('loveMessages') || '[]');
    
    // Check if message already exists
    const exists = savedMessages.some(msg => 
        msg.message === message && msg.date === messageData.date
    );
    
    if (!exists) {
        savedMessages.push(messageData);
        localStorage.setItem('loveMessages', JSON.stringify(savedMessages));
        
        // Update saved count in footer
        updateFooterStats();
        
        // Show auto-save notification
        setTimeout(() => {
            showNotification('Message auto-saved to your collection! 💾');
        }, 1500);
    }
}

// Calculate Elapsed Time
function calculateElapsedTime() {
    if (!gameState.startTime) return 0;
    
    const currentTime = new Date();
    return Math.floor((currentTime - gameState.startTime) / 1000);
}

// Format Time
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Reset Game Function
function resetGame() {
    // Clear game state
    gameState = {
        collectedHearts: 0,
        currentLevel: 1,
        gameStarted: false,
        gameCompleted: false,
        startTime: null,
        timerInterval: null,
        currentMessageIndex: Math.floor(Math.random() * CONFIG.messages.length),
        hintsUsed: 0,
        totalTime: 0,
        heartPositions: []
    };
    
    // Update UI
    elements.heartsCount.textContent = '0';
    elements.levelCount.textContent = '1';
    elements.timer.textContent = '00:00';
    elements.progressBar.style.width = '0%';
    elements.progressText.textContent = '0%';
    
    // Hide message reveal container
    elements.messageRevealContainer.classList.remove('revealed');
    
    // Reset message display
    elements.currentMessage.innerHTML = `
        <div class="message-content">
            <p class="welcome-message">Game Reset! Ready to find love messages again? 💕</p>
            <p class="game-instruction">Click "Start Game" to begin your new journey!</p>
            <div class="message-ornament">
                <i class="fas fa-heart"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-heart"></i>
            </div>
        </div>
    `;
    
    // Recreate hearts grid
    createHeartsGrid();
    
    // Enable start button
    elements.startBtn.disabled = false;
    elements.startBtn.innerHTML = '<span class="btn-icon"><i class="fas fa-play-circle"></i></span><span class="btn-text">Start Game</span>';
    
    // Clear timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    
    // Reset next message button
    elements.nextMessageBtn.disabled = false;
}

// Export game functions for global access
window.LoveMessageGame = {
    init: initGame,
    start: startGame,
    reset: resetGame,
    showHint: showHint,
    nextMessage: nextLoveMessage,
    shareMessage: shareMessage,
    saveMessage: saveMessage,
    showSavedMessages: showSavedMessagesModal,
    getStats: () => JSON.parse(localStorage.getItem('loveGameStats') || '{}'),
    clearStats: () => {
        localStorage.removeItem('loveGameStats');
        localStorage.removeItem('loveMessages');
        updateFooterStats();
        showNotification('All stats and messages cleared! 🔄');
    }
};

// Keyboard shortcuts help
function showKeyboardHelp() {
    const helpMessage = `
        🎮 Keyboard Shortcuts:
        • Space: Start Game / Show Hint
        • Ctrl/Cmd + N: Next Love Message
        • Ctrl/Cmd + R: Reset Game
        • Ctrl/Cmd + S: Save Message
        • Esc: Close Modals
    `;
    
    console.log(helpMessage);
}

// Show keyboard help on first visit
if (!localStorage.getItem('loveGameFirstVisit')) {
    setTimeout(() => {
        showNotification('💡 Tip: Use Spacebar to start game and show hints!');
        localStorage.setItem('loveGameFirstVisit', 'true');
    }, 3000);
}

// Initialize the game
window.addEventListener('load', () => {
    console.log('💝 Love Message Game Loaded Successfully!');
    console.log('🎮 Use window.LoveMessageGame to access game functions');
    showKeyboardHelp();
});
