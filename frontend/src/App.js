// src/App.js

import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import BookingForm from './pages/BookingForm';
import AdminPanel from './pages/AdminPanel';
import PrivateRoute from './components/PrivateRoute';

// Импортируйте другие страницы при необходимости

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/about" element={<About/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/booking" element={<BookingForm/>}/>
                <Route path="/admin" element={<AdminPanel/>}/>
                <Route path="/admin" element={<PrivateRoute> <AdminPanel/></PrivateRoute>}/>
                {/* Добавьте другие маршруты по необходимости */}
            </Routes>
        </Router>
    );
}

export default App;
