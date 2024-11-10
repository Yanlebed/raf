import React, {useEffect, useState} from 'react';
import {getServices} from '../api';
import ServiceList from '../components/ServiceList';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Home() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchServices() {
            try {
                const data = await getServices();
                setServices(data);
            } catch (error) {
                console.error('Ошибка при загрузке услуг:', error);
                setError('Не удалось загрузить услуги. Пожалуйста, попробуйте позже.');
            } finally {
                setLoading(false);
            }
        }

        fetchServices();
    }, []);

    return (
        <div>
            <Header/>
            <main>
                <h1>Добро пожаловать на наш сайт!</h1>
                {loading && <p>Загрузка услуг...</p>}
                {error && <p>{error}</p>}
                {!loading && !error && <ServiceList services={services}/>}
            </main>
            <Footer/>
        </div>
    );
}

export default Home;
