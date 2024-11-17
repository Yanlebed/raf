// src/pages/Home.js

import React, { useState } from 'react';
import Carousel from '../components/Carousel';
import SearchBarComponent from '../components/SearchBarComponent';
import { Container, Typography, Grid, Box, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';

const Home = () => {
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (query) => {
    if (query.trim() === '') {
      toast.warning('Пожалуйста, введите запрос для поиска.');
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get('http://localhost:8000/api/v1/search', {
        params: { query },
      });
      setSearchResults(response.data.results);
      if (response.data.results.length === 0) {
        toast.info('Нет результатов по вашему запросу.');
      }
    } catch (error) {
      console.error('Ошибка при поиске:', error);
      toast.error('Произошла ошибка при поиске. Пожалуйста, попробуйте позже.');
    }
  };

  return (
    <div>
      {/* Карусель изображений */}
      <Carousel />

      {/* Поле поиска */}
      <SearchBarComponent onSearch={handleSearch} />

      {/* Отображение результатов поиска */}
      {searchResults.length > 0 && (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Результаты поиска:
          </Typography>
          <List>
            {searchResults.map((item) => (
              <ListItem key={item.id}>
                <ListItemText primary={item.name} secondary={item.description} />
              </ListItem>
            ))}
          </List>
        </Container>
      )}

      {/* Блоки процедур */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          {/* Пример блоков процедур */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <i className="fas fa-cut fa-3x mb-2 text-pantone-432c"></i>
              <Typography variant="h6">Стрижка</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <i className="fas fa-hand-sparkles fa-3x mb-2 text-pantone-432c"></i>
              <Typography variant="h6">Манікюр</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <i className="fas fa-spa fa-3x mb-2 text-pantone-432c"></i>
              <Typography variant="h6">Косметологія</Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Дополнительные блоки */}
        {/* ... */}
      </Container>

      {/* Остальная часть вашей страницы */}
    </div>
  );
};

export default Home;
