import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ProductCard from './components/ProductCard'

export default function App() {
  const products = [
    { name: "Wireless Mouse", price: 25.99, status: "In Stock" },
    { name: "Keyboard", price: 45.5, status: "Out of Stock" },
    { name: "Monitor", price: 199.99, status: "In Stock" },
  ];

  return (
    <div className="app-container">
      <h2>Products List</h2>
      <div className="product-list">
        {products.map((p, idx) => (
          <ProductCard
            key={idx}
            name={p.name}
            price={p.price}
            status={p.status}
          />
        ))}
      </div>
    </div>
  );
}