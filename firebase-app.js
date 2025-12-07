// ===== CONFIGURAÇÃO DO FIREBASE (SEM AUTENTICAÇÃO) =====
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Configuração do Firebase (MESMA DO SEU INDEX.HTML)
const firebaseConfig = {
    apiKey: "AIzaSyBCORH8KvPxzPW3U0JMbgPV4WJiEVsDyWg",
    authDomain: "site-romantico-9acba.firebaseapp.com",
    projectId: "site-romantico-9acba",
    storageBucket: "site-romantico-9acba.firebasestorage.app",
    messagingSenderId: "17047121956",
    appId: "1:17047121956:web:2b7b61c0e2b856b218a8b1",
    measurementId: "G-4JZWFFL42Q"
};

// ===== INICIALIZAÇÃO =====
let app = null;
let db = null;
let isConnected = false;
let messagesUnsubscribe = null;

// Inicializar Firebase
function initializeFirebase() {
    try {
        console.log('🚀 Inicializando Firebase (sem autenticação)...');
        
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        
        console.log('✅ Firebase inicializado com sucesso!');
        isConnected = true;
        updateFirebaseStatus('online');
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao inicializar Firebase:', error);
        updateFirebaseStatus('error', error.message);
        return false;
    }
}

// ===== FUNÇÃO PARA ATUALIZAR STATUS VISUAL =====
function updateFirebaseStatus(status, message = '') {
    const statusElement = document.getElementById('firebaseStatus');
    if (!statusElement) return;
    
    switch (status) {
        case 'online':
            statusElement.innerHTML = '<i class="fas fa-circle" style="color: #4CAF50;"></i> Online';
            statusElement.className = 'firebase-status online';
            break;
        case 'offline':
            statusElement.innerHTML = '<i class="fas fa-circle" style="color: #ff9800;"></i> Offline';
            statusElement.className = 'firebase-status offline';
            break;
        case 'error':
            statusElement.innerHTML = `<i class="fas fa-circle" style="color: #f44336;"></i> Erro: ${message.substring(0, 30)}`;
            statusElement.className = 'firebase-status offline';
            break;
        case 'connecting':
            statusElement.innerHTML = '<i class="fas fa-circle" style="color: #9e9e9e;"></i> Conectando...';
            statusElement.className = 'firebase-status';
            break;
    }
}

// ===== FUNÇÃO PARA SALVAR MENSAGEM NO FIRESTORE =====
async function saveMessageToFirestore(messageData) {
    if (!db) {
        throw new Error('Firebase não inicializado');
    }
    
    try {
        console.log('💾 Salvando mensagem no Firestore...');
        
        // Adicionar timestamp
        const messageWithTimestamp = {
            ...messageData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            timestamp: new Date().getTime()
        };
        
        // Adicionar à coleção "messages"
        const docRef = await addDoc(collection(db, "messages"), messageWithTimestamp);
        console.log('✅ Mensagem salva com ID:', docRef.id);
        
        return {
            success: true,
            messageId: docRef.id,
            firestoreId: docRef.id
        };
        
    } catch (error) {
        console.error('❌ Erro ao salvar no Firestore:', error);
        throw error;
    }
}

// ===== FUNÇÃO PARA CARREGAR MENSAGENS DO FIRESTORE =====
function loadMessagesFromFirestore(callback) {
    if (!db) {
        console.error('❌ Firestore não inicializado');
        callback([]);
        return null;
    }
    
    try {
        console.log('📥 Carregando mensagens do Firestore...');
        
        // Consulta para obter mensagens ordenadas por timestamp (mais recente primeiro)
        const messagesQuery = query(
            collection(db, "messages"),
            orderBy("timestamp", "desc"),
            limit(100)
        );
        
        // Listener em tempo real (sem autenticação necessária)
        messagesUnsubscribe = onSnapshot(
            messagesQuery,
            (snapshot) => {
                const messages = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    
                    // Formatar data para exibição
                    let displayDate = 'Data não disponível';
                    try {
                        if (data.createdAt && data.createdAt.toDate) {
                            const date = data.createdAt.toDate();
                            displayDate = date.toLocaleDateString('pt-BR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            });
                        } else if (data.createdAt) {
                            const date = new Date(data.createdAt);
                            displayDate = date.toLocaleDateString('pt-BR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            });
                        }
                    } catch (e) {
                        console.warn('Erro ao formatar data:', e);
                    }
                    
                    messages.push({
                        id: doc.id,
                        firestoreId: doc.id,
                        title: data.title || 'Mensagem de Amor',
                        content: data.content || '',
                        date: data.date || displayDate,
                        color: data.color || '#ffebee',
                        author: data.author || 'Anônimo',
                        createdAt: data.createdAt ? 
                            (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) 
                            : new Date().toISOString(),
                        timestamp: data.timestamp || Date.now()
                    });
                });
                
                console.log(`✅ ${messages.length} mensagens carregadas do Firestore`);
                callback(messages);
                
            },
            (error) => {
                console.error('❌ Erro ao carregar mensagens:', error);
                updateFirebaseStatus('error', error.message);
                
                // Fallback para localStorage
                loadMessagesFromLocalStorage(callback);
            }
        );
        
        return messagesUnsubscribe;
        
    } catch (error) {
        console.error('❌ Erro na consulta:', error);
        updateFirebaseStatus('error', error.message);
        
        // Fallback para localStorage
        loadMessagesFromLocalStorage(callback);
        return null;
    }
}

// ===== FUNÇÕES PARA MODO OFFLINE (LOCALSTORAGE) =====

// Carregar mensagens do localStorage
function loadMessagesFromLocalStorage(callback) {
    try {
        const savedMessages = JSON.parse(localStorage.getItem('loveMessages_offline')) || [];
        console.log(`📱 ${savedMessages.length} mensagens carregadas do localStorage`);
        
        // Ordenar por timestamp (mais recente primeiro)
        savedMessages.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        callback(savedMessages);
        
    } catch (e) {
        console.error('❌ Erro ao carregar do localStorage:', e);
        callback([]);
    }
}

// Salvar mensagem no localStorage
function saveMessageToLocalStorage(messageData) {
    try {
        const localMessage = {
            ...messageData,
            id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            localSaved: true,
            localTimestamp: new Date().toISOString(),
            timestamp: Date.now(),
            syncStatus: 'pending'
        };
        
        // Salvar no localStorage
        const savedMessages = JSON.parse(localStorage.getItem('loveMessages_offline')) || [];
        savedMessages.push(localMessage);
        
        // Manter apenas as últimas 100 mensagens
        if (savedMessages.length > 100) {
            savedMessages.length = 100;
        }
        
        localStorage.setItem('loveMessages_offline', JSON.stringify(savedMessages));
        console.log('📱 Mensagem salva no localStorage:', localMessage.id);
        
        return localMessage.id;
        
    } catch (e) {
        console.error('❌ Erro ao salvar no localStorage:', e);
        return null;
    }
}

// Sincronizar mensagens offline com Firestore
async function syncOfflineMessages() {
    if (!db) {
        console.log('⚠️ Firestore não disponível para sincronização');
        return;
    }
    
    try {
        const savedMessages = JSON.parse(localStorage.getItem('loveMessages_offline')) || [];
        const pendingMessages = savedMessages.filter(msg => msg.syncStatus === 'pending');
        
        if (pendingMessages.length === 0) {
            console.log('✅ Nenhuma mensagem offline para sincronizar');
            return;
        }
        
        console.log(`🔄 Sincronizando ${pendingMessages.length} mensagens offline...`);
        
        let syncedCount = 0;
        
        for (const message of pendingMessages) {
            try {
                // Remover campos locais antes de enviar
                const { id, localSaved, localTimestamp, syncStatus, ...firestoreMessage } = message;
                
                // Enviar para Firestore
                await addDoc(collection(db, "messages"), {
                    ...firestoreMessage,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    timestamp: Date.now(),
                    syncStatus: 'synced'
                });
                
                syncedCount++;
                console.log(`✅ Mensagem sincronizada: ${message.id}`);
                
            } catch (error) {
                console.error(`❌ Falha ao sincronizar mensagem ${message.id}:`, error);
            }
        }
        
        // Remover mensagens sincronizadas do localStorage
        if (syncedCount > 0) {
            const updatedMessages = savedMessages.filter(msg => 
                !pendingMessages.slice(0, syncedCount).some(pending => pending.id === msg.id)
            );
            localStorage.setItem('loveMessages_offline', JSON.stringify(updatedMessages));
            console.log(`✅ ${syncedCount} mensagens sincronizadas com sucesso!`);
        }
        
    } catch (error) {
        console.error('❌ Erro geral na sincronização:', error);
    }
}

// ===== MONITORAMENTO DE CONEXÃO =====

// Verificar se está online
function checkConnection() {
    if (navigator.onLine && db) {
        isConnected = true;
        updateFirebaseStatus('online');
        return true;
    } else {
        isConnected = false;
        updateFirebaseStatus('offline');
        return false;
    }
}

// Configurar listeners de rede
function setupNetworkListeners() {
    // Verificar conexão inicial
    checkConnection();
    
    // Quando voltar a conexão
    window.addEventListener('online', () => {
        console.log('🌐 Conexão restabelecida');
        isConnected = true;
        updateFirebaseStatus('online');
        
        // Tentar sincronizar mensagens offline
        if (db) {
            setTimeout(() => syncOfflineMessages(), 2000);
        }
    });
    
    // Quando perder conexão
    window.addEventListener('offline', () => {
        console.log('⚠️ Sem conexão com a internet');
        isConnected = false;
        updateFirebaseStatus('offline');
    });
}

// ===== INICIALIZAÇÃO AUTOMÁTICA =====

// Inicializar quando o script carregar
initializeFirebase();
setupNetworkListeners();

// ===== EXPORTAR FUNÇÕES PARA USO GLOBAL =====
window.firebaseApp = {
    // Status
    isConnected: () => isConnected,
    
    // Inicialização
    initialize: initializeFirebase,
    
    // Funções principais
    addMessage: saveMessageToFirestore,
    loadMessages: loadMessagesFromFirestore,
    
    // Funções offline
    saveToLocalStorage: saveMessageToLocalStorage,
    loadFromLocalStorage: loadMessagesFromLocalStorage,
    syncOfflineMessages: syncOfflineMessages,
    
    // Utilitários
    updateStatus: updateFirebaseStatus,
    checkConnection: checkConnection
};

console.log('🔥 Firebase App (sem autenticação) carregado com sucesso!');