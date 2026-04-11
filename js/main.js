// ===== ARQUIVO PRINCIPAL =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando...');
    
    App.isMobile = checkIfMobile();
    
    hideLoading();
    setTimeout(hideLoading, 2000);
    setTimeout(hideLoading, 5000);
    
    loadSettings();
    initializeThemeToggle();
    initializeMenu();
    initializeCursor();
    initializeHearts();
    
    // Inicializar sistemas
    loadGallery();
    initializeGarden();
    initializeMessageWall();
    initializeAudioPlayer();
    
    initializeFirebase();
    setupUploadForm();
    
    // Contador de tempo
    updateTimeTogether();
    setInterval(updateTimeTogether, 1000);
    
    window.addEventListener('resize', handleResize);
    setupUserInteraction();
    
    setTimeout(() => {
        hideLoading();
        showNotification('🎵 Bem-vindo!');
        if (App.isMobile) {
            const btn = document.getElementById('mobilePlayButton');
            if (btn) btn.classList.add('show');
        }
    }, 2000);
    
    initializeTypingEffect();
    console.log('✅ Pronto!');
});

function loadSettings() {
    try {
        const v = localStorage.getItem('musicVolume');
        if (v) App.audioVolume = parseFloat(v);
        const t = localStorage.getItem('theme');
        if (t === 'dark') enableDarkMode(); 
        else if (t === 'light') enableLightMode();
        else if (window.matchMedia('(prefers-color-scheme: dark)').matches) enableDarkMode();
    } catch (e) {}
}

async function initializeFirebase() {
    if (typeof window.firebaseApp === 'undefined') return;
    try {
        if (window.firebaseApp.initialize) {
            App.firebaseReady = window.firebaseApp.initialize();
            App.firebasePhotosReady = true;
        }
    } catch (e) {
        console.error('Erro Firebase:', e);
    }
}

function initializeMenu() {
    const toggle = document.getElementById('menuToggle');
    const menu = document.getElementById('mobileMenu');
    if (!toggle || !menu) return;
    
    toggle.addEventListener('click', () => { 
        menu.classList.toggle('active'); 
        toggle.innerHTML = menu.classList.contains('active') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>'; 
    });
    
    menu.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { 
        menu.classList.remove('active'); 
        toggle.innerHTML = '<i class="fas fa-bars"></i>'; 
    }));
}

function initializeThemeToggle() {
    const btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', () => App.isDarkMode ? enableLightMode() : enableDarkMode());
}

function enableDarkMode() { 
    document.documentElement.classList.add('dark-mode'); 
    App.isDarkMode = true; 
    const icon = document.querySelector('#themeToggle i');
    if (icon) icon.className = 'fas fa-sun'; 
    localStorage.setItem('theme', 'dark'); 
}

function enableLightMode() { 
    document.documentElement.classList.remove('dark-mode'); 
    App.isDarkMode = false; 
    const icon = document.querySelector('#themeToggle i');
    if (icon) icon.className = 'fas fa-moon'; 
    localStorage.setItem('theme', 'light'); 
}

function initializeCursor() {
    if (App.isMobile) return;
    const cursor = document.getElementById('customCursor');
    if (!cursor) return;
    cursor.style.display = 'block';
    document.addEventListener('mousemove', (e) => { 
        cursor.style.left = e.clientX + 'px'; 
        cursor.style.top = e.clientY + 'px'; 
    });
}

function initializeHearts() {
    const container = document.getElementById('hearts-container');
    if (!container) return;
    for (let i = 0; i < (App.isMobile ? 10 : 20); i++) {
        setTimeout(createFloatingHeart, i * 300);
    }
    setInterval(createFloatingHeart, App.isMobile ? 2000 : 1500);
}

function createFloatingHeart() {
    const container = document.getElementById('hearts-container');
    if (!container || container.children.length > 40) return;
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.innerHTML = CONFIG.hearts.emojis[Math.floor(Math.random() * CONFIG.hearts.emojis.length)];
    heart.style.cssText = `
        left: ${Math.random() * window.innerWidth}px;
        top: ${window.innerHeight + 20}px;
        font-size: ${15 + Math.random() * 15}px;
        animation: heartFloat ${10 + Math.random() * 15}s linear forwards;
        color: ${getRandomHeartColor()};
    `;
    container.appendChild(heart);
    setTimeout(() => heart.remove(), 25000);
}

function setupUserInteraction() {
    ['click', 'touchstart'].forEach(e => {
        document.addEventListener(e, () => { 
            if (!App.userInteracted) { 
                App.userInteracted = true; 
                App.audioUnlocked = true; 
            } 
        }, { once: true });
    });
}

function updateTimeTogether() {
    const diff = Date.now() - new Date(CONFIG.startDate).getTime();
    if (diff <= 0) return;
    
    const y = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    const mo = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    const d = Math.floor((diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    
    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl('years', y);
    setEl('months', mo);
    setEl('days', d);
    setEl('hours', h);
    setEl('minutes', m);
    setEl('seconds', s);
    
    const msg = document.getElementById('loveMessage');
    if (msg) msg.textContent = `✨ Há ${y} anos, ${mo} meses e ${d} dias compartilhando amor! ✨`;
}

function initializeTypingEffect() {
    const el = document.getElementById('typingTitle');
    if (!el) return;
    const text = el.innerHTML; 
    el.innerHTML = ''; 
    let i = 0;
    function type() { 
        if (i < text.length) { 
            el.innerHTML = text.substring(0, i + 1) + '<span class="typing-cursor"></span>'; 
            i++; 
            setTimeout(type, 100); 
        } 
    }
    setTimeout(type, 500);
}

function handleResize() { 
    App.isMobile = checkIfMobile(); 
}

// Handlers globais
window.scrollToSection = scrollToSection;
window.handleSubmit = async function(event) {
    event.preventDefault();
    const msgInput = document.getElementById('message');
    if (!msgInput || !msgInput.value.trim()) return;
    
    const newMessage = {
        title: 'Mensagem do Formulário',
        content: msgInput.value.trim(),
        author: 'Visitante',
        color: '#e8f5e8',
        date: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    };
    
    if (App.firebaseReady && window.firebaseApp?.addMessage) {
        try {
            await window.firebaseApp.addMessage({ ...newMessage, timestamp: Date.now() });
            showNotification('💌 Mensagem enviada!');
        } catch (e) {
            showNotification('📱 Salva localmente');
        }
    } else {
        showNotification('📱 Salva localmente');
    }
    
    msgInput.value = '';
    createHeartExplosion();
    if (typeof loadMessages === 'function') loadMessages();
};

console.log('✅ Main carregado');