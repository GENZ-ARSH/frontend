const BASE_API_URL = 'https://genzz-backend.onrender.com';
const TELEGRAM_CHANNEL = 'https://t.me/genzcoders1';
const clickSound = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
clickSound.volume = 0.3;

// Hardcoded books array
const books = [
    {
        id: "1",
        title: "Concept of Physics - Part 1 & 2 By H.C. Verma (Set of 2 books)2025-26",
        class: "all",
        exam: "all",
        image_url: "https://via.placeholder.com/150x200",
        link: "https://drive.google.com/drive/folders/19Qqr5Q-QIpOgiJlAzvfL3dpJ7gy2SWZc",
        author: "H.C. Verma",
        category: "Physics"
    },
    {
        id: "2",
        title: "R.D. Sharma Mathematics For Class 12 with MCQs in Mathematics CBSE Exam",
        class: "12th",
        exam: "all",
        image_url: "https://via.placeholder.com/150x200",
        link: "https://drive.google.com/drive/folders/1mPglRtoR0lT8g6gVKB1iKXzOso2rZEXA",
        author: "R.D. Sharma",
        category: "Mathematics"
    },
    {
        id: "3",
        title: "Lakshya For JEE Main & Advanced Class 12 Mathematics Modules with Solutions",
        class: "12th",
        exam: "JEE",
        image_url: "https://via.placeholder.com/150x200",
        link: "https://drive.google.com/drive/folders/1g0HbYev2fHuHed56xFWuxn6nri-jQcH-",
        author: "Lakshya",
        category: "Mathematics"
    },
    {
        id: "4",
        title: "Lakshya For JEE Main & Advanced Class 12 Physics Modules with Solutions",
        class: "12th",
        exam: "JEE",
        image_url: "https://via.placeholder.com/150x200",
        link: "https://drive.google.com/drive/folders/1tHywg5e8KU-gqaRqtfWC5041kso1PPE5",
        author: "Lakshya",
        category: "Physics"
    },
    {
        id: "5",
        title: "Arjuna for NEET Class 11th Zoology Modules with Solutions",
        class: "11th",
        exam: "NEET",
        image_url: "https://via.placeholder.com/150x200",
        link: "https://drive.google.com/drive/folders/1fXe8T1Tvhef9EHzGu75qc4Ezjw4REKef",
        author: "Arjuna",
        category: "Zoology"
    },
    {
        id: "6",
        title: "Arjuna for NEET Class 11th Botany Modules with Solutions",
        class: "11th",
        exam: "NEET",
        image_url: "https://via.placeholder.com/150x200",
        link: "https://drive.google.com/drive/folders/1N18tjDboqiWy__W3yha1wPCw1VgtTTyO",
        author: "Arjuna",
        category: "Botany"
    },
    {
        id: "7",
        title: "Arjuna for NEET Class 11th Chemistry Modules with Solutions",
        class: "11th",
        exam: "NEET",
        image_url: "https://via.placeholder.com/150x200",
        link: "https://drive.google.com/drive/folders/1oAsZuEO5khBNvs-gAaPTyh1IPWbyLxxx",
        author: "Arjuna",
        category: "Chemistry"
    }
];

// Cache for books
const bookCache = new Map();

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Throttle function
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

// Fetch CSRF Token
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
            console.error('Error fetching CSRF token:', error);
            if (!retries) return null;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    return null;
}

// Expanded FAQ database
const faqs = {
    'how to download': {
        question: 'Bhai, book kaise download karu?',
        answer: 'Book card pe "Download PDF" button dabao. Google Drive khulega, waha se download kar le. Issue ho toh Telegram pe chill: https://t.me/genzcoders1'
    },
    'key not working': {
        question: 'Meri key kaam nahi kar rahi, kya karu?',
        answer: 'Key expire ho sakti hai. Admin se contact karo ya Telegram pe bol: https://t.me/genzcoders1'
    },
    'what is genzz library': {
        question: 'GenZZ Library kya hai, bro?',
        answer: 'GenZZ Library ek free platform hai 10th-12th, Board, JEE, NEET ke study materials ke liye. Secure access ke liye admin se baat karo aur updates ke liye Telegram join karo: https://t.me/genzcoders1'
    },
    'is it free': {
        question: 'Yeh free hai na?',
        answer: 'Bilku free, bhai! Bas admin access ke liye verify karo. No charges, pakka! Support ke liye Telegram join kar: https://t.me/genzcoders1'
    },
    'how to contact support': {
        question: 'Support se kaise contact karu?',
        answer: 'Telegram channel join karo: https://t.me/genzcoders1 ya email karo: support@genzzlibrary.com. Telegram pe jaldi reply milta hai, try kar!'
    },
    'books not loading': {
        question: 'Books load kyun nahi ho rahi?',
        answer: 'Internet check karo ya page refresh karo. Admin se access verify karo. Issue rahe toh Telegram pe bataye: https://t.me/genzcoders1'
    },
    'how to access admin': {
        question: 'Admin panel kaise access karu?',
        answer: 'Sirf authorized admins ke liye. Chatbot mein /admin type karo aur password daalo. Queries ke liye Telegram pe contact: https://t.me/genzcoders1'
    },
    'how to join telegram': {
        question: 'Telegram community kaise join karu?',
        answer: 'Group mein join karo: https://t.me/genzzthinks ya channel pe aao: https://t.me/genzcoders1. Updates aur support ke liye perfect hai!'
    },
    'how to filter books': {
        question: 'Books filter kaise karu?',
        answer: 'Filter buttons use kar—class (10th, 11th, 12th), exam (Board, JEE, NEET), ya category (Physics, Chemistry, etc.) select kar. Search bar mein bhi title daal sakta hai!'
    },
    'how to load more books': {
        question: 'Aur books kaise load karu?',
        answer: 'Page ke neeche "Load More" button dabao. Agar button nahi dikha toh saari books load ho chuki hain. Issue ho toh Telegram pe ping kar: https://t.me/genzcoders1'
    },
    'how to search books': {
        question: 'Books kaise search karu?',
        answer: 'Search bar mein book ka title, class, ya exam type kar. Ya mujhse directly puchh: /search <book name>. Filters bhi use kar sakta hai!'
    },
    'how to suggest books': {
        question: 'Books suggest kaise karu?',
        answer: 'Telegram group mein suggestion daal do: https://t.me/genzzthinks ya owner ko directly bol: @just_arsh1. Hum jaldi review karenge!'
    },
    'safe to use': {
        question: 'GenZZ Library safe hai kya?',
        answer: '100% safe, bro! Secure access aur CSRF protection hai. Privacy ka full dhyaan rakhte hain. Doubt ho toh Telegram pe clarify kar: https://t.me/genzcoders1'
    },
    'lost access': {
        question: 'Library ka access khoya, ab kya?',
        answer: 'Admin se dobara access verify karo. Cookies clear karo ya browser change karo. Issue ho toh Telegram pe bol: https://t.me/genzcoders1'
    },
    'how to contribute': {
        question: 'Main kaise contribute kar sakta hu?',
        answer: 'Books ya resources suggest karo Telegram pe: https://t.me/genzzthinks. Developers ho toh owner se baat karo: @just_arsh1'
    }
};

// Telegram links
const telegramLinks = {
    group: 'https://t.me/genzzthinks',
    channel: 'https://t.me/genzcoders1',
    owner: '@just_arsh1'
};

// Sanitize input
function sanitizeInput(input) {
    return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
    });
}

// Prompt Admin Login
async function promptAdminLogin(isInitialLoad = false) {
    const csrfToken = await getCsrfToken();
    if (!csrfToken) {
        Swal.fire('Error!', 'Failed to initialize security. Try again or contact support on Telegram: ' + TELEGRAM_CHANNEL, 'error');
        return false;
    }

    const result = await Swal.fire({
        title: 'Admin Access 🔒',
        html: `
            <input type="password" id="admin-password" class="swal2-input" placeholder="Enter admin password">
            <input type="hidden" id="csrf-token" value="${csrfToken}">
        `,
        confirmButtonText: 'Login',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        preConfirm: async () => {
            const password = sanitizeInput(document.getElementById('admin-password').value);
            const csrfToken = document.getElementById('csrf-token').value;
            if (!password) {
                Swal.showValidationMessage('Password is required!');
                return false;
            }
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                const response = await fetch(`${BASE_API_URL}/api/admin-login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': csrfToken,
                    },
                    body: JSON.stringify({ password, _csrf: csrfToken }),
                    credentials: 'include',
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);
                const result = await response.json();
                if (result.success) {
                    return result.token;
                } else {
                    Swal.showValidationMessage(result.error || 'Wrong password!');
                    return false;
                }
            } catch (error) {
                console.error('Admin login fetch error:', error);
                Swal.showValidationMessage('Server error. Try again or contact: ' + TELEGRAM_CHANNEL);
                return false;
            }
        },
    });

    if (result.isConfirmed) {
        clickSound.play();
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('adminToken', result.value);
        if (!isInitialLoad) {
            Swal.fire('Success!', 'Admin access granted! Redirecting...', 'success').then(() => {
                window.location.href = './admin.html';
            });
        }
        return true;
    }
    return false;
}

// Check Access
async function checkAccess() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const directAccess = localStorage.getItem('directAccess') === 'success';

    if (isAdmin || directAccess) {
        clickSound.play();
        document.getElementById('loading-overlay').style.display = 'none';
        document.querySelector('.books-section').style.display = 'block';
        loadBooks();
        return;
    }

    const isAdminAttempt = await Swal.fire({
        title: 'Access Type',
        text: 'Are you an admin?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, I’m an admin',
        cancelButtonText: 'No, I’m a user',
    });

    if (isAdminAttempt.isConfirmed) {
        const adminSuccess = await promptAdminLogin(true);
        if (!adminSuccess) {
            window.location.href = './index.html';
            return;
        }
        clickSound.play();
        document.getElementById('loading-overlay').style.display = 'none';
        document.querySelector('.books-section').style.display = 'block';
        loadBooks();
        return;
    }

    Swal.fire({
        title: 'Access Required 🔑',
        text: 'You need admin access to view the library. Contact support or try admin login.',
        icon: 'info',
        confirmButtonText: 'Contact Support',
        showCancelButton: true,
        cancelButtonText: 'Try Admin Login',
    }).then(async (result) => {
        if (result.isConfirmed) {
            window.location.href = TELEGRAM_CHANNEL;
        } else {
            const adminSuccess = await promptAdminLogin();
            if (adminSuccess) {
                document.getElementById('loading-overlay').style.display = 'none';
                document.querySelector('.books-section').style.display = 'block';
                loadBooks();
            } else {
                window.location.href = './index.html';
            }
        }
    });
}

// Levenshtein Distance for fuzzy search
function levenshteinDistance(a, b) {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
    for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
            const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + indicator
            );
        }
    }
    return matrix[b.length][a.length];
}

// Load Books
let allBooks = [];
async function loadBooks(page = 1, limit = 12) {
    const cacheKey = `books-${page}-${limit}`;
    if (bookCache.has(cacheKey)) {
        renderBooks(bookCache.get(cacheKey));
        return;
    }

    try {
        const booksGrid = document.querySelector('.books-grid');
        if (page === 1) {
            booksGrid.innerHTML = '';
            for (let i = 0; i < limit; i++) {
                const skeleton = document.createElement('div');
                skeleton.className = 'skeleton-card';
                booksGrid.appendChild(skeleton);
            }
        }

        // Use hardcoded books array
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedBooks = books.slice(start, end).map(book => ({
            ...book,
            title: sanitizeInput(book.title),
            author: sanitizeInput(book.author),
            image_url: sanitizeInput(book.image_url),
            link: sanitizeInput(book.link),
            class: sanitizeInput(book.class),
            exam: sanitizeInput(book.exam),
            category: sanitizeInput(book.category)
        }));

        booksGrid.querySelectorAll('.skeleton-card').forEach(skeleton => skeleton.remove());

        bookCache.set(cacheKey, paginatedBooks);
        allBooks = allBooks.concat(paginatedBooks);
        renderBooks(paginatedBooks);

        if (end < books.length) {
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.className = 'load-more';
            loadMoreBtn.textContent = 'Load More';
            loadMoreBtn.addEventListener('click', () => {
                loadBooks(page + 1, limit);
                loadMoreBtn.remove();
            });
            booksGrid.after(loadMoreBtn);
        }

        Swal.fire({
            title: "Books Loaded!",
            toast: true,
            position: "top-end",
            timer: 1500,
            icon: "success"
        });
    } catch (error) {
        console.error('Error loading books:', error);
        Swal.fire({
            title: 'Error!',
            text: 'Books load nahi hui, bhai! Check internet ya Telegram pe bol: ' + TELEGRAM_CHANNEL,
            icon: 'error',
        });
    }
}

// Render Books
function renderBooks(books) {
    const booksGrid = document.querySelector('.books-grid');
    books.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.dataset.id = book.id;
        card.dataset.title = book.title;
        card.dataset.class = book.class;
        card.dataset.exam = book.exam;
        card.dataset.category = book.category || 'General';
        card.innerHTML = `
            <img src="${sanitizeInput(book.image_url)}" class="book-cover" alt="${sanitizeInput(book.title)}" loading="lazy">
            <h5 class="book-title">${sanitizeInput(book.title)}</h5>
            <p class="book-author">${sanitizeInput(book.author)}</p>
            <a href="${sanitizeInput(book.link)}" target="_blank" class="btn-download" aria-label="Download ${sanitizeInput(book.title)}">Download PDF</a>
        `;
        booksGrid.appendChild(card);
    });
}

// Filter Books
function filterBooks(query, classFilter = '', examFilter = '', categoryFilter = '') {
    const cards = document.querySelectorAll('.book-card');
    query = query.toLowerCase().trim();
    const threshold = 3;

    cards.forEach(card => {
        const title = card.dataset.title.toLowerCase();
        const classType = card.dataset.class.toLowerCase();
        const exam = card.dataset.exam.toLowerCase();
        const category = card.dataset.category.toLowerCase();

        const matchesQuery = query ? levenshteinDistance(title, query) <= threshold || title.includes(query) : true;
        const matchesClass = classFilter && classFilter !== 'all' ? classType === classFilter.toLowerCase() : true;
        const matchesExam = examFilter && examFilter !== 'all' ? exam === examFilter.toLowerCase() : true;
        const matchesCategory = categoryFilter && categoryFilter !== 'all' ? category === categoryFilter.toLowerCase() : true;

        card.style.display = matchesQuery && matchesClass && matchesExam && matchesCategory ? 'block' : 'none';
    });
}

// Search Books for Chatbot
function searchBooksForChatbot(query) {
    query = query.toLowerCase().trim();
    const threshold = 3;
    const matches = allBooks.filter(book => {
        const title = book.title.toLowerCase();
        return levenshteinDistance(title, query) <= threshold || title.includes(query);
    });

    if (matches.length === 0) {
        return 'Koi book nahi mili, bhai! Search bar mein try kar ya query change kar. 😕';
    }

    return `
        Yeh books mili matching "${query}":
        ${matches.slice(0, 3).map(book => `- **${sanitizeInput(book.title)}** by ${sanitizeInput(book.author)} (Class: ${sanitizeInput(book.class)}, Exam: ${sanitizeInput(book.exam)})`).join('\n')}
        ${matches.length > 3 ? `\nAur ${matches.length - 3} books hain! Search bar mein "${query}" daal ke dekh.` : ''}
    `;
}

// Add Chatbot Message
function addChatbotMessage(message, isBot = false) {
    const messages = document.getElementById('chatbot-messages');
    const div = document.createElement('div');
    div.className = `chatbot-message ${isBot ? 'bot' : 'user'} animate__animated animate__fadeIn`;
    div.innerHTML = sanitizeInput(message);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

// Rate limiting for chatbot
let lastQuery = 0;
let queryCount = 0;
const RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW = 60000;

function checkRateLimit() {
    const now = Date.now();
    if (now - lastQuery > RATE_LIMIT_WINDOW) {
        queryCount = 0;
        lastQuery = now;
    }
    queryCount++;
    if (queryCount > RATE_LIMIT) {
        return false;
    }
    lastQuery = now;
    return true;
}

// Chatbot commands
const commands = {
    '/help': () => `
        🆘 **Chatbot Help** 🆘
        Commands:
        - **/links**: Telegram group, channel, aur owner ke links.
        - **/contact**: Owner se direct contact karo.
        - **/admin**: Admin panel access (password required).
        - **/search <query>**: Books search karo yaha se!
        - **/stats**: Library ke stats dekh.
        - **/suggest <book>**: Book suggestion daal.
        - **/updates**: Latest updates check kar.
        - **/about**: GenZZ Library ke baare mein jano.
        - **/help**: Yeh help message.
        Ask anything like "how to download" ya set name: "Name: TeraNaam"
    `,
    '/links': () => `
        📢 **GenZZ Community Links** 📢
        - Telegram Group: ${telegramLinks.group}
        - Telegram Channel: ${telegramLinks.channel}
        - Owner: ${telegramLinks.owner}
        Join karo for updates aur support! 😎
    `,
    '/contact': () => `
        📩 **Contact Us** 📩
        Owner se direct baat karo: ${telegramLinks.owner}
        Ya Telegram group join karo: ${telegramLinks.group}
        Fast response guaranteed! 🚀
    `,
    '/search': query => {
        if (!query) return 'Bhai, /search ke saath book ka naam daal! Like: /search Physics';
        return searchBooksForChatbot(query);
    },
    '/about': () => `
        📚 **About GenZZ Library** 📚
        GenZZ Library ek free platform hai for 10th-12th, Board, JEE, NEET study materials.
        Humara mission hai students ko best resources dena, bilkul free!
        Join our Telegram for updates: ${telegramLinks.channel}
    `,
    '/stats': () => `
        📊 **Library Stats** 📊
        - Total Books: ${allBooks.length}
        - Categories: Physics, Chemistry, Maths, Biology, General
        - Popular Exams: JEE, NEET, Boards
        More stats ke liye admin se contact karo: ${telegramLinks.channel}
    `,
    '/suggest': query => {
        if (!query) return 'Bhai, /suggest ke saath book ka naam daal! Like: /suggest HC Verma';
        return `Book suggestion noted: "${query}". Team ko bhej diya! Join Telegram for updates: ${telegramLinks.channel}`;
    },
    '/updates': () => `
        🔔 **Latest Updates** 🔔
        - New books added for JEE 2025 prep
        - Improved search and filter system
        - Admin panel upgraded
        Stay tuned on Telegram: ${telegramLinks.channel}
    `
};

// Handle Chatbot Input
async function handleChatbotInput() {
    if (!checkRateLimit()) {
        addChatbotMessage('Thodi der ruk, bhai! Too many queries. Max 10 per minute. 😅', true);
        return;
    }

    const input = document.getElementById('chatbot-input-text');
    const message = input.value.trim();
    if (!message) return;

    addChatbotMessage(message);
    input.value = '';

    const lowerMessage = message.toLowerCase();

    // Handle commands
    if (commands[lowerMessage]) {
        addChatbotMessage(commands[lowerMessage](), true);
        return;
    }

    if (lowerMessage.startsWith('/search')) {
        const query = message.split(' ').slice(1).join(' ');
        addChatbotMessage(commands['/search'](query), true);
        return;
    }

    if (lowerMessage.startsWith('/suggest')) {
        const query = message.split(' ').slice(1).join(' ');
        addChatbotMessage(commands['/suggest'](query), true);
        return;
    }

    if (lowerMessage === '/admin') {
        addChatbotMessage('Bhai, admin banne ke liye password daal! 😎', true);
        const adminSuccess = await promptAdminLogin();
        if (!adminSuccess) {
            addChatbotMessage('Admin login cancel kiya. Koi na, books dekh le! 📚', true);
        }
        return;
    }

    const nameMatch = message.match(/^Name:\s*(.+)$/i);
    if (nameMatch) {
        localStorage.setItem('chatbotName', nameMatch[1]);
        addChatbotMessage(`Naam save ho gaya, ${nameMatch[1]}! Ab query puchh ya /links check kar. 😎`, true);
        return;
    }

    let found = false;
    for (const [key, faq] of Object.entries(faqs)) {
        if (lowerMessage.includes(key)) {
            addChatbotMessage(`
                ❓ **${faq.question}** ❓
                ${faq.answer}
            `, true);
            found = true;
            break;
        }
    }

    if (!found) {
        const name = localStorage.getItem('chatbotName') || 'Bhai';
        try {
            const csrfToken = await getCsrfToken();
            if (!csrfToken) {
                addChatbotMessage('Failed to fetch CSRF token. Try again or contact: https://t.me/genzcoders1', true);
                return;
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(`${BASE_API_URL}/api/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify({ name, message, _csrf: csrfToken }),
                credentials: 'include',
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            const result = await response.json();
            if (result.success) {
                addChatbotMessage(`
                    Query bhej di, ${name}! Team Telegram pe dekhegi: ${telegramLinks.channel}. 😊
                    Try asking specific questions like "how to download" ya check /help!
                `, true);
            } else {
                addChatbotMessage(`Query bhejne mein error: ${result.error || 'Kuch toh gadbad hai'}. Fir se try kar ya Telegram pe bol: ${telegramLinks.channel}`, true);
            }
        } catch (error) {
            console.error('Query submission error:', error);
            addChatbotMessage(`Server error, ${name}. Thodi der baad try kar ya Telegram group mein chill: ${telegramLinks.group}`, true);
        }
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async function () {
    const darkModeEnabled = localStorage.getItem('darkMode') === 'enabled';
    if (darkModeEnabled) {
        document.getElementById('darkModeToggle').checked = true;
    }
    document.getElementById('darkModeToggle').addEventListener('change', function () {
        clickSound.play();
        localStorage.setItem('darkMode', this.checked ? 'enabled' : 'disabled');
    });

    checkAccess();

    document.getElementById('chatbot-button').addEventListener('click', function () {
        clickSound.play();
        const window = document.getElementById('chatbot-window');
        window.style.display = window.style.display === 'flex' ? 'none' : 'flex';
        if (window.style.display === 'flex') {
            addChatbotMessage(`
                Yo bhai, welcome to GenZZ Bot! 😎
                Books dekhne ke liye search bar use kar ya mujhse puchh:
                - /search <book name> to find books
                - /links for Telegram group, channel, aur owner
                - /contact to reach the boss
                - /admin for admin access
                - /stats for library stats
                - /suggest <book> to suggest books
                - /updates for latest updates
                - /about to know more about us
                - /help for all commands
                Ask anything like "how to download"!
            `, true);
        }
    });

    document.getElementById('chatbot-input-text').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            clickSound.play();
            handleChatbotInput();
        }
    });
    document.getElementById('chatbot-input-button').addEventListener('click', function () {
        clickSound.play();
        handleChatbotInput();
    });

    document.getElementById('search').addEventListener('input', debounce(function () {
        filterBooks(
            this.value,
            document.querySelector('[data-class].active')?.dataset.class || '',
            document.querySelector('[data-exam].active')?.dataset.exam || '',
            document.querySelector('[data-category].active')?.dataset.category || ''
        );
    }, 300));

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', throttle(() => {
            clickSound.play();
            const type = btn.dataset.class ? 'class' : btn.dataset.exam ? 'exam' : 'category';
            const activeBtn = document.querySelector(`[data-${type}].active`);
            if (activeBtn) activeBtn.classList.remove('active');
            btn.classList.add('active');
            filterBooks(
                document.getElementById('search').value,
                document.querySelector('[data-class].active')?.dataset.class || '',
                document.querySelector('[data-exam].active')?.dataset.exam || '',
                document.querySelector('[data-category].active')?.dataset.category || ''
            );
        }, 200));
    });

    document.querySelectorAll('.btn-download, .btn-access').forEach(button => {
        button.addEventListener('click', async function (e) {
            clickSound.play();
            const bookCard = e.target.closest('.book-card');
            if (bookCard) {
                const bookId = bookCard.dataset.id;
                try {
                    const csrfToken = await getCsrfToken();
                    if (!csrfToken) {
                        console.error('Failed to fetch CSRF token for click tracking');
                        return;
                    }
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000);
                    await fetch(`${BASE_API_URL}/api/books/${bookId}/click`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-Token': csrfToken
                        },
                        body: JSON.stringify({ _csrf: csrfToken }),
                        credentials: 'include',
                        signal: controller.signal,
                    });
                    clearTimeout(timeoutId);
                } catch (error) {
                    console.error('Error tracking click:', error);
                }
            }

            const rect = e.target.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            tsParticles.load('sparkles-' + Date.now(), {
                fullScreen: { enable: false },
                particles: {
                    number: { value: 20 },
                    color: { value: ['#facc15', '#f97316'] },
                    shape: { type: 'star' },
                    opacity: { value: 0.8, animation: { enable: true, minimumValue: 0, speed: 2 } },
                    size: { value: 5, random: true },
                    move: {
                        enable: true,
                        speed: 10,
                        direction: 'none',
                        outModes: { default: 'destroy' }
                    },
                },
                emitters: {
                    position: { x, y },
                    rate: { quantity: 20, delay: 0 },
                },
            });
        });
    });
});