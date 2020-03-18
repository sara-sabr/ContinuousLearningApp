import React from 'react';
import logo from './logo.svg';
import './App.css';
import i18n from "./translations";
import { BrowserRouter, Route, Link } from 'react-router-dom';
import Home from "./components/Home";
import About from "./components/About";
import Dashboard from "./components/Dashboard";


function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/dashboard">Dashbord</Link></li>
        </ul>
        <Route exact path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/dashboard" component={Dashboard} />
      </div>
    </BrowserRouter>
  );
}

export default App;
