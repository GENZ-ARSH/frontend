const BASE_API_URL = 'https://genzz-backend.onrender.com';
const TELEGRAM_CHANNEL = 'https://t.me/genzcoders1';

// CSRF Token Fetch
async function getCsrfToken() {
    try {
        const response = await fetch(`${BASE_API_URL}/api/csrf-token`, {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();
        return data.csrfToken;
    } catch (error) {
        console.error('CSRF token fetch failed:', error);
        return null;
    }
}

// Sanitize Input
function sanitizeInput(input) {
    return DOMPurify.sanitize(input);
}

// Check Admin Authentication
function checkAdminAuth() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const token = localStorage.getItem('adminToken');
    if (!isAdmin || !token) {
        window.location.href = './home.html';
    }
}

// Load Books (for both admin and home pages)
async function loadBooks(page = 1, limit = 10, isAdmin = false) {
    const booksList = document.querySelector(isAdmin ? '#books-container' : '.books-grid');
    booksList.innerHTML = isAdmin ? '<div class="spinner" style="display: block;"></div>' : 
        Array(4).fill().map(() => '<div class="skeleton-card"></div>').join('');

    try {
        const search = document.getElementById('search')?.value || '';
        const filterClass = document.getElementById('filter-class')?.value || '';
        const filterExam = document.getElementById('filter-exam')?.value || '';
        const filterCategory = document.getElementById('filter-category')?.value || '';

        let url = `${BASE_API_URL}/api/books?page=${page}&limit=${limit}`;
        if (search) url += `&q=${encodeURIComponent(search)}`;
        if (filterClass) url += `&class=${encodeURIComponent(filterClass)}`;
        if (filterExam) url += `&exam=${encodeURIComponent(filterExam)}`;
        if (filterCategory) url += `&category=${encodeURIComponent(filterCategory)}`;

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        });

        if (response.status === 429) {
            Swal.fire({
                title: 'Rate Limit Exceeded',
                text: 'Too many requests, bhai! Thodi der baad try kar ya Telegram pe bol: ' + TELEGRAM_CHANNEL,
                icon: 'warning'
            });
            return;
        }

        const data = await response.json();
        const books = data.books;
        const totalPages = data.totalPages;

        booksList.innerHTML = '';
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

        books.forEach(book => {
            const item = document.createElement('div');
            item.className = isAdmin ? 'book-item animate__animated animate__fadeIn' : 'book-card animate__animated animate__fadeIn';
            item.innerHTML = isAdmin ? `
                <input type="checkbox" class="book-checkbox" data-id="${sanitizeInput(book.id)}">
                <img src="${sanitizeInput(book.image_url)}" alt="${sanitizeInput(book.title)}" loading="lazy">
                <div>
                    <h5>${sanitizeInput(book.title)}</h5>
                    <p>Author: ${sanitizeInput(book.author || 'Unknown')}</p>
                    <p>Class: ${sanitizeInput(book.class || 'General')} | Exam: ${sanitizeInput(book.exam || 'General')}</p>
                    <p>Category: ${sanitizeInput(book.category || 'General')}</p>
                    <button class="btn-preview" data-book='${JSON.stringify(book)}'>Preview</button>
                    <button class="btn-delete" data-id="${sanitizeInput(book.id)}">Delete</button>
                </div>
            ` : `
                <img class="book-cover" src="${sanitizeInput(book.image_url)}" alt="${sanitizeInput(book.title)}" loading="lazy">
                <h3 class="book-title">${sanitizeInput(book.title)}</h3>
                <p class="book-author">Author: ${sanitizeInput(book.author || 'Unknown')}</p>
                <div class="book-actions">
                    <a href="${sanitizeInput(book.link)}" class="btn-download" target="_blank">Download</a>
                    <button class="btn-preview" data-book='${JSON.stringify(book)}'>Preview</button>
                    <button class="btn-favorite ${favorites.includes(book.id) ? 'active' : ''}" data-id="${sanitizeInput(book.id)}">
                        <i class="bi bi-heart-fill"></i>
                    </button>
                </div>
            `;
            booksList.appendChild(item);
        });

        // Update pagination controls
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        if (prevBtn && nextBtn) {
            prevBtn.disabled = page === 1;
            nextBtn.disabled = page >= totalPages;
            localStorage.setItem('currentPage', page);
        }

        if (!books.length && !isAdmin) {
            booksList.innerHTML = '<p style="text-align: center; color: #4b5563;">No books found. Try adjusting your search or filters.</p>';
        }
    } catch (error) {
        console.error('Error loading books:', error);
        Swal.fire({
            title: 'Error!',
            text: 'Books load nahi hui, bhai! Check internet ya Telegram pe bol: ' + TELEGRAM_CHANNEL,
            icon: 'error'
        });
    }
}

// Add Book (Admin)
async function addBook(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner" style="display: inline-block;"></span> Adding...';

    try {
        const formData = new FormData(form);
        const coverOption = form.querySelector('input[name="cover-option"]:checked').value;
        if (coverOption === 'url') {
            formData.delete('cover');
            formData.append('image_url', form.querySelector('#cover-url').value);
        }

        const csrfToken = await getCsrfToken();
        if (!csrfToken) {
            throw new Error('CSRF token missing');
        }
        formData.append('_csrf', csrfToken);

        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${BASE_API_URL}/api/books`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData,
            credentials: 'include'
        });

        if (response.ok) {
            Swal.fire({
                title: 'Success!',
                text: 'Book add ho gayi, bhai! 😎',
                icon: 'success',
                timer: 1500
            });
            form.reset();
            document.getElementById('cover-preview').style.display = 'none';
            document.getElementById('cover-file-group').style.display = 'block';
            document.getElementById('cover-url-group').style.display = 'none';
            loadBooks(1, 10, true);
        } else {
            const result = await response.json();
            Swal.fire({
                title: 'Error!',
                text: result.error || 'Book add nahi hui, bhai! Contact: ' + TELEGRAM_CHANNEL,
                icon: 'error'
            });
        }
    } catch (error) {
        Swal.fire({
            title: 'Error!',
            text: 'Server error, bhai! Baad mein try kar ya Telegram pe bol: ' + TELEGRAM_CHANNEL,
            icon: 'error'
        });
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Add Book';
    }
}

// Delete Book (Admin)
async function deleteBook(bookId) {
    const confirmDelete = await Swal.fire({
        title: 'Are you sure?',
        text: 'Book delete karne ke baad wapas nahi aayegi!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Haan, delete kar!',
        cancelButtonText: 'Nahi, cancel kar'
    });

    if (!confirmDelete.isConfirmed) return;

    try {
        const csrfToken = await getCsrfToken();
        if (!csrfToken) {
            Swal.fire({
                title: 'Error!',
                text: 'Security issue, bhai! Try again or contact: ' + TELEGRAM_CHANNEL,
                icon: 'error'
            });
            return;
        }

        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${BASE_API_URL}/api/books/${bookId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken,
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ _csrf: csrfToken }),
            credentials: 'include'
        });

        if (response.ok) {
            Swal.fire({
                title: 'Success!',
                text: 'Book delete ho gayi! 😎',
                icon: 'success',
                timer: 1500
            });
            loadBooks(1, 10, true);
        } else {
            const result = await response.json();
            Swal.fire({
                title: 'Error!',
                text: result.error || 'Book delete nahi hui, bhai! Contact: ' + TELEGRAM_CHANNEL,
                icon: 'error'
            });
        }
    } catch (error) {
        Swal.fire({
            title: 'Error!',
            text: 'Server error, bhai! Baad mein try kar ya Telegram pe bol: ' + TELEGRAM_CHANNEL,
            icon: 'error'
        });
    }
}

// Bulk Delete (Admin)
async function bulkDeleteBooks() {
    const checkboxes = document.querySelectorAll('.book-checkbox:checked');
    const bookIds = Array.from(checkboxes).map(cb => cb.dataset.id);
    if (!bookIds.length) {
        Swal.fire({
            title: 'Error!',
            text: 'Koi book select nahi ki, bhai!',
            icon: 'error'
        });
        return;
    }

    const confirmDelete = await Swal.fire({
        title: 'Are you sure?',
        text: `${bookIds.length} books delete karne ke baad wapas nahi aayengi!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Haan, delete kar!',
        cancelButtonText: 'Nahi, cancel kar'
    });

    if (!confirmDelete.isConfirmed) return;

    try {
        const csrfToken = await getCsrfToken();
        if (!csrfToken) {
            Swal.fire({
                title: 'Error!',
                text: 'Security issue, bhai! Try again or contact: ' + TELEGRAM_CHANNEL,
                icon: 'error'
            });
            return;
        }

        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${BASE_API_URL}/api/books/bulk-delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken,
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ bookIds, _csrf: csrfToken }),
            credentials: 'include'
        });

        if (response.ok) {
            Swal.fire({
                title: 'Success!',
                text: 'Books delete ho gayi! ��',
                icon: 'success',
                timer: 1500
            });
            loadBooks(1, 10, true);
        } else {
            const result = await response.json();
            Swal.fire({
                title: 'Error!',
                text: result.error || 'Books delete nahi hui, bhai! Contact: ' + TELEGRAM_CHANNEL,
                icon: 'error'
            });
        }
    } catch (error) {
        Swal.fire({
            title: 'Error!',
            text: 'Server error, bhai! Baad mein try kar ya Telegram pe bol: ' + TELEGRAM_CHANNEL,
            icon: 'error'
        });
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const isAdminPage = window.location.pathname.includes('admin.html');
    if (isAdminPage) {
        checkAdminAuth();
        loadBooks(1, 10, true);

        const bookForm = document.getElementById('add-book-form');
        bookForm?.addEventListener('submit', addBook);

        document.getElementById('bulk-delete')?.addEventListener('click', bulkDeleteBooks);

        document.getElementById('select-all')?.addEventListener('change', (e) => {
            document.querySelectorAll('.book-checkbox').forEach(cb => {
                cb.checked = e.target.checked;
            });
            document.getElementById('bulk-delete').style.display = 
                document.querySelectorAll('.book-checkbox:checked').length ? 'inline-block' : 'none';
        });

        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('book-checkbox')) {
                document.getElementById('bulk-delete').style.display = 
                    document.querySelectorAll('.book-checkbox:checked').length ? 'inline-block' : 'none';
            }
        });

        document.getElementById('prev-page')?.addEventListener('click', () => {
            const currentPage = parseInt(localStorage.getItem('currentPage') || '1');
            if (currentPage > 1) {
                loadBooks(currentPage - 1, 10, true);
            }
        });

        document.getElementById('next-page')?.addEventListener('click', () => {
            const currentPage = parseInt(localStorage.getItem('currentPage') || '1');
            loadBooks(currentPage + 1, 10, true);
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-delete')) {
                deleteBook(e.target.dataset.id);
            }
        });

        // Cover image preview
        const coverInput = document.getElementById('cover');
        const coverPreview = document.getElementById('cover-preview');
        coverInput?.addEventListener('change', () => {
            const file = coverInput.files[0];
            if (file) {
                coverPreview.src = URL.createObjectURL(file);
                coverPreview.style.display = 'block';
            } else {
                coverPreview.style.display = 'none';
            }
        });

        // Cover option toggle
        document.querySelectorAll('input[name="cover-option"]').forEach(radio => {
            radio.addEventListener('change', () => {
                document.getElementById('cover-file-group').style.display = radio.value === 'file' ? 'block' : 'none';
                document.getElementById('cover-url-group').style.display = radio.value === 'url' ? 'block' : 'none';
                coverPreview.style.display = 'none';
            });
        });
    } else {
        loadBooks(1, 10, false);

        document.getElementById('prev-page')?.addEventListener('click', () => {
            const currentPage = parseInt(localStorage.getItem('currentPage') || '1');
            if (currentPage > 1) {
                loadBooks(currentPage - 1, 10, false);
            }
        });

        document.getElementById('next-page')?.addEventListener('click', () => {
            const currentPage = parseInt(localStorage.getItem('currentPage') || '1');
            loadBooks(currentPage + 1, 10, false);
        });
    }
});
