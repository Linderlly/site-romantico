// ===== FUNÇÕES UTILITÁRIAS =====

function showNotification(text) {
    document.querySelectorAll('.notification').forEach(n => n.remove());
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = text;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function createHeartExplosion() {
    const hearts = App.isMobile ? 5 : 10;
    for (let i = 0; i < hearts; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.innerHTML = '💖';
            heart.style.cssText = `
                position: fixed; top: 50%; left: 50%; font-size: ${App.isMobile ? '20px' : '30px'};
                pointer-events: none; z-index: 9998; transform: translate(-50%, -50%);
                animation: explode 1s ease-out forwards;
                --random-x: ${(Math.random() * 200 - 100)}px;
                --random-y: ${(Math.random() * 200 - 100)}px;
            `;
            document.body.appendChild(heart);
            setTimeout(() => heart.remove(), 1000);
        }, i * 100);
    }
}

function formatDateTime(dateString) {
    try {
        if (!dateString) return 'Data desconhecida';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Data inválida';
        return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) { return 'Data desconhecida'; }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60), s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function scrollToSection(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) {
        const header = document.querySelector('.header').offsetHeight;
        const pos = el.getBoundingClientRect().top + window.pageYOffset - header;
        window.scrollTo({ top: pos, behavior: 'smooth' });
    }
}

function checkIfMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
}

function compressImage(base64, maxWidth = 800) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let w = img.width, h = img.height;
            if (w > maxWidth) { h = (maxWidth / w) * h; w = maxWidth; }
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = base64;
    });
}

function getRandomHeartColor() {
    const colors = ['#ff4081', '#e91e63', '#ff6b9d', '#ff8e8e', '#ff9a9e'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function handleImageError(img, fallback) {
    img.style.display = 'none';
    const fb = img.nextElementSibling;
    if (fb && fb.classList.contains('image-fallback')) {
        fb.style.display = 'flex';
        fb.innerHTML = `${fallback} ${img.alt}`;
    }
}

function hideLoading() {
    const el = document.getElementById('mobileLoading');
    if (el) el.classList.add('hidden');
}

function handleUserInteraction() {
    if (!App.userInteracted) {
        App.userInteracted = true;
        App.audioUnlocked = true;
        const btn = document.getElementById('mobilePlayButton');
        if (btn) btn.classList.remove('show');
    }
}

function showAudioPermissionOverlay() {
    if (!App.isMobile) return;
    document.querySelector('.audio-permission-overlay')?.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'audio-permission-overlay';
    overlay.innerHTML = `
        <div class="permission-content">
            <div style="font-size:3rem;margin-bottom:20px;">🔊</div>
            <h2>Permitir Áudio</h2>
            <p>Precisamos da sua permissão para reproduzir áudio.</p>
            <button class="permission-btn" id="allowAudioBtn">Permitir Áudio</button>
        </div>
    `;
    document.body.appendChild(overlay);
    
    document.getElementById('allowAudioBtn').addEventListener('click', () => {
        const audio = new Audio();
        audio.volume = 0.001;
        audio.play().then(() => {
            App.audioUnlocked = true;
            App.userInteracted = true;
            overlay.remove();
            showNotification('✅ Áudio liberado!');
        }).catch(() => showNotification('❌ Não foi possível liberar'));
    });
}

// Tornar globais
window.showNotification = showNotification;
window.createHeartExplosion = createHeartExplosion;
window.formatDateTime = formatDateTime;
window.formatTime = formatTime;
window.scrollToSection = scrollToSection;
window.checkIfMobile = checkIfMobile;
window.compressImage = compressImage;
window.getRandomHeartColor = getRandomHeartColor;
window.handleImageError = handleImageError;
window.hideLoading = hideLoading;
window.handleUserInteraction = handleUserInteraction;
window.showAudioPermissionOverlay = showAudioPermissionOverlay;

console.log('✅ Utils carregado');