import React from 'react';
import './styles/App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import LoveStory from './components/LoveStory';
import Gallery from './components/Gallery';
import Countdown from './components/Countdown';
import Contact from './components/Contact';

function App() {
  return (
    <div className="App">
      <Header />
      <Hero />
      <LoveStory />
      <Gallery />
      <Countdown />
      <Contact />
    </div>
  );
}

export default App;