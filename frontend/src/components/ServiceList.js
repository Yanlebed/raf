import React from 'react';
import '../styles/ServiceList.scss'; // Если вы будете добавлять стили

function ServiceList({ services }) {
  if (services.length === 0) {
    return <p>Услуги не найдены.</p>;
  }

  return (
    <div>
      <h2>Наши услуги</h2>
      <ul>
        {services.map((service) => (
          <li key={service.id}>
            <h3>{service.name}</h3>
            <p>{service.description}</p>
            <p>Цена: {service.price} грн.</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ServiceList;
