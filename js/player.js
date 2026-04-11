// ===== PLAYER DE ÁUDIO =====

let updateInterval = null;

function initializeAudioPlayer() {
    // Criar elemento de áudio
    App.audioPlayer = document.createElement('audio');
    App.audioPlayer.id = 'audio-player';
    App.audioPlayer.preload = 'auto';
    App.audioPlayer.crossOrigin = 'anonymous';
    App.audioPlayer.controls = false;
    App.audioPlayer.autoplay = false;
    App.audioPlayer.volume = App.audioVolume;
    
    const playerContent = document.getElementById('playerContent');
    if (playerContent) {
        playerContent.insertBefore(App.audioPlayer, playerContent.firstChild);
    }
    
    // Eventos do player
    App.audioPlayer.addEventListener('canplay', onAudioReady);
    App.audioPlayer.addEventListener('play', onAudioPlay);
    App.audioPlayer.addEventListener('pause', onAudioPause);
    App.audioPlayer.addEventListener('ended', onAudioEnded);
    App.audioPlayer.addEventListener('error', onAudioError);
    App.audioPlayer.addEventListener('timeupdate', onAudioTimeUpdate);
    App.audioPlayer.addEventListener('loadedmetadata', onAudioMetadataLoaded);
    App.audioPlayer.addEventListener('loadeddata', function() {
        App.playerReady = true;
        enableControls(true);
    });
    
    // Carregar playlist e configurar controles
    loadPlaylist();
    setupPlayerControls();
    
    // Configurar toggle do player (abrir/fechar)
    const playerToggle = document.getElementById('playerToggle');
    const playerContentDiv = document.getElementById('playerContent');
    
    if (playerToggle && playerContentDiv) {
        // Remover listeners antigos
        const newToggle = playerToggle.cloneNode(true);
        playerToggle.parentNode.replaceChild(newToggle, playerToggle);
        
        newToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            handleUserInteraction();
            
            // Alternar classes
            playerContentDiv.classList.toggle('expanded');
            this.classList.toggle('rotated');
            
            console.log('Player toggled:', playerContentDiv.classList.contains('expanded'));
        });
    }
    
    // Carregar primeira música
    if (CONFIG.musicPlaylist.length > 0) {
        loadTrack(0, false);
        updateCurrentSongInfo();
    } else {
        showNotification('Adicione músicas na playlist!');
    }
    
    console.log('✅ Player inicializado');
}

// Eventos do player
function onAudioReady() {
    App.playerReady = true;
    enableControls(true);
    updateProgressBar();
    
    const durationElement = document.getElementById('duration');
    if (durationElement && App.audioPlayer.duration) {
        durationElement.textContent = formatTime(App.audioPlayer.duration);
    }
}

function onAudioPlay() {
    App.isPlaying = true;
    
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
    App.isPlaying = false;
    
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
    App.isPlaying = false;
    
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        playBtn.title = 'Reproduzir';
    }
    
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
    
    const progressFill = document.getElementById('progressFill');
    if (progressFill) progressFill.style.width = '0%';
    
    const currentTime = document.getElementById('currentTime');
    if (currentTime) currentTime.textContent = '0:00';
}

function onAudioError(event) {
    console.error('Erro no áudio:', event);
    let errorMsg = 'Erro ao carregar a música. ';
    
    if (App.audioPlayer.error) {
        switch(App.audioPlayer.error.code) {
            case 1: errorMsg += 'Reprodução interrompida.'; break;
            case 2: errorMsg += 'Erro de rede.'; break;
            case 3: errorMsg += 'Arquivo corrompido.'; break;
            case 4: errorMsg += 'Formato não suportado.'; break;
            default: errorMsg += 'Erro desconhecido.';
        }
    }
    
    showNotification(errorMsg);
}

function onAudioTimeUpdate() {
    updateProgressBar();
}

function onAudioMetadataLoaded() {
    const durationElement = document.getElementById('duration');
    if (durationElement && App.audioPlayer.duration) {
        durationElement.textContent = formatTime(App.audioPlayer.duration);
    }
}

// Configurar controles do player
function setupPlayerControls() {
    // Play/Pause
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
        const newPlayBtn = playBtn.cloneNode(true);
        playBtn.parentNode.replaceChild(newPlayBtn, playBtn);
        
        newPlayBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            handleUserInteraction();
            
            if (!App.playerReady || !App.audioPlayer) {
                showNotification('Carregando música...');
                return;
            }
            
            if (App.isMobile && !App.audioUnlocked) {
                showAudioPermissionOverlay();
                return;
            }
            
            if (App.isPlaying) {
                App.audioPlayer.pause();
            } else {
                if (App.audioPlayer.ended || App.audioPlayer.currentTime >= App.audioPlayer.duration) {
                    App.audioPlayer.currentTime = 0;
                }
                playAudio();
            }
        });
    }
    
    // Próxima
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        const newNextBtn = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
        
        newNextBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            handleUserInteraction();
            playNextTrack();
        });
    }
    
    // Anterior
    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) {
        const newPrevBtn = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
        
        newPrevBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            handleUserInteraction();
            playPrevTrack();
        });
    }
    
    // Volume
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
        volumeSlider.value = App.audioVolume * 100;
        const volumePercent = document.getElementById('volumePercent');
        if (volumePercent) volumePercent.textContent = volumeSlider.value + '%';
        
        const newSlider = volumeSlider.cloneNode(true);
        volumeSlider.parentNode.replaceChild(newSlider, volumeSlider);
        
        newSlider.addEventListener('input', function(e) {
            handleUserInteraction();
            const volume = parseInt(e.target.value) / 100;
            if (App.audioPlayer) {
                App.audioPlayer.volume = volume;
                if (App.isMuted && volume > 0) {
                    App.isMuted = false;
                    const muteBtn = document.getElementById('muteBtn');
                    if (muteBtn) muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                }
                App.audioVolume = volume;
                const volPercent = document.getElementById('volumePercent');
                if (volPercent) volPercent.textContent = Math.round(volume * 100) + '%';
                App.lastVolume = volume * 100;
                localStorage.setItem('musicVolume', App.audioVolume);
            }
        });
    }
    
    // Mute
    const muteBtn = document.getElementById('muteBtn');
    if (muteBtn) {
        const newMuteBtn = muteBtn.cloneNode(true);
        muteBtn.parentNode.replaceChild(newMuteBtn, muteBtn);
        
        newMuteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            handleUserInteraction();
            toggleMute();
        });
    }
    
    // Info
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        const newFullscreenBtn = fullscreenBtn.cloneNode(true);
        fullscreenBtn.parentNode.replaceChild(newFullscreenBtn, fullscreenBtn);
        
        newFullscreenBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            handleUserInteraction();
            showSongInfo();
        });
    }
    
    // Barra de progresso
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        const newProgressBar = progressBar.cloneNode(true);
        progressBar.parentNode.replaceChild(newProgressBar, progressBar);
        
        newProgressBar.addEventListener('click', function(e) {
            handleUserInteraction();
            if (App.audioPlayer && App.audioPlayer.duration) {
                const rect = this.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                App.audioPlayer.currentTime = App.audioPlayer.duration * percent;
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
        if (index === App.currentTrackIndex) {
            item.classList.add('active');
        }
        
        item.innerHTML = `
            <span class="play-icon">${index === App.currentTrackIndex && App.isPlaying ? '▶️' : '🎵'}</span>
            <span class="song-title">${song.title}</span>
            <span class="song-duration">${song.duration}</span>
        `;
        
        item.addEventListener('click', function() {
            handleUserInteraction();
            
            if (App.isMobile && !App.audioUnlocked) {
                showAudioPermissionOverlay();
                return;
            }
            
            if (App.playerReady) {
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
    
    App.currentTrackIndex = index;
    const track = CONFIG.musicPlaylist[index];
    
    if (App.audioPlayer) {
        App.audioPlayer.pause();
        App.isPlaying = false;
        App.audioPlayer.src = '';
        
        setTimeout(() => {
            App.audioPlayer.src = track.src;
            App.audioPlayer.load();
            
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
    if (!App.audioPlayer || !App.playerReady) {
        showNotification('Carregando música...');
        return;
    }
    
    if (!App.audioPlayer.src && CONFIG.musicPlaylist.length > 0) {
        loadTrack(App.currentTrackIndex, true);
    } else {
        if (App.audioPlayer.ended || App.audioPlayer.currentTime >= App.audioPlayer.duration) {
            App.audioPlayer.currentTime = 0;
        }
        playAudio();
    }
}

function playAudio() {
    if (!App.audioPlayer) return;
    
    if (App.isMobile && !App.audioUnlocked) {
        showAudioPermissionOverlay();
        return;
    }
    
    App.audioPlayer.play().then(() => {
        App.isPlaying = true;
        
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            playBtn.title = 'Pausar';
        }
        
        const mobileBtn = document.getElementById('mobilePlayButton');
        if (mobileBtn) {
            mobileBtn.classList.remove('show');
        }
        
        const currentTrack = CONFIG.musicPlaylist[App.currentTrackIndex];
        if (currentTrack) {
            showNotification(`🎵 Tocando: ${currentTrack.title}`);
        }
        
    }).catch(error => {
        console.error('Erro ao reproduzir áudio:', error);
        if (error.name === 'NotAllowedError') {
            if (App.isMobile) {
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
    
    App.currentTrackIndex = (App.currentTrackIndex + 1) % CONFIG.musicPlaylist.length;
    loadTrack(App.currentTrackIndex, true);
}

function playPrevTrack() {
    if (CONFIG.musicPlaylist.length === 0) return;
    
    App.currentTrackIndex = (App.currentTrackIndex - 1 + CONFIG.musicPlaylist.length) % CONFIG.musicPlaylist.length;
    loadTrack(App.currentTrackIndex, true);
}

function toggleMute() {
    if (!App.audioPlayer) return;
    
    App.isMuted = !App.isMuted;
    
    const muteBtn = document.getElementById('muteBtn');
    
    if (App.isMuted) {
        App.audioPlayer.muted = true;
        if (muteBtn) {
            muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            muteBtn.title = 'Desmutar';
        }
    } else {
        App.audioPlayer.muted = false;
        App.audioPlayer.volume = App.lastVolume / 100;
        const volumeSlider = document.getElementById('volumeSlider');
        const volumePercent = document.getElementById('volumePercent');
        if (volumeSlider) volumeSlider.value = App.lastVolume;
        if (volumePercent) volumePercent.textContent = App.lastVolume + '%';
        if (muteBtn) {
            muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            muteBtn.title = 'Mutar';
        }
    }
}

function showSongInfo() {
    if (App.currentTrackIndex >= 0 && App.currentTrackIndex < CONFIG.musicPlaylist.length) {
        const song = CONFIG.musicPlaylist[App.currentTrackIndex];
        
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
                        <i class="fas ${App.isPlaying ? 'fa-pause' : 'fa-play'}"></i> ${App.isPlaying ? 'Pausar' : 'Reproduzir'}
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
    if (!App.playerReady || !App.audioPlayer) {
        showNotification('Player ainda não está pronto.');
        return;
    }
    
    handleUserInteraction();
    
    if (App.isPlaying) {
        App.audioPlayer.pause();
    } else {
        if (App.audioPlayer.ended || App.audioPlayer.currentTime >= App.audioPlayer.duration) {
            App.audioPlayer.currentTime = 0;
        }
        playAudio();
    }
}

function updateProgressBar() {
    if (App.audioPlayer && App.audioPlayer.duration) {
        try {
            const currentTime = App.audioPlayer.currentTime;
            const duration = App.audioPlayer.duration;
            
            if (duration > 0) {
                const percent = (currentTime / duration) * 100;
                const progressFill = document.getElementById('progressFill');
                const currentTimeEl = document.getElementById('currentTime');
                const durationEl = document.getElementById('duration');
                
                if (progressFill) progressFill.style.width = percent + '%';
                if (currentTimeEl) currentTimeEl.textContent = formatTime(currentTime);
                if (durationEl) durationEl.textContent = formatTime(duration);
            }
        } catch (error) {
            console.error('Erro ao atualizar progresso:', error);
        }
    }
}

function updateCurrentSongInfo() {
    if (App.currentTrackIndex >= 0 && App.currentTrackIndex < CONFIG.musicPlaylist.length) {
        const song = CONFIG.musicPlaylist[App.currentTrackIndex];
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
        
        if (index === App.currentTrackIndex) {
            item.classList.add('active');
            const icon = item.querySelector('.play-icon');
            if (icon) {
                icon.textContent = App.isPlaying ? '▶️' : '⏸️';
            }
        }
    });
}

// Exportar funções globais
window.initializeAudioPlayer = initializeAudioPlayer;
window.playCurrentTrack = playCurrentTrack;
window.playNextTrack = playNextTrack;
window.playPrevTrack = playPrevTrack;
window.togglePlayPause = togglePlayPause;
window.toggleMute = toggleMute;
window.showSongInfo = showSongInfo;

console.log('✅ Player carregado');