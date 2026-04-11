// ===== CONFIGURAÇÕES GLOBAIS =====
const CONFIG = {
    startDate: '2025-06-05',
    
    photos: [
        { src: "images/foto1.jpeg", alt: "Melhores momentos", description: "Ao seu lado", fallback: "💖" },
        { src: "images/foto2.jpeg", alt: "Nossas idas ao cinema", description: "Momentos tornam-se inesquecíveis", fallback: "💕" }
    ],
    
    hearts: {
        minSize: 15, maxSize: 30, minSpeed: 10, maxSpeed: 25, maxHearts: 20,
        emojis: ['💖', '💕', '❤️', '💗', '💓', '💞', '💝', '💘', '💌']
    },
    
    musicPlaylist: [
        { src: 'music/musica1.mp3', title: 'Aliança', artist: 'Tribalistas', duration: '4:11' },
        { src: 'music/musica2.mp3', title: 'Anjos', artist: 'Venere Vai Venus', duration: '3:18' },
        { src: 'music/musica3.mp3', title: 'Luz que me traz paz', artist: 'Maneva', duration: '5:03' },
        { src: 'music/musica4.mp3', title: 'Ararinha', artist: 'Carlinhos Brown', duration: '2:39' },
        { src: 'music/musica5.mp3', title: 'Olhos Castanhos', artist: 'Geovanna Jainy', duration: '2:30' },
        { src: 'music/musica6.mp3', title: 'Those Eyes', artist: 'New West', duration: '3:40' },
        { src: 'music/musica7.mp3', title: 'Pela Luz dos Olhos teus', artist: 'Miucha & Antonio Carlos Jobim', duration: '2:46' },
        { src: 'music/musica8.mp3', title: 'Lisboa', artist: 'Ana Vitória', duration: '3:39' },
        { src: 'music/musica9.mp3', title: 'All Of Me', artist: 'John Legend', duration: '5:07' },
        { src: 'music/musica10.mp3', title: 'Perfect', artist: 'Ed Sheeran', duration: '4:23' },
        { src: 'music/musica11.mp3', title: 'Sujeito Homem', artist: 'Guilherme e Benuto', duration: '3:04' }
    ],
    
    garden: {
        totalRoses: 17,
        specialRoseIndex: 7,
        roseGrowth: 50,
        lastWatered: null,
        roseMessages: [
            "Nosso primeiro encontro", "As várias brincadeiras", "Aquele jantar especial",
            "Dia dos namorados", "Nosso aniversário", "Caminhada no parque",
            "Nosso primeiro beijo", "🌟 NOSSA ROSA DOURADA 🌟", "Conversas até tarde",
            "Aquele lanche da tarde", "Aquele café da manhã", "Dia chuvoso em casa",
            "Festa com amigos", "Projeto conjunto", "Idas ao cinema",
            "Todas as declarações", "Todos os presentes"
        ]
    }
};

const STORAGE_KEY = 'loveGallery_photos';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Estado global da aplicação
const App = {
    audioVolume: 0.7,
    currentTrackIndex: 0,
    isPlaying: false,
    playerReady: false,
    isMuted: false,
    lastVolume: 70,
    audioPlayer: null,
    isDarkMode: false,
    isMobile: false,
    userInteracted: false,
    audioUnlocked: false,
    firebaseReady: false,
    firebasePhotosReady: false,
    isUploading: false,
    uploadLock: false,
    wallMessages: [],
    currentWallIndex: 0,
    offlineMessages: []
};

// Tornar global
window.CONFIG = CONFIG;
window.App = App;
window.STORAGE_KEY = STORAGE_KEY;
window.MAX_IMAGE_SIZE = MAX_IMAGE_SIZE;

console.log('✅ Config carregada');