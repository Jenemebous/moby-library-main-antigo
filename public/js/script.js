document.getElementById('book-form').addEventListener('submit', addBook);

function showAddBookForm() {
    document.getElementById('add-book-form').classList.remove('hidden');
}

function hideAddBookForm() {
    document.getElementById('add-book-form').classList.add('hidden');
}

function addBook(event) {
    event.preventDefault();
    
    const title = document.getElementById('book-title').value;
    const author = document.getElementById('book-author').value;
    const cover = document.getElementById('book-cover').value;

    const bookshelf = document.getElementById('bookshelf');

    const bookDiv = document.createElement('div');
    bookDiv.className = 'book';
    bookDiv.innerHTML = `
        <img src="${cover}" alt="Capa do Livro">
        <p>${title}</p>
        <p>${author}</p>
        <button onclick="editBook(this)">Editar</button>
        <button onclick="removeBook(this)">Remover</button>
    `;

    bookshelf.appendChild(bookDiv);

    hideAddBookForm();
    document.getElementById('book-form').reset();
}

function removeBook(button) {
    const bookDiv = button.parentElement;
    bookDiv.remove();
}

function editBook(button) {
    const bookDiv = button.parentElement;
    const title = bookDiv.querySelector('p:nth-of-type(1)').innerText;
    const author = bookDiv.querySelector('p:nth-of-type(2)').innerText;
    const cover = bookDiv.querySelector('img').src;

    document.getElementById('book-title').value = title;
    document.getElementById('book-author').value = author;
    document.getElementById('book-cover').value = cover;

    removeBook(button);
    showAddBookForm();
}
