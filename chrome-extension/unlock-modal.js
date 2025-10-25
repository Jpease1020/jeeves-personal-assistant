// Emergency Unlock Modal for Enhanced Porn Blocking Extension
// Handles the friction-based unlock process with reason requirement and timer

class EmergencyUnlockModal {
    constructor() {
        this.isOpen = false;
        this.countdownTimer = null;
        this.countdownSeconds = 60;
        this.originalCountdown = 60;
    }

    // Show the emergency unlock modal
    show(domain, originalUrl) {
        if (this.isOpen) return;
        
        this.isOpen = true;
        this.domain = domain;
        this.originalUrl = originalUrl;
        this.countdownSeconds = this.originalCountdown;
        
        this.createModal();
        this.startCountdown();
    }

    // Create the modal HTML
    createModal() {
        const modal = document.createElement('div');
        modal.id = 'emergency-unlock-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>🚨 Emergency Unlock</h2>
                        <button class="close-btn" onclick="emergencyUnlock.close()">×</button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="warning-section">
                            <div class="warning-icon">⚠️</div>
                            <p class="warning-text">
                                You are about to temporarily unlock access to <strong>${this.domain}</strong>
                            </p>
                            <p class="warning-subtext">
                                This action will be logged and you'll have access for only 5 minutes.
                            </p>
                        </div>
                        
                        <div class="reason-section">
                            <label for="unlock-reason">Why do you need to access this site?</label>
                            <textarea 
                                id="unlock-reason" 
                                placeholder="Please provide a detailed reason (minimum 20 characters)..."
                                rows="3"
                                maxlength="500"
                            ></textarea>
                            <div class="char-count">
                                <span id="char-count">0</span>/500 characters
                            </div>
                        </div>
                        
                        <div class="countdown-section">
                            <div class="countdown-display">
                                <span id="countdown-timer">${this.countdownSeconds}</span> seconds
                            </div>
                            <p class="countdown-text">Please wait before proceeding...</p>
                        </div>
                        
                        <div class="motivation-section">
                            <div class="motivation-quote">
                                "The best time to plant a tree was 20 years ago. The second best time is now."
                            </div>
                            <div class="breathing-exercise">
                                <p>Take 3 deep breaths before deciding:</p>
                                <div class="breath-indicators">
                                    <div class="breath-dot"></div>
                                    <div class="breath-dot"></div>
                                    <div class="breath-dot"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button id="proceed-btn" class="proceed-btn" disabled>
                            Continue to Site
                        </button>
                        <button class="cancel-btn" onclick="emergencyUnlock.close()">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #emergency-unlock-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 1000000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .modal-content {
                background: white;
                border-radius: 12px;
                max-width: 500px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .modal-header h2 {
                margin: 0;
                color: #dc2626;
                font-size: 20px;
                font-weight: 600;
            }
            
            .close-btn {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #6b7280;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-body {
                padding: 24px;
            }
            
            .warning-section {
                text-align: center;
                margin-bottom: 24px;
                padding: 16px;
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 8px;
            }
            
            .warning-icon {
                font-size: 32px;
                margin-bottom: 8px;
            }
            
            .warning-text {
                margin: 0 0 8px 0;
                color: #dc2626;
                font-weight: 500;
            }
            
            .warning-subtext {
                margin: 0;
                color: #7f1d1d;
                font-size: 14px;
            }
            
            .reason-section {
                margin-bottom: 24px;
            }
            
            .reason-section label {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
                color: #374151;
            }
            
            #unlock-reason {
                width: 100%;
                padding: 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-family: inherit;
                font-size: 14px;
                resize: vertical;
                min-height: 80px;
            }
            
            #unlock-reason:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .char-count {
                text-align: right;
                font-size: 12px;
                color: #6b7280;
                margin-top: 4px;
            }
            
            .countdown-section {
                text-align: center;
                margin-bottom: 24px;
                padding: 16px;
                background: #f3f4f6;
                border-radius: 8px;
            }
            
            .countdown-display {
                font-size: 32px;
                font-weight: bold;
                color: #dc2626;
                margin-bottom: 8px;
            }
            
            .countdown-text {
                margin: 0;
                color: #6b7280;
                font-size: 14px;
            }
            
            .motivation-section {
                text-align: center;
                margin-bottom: 24px;
            }
            
            .motivation-quote {
                font-style: italic;
                color: #6b7280;
                margin-bottom: 16px;
                padding: 12px;
                background: #f9fafb;
                border-radius: 6px;
            }
            
            .breathing-exercise p {
                margin: 0 0 8px 0;
                color: #374151;
                font-size: 14px;
            }
            
            .breath-indicators {
                display: flex;
                justify-content: center;
                gap: 8px;
            }
            
            .breath-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #d1d5db;
                animation: breathe 3s infinite;
            }
            
            .breath-dot:nth-child(2) {
                animation-delay: 1s;
            }
            
            .breath-dot:nth-child(3) {
                animation-delay: 2s;
            }
            
            @keyframes breathe {
                0%, 100% { background: #d1d5db; transform: scale(1); }
                50% { background: #3b82f6; transform: scale(1.2); }
            }
            
            .modal-footer {
                display: flex;
                gap: 12px;
                padding: 20px 24px;
                border-top: 1px solid #e5e7eb;
            }
            
            .proceed-btn, .cancel-btn {
                flex: 1;
                padding: 12px 16px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .proceed-btn {
                background: #dc2626;
                color: white;
            }
            
            .proceed-btn:hover:not(:disabled) {
                background: #b91c1c;
            }
            
            .proceed-btn:disabled {
                background: #d1d5db;
                color: #9ca3af;
                cursor: not-allowed;
            }
            
            .cancel-btn {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
            }
            
            .cancel-btn:hover {
                background: #e5e7eb;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Set up event listeners
        this.setupEventListeners();
    }

    // Set up event listeners
    setupEventListeners() {
        const reasonTextarea = document.getElementById('unlock-reason');
        const charCount = document.getElementById('char-count');
        const proceedBtn = document.getElementById('proceed-btn');
        
        // Character count
        reasonTextarea.addEventListener('input', () => {
            const count = reasonTextarea.value.length;
            charCount.textContent = count;
            
            // Enable proceed button when countdown is done and reason is sufficient
            if (this.countdownSeconds === 0 && count >= 20) {
                proceedBtn.disabled = false;
            } else {
                proceedBtn.disabled = true;
            }
        });
        
        // Proceed button click
        proceedBtn.addEventListener('click', () => {
            this.proceedWithUnlock();
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    // Start the countdown timer
    startCountdown() {
        const countdownElement = document.getElementById('countdown-timer');
        const proceedBtn = document.getElementById('proceed-btn');
        const reasonTextarea = document.getElementById('unlock-reason');
        
        this.countdownTimer = setInterval(() => {
            this.countdownSeconds--;
            countdownElement.textContent = this.countdownSeconds;
            
            if (this.countdownSeconds <= 0) {
                clearInterval(this.countdownTimer);
                countdownElement.textContent = '0';
                
                // Enable proceed button if reason is sufficient
                if (reasonTextarea.value.length >= 20) {
                    proceedBtn.disabled = false;
                }
                
                // Update UI
                const countdownSection = document.querySelector('.countdown-section');
                countdownSection.style.background = '#dcfce7';
                countdownSection.style.border = '1px solid #bbf7d0';
                
                const countdownText = document.querySelector('.countdown-text');
                countdownText.textContent = 'You may now proceed if you have provided a reason.';
                countdownText.style.color = '#166534';
            }
        }, 1000);
    }

    // Proceed with the unlock
    async proceedWithUnlock() {
        const reason = document.getElementById('unlock-reason').value.trim();
        
        if (reason.length < 20) {
            alert('Please provide a more detailed reason (at least 20 characters).');
            return;
        }
        
        try {
            // Send unlock request to background script
            const response = await chrome.runtime.sendMessage({
                action: 'temporaryUnlock',
                domain: this.domain,
                reason: reason
            });
            
            if (response.success) {
                // Redirect to original URL
                window.location.href = this.originalUrl;
            } else {
                alert('Failed to unlock site. Please try again.');
            }
        } catch (error) {
            console.error('Error unlocking site:', error);
            alert('An error occurred. Please try again.');
        }
        
        this.close();
    }

    // Close the modal
    close() {
        if (!this.isOpen) return;
        
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
        }
        
        const modal = document.getElementById('emergency-unlock-modal');
        if (modal) {
            modal.remove();
        }
        
        this.isOpen = false;
    }
}

// Create global instance
const emergencyUnlock = new EmergencyUnlockModal();

// Export for use in blocked.html
window.emergencyUnlock = emergencyUnlock;
