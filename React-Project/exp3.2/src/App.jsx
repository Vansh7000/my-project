import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

export default function App() {
  const [books, setBooks] = useState([
    { title: "1984", author: "George Orwell" },
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
    { title: "To Kill a Mockingbird", author: "Harper Lee" },
  ]);

  const [search, setSearch] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");

  // Add new book
  const addBook = () => {
    if (newTitle.trim() === "" || newAuthor.trim() === "") return;
    setBooks([...books, { title: newTitle, author: newAuthor }]);
    setNewTitle("");
    setNewAuthor("");
  };

  // Remove book by index
  const removeBook = (index) => {
    setBooks(books.filter((_, i) => i !== index));
  };

  // Filter books based on search
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-container">
      <h2>Library Management</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by title or author"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      {/* Add Book Form */}
      <div className="add-form">
        <input
          type="text"
          placeholder="New book title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="New book author"
          value={newAuthor}
          onChange={(e) => setNewAuthor(e.target.value)}
        />
        <button onClick={addBook}>Add Book</button>
      </div>

      {/* Book List */}
      <div className="book-list">
        {filteredBooks.length === 0 ? (
          <p>No books found.</p>
        ) : (
          filteredBooks.map((book, index) => (
            <div key={index} className="book-item">
              <span>
                <strong>{book.title}</strong> by {book.author}
              </span>
              <button onClick={() => removeBook(index)}>Remove</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}