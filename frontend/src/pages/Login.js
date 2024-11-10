import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.scss';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { login } from '../api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/admin'); // Перенаправление в панель администратора после успешного входа
    } catch (error) {
      setErrorMessage('Неверное имя пользователя или пароль');
    }
  };

  return (
    <div>
      <Header />
      <main className="login">
        <h1>Вход для администратора</h1>
        {errorMessage && <p className="login__error">{errorMessage}</p>}
        <form onSubmit={handleSubmit} className="login__form">
          <div className="login__group">
            <label htmlFor="username">Имя пользователя:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="login__group">
            <label htmlFor="password">Пароль:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login__submit">
            Войти
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}

export default Login;
