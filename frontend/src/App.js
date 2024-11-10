import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {Box} from '@mui/material';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import BookingForm from './pages/BookingForm';
import AdminPanel from './pages/AdminPanel';
import PrivateRoute from './components/PrivateRoute';

function App() {
    return (
        <Router>
            <Box
                sx={{
                    backgroundColor: 'background.default',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/about" element={<About/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/booking" element={<BookingForm/>}/>
                    <Route
                        path="/admin"
                        element={
                            <PrivateRoute>
                                <AdminPanel/>
                            </PrivateRoute>
                        }
                    />
                    {/* Добавьте другие маршруты по необходимости */}
                </Routes>
            </Box>
        </Router>
    );
}

export default App;
