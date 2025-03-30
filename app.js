function loadContent(tutorialType) {
    // Create a new XMLHttpRequest object
    var xhr = new XMLHttpRequest();

    // Define what happens on successful data submission
    xhr.onload = function () {
        if (xhr.status == 200) {
            // Update the content div with the response
            document.getElementById('content').innerHTML = xhr.responseText;
        } else {
            document.getElementById('content').innerHTML = "Error loading content!";
        }
    };

    // Define what happens in case of an error
    xhr.onerror = function () {
        document.getElementById('content').innerHTML = "Request failed!";
    };

    // Configure the request (GET request to the server-side file)
    xhr.open('GET', tutorialType + '.html', true);

    // Send the request
    xhr.send();
}


// Voice Navigation Module
const VoiceNavigation = {
    recognition: null,
    isActive: false,
    scrollAmount: 300, // Default scroll amount in pixels

    initialize() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
            return;
        }

        // Initialize speech recognition
        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        // Setup event handlers
        this.recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
            console.log('Voice command received:', transcript);
            this.handleCommand(transcript);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.showFeedback(`Error: ${event.error}`);
        };

        this.recognition.onend = () => {
            if (this.isActive) {
                this.recognition.start();
            } else {
                this.updateMicButtonState(false);
            }
        };

        // Setup microphone button
        const micButton = document.getElementById('micButton');
        micButton.innerHTML = '<i class="fas fa-microphone"></i>';
        micButton.addEventListener('click', () => this.toggleListening());

        // Add styles
        this.addStyles();
    },

    handleCommand(transcript) {
        // Handle scroll commands
        if (this.handleScrollCommands(transcript)) {
            return;
        }

        // Handle games menu commands
        if (transcript.includes('show games') || transcript.includes('games list')) {
            this.toggleGamesMenu(true);
            return;
        }
        if (transcript.includes('hide games') || transcript.includes('close games menu')) {
            this.toggleGamesMenu(false);
            return;
        }

        // Handle navigation commands
        const commands = {
            'home': 'home',
            'action': 'action',
            'adventure': 'adventureGames',
            'fighting': 'fighting',
            'rpg': 'rpg',
            'racing': 'racing',
            'shooting': 'shooting',
            'news': 'news',
            'reviews': 'reviews',
            'community': 'community',
            'about': 'about',
            'contact': 'contact'
        };

        for (const [command, page] of Object.entries(commands)) {
            if (transcript.includes(command)) {
                loadContent(page);
                this.showFeedback(`Navigating to ${command}`);
                return;
            }
        }

        // Handle stop command
        if (transcript.includes('stop listening') || transcript.includes('turn off')) {
            this.stopListening();
            return;
        }

        this.showFeedback('Command not recognized. Please try again.');
    },

    handleScrollCommands(transcript) {
        // Parse scroll amount if specified
        let amount = this.scrollAmount;
        const numberMatch = transcript.match(/\d+/);
        if (numberMatch) {
            amount = parseInt(numberMatch[0]) * 100; // Convert to pixels (e.g., "scroll up 3" = 300px)
        }

        // Handle scroll up commands
        if (transcript.includes('scroll up') || transcript.includes('go up')) {
            this.smoothScroll(-amount);
            this.showFeedback(`Scrolling up ${amount}px`);
            return true;
        }

        // Handle scroll down commands
        if (transcript.includes('scroll down') || transcript.includes('go down')) {
            this.smoothScroll(amount);
            this.showFeedback(`Scrolling down ${amount}px`);
            return true;
        }

        // Handle scroll to top
        if (transcript.includes('scroll to top') || transcript.includes('go to top')) {
            this.smoothScroll(-window.pageYOffset);
            this.showFeedback('Scrolling to top');
            return true;
        }

        // Handle scroll to bottom
        if (transcript.includes('scroll to bottom') || transcript.includes('go to bottom')) {
            const maxScroll = Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight,
                document.body.offsetHeight,
                document.documentElement.offsetHeight,
                document.body.clientHeight,
                document.documentElement.clientHeight
            ) - window.innerHeight;
            this.smoothScroll(maxScroll - window.pageYOffset);
            this.showFeedback('Scrolling to bottom');
            return true;
        }

        return false;
    },

    smoothScroll(amount) {
        window.scrollBy({
            top: amount,
            behavior: 'smooth'
        });
    },

    toggleGamesMenu(show = null) {
        const gamesMenu = document.querySelector('li:has(a[href="#"])');
        if (!gamesMenu) return;

        const subMenu = gamesMenu.querySelector('ul') || gamesMenu.querySelector('div');
        if (!subMenu) return;

        if (show === null) {
            show = subMenu.style.display === 'none' || !subMenu.style.display;
        }

        subMenu.style.display = show ? 'block' : 'none';
        this.showFeedback(show ? 'Games menu opened' : 'Games menu closed');
    },

    toggleListening() {
        if (this.isActive) {
            this.stopListening();
        } else {
            this.startListening();
        }
    },

    startListening() {
        try {
            this.recognition.start();
            this.isActive = true;
            this.updateMicButtonState(true);
            this.showFeedback('Voice navigation active - Listening for commands...');
        } catch (error) {
            console.error('Error starting recognition:', error);
        }
    },

    stopListening() {
        try {
            this.recognition.stop();
            this.isActive = false;
            this.updateMicButtonState(false);
            this.showFeedback('Voice navigation stopped');
        } catch (error) {
            console.error('Error stopping recognition:', error);
        }
    },

    updateMicButtonState(isListening) {
        const micButton = document.getElementById('micButton');
        if (isListening) {
            micButton.classList.add('listening');
        } else {
            micButton.classList.remove('listening');
        }
    },

    showFeedback(message) {
        let feedback = document.getElementById('voiceFeedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.id = 'voiceFeedback';
            document.body.appendChild(feedback);
        }
        
        feedback.textContent = message;
        feedback.classList.add('show');
        setTimeout(() => feedback.classList.remove('show'), 3000);
    },

    addStyles() {
        const styles = `
            .voice-nav-button {
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background-color: black;
                color: white;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }

            .voice-nav-button:hover {
                background-color: green;
            }

            .voice-nav-button.listening {
                background-color: red;
                
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }

            #voiceFeedback {
                position: fixed;
                bottom: 80px;
                right: 20px;
                background-color: white;
                color: black;
                padding: 10px 20px;
                border-radius: 5px;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 1000;
            }

            #voiceFeedback.show {
                opacity: 1;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
};

// Initialize voice navigation when the page loads
document.addEventListener('DOMContentLoaded', () => {
    VoiceNavigation.initialize();
});