import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function Profile({ authType }) {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, [authType]);

    const fetchProfile = async () => {
        setLoading(true);
        setError('');
        
        try {
            let endpoint = '';
            let config = { withCredentials: true };
            
            if (authType === 'session') {
                endpoint = `${API_URL}/session/profile`;
            } else if (authType === 'cookie') {
                endpoint = `${API_URL}/cookie/profile`;
            } else {
                endpoint = `${API_URL}/token/profile`;
                const token = localStorage.getItem('jwt_token');
                if (!token) {
                    throw new Error('No token found');
                }
                config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };
            }
            
            const response = await axios.get(endpoint, config);
            setUserData(response.data.user);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to load profile');
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            let endpoint = '';
            let config = { withCredentials: true };
            
            if (authType === 'session') {
                endpoint = `${API_URL}/session/logout`;
            } else if (authType === 'cookie') {
                endpoint = `${API_URL}/cookie/logout`;
            } else {
                endpoint = `${API_URL}/token/logout`;
                const token = localStorage.getItem('jwt_token');
                config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    withCredentials: true
                };
                localStorage.removeItem('jwt_token');
            }
            
            await axios.post(endpoint, {}, config);
            localStorage.removeItem('user');
            localStorage.removeItem('authType');
            alert('Logged out successfully!');
            navigate('/');
        } catch (err) {
            console.error('Logout error:', err);
            navigate('/');
        }
    };

    if (loading) {
        return <div className="loading">Loading profile...</div>;
    }

    if (error) {
        return <div className="error">{error}<br/>Redirecting to login...</div>;
    }

    return (
        <div className="profile-container">
            <h2>Your Profile</h2>
            {userData && (
                <div className="profile-info">
                    <p><strong>Authentication Method:</strong> {authType.toUpperCase()}</p>
                    <p><strong>User ID:</strong> {userData.id}</p>
                    <p><strong>Username:</strong> {userData.username}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                </div>
            )}
            <button onClick={handleLogout} className="logout-btn">
                Logout
            </button>
        </div>
    );
}

export default Profile;