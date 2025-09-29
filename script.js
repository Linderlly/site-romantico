// Configurações - ALTERE AQUI!
const CONFIG = {
    // Data do início do relacionamento (formato: 'YYYY-MM-DD')
    startDate: '2025-06-07',
    
    // Suas fotos - adicione os caminhos das suas imagens
    photos: [
        { 
            src: "images/foto1.jpeg", 
            alt: "Mais um de nossos vários encontros",
            description: "Nossa primeira foto juntos"
        },
        { 
            src: "images/foto2.jpg", 
            //alt: "Primeira viagem juntos",
            //description: "Férias inesquecíveis"
        },
        { 
            src: "images/foto3.jpg", 
            //alt: "Aniversário de namoro",
            //description: "Celebrando nosso amor"
        },
        { 
            src: "images/foto4.jpg", 
           // alt: "Momento especial",
           // description: "Sorrisos compartilhados"
        },
        { 
            src: "images/foto5.jpg", 
           // alt: "Passeio no parque",
            //description: "Dia perfeito juntos"
        },
        { 
            src: "images/foto6.jpg", 
            //alt: "Noite romântica",
            //description: "Velas e romance"
        }
    ]
};

// Função para rolar suavemente para as seções
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Função para carregar a galeria de fotos
function loadGallery() {
    const photoGrid = document.getElementById('photoGrid');
    
    CONFIG.photos.forEach(photo => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        
        photoItem.innerHTML = `
            <div class="image-container">
                <img 
                    src="${photo.src}" 
                    alt="${photo.alt}"
                    class="gallery-image"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
                >
                <div class="image-fallback" style="display: none;">
                    💕 ${photo.alt}
                </div>
            </div>
            <div class="photo-overlay">
                <p class="photo-description">${photo.description}</p>
            </div>
        `;
        
        photoGrid.appendChild(photoItem);
    });
}

// Função para atualizar a contagem do tempo juntos
function updateTimeTogether() {
    const startDate = new Date(CONFIG.startDate).getTime();
    const now = new Date().getTime();
    const difference = now - startDate;

    if (difference > 0) {
        const years = Math.floor(difference / (1000 * 60 * 60 * 24 * 365));
        const months = Math.floor((difference % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
        const days = Math.floor((difference % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        // Atualizar os elementos HTML
        document.getElementById('years').textContent = years;
        document.getElementById('months').textContent = months;
        document.getElementById('days').textContent = days;
        document.getElementById('hours').textContent = hours;
        document.getElementById('minutes').textContent = minutes;
        document.getElementById('seconds').textContent = seconds;
        
        // Atualizar mensagem
        document.getElementById('loveMessage').textContent = 
            `✨ Há ${years} anos, ${months} meses e ${days} dias compartilhando amor! ✨`;
    }
}

// Função para lidar com o envio do formulário
function handleSubmit(event) {
    event.preventDefault();
    const message = document.getElementById('message').value;
    
    if (message.trim()) {
        alert('Mensagem de amor enviada! 💖');
        document.getElementById('message').value = '';
    }
}

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    // Carregar galeria
    loadGallery();
    
    // Iniciar contagem do tempo
    updateTimeTogether();
    setInterval(updateTimeTogether, 1000);
    
    // Adicionar efeito de loading suave
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Efeito de parallax suave no header
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
    }
});