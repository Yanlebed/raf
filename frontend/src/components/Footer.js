import React from 'react';
import {Box, Container, Typography} from '@mui/material';

function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                padding: '1rem 0',
                marginTop: 'auto', // Чтобы футер располагался внизу страницы
            }}
        >
            <Container maxWidth="lg">
                <Typography variant="body1" align="center">
                    © 2023 Ваша Компания. Все права защищены.
                </Typography>
            </Container>
        </Box>
    );
}

export default Footer;
