import React from 'react';
import {Link, useNavigate} from 'react-router-dom';
import '../styles/Header.scss';
import {logout} from '../api';

function Header() {
    const token = localStorage.getItem('access_token');
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="header__logo">
                <Link to="/">Ваша Компания</Link>
            </div>
            <nav className="header__nav">
                <ul>
                    <li><Link to="/">Главная</Link></li>
                    <li><Link to="/services">Услуги</Link></li>
                    <li><Link to="/about">О нас</Link></li>
                    <li><Link to="/contact">Контакты</Link></li>
                    {token ? (
                        <>
                            <li><Link to="/admin">Админ</Link></li>
                            <li>
                                <button onClick={handleLogout} className="header__logout-button">Выйти</button>
                            </li>
                        </>
                    ) : (
                        <li><Link to="/login">Войти</Link></li>
                    )}
                </ul>
            </nav>
        </header>
    );
}

export default Header;
