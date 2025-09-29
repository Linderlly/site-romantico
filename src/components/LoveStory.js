import React from 'react';

const LoveStory = () => {
  const milestones = [
    {
      date: "Nosso Primeiro Encontro",
      description: "O dia em que nossos olhares se cruzaram e soubemos que algo especial estava começando."
    },
    {
      date: "Primeiro Beijo",
      description: "Um momento mágico que ficará guardado para sempre em nossos corações."
    },
    {
      date: "O Sim",
      description: "Quando decidimos construir nossa vida juntos, lado a lado."
    }
  ];

  return (
    <section id="historia" className="love-story">
      <div className="container">
        <h2>Nossa História de Amor</h2>
        <div className="timeline">
          {milestones.map((milestone, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-content">
                <h3>{milestone.date}</h3>
                <p>{milestone.description}</p>
              </div>
              <div className="timeline-marker">💖</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LoveStory;