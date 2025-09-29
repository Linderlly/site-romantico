import React, { useState, useEffect } from 'react';

const Countdown = () => {
  const [timeTogether, setTimeTogether] = useState({});

  useEffect(() => {
    // DEFINA A DATA DO INÍCIO DO RELACIONAMENTO AQUI 👇
    // Formato: 'YYYY-MM-DD'
    const startDate = new Date('2025-06-07').getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = now - startDate;

      if (difference > 0) {
        const years = Math.floor(difference / (1000 * 60 * 60 * 24 * 365));
        const months = Math.floor((difference % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
        const days = Math.floor((difference % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeTogether({
          years,
          months,
          days,
          hours,
          minutes,
          seconds
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="countdown">
      <div className="container">
        <h2>💖 Tempo de Amor 💖</h2>
        <p className="countdown-subtitle">
          Cada segundo ao seu lado é um momento especial
        </p>
        <div className="countdown-timer">
          <div className="time-unit">
            <span className="time-number">{timeTogether.years || 0}</span>
            <span className="time-label">Anos</span>
          </div>
          <div className="time-unit">
            <span className="time-number">{timeTogether.months || 0}</span>
            <span className="time-label">Meses</span>
          </div>
          <div className="time-unit">
            <span className="time-number">{timeTogether.days || 0}</span>
            <span className="time-label">Dias</span>
          </div>
          <div className="time-unit">
            <span className="time-number">{timeTogether.hours || 0}</span>
            <span className="time-label">Horas</span>
          </div>
          <div className="time-unit">
            <span className="time-number">{timeTogether.minutes || 0}</span>
            <span className="time-label">Minutos</span>
          </div>
          <div className="time-unit">
            <span className="time-number">{timeTogether.seconds || 0}</span>
            <span className="time-label">Segundos</span>
          </div>
        </div>
        <div className="love-message">
          <p>✨ Há {timeTogether.years || 0} anos, {timeTogether.months || 0} meses e {timeTogether.days || 0} dias compartilhando amor! ✨</p>
        </div>
      </div>
    </section>
  );
};

export default Countdown;