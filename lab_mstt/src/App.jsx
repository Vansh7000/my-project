import React, { useState } from "react";
import "./App.css";

function App() {
  const [patients, setPatients] = useState([
    { id: 1, name: "Rahul", disease: "Fever" },
    { id: 2, name: "Anjali", disease: "Cold" },
    { id: 3, name: "Vikram", disease: "Headache" },
  ]);

  const removePatient = (id) => {
    setPatients(patients.filter((p) => p.id !== id));
  };

  return (
    <div className="app">
      <h2>Patient List</h2>

      <div className="card-container">
        {patients.map((p) => (
          <div key={p.id} className="card">
            <h3>{p.name}</h3>
            <p>Disease: {p.disease}</p>
            <button onClick={() => removePatient(p.id)}>Remove</button>
          </div>
        ))}

        {patients.length === 0 && <p>No patients left.</p>}
      </div>
    </div>
  );
}

export default App;
