import React from 'react';

const Hero = () => {
  return (
    <section id="inicio" className="hero">
      <div className="hero-content">
        <h1 className="hero-title">
          Para o amor da minha vida 💕
        </h1>
        <p className="hero-subtitle">
          "O amor não se vê com os olhos, mas com o coração."<br />
          - William Shakespeare
        </p>
        <button className="cta-button">
          Nossa Jornada
        </button>
      </div>
      <div className="hero-background"></div>
    </section>
  );
};

export default Hero;