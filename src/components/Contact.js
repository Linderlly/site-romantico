import React, { useState } from 'react';

const Contact = () => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Mensagem de amor enviada! 💖');
    setMessage('');
  };

  return (
    <section id="contato" className="contact">
      <div className="container">
        <h2>Deixe uma Mensagem de Amor</h2>
        <form onSubmit={handleSubmit} className="love-form">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escreva sua mensagem de amor aqui..."
            rows="5"
            required
          />
          <button type="submit" className="submit-button">
            Enviar Mensagem 💌
          </button>
        </form>
        <div className="love-quote">
          <p>"O amor é composto de uma única alma habitando dois corpos."</p>
          <span>- Aristóteles</span>
        </div>
      </div>
    </section>
  );
};

export default Contact;