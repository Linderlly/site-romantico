import React from 'react';

const Gallery = () => {
  const photos = [
    { 
      id: 1, 
      src: "./images/foto1.jpg",  // Mudou para ./
      alt: "Nosso primeiro encontro",
      description: "Dia que tudo começou"
    },
    { 
      id: 2, 
      src: "./images/foto2.jpg",  // Mudou para ./
      alt: "Primeira viagem juntos",
      description: "Férias inesquecíveis"
    },
    // ... resto das fotos
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