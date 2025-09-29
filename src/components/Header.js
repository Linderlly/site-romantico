import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header">
      <nav className="nav">
        <div className="logo">
          💖 Nosso Amor
        </div>
        <ul className="nav-links">
          <li><Link to="#inicio">Início</Link></li>
          <li><Link to="#historia">Nossa História</Link></li>
          <li><Link to="#fotos">Fotos</Link></li>
          <li><Link to="#contato">Contato</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;