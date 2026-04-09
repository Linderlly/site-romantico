const CONFIG = {
    // Data do início do relacionamento (formato: 'YYYY-MM-DD')
    startDate: '2025-06-05',
    
    // Suas fotos (com fallback)
    photos: [
        { 
            src: "images/foto1.jpeg", 
            alt: "Melhores momentos",
            description: "Ao seu lado",
            fallback: "💖"
        },
        { 
            src: "images/foto2.jpeg", 
            alt: "Nossas idas ao cinema",
            description: "Momentos tornam-se inesquecíveis",
            fallback: "💕"
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
        },
        { 
            src: 'music/musica9.mp3', 
            title: 'All Of Me',
            artist: 'John Legend',
            duration: '5:07',
            format: 'mp3'
        },
        { 
            src: 'music/musica10.mp3', 
            title: 'Perfect',
            artist: 'Ed Sheeran',
            duration: '4:23',
            format: 'mp3'
        },
        { 
            src: 'music/musica11.mp3', 
            title: 'Sujeito Homem',
            artist: 'Guilherme e Benuto',
            duration: '3:04',
            format: 'mp3'
        }
    ],
    
    // Configuração do jardim das rosas
    garden: {
        totalRoses: 17,
        specialRoseIndex: 7,
        roseGrowth: 50,
        lastWatered: null,
        roseMessages: [
            "Nosso primeiro encontro",
            "As várias brincadeiras",
            "Aquele jantar especial",
            "Dia dos namorados",
            "Nosso aniversário",
            "Caminhada no parque",
            "Nosso primeiro beijo",
            "🌟 NOSSA ROSA DOURADA 🌟",
            "Conversas até tarde",
            "Aquele lanche da tarde",
            "Aquele café da manhã",
            "Dia chuvoso em casa",
            "Festa com amigos",
            "Projeto conjunto",
            "Idas ao cinema",
            "Todas as declarações",
            "Todos os presentes",
        ]
    }
};

let audioVolume = 0.7;
let isDarkMode = false;
let mouseX = 0;
let mouseY = 0;
let isMobile = false;
let userInteracted = false;
let audioUnlocked = false;

let wallMessages = [];
let currentWallIndex = 0;

let audioPlayer = null;
let currentTrackIndex = 0;
let isPlaying = false;
let playerReady = false;
let updateInterval = null;
let isMuted = false;
let lastVolume = 70;

let firebaseReady = false;
let firebaseInitialized = false;
let messagesUnsubscribe = null;

const offlineMessages = [];

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Inicializando Site Romântico...');
    
    // Verificar se é dispositivo móvel
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Mostrar loading mobile
    if (isMobile) {
        document.getElementById('mobileLoading').classList.remove('hidden');
    }
    
    // Carregar configurações salvas
    loadSettings();
    
    // Inicializar componentes básicos
    initializeThemeToggle();
    initializeMenu();
    loadGallery();
    initializeCursor();
    initializeHearts();
    
    // Carregar mensagens offline
    loadOfflineMessages();
    
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
    
    // Inicializar mural de mensagens
    initializeMessageWall();
    
    // Inicializar Firebase
    initializeFirebaseConnection();
    
    // Esconder loading após 2 segundos
    setTimeout(() => {
        document.getElementById('mobileLoading').classList.add('hidden');
        showNotification('🎵 Bem-vindo ao nosso site de amor!');
    }, 2000);
    
    // Mostrar botão de play mobile se for mobile
    if (isMobile) {
        setTimeout(() => {
            const mobileBtn = document.getElementById('mobilePlayButton');
            if (mobileBtn) {
                mobileBtn.classList.add('show');
            }
        }, 3000);
    }
    
    // Inicializar efeito de digitação
    initializeTypingEffect();
});

async function initializeFirebaseConnection() {
    console.log('Inicializando conexão com Firebase...');
    
    // Verificar se o módulo Firebase está disponível
    if (typeof window.firebaseApp === 'undefined') {
        firebaseReady = false;
        loadLocalMessages();
        return;
    }
    
    try {
        // Inicializar Firebase
        if (window.firebaseApp.initialize) {
            const initialized = window.firebaseApp.initialize();
            if (initialized) {
                firebaseReady = true;
                firebaseInitialized = true;
            }
        }
        
        // Configurar listener para mudanças de status
        setupFirebaseStatusListener();
        
        // Carregar mensagens iniciais
        loadFirebaseMessages();
        
    } catch (error) {
        firebaseReady = false;
        showNotification('📱 Modo offline ativado. Suas mensagens serão salvas localmente.');
        loadLocalMessages();
    }
}

function setupFirebaseStatusListener() {
    // Verificar periodicamente o status
    setInterval(() => {
        if (window.firebaseApp && window.firebaseApp.isConnected) {
            const isConn = window.firebaseApp.isConnected();
            if (isConn !== firebaseReady) {
                firebaseReady = isConn;
                
                if (firebaseReady) {
                    // Sincronizar mensagens offline
                    syncOfflineMessages();
                    // Recarregar mensagens
                    loadFirebaseMessages();
                }
            }
        }
    }, 5000);
}

function loadFirebaseMessages() {
    if (!window.firebaseApp || !window.firebaseApp.loadMessages) {
        loadLocalMessages();
        return;
    }
    
    try {
        // Cancelar listener anterior se existir
        if (messagesUnsubscribe && typeof messagesUnsubscribe === 'function') {
            messagesUnsubscribe();
        }
        
        // Carregar mensagens do Firestore
        messagesUnsubscribe = window.firebaseApp.loadMessages((messages) => {
            // Combinar com mensagens offline
            const allMessages = [...messages];
            
            // Adicionar mensagens offline que não estão na lista
            offlineMessages.forEach(offlineMsg => {
                const alreadyExists = allMessages.some(msg => 
                    msg.localSaved && msg.id === offlineMsg.id
                );
                if (!alreadyExists) {
                    allMessages.unshift(offlineMsg);
                }
            });
            
            // Ordenar por timestamp (mais recente primeiro)
            allMessages.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            
            wallMessages = allMessages;
            createMessageWall();
            
            // Sincronizar mensagens offline se houver conexão
            if (firebaseReady && offlineMessages.length > 0) {
                setTimeout(() => syncOfflineMessages(), 2000);
            }
        });
        
    } catch (error) {
        loadLocalMessages();
    }
}

function loadLocalMessages() {
    if (window.firebaseApp && window.firebaseApp.loadFromLocalStorage) {
        window.firebaseApp.loadFromLocalStorage((messages) => {
            wallMessages = messages;
            createMessageWall();
        });
    } else {
        // Fallback manual
        try {
            const savedMessages = JSON.parse(localStorage.getItem('loveMessages_offline')) || [];
            wallMessages = savedMessages;
            createMessageWall();
        } catch (e) {
            wallMessages = [];
            createMessageWall();
        }
    }
}

async function saveMessageToCloud(messageData) {
    // Adicionar timestamp
    const messageWithTimestamp = {
        ...messageData,
        timestamp: Date.now()
    };
    
    // Se o Firebase estiver pronto, tentar salvar na nuvem
    if (firebaseReady && window.firebaseApp && window.firebaseApp.addMessage) {
        try {
            showNotification('💾 Salvando mensagem no mural...');
            
            const result = await window.firebaseApp.addMessage(messageWithTimestamp);
            
            if (result && result.success) {
                // Recarregar mensagens para atualizar a interface
                setTimeout(() => loadFirebaseMessages(), 1000);
                
                return {
                    success: true,
                    messageId: result.messageId,
                    source: 'firebase'
                };
            }
        } catch (error) {
            // Continuar para salvar localmente
        }
    }
    
    // Salvar localmente como fallback
    const localId = saveMessageLocally(messageWithTimestamp);
    
    return {
        success: true,
        messageId: localId,
        source: 'local'
    };
}

function saveMessageLocally(messageData) {
    try {
        const localMessage = {
            ...messageData,
            id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            localSaved: true,
            localTimestamp: new Date().toISOString(),
            syncStatus: 'pending'
        };
        
        // Adicionar ao array de mensagens offline
        offlineMessages.unshift(localMessage);
        
        // Salvar no localStorage
        const savedMessages = JSON.parse(localStorage.getItem('loveMessages_offline')) || [];
        savedMessages.unshift(localMessage);
        
        // Limitar a 100 mensagens
        if (savedMessages.length > 100) {
            savedMessages.length = 100;
        }
        
        localStorage.setItem('loveMessages_offline', JSON.stringify(savedMessages));
        
        // Atualizar mural imediatamente
        wallMessages.unshift(localMessage);
        createMessageWall();
        
        return localMessage.id;
        
    } catch (e) {
        showNotification('⚠️ Erro ao salvar a mensagem. Tente novamente.');
        return null;
    }
}

async function syncOfflineMessages() {
    if (!firebaseReady || !window.firebaseApp || !window.firebaseApp.syncOfflineMessages) {
        return;
    }
    
    try {
        if (offlineMessages.length > 0) {
            await window.firebaseApp.syncOfflineMessages();
            
            // Recarregar mensagens após sincronização
            setTimeout(() => loadFirebaseMessages(), 1000);
        }
    } catch (error) {
    }
}

function loadOfflineMessages() {
    try {
        const savedMessages = JSON.parse(localStorage.getItem('loveMessages_offline')) || [];
        offlineMessages.length = 0; // Limpar array
        offlineMessages.push(...savedMessages);
        
        return savedMessages;
    } catch (e) {
        return [];
    }
}

function initializeMessageWall() {
    // Configurar botão de adicionar mensagem
    const addMessageBtn = document.getElementById('addMessageBtn');
    const addMessageModal = document.getElementById('addMessageModal');
    const cancelMessageBtn = document.getElementById('cancelMessageBtn');
    const newMessageForm = document.getElementById('newMessageForm');
    const closeModal = addMessageModal.querySelector('.close-modal');
    
    if (addMessageBtn && addMessageModal) {
        addMessageBtn.addEventListener('click', () => {
            addMessageModal.classList.add('active');
            // Preencher data atual por padrão
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('messageDate').value = today;
            // Selecionar primeira cor por padrão
            const firstColor = document.querySelector('.color-option');
            if (firstColor) {
                firstColor.classList.add('active');
            }
            // Preencher autor com valor padrão
            document.getElementById('messageAuthor').value = 'Seu Amor';
        });
        
        closeModal.addEventListener('click', () => {
            addMessageModal.classList.remove('active');
            newMessageForm.reset();
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
        });
        
        cancelMessageBtn.addEventListener('click', () => {
            addMessageModal.classList.remove('active');
            newMessageForm.reset();
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
        });
        
        addMessageModal.addEventListener('click', (e) => {
            if (e.target === addMessageModal) {
                addMessageModal.classList.remove('active');
                newMessageForm.reset();
                document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
            }
        });
        
        // Selecionar cor
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', function() {
                document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // Formulário de nova mensagem
        newMessageForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const title = document.getElementById('messageTitle').value;
            const content = document.getElementById('messageContent').value;
            const dateInput = document.getElementById('messageDate').value;
            const selectedColor = document.querySelector('.color-option.active')?.dataset.color || '#ffebee';
            const author = document.getElementById('messageAuthor').value || 'Anônimo';
            
            // Formatar data
            let formattedDate;
            if (dateInput) {
                const date = new Date(dateInput);
                formattedDate = date.toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
            } else {
                formattedDate = new Date().toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
            }
            
            // Criar objeto da mensagem
            const newMessage = {
                title: title,
                content: content,
                date: formattedDate,
                color: selectedColor,
                author: author
            };
            
            try {
                // Fechar modal
                addMessageModal.classList.remove('active');
                newMessageForm.reset();
                document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
                
                // Salvar mensagem
                const result = await saveMessageToCloud(newMessage);
                
                if (result.success) {
                    if (result.source === 'firebase') {
                        showNotification('💌 Mensagem salva no mural!');
                    } else {
                        showNotification('📱 Mensagem salva localmente! Será sincronizada quando a conexão voltar.');
                    }
                    createHeartExplosion();
                } else {
                    showNotification('❌ Erro ao salvar a mensagem. Tente novamente.');
                }
                
            } catch (error) {
                showNotification('❌ Erro ao processar a mensagem.');
            }
        });
    }
    
    // Configurar navegação do mural
    setupWallNavigation();
    
    // Mostrar estado inicial do mural
    createMessageWall();
}

window.updateMessageWall = function(messages) {
    // Combinar com mensagens offline
    const allMessages = [...messages];
    
    // Adicionar mensagens offline
    offlineMessages.forEach(offlineMsg => {
        const exists = allMessages.some(msg => 
            msg.id === offlineMsg.id || 
            (msg.localSaved && msg.localTimestamp === offlineMsg.localTimestamp)
        );
        if (!exists) {
            allMessages.unshift(offlineMsg);
        }
    });
    
    // Ordenar por timestamp
    allMessages.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    
    wallMessages = allMessages;
    createMessageWall();
};

function createMessageWall() {
    const wallContent = document.getElementById('wallContent');
    const wallIndicators = document.getElementById('wallIndicators');
    
    if (!wallContent) return;
    
    wallContent.innerHTML = '';
    wallIndicators.innerHTML = '';
    
    // Atualizar contador
    updateMessageCount(wallMessages.length);
    
    if (wallMessages.length === 0) {
        wallContent.innerHTML = `
            <div class="empty-message">
                <div style="font-size: 3rem; margin-bottom: 20px;">💌</div>
                <h3>Nenhuma mensagem ainda</h3>
                <p>Seja o primeiro a deixar uma mensagem de amor!</p>
                <p style="margin-top: 10px; font-size: 0.9rem; opacity: 0.7;">
                    Clique no botão "Adicionar Nova Mensagem"
                </p>
            </div>
        `;
        return;
    }
    
    // Criar cartões de mensagem
    wallMessages.forEach((message, index) => {
        const messageCard = document.createElement('div');
        messageCard.className = 'message-card';
        messageCard.style.backgroundColor = message.color || '#ffebee';
        messageCard.dataset.index = index;
        
        // Verificar se é mensagem local
        const isLocalMessage = message.localSaved || message.id?.startsWith('local_');
        
        // Limitar conteúdo
        let displayContent = message.content || '';
        if (displayContent.length > 300) {
            displayContent = displayContent.substring(0, 300) + '...';
        }
        
        messageCard.innerHTML = `
            <div class="message-header">
                <div class="message-date">
                    ${message.date || 'Data não informada'}
                    ${isLocalMessage ? ' <span style="color: #ff9800; font-size: 0.8em; margin-left: 5px;">(📱 Offline)</span>' : ''}
                </div>
                ${message.author ? `<span class="message-author">${message.author}</span>` : ''}
            </div>
            <div class="message-title">${message.title || 'Mensagem de Amor'}</div>
            <div class="message-text">${displayContent}</div>
            ${message.createdAt ? `<div class="message-time">Enviado em: ${formatDateTime(message.createdAt)}</div>` : 
              isLocalMessage ? `<div class="message-time" style="color: #ff9800;">Salvo localmente: ${formatDateTime(message.localTimestamp)}</div>` : ''}
            <div class="message-footer">Com todo meu amor 💖</div>
        `;
        
        messageCard.addEventListener('click', () => {
            if (isMobile) return;
            showFullMessage(message);
        });
        
        messageCard.style.opacity = '0';
        messageCard.style.transform = 'translateY(20px)';
        
        wallContent.appendChild(messageCard);
        
        setTimeout(() => {
            messageCard.style.transition = 'all 0.5s ease';
            messageCard.style.opacity = '1';
            messageCard.style.transform = 'translateY(0)';
        }, index * 100);
        
        // Criar indicador
        const indicator = document.createElement('div');
        indicator.className = 'wall-indicator';
        indicator.dataset.index = index;
        indicator.addEventListener('click', () => {
            goToWallMessage(index);
        });
        wallIndicators.appendChild(indicator);
    });
    
    updateWallIndicators();
    updateCurrentPosition();
    updateNavButtons();
    setupTouchEvents();
}

function updateMessageCount(count) {
    const countElement = document.getElementById('messageCount');
    if (countElement) {
        countElement.textContent = `${count} mensagem${count !== 1 ? 'es' : ''}`;
        if (!firebaseReady && count > 0) {
            countElement.innerHTML += ' <span style="color: #ff9800; font-size: 0.8em;">(Modo offline)</span>';
        }
    }
}

function setupTouchEvents() {
    const wallScroll = document.getElementById('wallScroll');
    if (!wallScroll || !isMobile) return;
    
    let startX = 0;
    let currentX = 0;
    let isSwiping = false;
    
    wallScroll.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isSwiping = true;
    }, { passive: true });
    
    wallScroll.addEventListener('touchmove', (e) => {
        if (!isSwiping) return;
        currentX = e.touches[0].clientX;
        const diffX = startX - currentX;
        
        if (Math.abs(diffX) > 30) {
            e.preventDefault();
        }
    }, { passive: false });
    
    wallScroll.addEventListener('touchend', () => {
        if (!isSwiping) return;
        
        const diffX = startX - currentX;
        
        if (Math.abs(diffX) > 50) {
            if (diffX > 0) {
                nextWallMessage();
            } else {
                prevWallMessage();
            }
        }
        
        isSwiping = false;
        startX = 0;
        currentX = 0;
    }, { passive: true });
}

function setupWallNavigation() {
    const prevBtn = document.getElementById('prevWallBtn');
    const nextBtn = document.getElementById('nextBtn');
    const mobilePrevBtn = document.getElementById('mobilePrevBtn');
    const mobileNextBtn = document.getElementById('mobileNextBtn');
    
    if (prevBtn) prevBtn.addEventListener('click', prevWallMessage);
    if (nextBtn) nextBtn.addEventListener('click', nextWallMessage);
    if (mobilePrevBtn) mobilePrevBtn.addEventListener('click', prevWallMessage);
    if (mobileNextBtn) mobileNextBtn.addEventListener('click', nextWallMessage);
    
    // Navegação por teclado
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
        
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevWallMessage();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextWallMessage();
        }
    });
}

function prevWallMessage() {
    if (currentWallIndex > 0) {
        currentWallIndex--;
        updateWallPosition();
    }
}

function nextWallMessage() {
    if (currentWallIndex < wallMessages.length - 1) {
        currentWallIndex++;
        updateWallPosition();
    }
}

function goToWallMessage(index) {
    if (index >= 0 && index < wallMessages.length) {
        currentWallIndex = index;
        updateWallPosition();
    }
}

function updateWallPosition() {
    const wallContent = document.getElementById('wallContent');
    if (!wallContent || wallMessages.length === 0) return;
    
    const cardWidth = 320;
    const offset = currentWallIndex * cardWidth;
    
    wallContent.style.transform = `translateX(-${offset}px)`;
    
    updateWallIndicators();
    updateCurrentPosition();
    updateNavButtons();
}

function updateWallIndicators() {
    const indicators = document.querySelectorAll('.wall-indicator');
    indicators.forEach((indicator, index) => {
        if (index === currentWallIndex) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

function updateCurrentPosition() {
    const positionElement = document.getElementById('currentPosition');
    if (positionElement && wallMessages.length > 0) {
        positionElement.textContent = `${currentWallIndex + 1} / ${wallMessages.length}`;
    } else if (positionElement) {
        positionElement.textContent = '0 / 0';
    }
}

function updateNavButtons() {
    const prevBtn = document.getElementById('prevWallBtn');
    const nextBtn = document.getElementById('nextBtn');
    const mobilePrevBtn = document.getElementById('mobilePrevBtn');
    const mobileNextBtn = document.getElementById('mobileNextBtn');
    
    if (prevBtn) prevBtn.disabled = currentWallIndex === 0;
    if (nextBtn) nextBtn.disabled = currentWallIndex === wallMessages.length - 1;
    if (mobilePrevBtn) mobilePrevBtn.disabled = currentWallIndex === 0;
    if (mobileNextBtn) mobileNextBtn.disabled = currentWallIndex === wallMessages.length - 1;
}

function formatDateTime(dateString) {
    try {
        if (!dateString) return 'Data desconhecida';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Data inválida';
        
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return 'Data desconhecida';
    }
}

function showFullMessage(message) {
    const modal = document.createElement('div');
    modal.className = 'full-message-modal';
    
    // NOVO: Verificar se está no modo escuro
    const isDarkMode = document.documentElement.classList.contains('dark-mode');
    
    modal.innerHTML = `
        <div class="modal-content" style="background: ${isDarkMode ? 'var(--card-bg)' : message.color || '#ffebee'}; color: ${isDarkMode ? 'var(--text-color)' : 'inherit'}">
            <span class="close-modal">&times;</span>
            <div class="message-header">
                <div class="message-date">
                    ${message.date || 'Data não informada'}
                    ${message.localSaved ? ' <span style="color: #ff9800; font-size: 0.9em;">(📱 Mensagem Offline)</span>' : ''}
                </div>
                ${message.author ? `<span class="message-author">${message.author}</span>` : ''}
            </div>
            <h3 style="color: ${isDarkMode ? 'var(--text-color)' : 'inherit'}">${message.title || 'Mensagem de Amor'}</h3>
            <div class="full-message-text" style="color: ${isDarkMode ? 'var(--text-color)' : 'inherit'}">${message.content || ''}</div>
            ${message.createdAt ? `<div class="message-time">Enviado em: ${formatDateTime(message.createdAt)}</div>` : 
              message.localSaved ? `<div class="message-time" style="color: #ff9800;">Salvo localmente em: ${formatDateTime(message.localTimestamp)}</div>` : ''}
            <div class="message-footer">Com todo meu amor 💖</div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const style = document.createElement('style');
    style.textContent = `
        .full-message-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9998;
            padding: 20px;
            animation: fadeIn 0.3s ease-out;
        }
        .full-message-modal .modal-content {
            background: white;
            border-radius: 20px;
            padding: 30px;
            max-width: 600px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
            animation: slideInUp 0.3s ease-out;
        }
        .full-message-text {
            font-size: 1.1rem;
            line-height: 1.6;
            margin: 20px 0;
            color: var(--text-color);
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .full-message-modal .close-modal {
            position: absolute;
            top: 15px;
            right: 15px;
            font-size: 24px;
            color: var(--text-color);
            cursor: pointer;
            background: none;
            border: none;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            border-radius: 50%;
        }
        .full-message-modal .close-modal:hover {
            color: var(--primary-color);
            background: var(--glass-bg);
        }
    `;
    document.head.appendChild(style);
    
    modal.querySelector('.close-modal').onclick = () => {
        modal.remove();
        style.remove();
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
            style.remove();
        }
    };
}

function handleResize() {
    const wasMobile = isMobile;
    isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (wasMobile !== isMobile) {
        // Recalcular layout se necessário
    }
    
    const cursor = document.getElementById('customCursor');
    if (isMobile && cursor) {
        cursor.style.display = 'none';
    } else if (!isMobile && cursor) {
        cursor.style.display = 'block';
    }
    
    CONFIG.hearts.maxHearts = isMobile ? 15 : 20;
}

function setupUserInteraction() {
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
                this.classList.remove('show');
            }
        });
    }
}

function handleUserInteraction() {
    if (!userInteracted) {
        userInteracted = true;
        audioUnlocked = true;
        
        const mobileBtn = document.getElementById('mobilePlayButton');
        if (mobileBtn) {
            mobileBtn.classList.remove('show');
        }
        
        showNotification('🎵 Áudio liberado! Clique em Play para ouvir');
    }
}

function showAudioPermissionOverlay() {
    if (!isMobile) return;
    
    const existingOverlay = document.querySelector('.audio-permission-overlay');
    if (existingOverlay) existingOverlay.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'audio-permission-overlay';
    overlay.innerHTML = `
        <div class="permission-content">
            <div style="font-size: 3rem; margin-bottom: 20px;">🔊</div>
            <h2>Permitir Áudio</h2>
            <p>Para ouvir as músicas do nosso amor, precisamos da sua permissão para reproduzir áudio.</p>
            <button class="permission-btn" id="allowAudioBtn">Permitir Reprodução de Áudio</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    overlay.querySelector('#allowAudioBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        
        const silentAudio = new Audio();
        silentAudio.volume = 0.001;
        
        silentAudio.play().then(() => {
            audioUnlocked = true;
            userInteracted = true;
            silentAudio.pause();
            silentAudio.currentTime = 0;
            overlay.remove();
            showNotification('✅ Áudio liberado! Agora clique em Play');
        }).catch(error => {
            showNotification('❌ Não foi possível obter permissão. Tente novamente.');
        });
    });
    
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

function initializeCursor() {
    if (isMobile) return;
    
    const cursor = document.getElementById('customCursor');
    if (!cursor) return;
    
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

function initializeHearts() {
    const container = document.getElementById('hearts-container');
    if (!container) return;
    
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
    if (!container) return;
    
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
    isDarkMode = true;
    
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = 'fas fa-sun';
    }
    
    localStorage.setItem('theme', 'dark');
}

function enableLightMode() {
    document.documentElement.classList.remove('dark-mode');
    isDarkMode = false;
    
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = 'fas fa-moon';
    }
    
    localStorage.setItem('theme', 'light');
}

function initializeGarden() {
    loadGardenData();
    createRoses();
    
    const waterBtn = document.getElementById('waterGarden');
    if (waterBtn) {
        waterBtn.addEventListener('click', waterGarden);
    }
    
    updateGardenStats();
    updateRoseGrowth();
}

function loadGardenData() {
    try {
        const savedGarden = JSON.parse(localStorage.getItem('loveGarden'));
        if (savedGarden) {
            CONFIG.garden.roseGrowth = savedGarden.roseGrowth || CONFIG.garden.roseGrowth;
            CONFIG.garden.lastWatered = savedGarden.lastWatered || CONFIG.garden.lastWatered;
            CONFIG.garden.specialRoseIndex = savedGarden.specialRoseIndex || CONFIG.garden.specialRoseIndex;
            
            if (CONFIG.garden.lastWatered) {
                const lastWateredDate = new Date(CONFIG.garden.lastWatered);
                const now = new Date();
                const hoursSinceWater = (now - lastWateredDate) / (1000 * 60 * 60);
                
                if (hoursSinceWater > 24 && CONFIG.garden.roseGrowth > 0) {
                    CONFIG.garden.roseGrowth = Math.max(0, CONFIG.garden.roseGrowth - 5);
                    saveGardenData();
                }
            }
        }
    } catch (e) {
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
    }
}

function createRoses() {
    const gardenContainer = document.getElementById('gardenContainer');
    if (!gardenContainer) return;
    
    gardenContainer.innerHTML = '';
    
    for (let i = 0; i < CONFIG.garden.totalRoses; i++) {
        const isSpecial = i === CONFIG.garden.specialRoseIndex;
        
        const roseItem = document.createElement('div');
        roseItem.className = 'rose-item';
        roseItem.dataset.index = i;
        
        const leafLeft = Math.random() * 15 + 10;
        const leafRight = Math.random() * 15 + 10;
        
        roseItem.innerHTML = `
            <div class="rose ${isSpecial ? 'rose-special' : 'rose-normal'}">
                ${isSpecial ? '🏵️' : '🌹'}
            </div>
            <div class="rose-stem"></div>
            <div class="rose-leaf left" style="bottom: ${leafLeft}px;"></div>
            <div class="rose-leaf right" style="bottom: ${leafRight}px;"></div>
            <div class="rose-tooltip">${CONFIG.garden.roseMessages[i] || `Rosa ${i + 1}`}</div>
        `;
        
        roseItem.addEventListener('click', () => onRoseClick(i, isSpecial));
        
        roseItem.style.opacity = '0';
        roseItem.style.transform = 'translateY(20px)';
        
        gardenContainer.appendChild(roseItem);
        
        setTimeout(() => {
            roseItem.style.transition = 'all 0.5s ease';
            roseItem.style.opacity = '1';
            roseItem.style.transform = 'translateY(0)';
        }, i * 100);
    }
}

function onRoseClick(index, isSpecial) {
    const message = CONFIG.garden.roseMessages[index] || `Rosa ${index + 1}`;
    
    if (isSpecial) {
        showNotification(`💖 ${message} - Nossa rosa mais especial!`);
        
        const specialRose = document.querySelector(`.rose-item[data-index="${index}"] .rose`);
        if (specialRose) {
            specialRose.style.animation = 'none';
            setTimeout(() => {
                specialRose.style.animation = 'specialRoseGlow 2s infinite alternate';
            }, 10);
        }
        
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
    
    createRoseClickEffect(index);
}

function createRoseClickEffect(index) {
    const roseItem = document.querySelector(`.rose-item[data-index="${index}"]`);
    if (!roseItem) return;
    
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
    const lastWatered = CONFIG.garden.lastWatered ? new Date(CONFIG.garden.lastWatered) : null;
    const today = new Date();
    
    if (lastWatered && 
        lastWatered.getDate() === today.getDate() &&
        lastWatered.getMonth() === today.getMonth() &&
        lastWatered.getFullYear() === today.getFullYear()) {
        
        showNotification('💧 Você já regou o jardim hoje! Volte amanhã.');
        return;
    }
    
    CONFIG.garden.roseGrowth = Math.min(100, CONFIG.garden.roseGrowth + 10);
    CONFIG.garden.lastWatered = today.toISOString();
    
    saveGardenData();
    updateRoseGrowth();
    updateGardenStats();
    createWaterEffect();
    
    const growth = CONFIG.garden.roseGrowth;
    let message = '';
    
    if (growth >= 100) {
        message = '🎉 Nossa rosa dourada está completamente crescida! Amor perfeito!';
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
    animateRosesAfterWatering();
}

function createWaterEffect() {
    const gardenContainer = document.getElementById('gardenContainer');
    if (!gardenContainer) return;
    
    for (let i = 0; i < 3; i++) {
        const waterEffect = document.createElement('div');
        waterEffect.className = 'water-effect';
        
        const rect = gardenContainer.getBoundingClientRect();
        const x = rect.left + Math.random() * rect.width;
        const y = rect.top + Math.random() * rect.height;
        
        waterEffect.style.left = x + 'px';
        waterEffect.style.top = y + 'px';
        
        document.body.appendChild(waterEffect);
        
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
            
            const roseIcon = rose.querySelector('.rose');
            if (roseIcon) {
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
    const totalRoses = document.getElementById('totalRoses');
    if (totalRoses) {
        totalRoses.textContent = CONFIG.garden.totalRoses;
    }
    
    const specialRoses = document.getElementById('specialRoses');
    if (specialRoses) {
        specialRoses.textContent = '1';
    }
    
    const daysGrowing = document.getElementById('daysGrowing');
    if (daysGrowing && CONFIG.startDate) {
        const startDate = new Date(CONFIG.startDate);
        const today = new Date();
        const days = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
        daysGrowing.textContent = Math.max(0, days);
    }
}

function unlockGardenAchievement() {
    showNotification('🏆 Conquista desbloqueada: Jardineiro do Amor!');
    
    const specialMessage = document.getElementById('specialRoseMessage');
    if (specialMessage) {
        specialMessage.textContent = '✨ Nossa rosa dourada está perfeita! Ela desbloqueou uma surpresa especial para nós! ✨';
    }
    
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
            
            const startX = window.innerWidth / 2;
            const startY = window.innerHeight / 2;
            
            petal.style.left = startX + 'px';
            petal.style.top = startY + 'px';
            
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
                    onerror="handleImageError(this, '${photo.fallback || '💖'}')"
                >
                <div class="image-fallback" style="display: none;">
                    ${photo.fallback || '💕'} ${photo.alt}
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

// Função para tratar erro de imagem
window.handleImageError = function(imgElement, fallbackEmoji) {
    imgElement.style.display = 'none';
    const fallbackDiv = imgElement.nextElementSibling;
    if (fallbackDiv && fallbackDiv.classList.contains('image-fallback')) {
        fallbackDiv.style.display = 'flex';
        fallbackDiv.innerHTML = `${fallbackEmoji} ${imgElement.alt}`;
    }
};

function initializeAudioPlayer() {
    createAudioElement();
    loadPlaylist();
    setupPlayerControls();
    
    const playerToggle = document.getElementById('playerToggle');
    const playerContent = document.getElementById('playerContent');
    
    if (playerToggle && playerContent) {
        playerToggle.addEventListener('click', () => {
            playerContent.classList.toggle('expanded');
            playerToggle.classList.toggle('rotated');
            handleUserInteraction();
        });
    }
    
    if (CONFIG.musicPlaylist.length > 0) {
        loadTrack(currentTrackIndex, false);
        updateCurrentSongInfo();
    } else {
        showNotification('Adicione músicas na playlist!');
    }
}

function createAudioElement() {
    audioPlayer = document.createElement('audio');
    audioPlayer.id = 'audio-player';
    audioPlayer.preload = 'auto';
    audioPlayer.crossOrigin = 'anonymous';
    audioPlayer.controls = false;
    audioPlayer.autoplay = false;
    
    const playerContent = document.getElementById('playerContent');
    if (playerContent) {
        playerContent.insertBefore(audioPlayer, playerContent.firstChild);
    }
    
    audioPlayer.addEventListener('canplay', onAudioReady);
    audioPlayer.addEventListener('play', onAudioPlay);
    audioPlayer.addEventListener('pause', onAudioPause);
    audioPlayer.addEventListener('ended', onAudioEnded);
    audioPlayer.addEventListener('error', onAudioError);
    audioPlayer.addEventListener('timeupdate', onAudioTimeUpdate);
    audioPlayer.addEventListener('loadedmetadata', onAudioMetadataLoaded);
    audioPlayer.addEventListener('loadeddata', function() {
        playerReady = true;
        enableControls(true);
    });
    
    audioPlayer.volume = audioVolume;
}

function onAudioReady() {
    playerReady = true;
    enableControls(true);
    updateProgressBar();
    
    const durationElement = document.getElementById('duration');
    if (durationElement && audioPlayer.duration) {
        durationElement.textContent = formatTime(audioPlayer.duration);
    }
}

function onAudioPlay() {
    isPlaying = true;
    
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        playBtn.title = 'Pausar';
    }
    
    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(updateProgressBar, 100);
    
    updatePlaylistUI();
}

function onAudioPause() {
    isPlaying = false;
    
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        playBtn.title = 'Reproduzir';
    }
    
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
    
    updatePlaylistUI();
}

function onAudioEnded() {
    isPlaying = false;
    
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        playBtn.title = 'Reproduzir';
    }
    
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
    
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('currentTime').textContent = '0:00';
    
    showNotification('🎵 Música terminada. Clique em Play para repetir');
}

function onAudioError(event) {
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
}

function onAudioTimeUpdate() {
    updateProgressBar();
}

function onAudioMetadataLoaded() {
    const durationElement = document.getElementById('duration');
    if (durationElement && audioPlayer.duration) {
        durationElement.textContent = formatTime(audioPlayer.duration);
    }
}

function setupPlayerControls() {
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
                if (audioPlayer.ended || audioPlayer.currentTime >= audioPlayer.duration) {
                    audioPlayer.currentTime = 0;
                }
                playAudio();
            }
        });
    }
    
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            handleUserInteraction();
            playNextTrack();
        });
    }
    
    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            handleUserInteraction();
            playPrevTrack();
        });
    }
    
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
    
    const muteBtn = document.getElementById('muteBtn');
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            handleUserInteraction();
            toggleMute();
        });
    }
    
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            handleUserInteraction();
            showSongInfo();
        });
    }
    
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
    }
    
    enableControls(false);
}

function enableControls(enabled) {
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
                playTrack(index);
            } else {
                showNotification('Aguarde o player carregar...');
            }
        });
        
        playlist.appendChild(item);
    });
}

function loadTrack(index, shouldPlay = false) {
    if (index < 0 || index >= CONFIG.musicPlaylist.length) {
        return;
    }
    
    currentTrackIndex = index;
    const track = CONFIG.musicPlaylist[index];
    
    if (audioPlayer) {
        audioPlayer.pause();
        isPlaying = false;
        audioPlayer.src = '';
        
        setTimeout(() => {
            audioPlayer.src = track.src;
            audioPlayer.load();
            
            updateCurrentSongInfo();
            updatePlaylistUI();
            enableControls(true);
            
            showNotification(`🎵 ${track.title} carregada`);
            
            if (shouldPlay) {
                setTimeout(() => {
                    playAudio();
                }, 500);
            }
        }, 100);
    }
}

function playTrack(index) {
    loadTrack(index, true);
}

function playCurrentTrack() {
    if (!audioPlayer || !playerReady) {
        showNotification('Carregando música...');
        return;
    }
    
    if (!audioPlayer.src && CONFIG.musicPlaylist.length > 0) {
        loadTrack(currentTrackIndex, true);
    } else {
        if (audioPlayer.ended || audioPlayer.currentTime >= audioPlayer.duration) {
            audioPlayer.currentTime = 0;
        }
        playAudio();
    }
}

function playAudio() {
    if (!audioPlayer) return;
    
    if (isMobile && !audioUnlocked) {
        showAudioPermissionOverlay();
        return;
    }
    
    audioPlayer.play().then(() => {
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
        if (error.name === 'NotAllowedError') {
            if (isMobile) {
                showAudioPermissionOverlay();
            } else {
                showNotification('🔊 Clique no botão Play para iniciar');
            }
        } else if (error.name === 'NotSupportedError') {
            showNotification('❌ Formato de áudio não suportado');
        } else {
            showNotification('⚠️ Erro ao reproduzir. Tente novamente.');
        }
    });
}

function playNextTrack() {
    if (CONFIG.musicPlaylist.length === 0) return;
    
    currentTrackIndex = (currentTrackIndex + 1) % CONFIG.musicPlaylist.length;
    loadTrack(currentTrackIndex, true);
}

function playPrevTrack() {
    if (CONFIG.musicPlaylist.length === 0) return;
    
    currentTrackIndex = (currentTrackIndex - 1 + CONFIG.musicPlaylist.length) % CONFIG.musicPlaylist.length;
    loadTrack(currentTrackIndex, true);
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
                    <button class="modal-btn" onclick="playPrevTrack()">
                        <i class="fas fa-step-backward"></i> Anterior
                    </button>
                    <button class="modal-btn" onclick="togglePlayPause()">
                        <i class="fas ${isPlaying ? 'fa-pause' : 'fa-play'}"></i> ${isPlaying ? 'Pausar' : 'Reproduzir'}
                    </button>
                    <button class="modal-btn" onclick="playNextTrack()">
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

async function handleSubmit(event) {
    event.preventDefault();
    const message = document.getElementById('message');
    
    if (message && message.value.trim()) {
        const newMessage = {
            title: 'Mensagem do Formulário',
            content: message.value.trim(),
            author: 'Visitante',
            color: '#e8f5e8',
            date: new Date().toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })
        };
        
        try {
            const result = await saveMessageToCloud(newMessage);
            
            if (result.success) {
                if (result.source === 'firebase') {
                    showNotification('💌 Mensagem enviada para o mural de amor!');
                } else {
                    showNotification('📱 Mensagem salva localmente! Será sincronizada quando a conexão voltar.');
                }
                message.value = '';
                createHeartExplosion();
            } else {
                showNotification('❌ Erro ao enviar mensagem. Tente novamente.');
            }
            
        } catch (error) {
            showNotification('❌ Erro ao enviar mensagem.');
        }
    }
}

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
    
    document.addEventListener('keydown', function closeOnEscape(e) {
        if (e.key === 'Escape' && modal.parentNode) {
            modal.remove();
            document.removeEventListener('keydown', closeOnEscape);
        }
    });
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
    }
}

document.addEventListener('keydown', (e) => {
    // Verificar se o usuário está digitando em um campo de entrada
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return; // Não ativar atalhos quando estiver digitando
    }
    
    // Atalhos só funcionam quando o player está visível
    const playerContent = document.getElementById('playerContent');
    const isPlayerActive = playerContent && playerContent.classList.contains('expanded');
    
    if (e.code === 'Space' && isPlayerActive) {
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
    
    // Atalhos de navegação (só com Ctrl)
    if (e.ctrlKey) {
        if (e.code === 'ArrowRight') {
            e.preventDefault();
            handleUserInteraction();
            playNextTrack();
        } else if (e.code === 'ArrowLeft') {
            e.preventDefault();
            handleUserInteraction();
            playPrevTrack();
        }
    }
    
    // Atalho Mute (só com Ctrl)
    if (e.ctrlKey && e.code === 'KeyM') {
        e.preventDefault();
        handleUserInteraction();
        toggleMute();
    }
    
    // Atalho Info (só com Ctrl)
    if (e.ctrlKey && e.code === 'KeyI') {
        e.preventDefault();
        handleUserInteraction();
        showSongInfo();
    }
});


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

window.saveMessageToCloud = saveMessageToCloud;
window.syncOfflineMessages = syncOfflineMessages;
window.togglePlayPause = togglePlayPause;
window.playNextTrack = playNextTrack;
window.playPrevTrack = playPrevTrack;
window.showSongInfo = showSongInfo;
window.handleImageError = handleImageError;

// ===== EFEITO DE DIGITAÇÃO =====
function initializeTypingEffect() {
    const titleElement = document.getElementById('typingTitle');
    if (!titleElement) return;
    
    // Salva o texto original
    const originalText = titleElement.innerHTML;
    
    // Limpa o título e prepara para a digitação
    titleElement.innerHTML = '';
    let i = 0;
    
    function typeWriter() {
        if (i < originalText.length) {
            titleElement.innerHTML = originalText.substring(0, i + 1) + '<span class="typing-cursor"></span>';
            i++;
            setTimeout(typeWriter, 100);
        } else {
            // Mantém o cursor piscando por mais 2 segundos e depois remove suavemente
            setTimeout(() => {
                const cursor = titleElement.querySelector('.typing-cursor');
                if (cursor) {
                    cursor.style.animation = 'none';
                    cursor.style.opacity = '0';
                }
            }, 2000);
        }
    }
    
    // Inicia o efeito após um pequeno delay
    setTimeout(typeWriter, 500);
}

console.log('Script.js carregado com sucesso!');