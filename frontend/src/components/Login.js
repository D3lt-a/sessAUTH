import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function Login({ authType }) {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            let endpoint = '';
            if (authType === 'session') {
                endpoint = `${API_URL}/session/login`;
            } else if (authType === 'cookie') {
                endpoint = `${API_URL}/cookie/login`;
            } else {
                endpoint = `${API_URL}/token/login`;
            }
            
            const response = await axios.post(endpoint, credentials, {
                withCredentials: true
            });
            
            // Store token for JWT auth
            if (authType === 'token' && response.data.token) {
                localStorage.setItem('jwt_token', response.data.token);
            }
            
            // Store user info
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('authType', authType);
            
            alert(response.data.message);
            navigate('/profile');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>Login with {authType.toUpperCase()}</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={credentials.username}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            {error && <p className="error">{error}</p>}
        </div>
    );
}

export default Login;