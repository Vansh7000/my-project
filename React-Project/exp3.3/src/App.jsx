import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  displayInfo() {
    return `Name: ${this.name}, Age: ${this.age}`;
  }
}

// Subclass: Student
class Student extends Person {
  constructor(name, age, course) {
    super(name, age);
    this.course = course;
  }

  displayInfo() {
    return `${super.displayInfo()}, Course: ${this.course}`;
  }
}

// Subclass: Teacher
class Teacher extends Person {
  constructor(name, age, subject) {
    super(name, age);
    this.subject = subject;
  }

  displayInfo() {
    return `${super.displayInfo()}, Subject: ${this.subject}`;
  }
}

export default function App() {
  const student1 = new Student("Alice", 20, "Computer Science");
  const student2 = new Student("Bob", 22, "Mechanical Engineering");
  const teacher1 = new Teacher("Mr. Smith", 45, "Mathematics");

  return (
    <div className="app-container">
      <h2>Person Class Hierarchy</h2>

      <div className="card">
        <h3>Student Details</h3>
        <p>{student1.displayInfo()}</p>
        <p>{student2.displayInfo()}</p>
      </div>

      <div className="card">
        <h3>Teacher Details</h3>
        <p>{teacher1.displayInfo()}</p>
      </div>
    </div>
  );
}