import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function About() {
  return (
    <div>
      <Header />
      <main>
        <h1>О нас</h1>
        <p>Информация о вашей компании или проекте.</p>
      </main>
      <Footer />
    </div>
  );
}

export default About;
