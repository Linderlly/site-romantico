import React from 'react';

const Gallery = () => {
  const photos = [
    { 
      id: 1, 
      src: "./images/foto1.jpeg", 
      alt: "Nosso primeiro encontro",
      description: "Dia que tudo começou"
    },
    { 
      id: 2, 
      src: "./images/foto2.jpg", 
      //alt: "Primeira viagem juntos",
     // description: "Férias inesquecíveis"
    },
    { 
      id: 3, 
      src: "./images/foto3.jpg", 
     // alt: "Aniversário de namoro",
     // description: "Celebrando nosso amor"
    },
    { 
      id: 4, 
      src: "./images/foto4.jpg", 
      //alt: "Momento especial",
     // description: "Sorrisos compartilhados"
    },
    { 
      id: 5, 
      src: "./images/foto5.jpg", 
     // alt: "Passeio no parque",
     // description: "Dia perfeito juntos"
    },
    { 
      id: 6, 
      src: "./images/foto6.jpg", 
     // alt: "Noite romântica",
     // description: "Velas e romance"
    }
  ];

  return (
    <section id="fotos" className="gallery">
      <div className="container">
        <h2>Nossos Momentos Especiais</h2>
        <div className="photo-grid">
          {photos.map(photo => (
            <div key={photo.id} className="photo-item">
              <div className="image-container">
                <img 
                  src={photo.src} 
                  alt={photo.alt}
                  className="gallery-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'flex';
                    }
                  }}
                />
                <div className="image-fallback">
                  💕 {photo.alt}
                </div>
              </div>
              <div className="photo-overlay">
                <p className="photo-description">{photo.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;