import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import '../styles/AdminPanel.scss';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {getAppointments, deleteAppointment, logout} from '../api';

function AdminPanel() {
    const [appointments, setAppointments] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    useEffect(() => {
        async function fetchAppointments() {
            try {
                const data = await getAppointments();
                setAppointments(data);
            } catch (error) {
                setErrorMessage('Не удалось загрузить записи. Пожалуйста, попробуйте позже.');
            }
        }

        fetchAppointments();
    }, []);

    const handleDelete = async (id) => {
        try {
            await deleteAppointment(id);
            setAppointments(appointments.filter((appointment) => appointment.id !== id));
        } catch (error) {
            setErrorMessage('Ошибка при удалении записи.');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div>
            <Header/>
            <main className="admin-panel">
                <div className="admin-panel__header">
                    <h1>Панель администратора</h1>
                    <button onClick={handleLogout} className="admin-panel__logout-button">
                        Выйти
                    </button>
                </div>
                {errorMessage && <p className="admin-panel__error">{errorMessage}</p>}
                <table className="admin-panel__table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Имя</th>
                        <th>Телефон</th>
                        <th>Услуга</th>
                        <th>Дата</th>
                        <th>Время</th>
                        <th>Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    {appointments.map((appointment) => (
                        <tr key={appointment.id}>
                            <td>{appointment.id}</td>
                            <td>{appointment.name}</td>
                            <td>{appointment.phone}</td>
                            <td>{appointment.service}</td>
                            <td>{appointment.date}</td>
                            <td>{appointment.time}</td>
                            <td>
                                <button
                                    onClick={() => handleDelete(appointment.id)}
                                    className="admin-panel__delete-button"
                                >
                                    Удалить
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </main>
            <Footer/>
        </div>
    );
}

export default AdminPanel;
