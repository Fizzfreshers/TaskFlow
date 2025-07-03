import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isRegister) {
                await register(name, email, password);
            } else {
                await login(email, password);
            }
            navigate('/dashboard'); // redirect to dashboard on success
        } catch (error) {
            console.error('Authentication failed:', error.response ? error.response.data.message : error.message);
            alert(error.response ? error.response.data.message : 'An error occurred');
        }
    };

    return (
        <div className="auth-container">
            <h2>{isRegister ? 'Register' : 'Login'}</h2>
            <form onSubmit={handleSubmit}>
                {isRegister && (
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                )}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
            </form>
            <p>
                {isRegister ? 'Already have an account?' : 'Don\'t have an account?'}
                <span onClick={() => setIsRegister(!isRegister)} style={{ cursor: 'pointer', color: 'blue' }}>
                    {isRegister ? ' Login' : ' Register'}
                </span>
            </p>
        </div>
    );
};

export default Auth;