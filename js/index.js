const BASE_API_URL = 'https://genzz-backend.onrender.com';
const TELEGRAM_CHANNEL = 'https://t.me/genzcoders1';

const faqs = [
    { q: '/help', a: 'Available commands: /help, /links, /onboard, /stats, /books, /support, /contribute, /feedback, /updates, /community, /bug, /request' },
    { q: '/links', a: 'Join us at: Telegram Group - https://t.me/genzzthinks, Channel - https://t.me/genzcoders1, GitHub - https://github.com/GENZ-ARSH' },
    { q: '/onboard', a: 'Start with /start to share your name and class!' },
    { q: '/stats', a: '10K+ students, 500+ books, 100+ JEE/NEET resources!' }
];

// Sanitize Input
function sanitizeInput(input) {
    return DOMPurify.sanitize(input);
}

// Play Click Sound
function playClickSound() {
    const sound = document.getElementById('click-sound');
    const isMuted = document.cookie.includes('muted=true');
    if (!isMuted && sound) {
        sound.currentTime = 0;
        sound.play().catch((error) => {
            console.warn('Audio playback failed:', error);
        });
    }
}

// Get/Set Cookie
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Strict`;
}
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop().split(';').shift() : null;
}

// Throttle Utility
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Device Detection
function isLowEndDevice() {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isLowRes = window.innerWidth < 768 || window.devicePixelRatio < 1.5;
    return isTouch || isLowRes || navigator.userAgent.includes('Mobi');
}

// Get CSRF Token
async function getCsrfToken() {
    let retries = 3;
    while (retries) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(`${BASE_API_URL}/api/csrf-token`, {
                method: 'GET',
                credentials: 'include',
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            const data = await response.json();
            return data.csrfToken;
        } catch (error) {
            retries -= 1;
            if (!retries) return null;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    return null;
}

// Check Session
async function checkSession() {
    try {
        const response = await fetch(`${BASE_API_URL}/api/session`, {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();
        if (data.authenticated) {
            window.location.href = './home.html';
        }
    } catch (error) {
        Swal.fire({
            title: 'Session Error',
            text: 'Could not verify session. Continue to explore!',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        console.error('Session check failed:', error);
    }
}

// Show/Hide Loading Overlay
function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = 'flex';
}
function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.transition = 'opacity 0.5s ease';
    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.style.display = 'none';
        overlay.style.opacity = '1';
    }, 500);
}

// Fetch Social Links
async function fetchSocialLinks() {
    try {
        const response = await fetch(`${BASE_API_URL}/api/social-links`, {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();
        const badgesContainer = document.getElementById('social-badges');
        badgesContainer.innerHTML = '';
        data.links.forEach(link => {
            const badge = document.createElement('a');
            badge.href = link.url;
            badge.className = 'badge';
            badge.target = '_blank';
            badge.rel = 'noopener noreferrer';
            badge.setAttribute('aria-label', link.label);
            badge.setAttribute('data-tippy-content', link.tooltip);
            badge.innerHTML = `
                <img src="${link.icon}" alt="${link.name}" loading="lazy">
                ${link.name}
            `;
            badgesContainer.appendChild(badge);
        });
        tippy('.badge', {
            content: (reference) => reference.getAttribute('data-tippy-content'),
            theme: 'light'
        });
    } catch (error) {
        console.error('Failed to fetch social links:', error);
        const badgesContainer = document.getElementById('social-badges');
        badgesContainer.innerHTML = `
            <a href="https://t.me/genzzthinks" class="badge" target="_blank" rel="noopener noreferrer" aria-label="Join Telegram Group" data-tippy-content="Join our Telegram Group">
                <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" alt="Telegram Group" loading="lazy"> Group
            </a>
            <a href="https://t.me/genzcoders1" class="badge" target="_blank" rel="noopener noreferrer" aria-label="Join Telegram Channel" data-tippy-content="Join our Telegram Channel">
                <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" alt="Telegram Channel" loading="lazy"> Channel
            </a>
            <a href="https://github.com/GENZ-ARSH" class="badge" target="_blank" rel="noopener noreferrer" aria-label="Visit GitHub" data-tippy-content="Check our GitHub">
                <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" loading="lazy"> GitHub
            </a>
            <a href="https://www.instagram.com/genzzcoders" class="badge" target="_blank" rel="noopener noreferrer" aria-label="Follow on Instagram" data-tippy-content="Follow us on Instagram">
                <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram" loading="lazy"> Instagram
            </a>
            <a href="mailto:arshtyagi007@gmail.com" class="badge" aria-label="Contact Us" data-tippy-content="Contact us via Email">
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Mail_%28iOS%29.svg" alt="Email" loading="lazy"> Email
            </a>
        `;
        tippy('.badge', {
            content: (reference) => reference.getAttribute('data-tippy-content'),
            theme: 'light'
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize background
    const video = document.getElementById('background-video');
    const particles = document.getElementById('particles-js');
    if (isLowEndDevice()) {
        video.remove();
        particles.style.display = 'none';
        document.body.style.background = 'linear-gradient(135deg, #1e3a8a, #3b82f6)';
    } else {
        video.style.display = 'block';
        video.play().catch(() => console.warn('Video playback failed'));
        tsParticles.load('particles-js', {
            particles: {
                number: { value: 30 },
                color: { value: '#60a5fa' },
                shape: { type: 'circle' },
                opacity: { value: 0.3, random: true },
                size: { value: 2, random: true },
                move: { enable: true, speed: 0.8, direction: 'none', random: true }
            }
        });
        const parallax = throttle((e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 5;
            const y = (e.clientY / window.innerHeight - 0.5) * 5;
            video.style.transform = `translate(${x}px, ${y}px) scale(1.02)`;
        }, 100);
        document.addEventListener('mousemove', parallax);
    }

    // Check session
    checkSession();

    // Dark mode persistence
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (getCookie('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }
    darkModeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode');
        setCookie('darkMode', darkModeToggle.checked, 30);
        playClickSound();
    });

    // Mute toggle persistence
    const muteToggle = document.getElementById('muteToggle');
    if (getCookie('muted') === 'true') {
        muteToggle.checked = true;
    }
    muteToggle.addEventListener('change', () => {
        setCookie('muted', muteToggle.checked, 30);
        playClickSound();
    });

    // Animate welcome text
    const welcomeText = document.querySelector('.welcome-text');
    const text = welcomeText.textContent;
    welcomeText.textContent = '';
    text.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char;
        welcomeText.appendChild(span);
        gsap.fromTo(span, 
            { opacity: 0, y: 20 }, 
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.4, 
                delay: index * 0.03, 
                ease: 'power2.out' 
            }
        );
    });

    // Rotating taglines
    const taglines = [
        'Free Study Materials for JEE, NEET & More!',
        'Join 10K+ Learners Today!',
        'Ace Your Exams with GenZZ!'
    ];
    let taglineIndex = 0;
    const taglineElement = document.getElementById('tagline');
    setInterval(() => {
        taglineIndex = (taglineIndex + 1) % taglines.length;
        taglineElement.textContent = taglines[taglineIndex];
    }, 4000);

    // Animate stats
    document.querySelectorAll('.stat-number').forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        gsap.to(stat, {
            innerText: target,
            duration: 2,
            snap: { innerText: 1 },
            ease: 'power1.out',
            onUpdate: () => stat.innerText = Math.ceil(stat.innerText)
        });
    });

    // Start button (onboarding)
    const startBtn = document.getElementById('start-btn');
    startBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        playClickSound();
        const result = await Swal.fire({
            title: 'Welcome, Learner! 🚀',
            html: `
                <input type="text" id="name" class="swal2-input" placeholder="Your Name">
                <select id="class" class="swal2-select">
                    <option value="">Select Class</option>
                    <option value="10th">10th</option>
                    <option value="11th">11th</option>
                    <option value="12th">12th</option>
                </select>
            `,
            confirmButtonText: 'Start Learning',
            showCancelButton: true,
            preConfirm: () => {
                const name = sanitizeInput(document.getElementById('name').value);
                const classLevel = document.getElementById('class').value;
                if (!name || !classLevel) {
                    Swal.showValidationMessage('Name and class required!');
                    return false;
                }
                return { name, class: classLevel };
            }
        });

        if (result.isConfirmed) {
            showLoading();
            try {
                const csrfToken = await getCsrfToken();
                if (!csrfToken) throw new Error('CSRF token fetch failed');
                const response = await fetch(`${BASE_API_URL}/api/onboarding`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': csrfToken
                    },
                    body: JSON.stringify({ ...result.value, _csrf: csrfToken }),
                    credentials: 'include'
                });
                if (response.ok) {
                    window.location.href = './home.html';
                } else {
                    throw new Error('Onboarding failed');
                }
            } catch (error) {
                Swal.fire('Error', 'Onboarding issue! Try again or explore now.', 'error');
                hideLoading();
            }
        }
    });

    // Explore button
    const exploreBtn = document.getElementById('explore-btn');
    exploreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        playClickSound();
        showLoading();
        setTimeout(() => {
            window.location.href = './home.html';
        }, 500);
    });

    // Newsletter signup
    const newsletterSubmit = document.getElementById('newsletter-submit');
    newsletterSubmit.addEventListener('click', async (e) => {
        e.preventDefault();
        playClickSound();
        const email = sanitizeInput(document.getElementById('newsletter-email').value);
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            Swal.fire('Error', 'Please enter a valid email!', 'error');
            return;
        }
        try {
            const csrfToken = await getCsrfToken();
            if (!csrfToken) throw new Error('CSRF token fetch failed');
            const response = await fetch(`${BASE_API_URL}/api/newsletter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify({ email, _csrf: csrfToken }),
                credentials: 'include'
            });
            if (response.ok) {
                Swal.fire('Success', 'Subscribed to newsletter!', 'success');
                document.getElementById('newsletter-email').value = '';
            } else {
                throw new Error('Subscription failed');
            }
        } catch (error) {
            Swal.fire('Error', 'Subscription failed! Try again.', 'error');
        }
    });

    // Chatbot logic
    const chatbotButton = document.getElementById('chatbot-button');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotInput = document.getElementById('chatbot-input-text');
    const chatbotSend = document.getElementById('chatbot-input-button');
    const chatbotToggle = document.getElementById('chatbot-toggle');

    chatbotButton.addEventListener('click', (e) => {
        e.preventDefault();
        playClickSound();
        chatbotWindow.style.display = 'flex';
        chatbotWindow.classList.toggle('open');
        if (chatbotWindow.classList.contains('open')) {
            chatbotInput.focus();
            const welcomeMessage = document.createElement('div');
            welcomeMessage.className = 'chatbot-message bot';
            welcomeMessage.textContent = 'Hey bhai! Ask anything or try /help 😎';
            chatbotMessages.appendChild(welcomeMessage);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }
    });

    chatbotToggle.addEventListener('click', (e) => {
        e.preventDefault();
        playClickSound();
        chatbotWindow.style.height = chatbotWindow.style.height === '60px' ? '460px' : '60px';
        chatbotWindow.querySelector('#chatbot-messages').style.display = 
            chatbotWindow.style.height === '60px' ? 'none' : 'block';
        chatbotWindow.querySelector('#chatbot-input').style.display = 
            chatbotWindow.style.height === '60px' ? 'none' : 'flex';
    });

    chatbotSend.addEventListener('click', async (e) => {
        e.preventDefault();
        playClickSound();
        const message = sanitizeInput(chatbotInput.value.trim());
        if (!message) return;

        const userMessage = document.createElement('div');
        userMessage.className = 'chatbot-message user';
        userMessage.textContent = message;
        chatbotMessages.appendChild(userMessage);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        chatbotInput.value = '';

        // Check for client-side commands
        const faq = faqs.find(f => f.q.toLowerCase() === message.toLowerCase());
        if (faq) {
            const botMessage = document.createElement('div');
            botMessage.className = 'chatbot-message bot';
            botMessage.textContent = faq.a;
            chatbotMessages.appendChild(botMessage);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
            return;
        }

        // Fetch bot response
        try {
            const csrfToken = await getCsrfToken();
            if (!csrfToken) throw new Error('CSRF token fetch failed');
            const response = await fetch(`${BASE_API_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify({ message, _csrf: csrfToken }),
                credentials: 'include'
            });
            const data = await response.json();
            const botMessage = document.createElement('div');
            botMessage.className = 'chatbot-message bot';
            botMessage.textContent = sanitizeInput(data.response || 'Bhai, yeh query ka jawab abhi ready nahi! Telegram pe bol: ' + TELEGRAM_CHANNEL);

            // Handle admin redirect
            if (data.redirect) {
                setCookie('token', data.token, 1);
                setCookie('isAdmin', 'true', 1);
                botMessage.textContent = data.response;
                chatbotMessages.appendChild(botMessage);
                chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
                Swal.fire({
                    title: 'Success',
                    text: 'Redirecting to admin panel...',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = data.redirect;
                });
                return;
            }

            chatbotMessages.appendChild(botMessage);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        } catch (error) {
            console.error('Chatbot error:', error);
            const botMessage = document.createElement('div');
            botMessage.className = 'chatbot-message bot';
            botMessage.textContent = 'Server error, bhai! Try /help or Telegram: ' + TELEGRAM_CHANNEL;
            chatbotMessages.appendChild(botMessage);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }
    });

    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            chatbotSend.click();
        }
    });

    // Tooltips
    tippy('#start-btn, #explore-btn', {
        content: (reference) => reference.getAttribute('data-tippy-content'),
        theme: 'light'
    });

    // Focus management
    document.querySelectorAll('button, a, input').forEach(element => {
        element.addEventListener('focus', (e) => {
            e.target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        });
    });

    // Fetch social links
    fetchSocialLinks();

    // Analytics tracking
    function trackEvent(event, category, label) {
        if (window.gtag) {
            gtag('event', event, { event_category: category, event_label: label });
        }
    }
    startBtn.addEventListener('click', () => trackEvent('click', 'Button', 'Start Learning'));
    exploreBtn.addEventListener('click', () => trackEvent('click', 'Button', 'Explore Now'));
    newsletterSubmit.addEventListener('click', () => trackEvent('click', 'Form', 'Newsletter Subscribe'));
});
