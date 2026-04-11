// ===== SISTEMA DE MENSAGENS =====

let messagesUnsubscribe = null;

function initializeMessageWall() {
    const addBtn = document.getElementById('addMessageBtn');
    const modal = document.getElementById('addMessageModal');
    const form = document.getElementById('newMessageForm');
    
    if (addBtn && modal) {
        addBtn.addEventListener('click', () => {
            modal.classList.add('active');
            document.getElementById('messageDate').value = new Date().toISOString().split('T')[0];
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
            document.querySelector('.color-option')?.classList.add('active');
            document.getElementById('messageAuthor').value = 'Seu Amor';
        });
        
        modal.querySelector('.close-modal').addEventListener('click', () => { modal.classList.remove('active'); form.reset(); });
        document.getElementById('cancelMessageBtn').addEventListener('click', () => { modal.classList.remove('active'); form.reset(); });
        
        document.querySelectorAll('.color-option').forEach(o => {
            o.addEventListener('click', function() {
                document.querySelectorAll('.color-option').forEach(x => x.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('messageTitle').value;
            const content = document.getElementById('messageContent').value;
            const dateInput = document.getElementById('messageDate').value;
            const color = document.querySelector('.color-option.active')?.dataset.color || '#ffebee';
            const author = document.getElementById('messageAuthor').value || 'Anônimo';
            
            let formattedDate;
            if (dateInput) { 
                const d = new Date(dateInput); 
                d.setDate(d.getDate() + 1); // Corrigir timezone
                formattedDate = d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }); 
            } else {
                formattedDate = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
            }
            
            modal.classList.remove('active'); 
            form.reset();
            
            const msg = { title, content, date: formattedDate, color, author, timestamp: Date.now() };
            
            if (App.firebaseReady && window.firebaseApp?.addMessage) {
                try {
                    await window.firebaseApp.addMessage(msg);
                    showNotification('💌 Mensagem salva!');
                } catch (e) {
                    saveMessageLocally(msg);
                    showNotification('📱 Salva localmente');
                }
            } else {
                saveMessageLocally(msg);
                showNotification('📱 Salva localmente');
            }
            
            createHeartExplosion();
            loadMessages();
        });
    }
    
    setupWallNavigation();
    loadMessages();
}

function saveMessageLocally(data) {
    const local = { 
        ...data, 
        id: `local_${Date.now()}`, 
        localSaved: true, 
        localTimestamp: new Date().toISOString(), 
        syncStatus: 'pending' 
    };
    App.offlineMessages.unshift(local);
    const saved = JSON.parse(localStorage.getItem('loveMessages_offline') || '[]');
    saved.unshift(local); 
    if (saved.length > 100) saved.length = 100;
    localStorage.setItem('loveMessages_offline', JSON.stringify(saved));
}

function loadMessages() {
    if (window.firebaseApp?.loadMessages) {
        if (messagesUnsubscribe) messagesUnsubscribe();
        messagesUnsubscribe = window.firebaseApp.loadMessages((msgs) => {
            const all = [...msgs];
            // Carregar mensagens offline
            try {
                const offline = JSON.parse(localStorage.getItem('loveMessages_offline') || '[]');
                offline.forEach(om => { 
                    if (!all.some(m => m.id === om.id)) all.unshift(om); 
                });
            } catch (e) {}
            
            all.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            App.wallMessages = all;
            createMessageWall();
        });
    } else {
        try { 
            App.wallMessages = JSON.parse(localStorage.getItem('loveMessages_offline') || '[]'); 
        } catch (e) { 
            App.wallMessages = []; 
        }
        createMessageWall();
    }
}

function createMessageWall() {
    const content = document.getElementById('wallContent');
    const indicators = document.getElementById('wallIndicators');
    if (!content) return;
    
    content.innerHTML = ''; 
    indicators.innerHTML = '';
    
    const countEl = document.getElementById('messageCount');
    if (countEl) countEl.textContent = `${App.wallMessages.length} mensagem${App.wallMessages.length !== 1 ? 'es' : ''}`;
    
    if (!App.wallMessages.length) {
        content.innerHTML = `<div class="empty-message"><div style="font-size:3rem;">💌</div><h3>Nenhuma mensagem</h3><p>Seja o primeiro!</p></div>`;
        return;
    }
    
    App.wallMessages.forEach((msg, i) => {
        const card = document.createElement('div');
        card.className = 'message-card';
        card.style.backgroundColor = msg.color || '#ffebee';
        const isLocal = msg.localSaved;
        let disp = msg.content || ''; 
        if (disp.length > 300) disp = disp.substring(0, 300) + '...';
        
        card.innerHTML = `
            <div class="message-header">
                <div class="message-date">${msg.date || ''}${isLocal ? ' <span style="color:#ff9800;">(📱 Offline)</span>' : ''}</div>
                ${msg.author ? `<span class="message-author">${msg.author}</span>` : ''}
            </div>
            <div class="message-title">${msg.title || ''}</div>
            <div class="message-text">${disp}</div>
            <div class="message-footer">Com todo meu amor 💖</div>
        `;
        card.addEventListener('click', () => { if (!App.isMobile) showFullMessage(msg); });
        content.appendChild(card);
        
        const ind = document.createElement('div');
        ind.className = 'wall-indicator';
        ind.addEventListener('click', () => goToWallMessage(i));
        indicators.appendChild(ind);
    });
    
    updateWallIndicators(); 
    updateCurrentPosition(); 
    updateNavButtons();
}

function setupWallNavigation() {
    document.getElementById('prevWallBtn')?.addEventListener('click', () => { 
        if (App.currentWallIndex > 0) { App.currentWallIndex--; updateWallPosition(); } 
    });
    document.getElementById('nextWallBtn')?.addEventListener('click', () => { 
        if (App.currentWallIndex < App.wallMessages.length - 1) { App.currentWallIndex++; updateWallPosition(); } 
    });
}

function goToWallMessage(i) { 
    if (i >= 0 && i < App.wallMessages.length) { 
        App.currentWallIndex = i; 
        updateWallPosition(); 
    } 
}

function updateWallPosition() { 
    const c = document.getElementById('wallContent');
    if (c) c.style.transform = `translateX(-${App.currentWallIndex * 320}px)`; 
    updateWallIndicators(); 
    updateCurrentPosition(); 
    updateNavButtons(); 
}

function updateWallIndicators() { 
    document.querySelectorAll('.wall-indicator').forEach((ind, i) => ind.classList.toggle('active', i === App.currentWallIndex)); 
}

function updateCurrentPosition() { 
    const el = document.getElementById('currentPosition'); 
    if (el && App.wallMessages.length) el.textContent = `${App.currentWallIndex + 1} / ${App.wallMessages.length}`; 
}

function updateNavButtons() {
    const p = document.getElementById('prevWallBtn'), n = document.getElementById('nextWallBtn');
    if (p) p.disabled = App.currentWallIndex === 0;
    if (n) n.disabled = App.currentWallIndex === App.wallMessages.length - 1;
}

function showFullMessage(msg) {
    const modal = document.createElement('div');
    modal.className = 'full-message-modal';
    modal.innerHTML = `
        <div class="modal-content" style="background:${msg.color || '#ffebee'}">
            <span class="close-modal">&times;</span>
            <h3>${msg.title || ''}</h3>
            <div class="full-message-text">${msg.content || ''}</div>
            <div class="message-footer">Com todo meu amor 💖</div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.close-modal').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

window.initializeMessageWall = initializeMessageWall;
window.loadMessages = loadMessages;

console.log('✅ Messages carregado');