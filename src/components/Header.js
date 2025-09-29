import React from 'react';

const Header = () => {
  const handleScroll = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <header className="header">
      <nav className="nav">
        <div className="logo">
          💖 Nosso Amor
        </div>
        <ul className="nav-links">
          <li><button onClick={() => handleScroll('inicio')}>Início</button></li>
          <li><button onClick={() => handleScroll('historia')}>Nossa História</button></li>
          <li><button onClick={() => handleScroll('fotos')}>Fotos</button></li>
          <li><button onClick={() => handleScroll('contato')}>Contato</button></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;