import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import './styles/App.css';

function App() {
    const [authType, setAuthType] = useState('session');
    const [showLogin, setShowLogin] = useState(true); // true = show login, false = show register

    return (
        <Router>
            <div className="App">
                <h1>Authentication Practice Project</h1>
                
                <div className="nav-buttons">
                    <button onClick={() => setAuthType('session')}>
                        Session Auth
                    </button>
                    <button onClick={() => setAuthType('cookie')}>
                        Signed Cookie Auth
                    </button>
                    <button onClick={() => setAuthType('token')}>
                        JWT Token Auth
                    </button>
                </div>
                
                <div className="auth-type">
                    Current: <strong>{authType.toUpperCase()}</strong> Authentication
                </div>
                
                <Routes>
                    <Route path="/" element={
                        <>
                            {showLogin ? (
                                <Login authType={authType} />
                            ) : (
                                <Register authType={authType} />
                            )}
                            
                            <div className="switch-form">
                                {showLogin ? (
                                    <p>
                                        Don't have an account?{' '}
                                        <button 
                                            className="link-btn"
                                            onClick={() => setShowLogin(false)}>
                                            Register here
                                        </button>
                                    </p>
                                ) : (
                                    <p>
                                        Already have an account?{' '}
                                        <button 
                                            className="link-btn"
                                            onClick={() => setShowLogin(true)}>
                                            Back to Login
                                        </button>
                                    </p>
                                )}
                            </div>
                        </>
                    } />
                    <Route path="/profile" element={<Profile authType={authType} />} />
                </Routes>
                
            </div>
        </Router>
    );
}

export default App;