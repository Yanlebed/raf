import React from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {AppBar, Toolbar, Typography, Button} from '@mui/material';
import {logout} from '../api';

function Header() {
    const token = localStorage.getItem('access_token');
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography
                    variant="h6"
                    component={Link}
                    to="/"
                    sx={{
                        flexGrow: 1,
                        textDecoration: 'none',
                        color: 'primary.contrastText',
                    }}
                >
                    Ваша Компания
                </Typography>
                <Button color="inherit" component={Link} to="/">
                    Главная
                </Button>
                <Button color="inherit" component={Link} to="/services">
                    Услуги
                </Button>
                <Button color="inherit" component={Link} to="/about">
                    О нас
                </Button>
                <Button color="inherit" component={Link} to="/contact">
                    Контакты
                </Button>
                {token ? (
                    <>
                        <Button color="inherit" component={Link} to="/admin">
                            Админ
                        </Button>
                        <Button color="inherit" onClick={handleLogout}>
                            Выйти
                        </Button>
                    </>
                ) : (
                    <Button color="inherit" component={Link} to="/login">
                        Войти
                    </Button>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default Header;
