import React, {useState} from 'react';
import '../styles/BookingForm.scss';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {createAppointment} from '../api'; // Предполагается, что вы реализуете эту функцию

function BookingForm() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        service: '',
        date: '',
        time: '',
    });

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const services = ['Стрижка', 'Окрашивание', 'Маникюр', 'Педикюр']; // Замените на реальные услуги

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Отправка данных на сервер
            await createAppointment(formData);
            setSuccessMessage('Ваша запись успешно создана!');
            setFormData({
                name: '',
                phone: '',
                service: '',
                date: '',
                time: '',
            });
        } catch (error) {
            setErrorMessage('Произошла ошибка при создании записи. Пожалуйста, попробуйте позже.');
        }
    };

    return (
        <div>
            <Header/>
            <main className="booking-form">
                <h1>Запись на услугу</h1>
                {successMessage && <p className="booking-form__success">{successMessage}</p>}
                {errorMessage && <p className="booking-form__error">{errorMessage}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="booking-form__group">
                        <label htmlFor="name">Ваше имя:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="booking-form__group">
                        <label htmlFor="phone">Телефон:</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="booking-form__group">
                        <label htmlFor="service">Выберите услугу:</label>
                        <select
                            id="service"
                            name="service"
                            value={formData.service}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Выберите услугу --</option>
                            {services.map((service, index) => (
                                <option key={index} value={service}>
                                    {service}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="booking-form__group">
                        <label htmlFor="date">Дата:</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="booking-form__group">
                        <label htmlFor="time">Время:</label>
                        <input
                            type="time"
                            id="time"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="booking-form__submit">
                        Записаться
                    </button>
                </form>
            </main>
            <Footer/>
        </div>
    );
}

export default BookingForm;
