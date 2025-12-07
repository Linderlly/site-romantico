// ===== CONFIGURAÇÕES =====
const CONFIG = {
    // Data do início do relacionamento (formato: 'YYYY-MM-DD')
    startDate: '2025-06-05',
    
    // Suas fotos
    photos: [
        { 
            src: "images/foto1.jpeg", 
            alt: "Melhores momentos",
            description: "Ao seu lado"
        },
        { 
            src: "images/foto2.jpg", 
            alt: "Primeira viagem juntos",
            description: "Férias inesquecíveis"
        }
    ],
    
    // Corações flutuantes
    hearts: {
        minSize: 15,
        maxSize: 30,
        minSpeed: 10,
        maxSpeed: 25,
        maxHearts: 20,
        emojis: ['💖', '💕', '❤️', '💗', '💓', '💞', '💝', '💘', '💌']
    },
    
    // Playlist de músicas locais - ADICIONE SUAS MÚSICAS AQUI!
    musicPlaylist: [
        { 
            src: 'music/musica1.mp3', 
            title: 'Aliança',
            artist: 'Tribalistas',
            duration: '4:11',
            format: 'mp3'
        },
        { 
            src: 'music/musica2.mp3', 
            title: 'Anjos',
            artist: 'Venere Vai Venus',
            duration: '3:18',
            format: 'mp3'
        },
        { 
            src: 'music/musica3.mp3', 
            title: 'Luz que me traz paz',
            artist: 'Maneva',
            duration: '5:03',
            format: 'mp3'
        },
        { 
            src: 'music/musica4.mp3', 
            title: 'Ararinha',
            artist: 'Carlinhos Brown',
            duration: '2:39',
            format: 'mp3'
        },
        { 
            src: 'music/musica5.mp3', 
            title: 'Olhos Castanhos',
            artist: 'Geovanna Jainy',
            duration: '2:30',
            format: 'mp3'
        },
        { 
            src: 'music/musica6.mp3', 
            title: 'Those Eyes',
            artist: 'New West',
            duration: '3:40',
            format: 'mp3'
        },
        { 
            src: 'music/musica7.mp3', 
            title: 'Pela Luz dos Olhos teus',
            artist: 'Miucha & Antonio Carlos Jobim',
            duration: '2:46',
            format: 'mp3'
        },
        { 
            src: 'music/musica8.mp3', 
            title: 'Lisboa',
            artist: 'Ana Vitória',
            duration: '3:39',
            format: 'mp3'
        }
    ],
    
    // Configuração do jardim das rosas
    garden: {
        totalRoses: 15,
        specialRoseIndex: 7, // Índice da rosa especial
        roseGrowth: 50, // Crescimento inicial (0-100)
        lastWatered: null,
        roseMessages: [
            "Nosso primeiro encontro",
            "Primeira viagem juntos",
            "Aquele jantar especial",
            "Dia dos namorados",
            "Nosso aniversário",
            "Caminhada no parque",
            "Noite de filmes",
            "🌟 NOSSA ROSA DOURADA 🌟",
            "Conversas até tarde",
            "Surpresa inesquecível",
            "Aquele café da manhã",
            "Dia chuvoso em casa",
            "Festa com amigos",
            "Projeto conjunto",
            "Momento de superação"
        ]
    }
};

// ===== VARIÁVEIS GLOBAIS =====
let audioVolume = 0.7;
let isDarkMode = false;
let mouseX = 0;
let mouseY = 0;
let isMobile = false;
let userInteracted = false;
let audioUnlocked = false;

// ===== VARIÁVEIS DO PLAYER DE ÁUDIO =====
let audioPlayer = null;
let currentTrackIndex = 0;
let isPlaying = false;
let playerReady = false;
let updateInterval = null;
let isMuted = false;
let lastVolume = 70;
let audioContext = null;
let audioAnalyser = null;
let sourceNode = null;
let audioCanvas = null;
let audioCanvasCtx = null;

// NOVA VARIÁVEL: Controla se a música deve repetir ou ir para próxima
let autoNextEnabled = false;

// ===== INICIALIZAÇÃO PRINCIPAL =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando Site Romântico...');
    
    // Verificar se é dispositivo móvel
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log(`📱 Dispositivo móvel: ${isMobile}`);
    
    // Mostrar loading mobile
    if (isMobile) {
        document.getElementById('mobileLoading').classList.remove('hidden');
    }
    
    // Carregar configurações salvas
    loadSettings();
    
    // Inicializar componentes
    initializeThemeToggle();
    initializeMenu();
    loadGallery();
    initializeCursor();
    initializeHearts();
    
    // Iniciar contagem do tempo
    updateTimeTogether();
    setInterval(updateTimeTogether, 1000);
    
    // Configurar redimensionamento da tela
    window.addEventListener('resize', handleResize);
    
    // Configurar interação do usuário para desbloquear áudio
    setupUserInteraction();
    
    // Inicializar player de áudio
    initializeAudioPlayer();
    
    // Inicializar jardim das rosas
    initializeGarden();
    
    // Esconder loading após 2 segundos
    setTimeout(() => {
        document.getElementById('mobileLoading').classList.add('hidden');
        showNotification(isMobile ? '🔊 Toque na tela para liberar o áudio' : '🎵 Clique em Play para ouvir');
    }, 2000);
    
    // Mostrar botão de play mobile se for mobile
    if (isMobile) {
        setTimeout(() => {
            document.getElementById('mobilePlayButton').classList.add('show');
        }, 3000);
    }
});

// ===== MANIPULAÇÃO DE RESIZE =====
function handleResize() {
    const wasMobile = isMobile;
    isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (wasMobile !== isMobile) {
        console.log(`📱 Modo alterado para: ${isMobile ? 'Mobile' : 'Desktop'}`);
        location.reload(); // Recarregar para ajustar interface
    }
    
    const cursor = document.getElementById('customCursor');
    if (isMobile && cursor) {
        cursor.style.display = 'none';
    } else if (!isMobile && cursor) {
        cursor.style.display = 'block';
    }
    
    CONFIG.hearts.maxHearts = isMobile ? 15 : 20;
    
    // Atualizar visualizador se existir
    if (audioCanvasCtx) {
        drawAudioVisualizer();
    }
}

// ===== SETUP DE INTERAÇÃO DO USUÁRIO =====
function setupUserInteraction() {
    console.log('🔄 Configurando interação do usuário...');
    
    // Eventos para detectar interação do usuário
    const interactionEvents = ['click', 'touchstart', 'touchend', 'keydown', 'mousedown'];
    
    interactionEvents.forEach(eventType => {
        document.addEventListener(eventType, handleUserInteraction, { 
            once: false,
            passive: true 
        });
    });
    
    // Botão de play mobile
    const mobilePlayBtn = document.getElementById('mobilePlayButton');
    if (mobilePlayBtn) {
        mobilePlayBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            handleUserInteraction();
            
            if (!audioUnlocked) {
                showAudioPermissionOverlay();
                return;
            }
            
            if (audioPlayer && !isPlaying) {
                playCurrentTrack();
                this.classList.remove('show'); // Esconder após clicar
            }
        });
    }
}

function handleUserInteraction() {
    if (!userInteracted) {
        userInteracted = true;
        audioUnlocked = true;
        console.log('✅ Usuário interagiu - áudio desbloqueado');
        
        // Esconder botão mobile após interação
        const mobileBtn = document.getElementById('mobilePlayButton');
        if (mobileBtn) {
            mobileBtn.classList.remove('show');
        }
        
        // Se tiver AudioContext suspenso, retomar
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                console.log('✅ AudioContext retomado');
            });
        }
        
        // Mostrar mensagem amigável
        showNotification('🎵 Áudio liberado! Clique em Play para ouvir');
    }
}

function showAudioPermissionOverlay() {
    if (!isMobile) return;
    
    console.log('🛡️ Mostrando overlay de permissão de áudio...');
    
    // Remover overlay existente
    const existingOverlay = document.querySelector('.audio-permission-overlay');
    if (existingOverlay) existingOverlay.remove();
    
    // Criar overlay
    const overlay = document.createElement('div');
    overlay.className = 'audio-permission-overlay';
    overlay.innerHTML = `
        <div class="permission-content">
            <div style="font-size: 3rem; margin-bottom: 20px;">🔊</div>
            <h2>Permitir Áudio</h2>
            <p>
                Para ouvir as músicas do nosso amor, 
                precisamos da sua permissão para reproduzir áudio.
                Toque no botão abaixo para permitir.
            </p>
            <button class="permission-btn" id="allowAudioBtn">
                Permitir Reprodução de Áudio
            </button>
            <p style="margin-top: 15px; font-size: 0.9rem; opacity: 0.7;">
                Após permitir, clique em Play para começar
            </p>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Configurar botão de permissão
    overlay.querySelector('#allowAudioBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Criar áudio silencioso para "enganar" o navegador
        const silentAudio = new Audio();
        silentAudio.volume = 0.001;
        
        // Tentar reproduzir para desbloquear
        silentAudio.play().then(() => {
            console.log('✅ Permissão de áudio concedida');
            audioUnlocked = true;
            userInteracted = true;
            
            // Parar áudio silencioso
            silentAudio.pause();
            silentAudio.currentTime = 0;
            
            // Remover overlay
            overlay.remove();
            
            // Mostrar notificação
            showNotification('✅ Áudio liberado! Agora clique em Play');
            
        }).catch(error => {
            console.error('❌ Falha ao obter permissão:', error);
            showNotification('❌ Não foi possível obter permissão. Tente novamente.');
        });
    });
    
    // Fechar overlay ao clicar fora
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

// ===== CURSOR PERSONALIZADO =====
function initializeCursor() {
    if (isMobile) return;
    
    const cursor = document.getElementById('customCursor');
    cursor.style.display = 'block';
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
        
        const target = e.target;
        if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
            cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursor.style.color = '#ff4081';
        } else {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.color = '#e91e63';
        }
    });
    
    document.addEventListener('mousedown', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
    });
    
    document.addEventListener('mouseup', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    });
}

// ===== CORAÇÕES FLUTUANTES =====
function initializeHearts() {
    const container = document.getElementById('hearts-container');
    container.innerHTML = '';
    
    const initialHearts = isMobile ? CONFIG.hearts.maxHearts / 2 : CONFIG.hearts.maxHearts;
    for (let i = 0; i < initialHearts; i++) {
        setTimeout(() => createFloatingHeart(), i * 300);
    }
    
    const heartInterval = isMobile ? 2000 : 1500;
    setInterval(createFloatingHeart, heartInterval);
}

function createFloatingHeart() {
    const container = document.getElementById('hearts-container');
    
    if (container.children.length >= CONFIG.hearts.maxHearts * 2) {
        const excess = container.children.length - CONFIG.hearts.maxHearts;
        for (let i = 0; i < excess; i++) {
            if (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        }
    }
    
    const heart = document.createElement('div');
    const size = Math.random() * (CONFIG.hearts.maxSize - CONFIG.hearts.minSize) + CONFIG.hearts.minSize;
    const startX = Math.random() * window.innerWidth;
    const duration = Math.random() * (CONFIG.hearts.maxSpeed - CONFIG.hearts.minSpeed) + CONFIG.hearts.minSpeed;
    const emoji = CONFIG.hearts.emojis[Math.floor(Math.random() * CONFIG.hearts.emojis.length)];
    const adjustedSize = isMobile ? size * 0.8 : size;
    
    heart.className = 'floating-heart';
    heart.innerHTML = emoji;
    heart.style.cssText = `
        left: ${startX}px;
        top: ${window.innerHeight + 20}px;
        font-size: ${adjustedSize}px;
        animation: heartFloat ${duration}s linear forwards;
        color: ${getRandomHeartColor()};
    `;
    
    container.appendChild(heart);
    
    setTimeout(() => {
        if (heart.parentNode === container) {
            container.removeChild(heart);
        }
    }, duration * 1000);
}

function getRandomHeartColor() {
    const colors = ['#ff4081', '#e91e63', '#ff6b9d', '#ff8e8e', '#ff9a9e'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// ===== MENU RESPONSIVO =====
function initializeMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (!menuToggle || !mobileMenu) return;
    
    menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        menuToggle.innerHTML = mobileMenu.classList.contains('active') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
    });
    
    const menuItems = mobileMenu.querySelectorAll('button');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav') && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
}

// ===== TEMA CLARO/ESCURO =====
function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        enableDarkMode();
    } else if (savedTheme === 'light') {
        enableLightMode();
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        enableDarkMode();
    }
    
    themeToggle.addEventListener('click', toggleTheme);
    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                enableDarkMode();
            } else {
                enableLightMode();
            }
        }
    });
}

function toggleTheme() {
    if (isDarkMode) {
        enableLightMode();
    } else {
        enableDarkMode();
    }
}

function enableDarkMode() {
    document.documentElement.classList.add('dark-mode');
    document.documentElement.classList.remove('light-mode');
    isDarkMode = true;
    
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = 'fas fa-sun';
    }
    
    localStorage.setItem('theme', 'dark');
}

function enableLightMode() {
    document.documentElement.classList.add('light-mode');
    document.documentElement.classList.remove('dark-mode');
    isDarkMode = false;
    
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = 'fas fa-moon';
    }
    
    localStorage.setItem('theme', 'light');
}

// ===== JARDIM DAS ROSAS =====
function initializeGarden() {
    console.log('🌹 Inicializando jardim das rosas...');
    
    // Carregar dados salvos
    loadGardenData();
    
    // Criar rosas
    createRoses();
    
    // Configurar botão de regar
    const waterBtn = document.getElementById('waterGarden');
    if (waterBtn) {
        waterBtn.addEventListener('click', waterGarden);
    }
    
    // Atualizar estatísticas
    updateGardenStats();
    
    // Atualizar crescimento da rosa especial
    updateRoseGrowth();
}

function loadGardenData() {
    try {
        const savedGarden = JSON.parse(localStorage.getItem('loveGarden'));
        if (savedGarden) {
            CONFIG.garden.roseGrowth = savedGarden.roseGrowth || CONFIG.garden.roseGrowth;
            CONFIG.garden.lastWatered = savedGarden.lastWatered || CONFIG.garden.lastWatered;
            CONFIG.garden.specialRoseIndex = savedGarden.specialRoseIndex || CONFIG.garden.specialRoseIndex;
            
            // Verificar se pode crescer desde a última rega
            if (CONFIG.garden.lastWatered) {
                const lastWateredDate = new Date(CONFIG.garden.lastWatered);
                const now = new Date();
                const hoursSinceWater = (now - lastWateredDate) / (1000 * 60 * 60);
                
                // Se passou mais de 24 horas, perder um pouco de crescimento
                if (hoursSinceWater > 24 && CONFIG.garden.roseGrowth > 0) {
                    CONFIG.garden.roseGrowth = Math.max(0, CONFIG.garden.roseGrowth - 5);
                    saveGardenData();
                }
            }
        }
    } catch (e) {
        console.log('Erro ao carregar dados do jardim:', e);
    }
}

function saveGardenData() {
    try {
        localStorage.setItem('loveGarden', JSON.stringify({
            roseGrowth: CONFIG.garden.roseGrowth,
            lastWatered: CONFIG.garden.lastWatered,
            specialRoseIndex: CONFIG.garden.specialRoseIndex
        }));
    } catch (e) {
        console.log('Erro ao salvar dados do jardim:', e);
    }
}

function createRoses() {
    const gardenContainer = document.getElementById('gardenContainer');
    if (!gardenContainer) return;
    
    gardenContainer.innerHTML = '';
    
    // Se não tiver mensagens suficientes, criar algumas padrão
    while (CONFIG.garden.roseMessages.length < CONFIG.garden.totalRoses) {
        CONFIG.garden.roseMessages.push(`Rosa do Amor ${CONFIG.garden.roseMessages.length + 1}`);
    }
    
    for (let i = 0; i < CONFIG.garden.totalRoses; i++) {
        const isSpecial = i === CONFIG.garden.specialRoseIndex;
        
        const roseItem = document.createElement('div');
        roseItem.className = 'rose-item';
        roseItem.dataset.index = i;
        
        // Posição aleatória para as folhas
        const leafLeft = Math.random() * 15 + 10;
        const leafRight = Math.random() * 15 + 10;
        
        roseItem.innerHTML = `
            <div class="rose ${isSpecial ? 'rose-special' : 'rose-normal'}">
                ${isSpecial ? '🏵️' : '🌹'}
            </div>
            <div class="rose-stem"></div>
            <div class="rose-leaf left" style="bottom: ${leafLeft}px;"></div>
            <div class="rose-leaf right" style="bottom: ${leafRight}px;"></div>
            <div class="rose-tooltip">${CONFIG.garden.roseMessages[i]}</div>
        `;
        
        // Adicionar evento de clique
        roseItem.addEventListener('click', () => onRoseClick(i, isSpecial));
        
        // Adicionar animação de entrada
        roseItem.style.opacity = '0';
        roseItem.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            roseItem.style.transition = 'all 0.5s ease';
            roseItem.style.opacity = '1';
            roseItem.style.transform = 'translateY(0)';
        }, i * 100);
        
        gardenContainer.appendChild(roseItem);
    }
}

function onRoseClick(index, isSpecial) {
    const message = CONFIG.garden.roseMessages[index];
    
    if (isSpecial) {
        showNotification(`💖 ${message} - Nossa rosa mais especial!`);
        
        // Criar efeito de brilho na rosa especial
        const specialRose = document.querySelector(`.rose-item[data-index="${index}"] .rose`);
        if (specialRose) {
            specialRose.style.animation = 'none';
            setTimeout(() => {
                specialRose.style.animation = 'specialRoseGlow 2s infinite alternate';
            }, 10);
        }
        
        // Mostrar mensagem especial
        const specialMessage = document.getElementById('specialRoseMessage');
        if (specialMessage) {
            const specialMessages = [
                "Esta rosa dourada representa o amor mais puro que temos!",
                "Nosso amor brilha como ouro em meio às outras rosas!",
                "Cada pétala desta rosa é um momento inesquecível nosso!",
                "A rosa mais bonita do jardim, assim como você é para mim!",
                "Nosso amor especial, representado nesta rosa única!"
            ];
            specialMessage.textContent = specialMessages[Math.floor(Math.random() * specialMessages.length)];
        }
    } else {
        showNotification(`🌹 ${message}`);
    }
    
    // Efeito visual no clique
    createRoseClickEffect(index);
}

function createRoseClickEffect(index) {
    const roseItem = document.querySelector(`.rose-item[data-index="${index}"]`);
    if (!roseItem) return;
    
    // Criar partículas de pétalas
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const petal = document.createElement('div');
            petal.innerHTML = '🌸';
            petal.style.cssText = `
                position: absolute;
                font-size: 20px;
                pointer-events: none;
                z-index: 10;
                opacity: 0.8;
                animation: petalFloat 1s ease-out forwards;
            `;
            
            const rect = roseItem.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;
            
            petal.style.left = startX + 'px';
            petal.style.top = startY + 'px';
            
            // Animação única para cada pétala
            petal.style.setProperty('--end-x', (Math.random() * 100 - 50) + 'px');
            petal.style.setProperty('--end-y', (Math.random() * 100 - 150) + 'px');
            
            document.body.appendChild(petal);
            
            setTimeout(() => {
                if (petal.parentNode) {
                    petal.remove();
                }
            }, 1000);
        }, i * 100);
    }
}

function waterGarden() {
    // Verificar se já regou hoje
    const lastWatered = CONFIG.garden.lastWatered ? new Date(CONFIG.garden.lastWatered) : null;
    const today = new Date();
    
    if (lastWatered && 
        lastWatered.getDate() === today.getDate() &&
        lastWatered.getMonth() === today.getMonth() &&
        lastWatered.getFullYear() === today.getFullYear()) {
        
        showNotification('💧 Você já regou o jardim hoje! Volte amanhã.');
        return;
    }
    
    // Aumentar crescimento da rosa especial
    CONFIG.garden.roseGrowth = Math.min(100, CONFIG.garden.roseGrowth + 10);
    CONFIG.garden.lastWatered = today.toISOString();
    
    // Salvar dados
    saveGardenData();
    
    // Atualizar interface
    updateRoseGrowth();
    updateGardenStats();
    
    // Efeito visual de regar
    createWaterEffect();
    
    // Atualizar mensagem baseada no crescimento
    const growth = CONFIG.garden.roseGrowth;
    let message = '';
    
    if (growth >= 100) {
        message = '🎉 Nossa rosa dourada está completamente crescida! Amor perfeito!';
        // Desbloquear algo especial
        unlockGardenAchievement();
    } else if (growth >= 75) {
        message = '🌺 Nossa rosa especial está quase totalmente crescida!';
    } else if (growth >= 50) {
        message = '🌸 Rosa dourada está na metade do caminho! Continue regando!';
    } else if (growth >= 25) {
        message = '🌷 Rosa especial está começando a brilhar!';
    } else {
        message = '🌱 Rosa dourada está apenas brotando. Continue regando!';
    }
    
    showNotification(`💧 Jardim regado! ${message}`);
    
    // Animação nas rosas
    animateRosesAfterWatering();
}

function createWaterEffect() {
    const gardenContainer = document.getElementById('gardenContainer');
    if (!gardenContainer) return;
    
    // Criar múltiplos efeitos de água
    for (let i = 0; i < 3; i++) {
        const waterEffect = document.createElement('div');
        waterEffect.className = 'water-effect';
        
        // Posição aleatória
        const rect = gardenContainer.getBoundingClientRect();
        const x = rect.left + Math.random() * rect.width;
        const y = rect.top + Math.random() * rect.height;
        
        waterEffect.style.left = x + 'px';
        waterEffect.style.top = y + 'px';
        
        document.body.appendChild(waterEffect);
        
        // Remover após animação
        setTimeout(() => {
            if (waterEffect.parentNode) {
                waterEffect.remove();
            }
        }, 1000);
    }
}

function animateRosesAfterWatering() {
    const roses = document.querySelectorAll('.rose-item');
    
    roses.forEach((rose, index) => {
        setTimeout(() => {
            rose.style.transform = 'translateY(-10px)';
            
            // Adicionar efeito de brilho temporário
            const roseIcon = rose.querySelector('.rose');
            if (roseIcon) {
                const originalClass = roseIcon.className;
                roseIcon.style.filter = 'brightness(1.3)';
                
                setTimeout(() => {
                    rose.style.transform = '';
                    roseIcon.style.filter = '';
                }, 500);
            }
        }, index * 50);
    });
}

function updateRoseGrowth() {
    const growthElement = document.getElementById('roseGrowth');
    const progressFill = document.getElementById('roseProgressFill');
    
    if (growthElement) {
        growthElement.textContent = `${CONFIG.garden.roseGrowth}%`;
    }
    
    if (progressFill) {
        progressFill.style.width = `${CONFIG.garden.roseGrowth}%`;
        
        // Mudar cor baseada no crescimento
        if (CONFIG.garden.roseGrowth >= 75) {
            progressFill.style.background = 'linear-gradient(90deg, #4CAF50, #8BC34A)';
        } else if (CONFIG.garden.roseGrowth >= 50) {
            progressFill.style.background = 'linear-gradient(90deg, #FFC107, #FF9800)';
        } else {
            progressFill.style.background = 'linear-gradient(90deg, #FF9800, #FF5722)';
        }
    }
}

function updateGardenStats() {
    // Atualizar contador de rosas
    const totalRoses = document.getElementById('totalRoses');
    if (totalRoses) {
        totalRoses.textContent = CONFIG.garden.totalRoses;
    }
    
    // Atualizar contador de rosas especiais
    const specialRoses = document.getElementById('specialRoses');
    if (specialRoses) {
        specialRoses.textContent = '1';
    }
    
    // Atualizar contador de dias crescendo
    const daysGrowing = document.getElementById('daysGrowing');
    if (daysGrowing && CONFIG.startDate) {
        const startDate = new Date(CONFIG.startDate);
        const today = new Date();
        const days = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
        daysGrowing.textContent = Math.max(0, days);
    }
}

function unlockGardenAchievement() {
    // Quando a rosa chega a 100%, desbloquear algo especial
    showNotification('🏆 Conquista desbloqueada: Jardineiro do Amor!');
    
    // Pode adicionar uma nova rosa especial, desbloquear música, etc.
    const specialMessage = document.getElementById('specialRoseMessage');
    if (specialMessage) {
        specialMessage.textContent = '✨ Nossa rosa dourada está perfeita! Ela desbloqueou uma surpresa especial para nós! ✨';
    }
    
    // Criar uma explosão de pétalas
    createPetalExplosion();
}

function createPetalExplosion() {
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const petal = document.createElement('div');
            petal.innerHTML = '🌸';
            petal.style.cssText = `
                position: fixed;
                font-size: 30px;
                pointer-events: none;
                z-index: 9998;
                opacity: 0.9;
                animation: petalExplosion 2s ease-out forwards;
            `;
            
            // Posição inicial no centro
            const startX = window.innerWidth / 2;
            const startY = window.innerHeight / 2;
            
            petal.style.left = startX + 'px';
            petal.style.top = startY + 'px';
            
            // Posição final aleatória
            const angle = Math.random() * Math.PI * 2;
            const distance = 200 + Math.random() * 300;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;
            
            petal.style.setProperty('--end-x', endX + 'px');
            petal.style.setProperty('--end-y', endY + 'px');
            
            document.body.appendChild(petal);
            
            setTimeout(() => {
                if (petal.parentNode) {
                    petal.remove();
                }
            }, 2000);
        }, i * 50);
    }
}

// ===== PLAYER DE ÁUDIO HTML5 =====
function initializeAudioPlayer() {
    console.log('🎵 Inicializando Player de Áudio...');
    
    // Criar elemento de áudio
    createAudioElement();
    
    // Carregar playlist
    loadPlaylist();
    
    // Configurar controles
    setupPlayerControls();
    
    // Configurar toggle do player
    const playerToggle = document.getElementById('playerToggle');
    const playerContent = document.getElementById('playerContent');
    
    if (playerToggle && playerContent) {
        playerToggle.addEventListener('click', () => {
            playerContent.classList.toggle('expanded');
            playerToggle.classList.toggle('rotated');
            handleUserInteraction();
        });
    }
    
    // Criar visualizador de áudio (só em desktop)
    if (!isMobile) {
        createAudioVisualizer();
    }
    
    // Carregar primeira música (mas não tocar automaticamente)
    if (CONFIG.musicPlaylist.length > 0) {
        loadTrack(currentTrackIndex, false); // false = não tocar automaticamente
        updateCurrentSongInfo();
    } else {
        showNotification('Adicione músicas na playlist!');
    }
}

function createAudioElement() {
    console.log('🎧 Criando elemento de áudio...');
    
    // Criar elemento de áudio
    audioPlayer = document.createElement('audio');
    audioPlayer.id = 'audio-player';
    audioPlayer.preload = 'auto';
    audioPlayer.crossOrigin = 'anonymous';
    
    // IMPORTANTE para mobile
    audioPlayer.controls = false;
    audioPlayer.autoplay = false; // Nunca autoplay
    
    // Adicionar ao player-content
    const playerContent = document.getElementById('playerContent');
    if (playerContent) {
        playerContent.insertBefore(audioPlayer, playerContent.firstChild);
    }
    
    // Configurar eventos do áudio
    audioPlayer.addEventListener('canplay', onAudioReady);
    audioPlayer.addEventListener('play', onAudioPlay);
    audioPlayer.addEventListener('pause', onAudioPause);
    audioPlayer.addEventListener('ended', onAudioEnded);
    audioPlayer.addEventListener('error', onAudioError);
    audioPlayer.addEventListener('timeupdate', onAudioTimeUpdate);
    audioPlayer.addEventListener('loadedmetadata', onAudioMetadataLoaded);
    
    // Evento específico para quando dados são carregados
    audioPlayer.addEventListener('loadeddata', function() {
        console.log('✅ Dados de áudio carregados');
        playerReady = true;
        enableControls(true);
    });
    
    // Configurar volume inicial
    audioPlayer.volume = audioVolume;
    
    console.log('✅ Elemento de áudio criado com sucesso!');
}

function createAudioVisualizer() {
    if (isMobile) return;
    
    // Criar canvas para visualizador
    audioCanvas = document.createElement('canvas');
    audioCanvas.id = 'audio-visualizer';
    audioCanvas.width = 300;
    audioCanvas.height = 60;
    audioCanvas.style.cssText = `
        width: 100%;
        height: 60px;
        background: transparent;
        margin: 10px 0;
        border-radius: 5px;
        display: block;
    `;
    
    // Adicionar ao controls-bottom
    const controlsBottom = document.querySelector('.controls-bottom');
    if (controlsBottom) {
        controlsBottom.insertBefore(audioCanvas, controlsBottom.firstChild);
    }
    
    // Obter contexto
    audioCanvasCtx = audioCanvas.getContext('2d');
    
    // Inicializar Web Audio API se suportado
    if (window.AudioContext || window.webkitAudioContext) {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContextClass();
            
            // Criar analyser node
            audioAnalyser = audioContext.createAnalyser();
            audioAnalyser.fftSize = 256;
            
            // Criar source
            if (audioPlayer) {
                sourceNode = audioContext.createMediaElementSource(audioPlayer);
                sourceNode.connect(audioAnalyser);
                audioAnalyser.connect(audioContext.destination);
                
                // Iniciar animação do visualizador
                requestAnimationFrame(drawAudioVisualizer);
                
                console.log('✅ Visualizador de áudio inicializado!');
            }
        } catch (error) {
            console.warn('⚠️ Não foi possível inicializar o visualizador:', error);
        }
    }
}

function drawAudioVisualizer() {
    if (!audioAnalyser || !audioCanvasCtx || !audioPlayer || audioPlayer.paused || isMobile) {
        requestAnimationFrame(drawAudioVisualizer);
        return;
    }
    
    const bufferLength = audioAnalyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    audioAnalyser.getByteFrequencyData(dataArray);
    
    audioCanvasCtx.clearRect(0, 0, audioCanvas.width, audioCanvas.height);
    
    const barWidth = (audioCanvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;
    
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    
    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        
        const gradient = audioCanvasCtx.createLinearGradient(0, 0, 0, audioCanvas.height);
        gradient.addColorStop(0, primaryColor);
        gradient.addColorStop(1, '#ff9a9e');
        
        audioCanvasCtx.fillStyle = gradient;
        
        audioCanvasCtx.fillRect(
            x, 
            audioCanvas.height - barHeight, 
            barWidth, 
            barHeight
        );
        
        x += barWidth + 1;
    }
    
    requestAnimationFrame(drawAudioVisualizer);
}

function onAudioReady() {
    console.log('✅ Áudio pronto para tocar!');
    playerReady = true;
    enableControls(true);
    updateProgressBar();
    
    // Atualizar tempo total
    const durationElement = document.getElementById('duration');
    if (durationElement && audioPlayer.duration) {
        durationElement.textContent = formatTime(audioPlayer.duration);
    }
}

function onAudioPlay() {
    console.log('▶️ Áudio iniciado');
    isPlaying = true;
    
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        playBtn.title = 'Pausar';
    }
    
    // Iniciar intervalo para atualizar barra de progresso
    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(updateProgressBar, 100);
    
    // Mostrar visualizador se não for mobile
    if (audioCanvas && !isMobile) {
        audioCanvas.style.display = 'block';
    }
    
    // Atualizar playlist UI
    updatePlaylistUI();
}

function onAudioPause() {
    console.log('⏸️ Áudio pausado');
    isPlaying = false;
    
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        playBtn.title = 'Reproduzir';
    }
    
    // Parar intervalo
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
    
    // Atualizar playlist UI
    updatePlaylistUI();
}

function onAudioEnded() {
    console.log('⏹️ Música terminada - NÃO passando automaticamente para próxima');
    isPlaying = false;
    
    // Atualizar botão de play
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        playBtn.title = 'Reproduzir';
    }
    
    // Parar intervalo
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
    
    // Resetar barra de progresso
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('currentTime').textContent = '0:00';
    
    // Mostrar notificação
    showNotification('🎵 Música terminada. Clique em Play para repetir');
    
    // SÓ passar para próxima se autoNextEnabled estiver ativo
    if (autoNextEnabled) {
        setTimeout(() => {
            playNextTrack();
        }, 1000);
    }
}

function onAudioError(event) {
    console.error('❌ Erro no player de áudio:', audioPlayer.error);
    
    let errorMsg = 'Erro ao carregar a música. ';
    
    if (audioPlayer.error) {
        switch(audioPlayer.error.code) {
            case 1:
                errorMsg += 'Reprodução interrompida pelo usuário.';
                break;
            case 2:
                errorMsg += 'Erro de rede. Verifique sua conexão.';
                break;
            case 3:
                errorMsg += 'Arquivo corrompido ou formato não suportado.';
                break;
            case 4:
                errorMsg += 'Formato de áudio não suportado. Use MP3.';
                break;
            default:
                errorMsg += 'Erro desconhecido.';
        }
    }
    
    showNotification(errorMsg);
    
    // NÃO tentar próxima música automaticamente
    console.log('⚠️ Erro na música - NÃO passando para próxima automaticamente');
}

function onAudioTimeUpdate() {
    updateProgressBar();
}

function onAudioMetadataLoaded() {
    console.log('📊 Metadados de áudio carregados');
    
    const durationElement = document.getElementById('duration');
    if (durationElement && audioPlayer.duration) {
        durationElement.textContent = formatTime(audioPlayer.duration);
    }
}

function setupPlayerControls() {
    console.log('🎛️ Configurando controles do player...');
    
    // Botão play/pause
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
        playBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            handleUserInteraction();
            
            if (!playerReady || !audioPlayer) {
                showNotification('Carregando música...');
                return;
            }
            
            if (!audioUnlocked && isMobile) {
                showAudioPermissionOverlay();
                return;
            }
            
            if (isPlaying) {
                audioPlayer.pause();
            } else {
                // Se a música terminou, voltar ao início
                if (audioPlayer.ended || audioPlayer.currentTime >= audioPlayer.duration) {
                    audioPlayer.currentTime = 0;
                }
                playAudio();
            }
        });
        
        if (isMobile) {
            playBtn.style.padding = '15px';
            playBtn.style.minWidth = '60px';
            playBtn.style.minHeight = '60px';
        }
    }
    
    // Botão próximo - AGORA SÓ MUDA QUANDO O USUÁRIO CLICAR
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            handleUserInteraction();
            if (confirm('Tocar próxima música?')) {
                playNextTrack();
            }
        });
    }
    
    // Botão anterior - AGORA SÓ MUDA QUANDO O USUÁRIO CLICAR
    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            handleUserInteraction();
            if (confirm('Tocar música anterior?')) {
                playPrevTrack();
            }
        });
    }
    
    // Controle de volume
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
        volumeSlider.value = audioVolume * 100;
        document.getElementById('volumePercent').textContent = volumeSlider.value + '%';
        
        volumeSlider.addEventListener('input', (e) => {
            handleUserInteraction();
            const volume = parseInt(e.target.value) / 100;
            if (audioPlayer) {
                audioPlayer.volume = volume;
                if (isMuted && volume > 0) {
                    isMuted = false;
                    document.getElementById('muteBtn').innerHTML = '<i class="fas fa-volume-up"></i>';
                }
                audioVolume = volume;
                document.getElementById('volumePercent').textContent = Math.round(volume * 100) + '%';
                lastVolume = volume * 100;
                localStorage.setItem('musicVolume', audioVolume);
            }
        });
    }
    
    // Botão de mute
    const muteBtn = document.getElementById('muteBtn');
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            handleUserInteraction();
            toggleMute();
        });
    }
    
    // Botão de informações
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            handleUserInteraction();
            showSongInfo();
        });
    }
    
    // Barra de progresso
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.addEventListener('click', (e) => {
            handleUserInteraction();
            if (audioPlayer && audioPlayer.duration) {
                const rect = progressBar.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                const newTime = audioPlayer.duration * percent;
                audioPlayer.currentTime = newTime;
            }
        });
        
        if (isMobile) {
            progressBar.style.height = '10px';
            progressBar.style.cursor = 'pointer';
        }
    }
    
    // Inicialmente desabilitar controles
    enableControls(false);
    
    if (isMobile) {
        setTimeout(() => {
            showNotification('🔊 Toque na tela primeiro, depois em Play');
        }, 2000);
    }
}

function enableControls(enabled) {
    console.log(`🎚️ ${enabled ? 'Habilitando' : 'Desabilitando'} controles...`);
    
    const buttons = ['playBtn', 'prevBtn', 'nextBtn', 'muteBtn', 'fullscreenBtn'];
    const slider = document.getElementById('volumeSlider');
    const progress = document.getElementById('progressBar');
    
    buttons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.disabled = !enabled;
            btn.style.opacity = enabled ? '1' : '0.5';
            btn.style.cursor = enabled ? 'pointer' : 'not-allowed';
        }
    });
    
    if (slider) {
        slider.disabled = !enabled;
        slider.style.opacity = enabled ? '1' : '0.5';
    }
    
    if (progress) {
        progress.style.cursor = enabled ? 'pointer' : 'not-allowed';
    }
}

function loadPlaylist() {
    const playlist = document.getElementById('playlist');
    if (!playlist) return;
    
    playlist.innerHTML = '';
    
    if (!CONFIG.musicPlaylist || CONFIG.musicPlaylist.length === 0) {
        playlist.innerHTML = '<div class="player-error">Adicione músicas na pasta "music/"</div>';
        return;
    }
    
    CONFIG.musicPlaylist.forEach((song, index) => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        if (index === currentTrackIndex) {
            item.classList.add('active');
        }
        
        item.innerHTML = `
            <span class="play-icon">${index === currentTrackIndex && isPlaying ? '▶️' : '🎵'}</span>
            <span class="song-title">${song.title}</span>
            <span class="song-duration">${song.duration}</span>
        `;
        
        item.addEventListener('click', () => {
            handleUserInteraction();
            
            if (!audioUnlocked && isMobile) {
                showAudioPermissionOverlay();
                return;
            }
            
            if (playerReady) {
                if (confirm(`Tocar "${song.title}"?`)) {
                    playTrack(index);
                }
            } else {
                showNotification('Aguarde o player carregar...');
            }
        });
        
        playlist.appendChild(item);
    });
}

// MODIFICADA: Adicionado parâmetro para não tocar automaticamente
function loadTrack(index, shouldPlay = false) {
    if (index < 0 || index >= CONFIG.musicPlaylist.length) {
        console.error('Índice inválido:', index);
        return;
    }
    
    currentTrackIndex = index;
    const track = CONFIG.musicPlaylist[index];
    
    if (audioPlayer) {
        console.log(`🎵 Carregando: ${track.title} (tocar: ${shouldPlay})`);
        
        // Parar áudio atual
        audioPlayer.pause();
        isPlaying = false;
        
        // Resetar fonte
        audioPlayer.src = '';
        
        setTimeout(() => {
            // Definir nova fonte
            audioPlayer.src = track.src;
            
            // Forçar carregamento
            audioPlayer.load();
            
            // Atualizar informações
            updateCurrentSongInfo();
            updatePlaylistUI();
            
            // Habilitar controles
            enableControls(true);
            
            // Mostrar notificação
            showNotification(`🎵 ${track.title} carregada`);
            
            // Só tocar se shouldPlay for true
            if (shouldPlay) {
                setTimeout(() => {
                    playAudio();
                }, 500);
            }
            
        }, 100);
    }
}

function playTrack(index) {
    // Carregar e tocar a música
    loadTrack(index, true);
}

function playCurrentTrack() {
    if (!audioPlayer || !playerReady) {
        console.log('Player não está pronto');
        showNotification('Carregando música...');
        return;
    }
    
    // Verificar se já tem fonte
    if (!audioPlayer.src && CONFIG.musicPlaylist.length > 0) {
        loadTrack(currentTrackIndex, true); // true = tocar após carregar
    } else {
        // Se a música terminou, voltar ao início
        if (audioPlayer.ended || audioPlayer.currentTime >= audioPlayer.duration) {
            audioPlayer.currentTime = 0;
        }
        playAudio();
    }
}

function playAudio() {
    if (!audioPlayer) return;
    
    // Verificar permissões em mobile
    if (isMobile && !audioUnlocked) {
        showAudioPermissionOverlay();
        return;
    }
    
    console.log('▶️ Tentando reproduzir áudio...');
    
    audioPlayer.play().then(() => {
        console.log('✅ Áudio reproduzindo com sucesso');
        isPlaying = true;
        
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            playBtn.title = 'Pausar';
        }
        
        const mobileBtn = document.getElementById('mobilePlayButton');
        if (mobileBtn) {
            mobileBtn.classList.remove('show');
        }
        
        const currentTrack = CONFIG.musicPlaylist[currentTrackIndex];
        if (currentTrack) {
            showNotification(`🎵 Tocando: ${currentTrack.title}`);
        }
        
    }).catch(error => {
        console.error('❌ Erro ao reproduzir áudio:', error);
        
        if (error.name === 'NotAllowedError') {
            console.log('🛑 Autoplay bloqueado - requer interação do usuário');
            
            if (isMobile) {
                showAudioPermissionOverlay();
            } else {
                showNotification('🔊 Clique no botão Play para iniciar');
            }
            
        } else if (error.name === 'NotSupportedError') {
            showNotification('❌ Formato de áudio não suportado');
        } else {
            console.error('Erro detalhado:', error);
            showNotification('⚠️ Erro ao reproduzir. Tente novamente.');
        }
    });
}

function playNextTrack() {
    if (CONFIG.musicPlaylist.length === 0) return;
    
    currentTrackIndex = (currentTrackIndex + 1) % CONFIG.musicPlaylist.length;
    loadTrack(currentTrackIndex, true); // true = tocar após carregar
}

function playPrevTrack() {
    if (CONFIG.musicPlaylist.length === 0) return;
    
    currentTrackIndex = (currentTrackIndex - 1 + CONFIG.musicPlaylist.length) % CONFIG.musicPlaylist.length;
    loadTrack(currentTrackIndex, true); // true = tocar após carregar
}

function toggleMute() {
    if (!audioPlayer) return;
    
    isMuted = !isMuted;
    
    if (isMuted) {
        audioPlayer.muted = true;
        document.getElementById('muteBtn').innerHTML = '<i class="fas fa-volume-mute"></i>';
        document.getElementById('muteBtn').title = 'Desmutar';
    } else {
        audioPlayer.muted = false;
        audioPlayer.volume = lastVolume / 100;
        document.getElementById('volumeSlider').value = lastVolume;
        document.getElementById('volumePercent').textContent = lastVolume + '%';
        document.getElementById('muteBtn').innerHTML = '<i class="fas fa-volume-up"></i>';
        document.getElementById('muteBtn').title = 'Mutar';
    }
}

function showSongInfo() {
    if (currentTrackIndex >= 0 && currentTrackIndex < CONFIG.musicPlaylist.length) {
        const song = CONFIG.musicPlaylist[currentTrackIndex];
        
        const modal = document.createElement('div');
        modal.className = 'song-info-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>🎵 ${song.title}</h3>
                <div class="song-details">
                    <p><strong>Artista:</strong> ${song.artist}</p>
                    <p><strong>Duração:</strong> ${song.duration}</p>
                    <p><strong>Formato:</strong> ${song.format || 'mp3'}</p>
                    <p><strong>Arquivo:</strong> ${song.src}</p>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn" onclick="if(confirm('Tocar música anterior?')) playPrevTrack()">
                        <i class="fas fa-step-backward"></i> Anterior
                    </button>
                    <button class="modal-btn" onclick="togglePlayPause()">
                        <i class="fas ${isPlaying ? 'fa-pause' : 'fa-play'}"></i> ${isPlaying ? 'Pausar' : 'Reproduzir'}
                    </button>
                    <button class="modal-btn" onclick="if(confirm('Tocar próxima música?')) playNextTrack()">
                        Próxima <i class="fas fa-step-forward"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.close-modal').onclick = () => modal.remove();
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
        
        document.addEventListener('keydown', function closeOnEscape(e) {
            if (e.key === 'Escape' && modal.parentNode) {
                modal.remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        });
    }
}

function togglePlayPause() {
    if (!playerReady || !audioPlayer) {
        showNotification('Player ainda não está pronto.');
        return;
    }
    
    handleUserInteraction();
    
    if (isPlaying) {
        audioPlayer.pause();
    } else {
        // Se a música terminou, voltar ao início
        if (audioPlayer.ended || audioPlayer.currentTime >= audioPlayer.duration) {
            audioPlayer.currentTime = 0;
        }
        playAudio();
    }
}

function updateProgressBar() {
    if (audioPlayer && audioPlayer.duration) {
        try {
            const currentTime = audioPlayer.currentTime;
            const duration = audioPlayer.duration;
            
            if (duration > 0) {
                const percent = (currentTime / duration) * 100;
                document.getElementById('progressFill').style.width = percent + '%';
                
                document.getElementById('currentTime').textContent = formatTime(currentTime);
                document.getElementById('duration').textContent = formatTime(duration);
            }
        } catch (error) {
            console.warn('Erro ao atualizar barra de progresso:', error);
        }
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

function updateCurrentSongInfo() {
    if (currentTrackIndex >= 0 && currentTrackIndex < CONFIG.musicPlaylist.length) {
        const song = CONFIG.musicPlaylist[currentTrackIndex];
        const songTitle = document.getElementById('songTitle');
        if (songTitle) {
            songTitle.textContent = `${song.title} - ${song.artist}`;
            songTitle.title = `${song.title} - ${song.artist}`;
        }
    }
}

function updatePlaylistUI() {
    const items = document.querySelectorAll('.playlist-item');
    items.forEach((item, index) => {
        item.classList.remove('active');
        const icon = item.querySelector('.play-icon');
        if (icon) {
            icon.textContent = '🎵';
        }
        
        if (index === currentTrackIndex) {
            item.classList.add('active');
            const icon = item.querySelector('.play-icon');
            if (icon) {
                icon.textContent = isPlaying ? '▶️' : '⏸️';
            }
        }
    });
}

// ===== GALERIA DE FOTOS =====
function loadGallery() {
    const photoGrid = document.getElementById('photoGrid');
    if (!photoGrid) return;
    
    photoGrid.innerHTML = '';
    
    CONFIG.photos.forEach(photo => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        
        photoItem.innerHTML = `
            <div class="image-container">
                <img 
                    src="${photo.src}" 
                    alt="${photo.alt}"
                    class="gallery-image"
                    loading="lazy"
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
        
        photoItem.addEventListener('click', () => {
            openPhotoModal(photo.src, photo.alt, photo.description);
        });
        
        photoGrid.appendChild(photoItem);
    });
}

// ===== CONTADOR DE TEMPO =====
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

        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };
        
        updateElement('years', years);
        updateElement('months', months);
        updateElement('days', days);
        updateElement('hours', hours);
        updateElement('minutes', minutes);
        updateElement('seconds', seconds);
        
        const messageElement = document.getElementById('loveMessage');
        if (messageElement) {
            messageElement.textContent = 
                `✨ Há ${years} anos, ${months} meses e ${days} dias compartilhando amor! ✨`;
        }
    }
}

// ===== NAVEGAÇÃO =====
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// ===== FORMULÁRIO =====
function handleSubmit(event) {
    event.preventDefault();
    const message = document.getElementById('message');
    
    if (message && message.value.trim()) {
        showNotification('💌 Mensagem de amor enviada!');
        saveMessage(message.value);
        message.value = '';
        createHeartExplosion();
    }
}

function saveMessage(message) {
    try {
        const messages = JSON.parse(localStorage.getItem('loveMessages') || '[]');
        messages.push({
            text: message,
            date: new Date().toISOString()
        });
        localStorage.setItem('loveMessages', JSON.stringify(messages));
    } catch (e) {
        console.log('Erro ao salvar mensagem:', e);
    }
}

// ===== FUNÇÕES AUXILIARES =====
function showNotification(text) {
    const oldNotifications = document.querySelectorAll('.notification');
    oldNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = text;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

function createHeartExplosion() {
    const hearts = isMobile ? 5 : 10;
    for (let i = 0; i < hearts; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.innerHTML = '💖';
            
            const randomX = (Math.random() * 200 - 100) + 'px';
            const randomY = (Math.random() * 200 - 100) + 'px';
            
            heart.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                font-size: ${isMobile ? '20px' : '30px'};
                pointer-events: none;
                z-index: 9998;
                transform: translate(-50%, -50%);
                animation: explode 1s ease-out forwards;
                --random-x: ${randomX};
                --random-y: ${randomY};
            `;
            
            document.body.appendChild(heart);
            setTimeout(() => {
                if (heart.parentNode) {
                    heart.remove();
                }
            }, 1000);
        }, i * 100);
    }
}

function openPhotoModal(src, alt, description) {
    const existingModal = document.querySelector('.photo-modal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'photo-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <img src="${src}" alt="${alt}">
            <div class="modal-info">
                <h3>${alt}</h3>
                <p>${description}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close-modal').onclick = () => modal.remove();
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
    
    const closeOnEscape = (e) => {
        if (e.key === 'Escape' && modal.parentNode) {
            modal.remove();
            document.removeEventListener('keydown', closeOnEscape);
        }
    };
    
    document.addEventListener('keydown', closeOnEscape);
}

function loadSettings() {
    try {
        const savedVolume = localStorage.getItem('musicVolume');
        if (savedVolume) {
            audioVolume = parseFloat(savedVolume);
        }
        
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            if (savedTheme === 'dark') {
                enableDarkMode();
            } else {
                enableLightMode();
            }
        }
    } catch (e) {
        console.log('Erro ao carregar configurações:', e);
    }
}

// ===== ATALHOS DE TECLADO =====
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        handleUserInteraction();
        if (playerReady) {
            if (isPlaying) {
                audioPlayer.pause();
            } else {
                if (audioPlayer.ended || audioPlayer.currentTime >= audioPlayer.duration) {
                    audioPlayer.currentTime = 0;
                }
                playAudio();
            }
        }
    }
    
    if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleUserInteraction();
        if (confirm('Tocar próxima música?')) {
            playNextTrack();
        }
    } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleUserInteraction();
        if (confirm('Tocar música anterior?')) {
            playPrevTrack();
        }
    }
    
    if (e.code === 'KeyM') {
        e.preventDefault();
        handleUserInteraction();
        toggleMute();
    }
    
    if (e.code === 'KeyI') {
        e.preventDefault();
        handleUserInteraction();
        showSongInfo();
    }
});

// ===== TOUCH GESTURES FOR MOBILE =====
if ('ontouchstart' in window) {
    let touchStartY = 0;
    const player = document.querySelector('.music-player');
    
    if (player) {
        player.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        player.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const diffY = touchStartY - touchEndY;
            
            if (Math.abs(diffY) > 50) {
                const playerContent = document.getElementById('playerContent');
                const playerToggle = document.getElementById('playerToggle');
                
                if (diffY > 0) {
                    playerContent.classList.add('expanded');
                    playerToggle.classList.add('rotated');
                } else {
                    playerContent.classList.remove('expanded');
                    playerToggle.classList.remove('rotated');
                }
            }
        }, { passive: true });
    }
}

// ===== FUNÇÃO DE DEBUG =====
function debugAudio() {
    console.log('=== DEBUG AUDIO ===');
    console.log('isMobile:', isMobile);
    console.log('userInteracted:', userInteracted);
    console.log('audioUnlocked:', audioUnlocked);
    console.log('Player:', audioPlayer);
    console.log('Player Ready:', playerReady);
    console.log('Is Playing:', isPlaying);
    console.log('Current Track:', currentTrackIndex);
    console.log('Src:', audioPlayer?.src);
    console.log('Ready State:', audioPlayer?.readyState);
    console.log('Error:', audioPlayer?.error);
    console.log('Volume:', audioPlayer?.volume);
    console.log('Muted:', audioPlayer?.muted);
    console.log('===================');
}

// Adicionar botão de debug (opcional, remover em produção)
document.addEventListener('DOMContentLoaded', function() {
    const debugBtn = document.createElement('button');
    debugBtn.textContent = '🔧 Debug';
    debugBtn.style.cssText = `
        position: fixed;
        bottom: 10px;
        left: 10px;
        z-index: 9999;
        background: #ff4444;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 12px;
        opacity: 0.5;
    `;
    debugBtn.addEventListener('click', debugAudio);
    document.body.appendChild(debugBtn);
});

console.log(`
`);