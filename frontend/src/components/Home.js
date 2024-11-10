import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {Box, Typography} from '@mui/material';

function Home() {
    return (
        <>
            <Header/>
            <Box sx={{flexGrow: 1, padding: '2rem'}}>
                {/* Ваш контент */}
                <Typography variant="h4" align="center" gutterBottom>
                    Добро пожаловать на наш сайт!
                </Typography>
                {/* Добавьте остальной контент здесь */}
            </Box>
            <Footer/>
        </>
    );
}

export default Home;
