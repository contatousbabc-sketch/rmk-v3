
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, updateProfile } from 'firebase/auth';

// --- CONFIGURAÇÃO DO FIREBASE ---
// Preencha com seus dados do console.firebase.google.com
const firebaseConfig = {
  apiKey: "API_KEY_AQUI",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "rmkv2-7f06c",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// --- INICIALIZAÇÃO ---
let auth: any = null;
let googleProvider: any = null;

// Chave para simular sessão local se não houver Firebase
export const MOCK_SESSION_KEY = 'rmk_mock_session';

try {
    // Verificação simples para não quebrar se as chaves não existirem ou forem padrão
    if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "API_KEY_AQUI") {
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        googleProvider = new GoogleAuthProvider();
    } else {
        console.log("ℹ️ Modo Mock Ativado (Firebase não configurado ou chaves inválidas).");
    }
} catch (e) {
    console.error("Erro ao inicializar Firebase:", e);
    // Garante que auth seja null para cair no fallback
    auth = null;
}

export { auth };

// --- FUNÇÕES DE AUTENTICAÇÃO ---

export const loginWithGoogle = async () => {
    // 1. Tenta Login Real (Se Firebase estiver configurado)
    if (auth && googleProvider) {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return result.user; 
        } catch (error: any) {
            console.warn("Erro no Login Google (caindo para Mock):", error.message);
            // Se der erro (ex: popup fechado, ou erro de config), cai para o mock abaixo
        }
    }

    // 2. Fallback: Login Mock Robusto
    console.warn("⚠️ Usando Login Simulado (Mock).");
    
    const mockUser = { 
        uid: 'mock_google_user_' + Math.floor(Math.random() * 10000), 
        displayName: 'Google User (Teste)', 
        email: 'teste@kingdom.com',
        photoURL: null, // Sem foto para testar a UI de letra
        isAnonymous: false,
        isMock: true
    };
    
    // Salva sessão para persistir no F5
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockUser));
    
    await new Promise(r => setTimeout(r, 500)); // Pequeno delay para sensação de loading
    return mockUser;
};

export const logout = async () => {
    try {
        // Tenta logout real
        if (auth) {
            await signOut(auth);
        }
    } catch (error) {
        console.error("Erro ao deslogar do Firebase:", error);
    } finally {
        // SEMPRE limpa a sessão local, independente do erro
        localStorage.removeItem(MOCK_SESSION_KEY);
    }
};

export const updateUserProfile = async (user: any, newName: string) => {
    // Objeto atualizado
    const updatedUser = { ...user, displayName: newName };

    // 1. Tenta atualizar no Firebase se for usuário real
    if (auth && user && !user.isMock && !user.uid.startsWith('guest_') && !user.uid.startsWith('mock_')) {
        try {
            await updateProfile(user, { displayName: newName });
        } catch (e) {
            console.error("Erro ao atualizar perfil Firebase (ignorando para manter UX):", e);
        }
    }

    // 2. Atualiza no LocalStorage (para mocks e guests persistirem o nome)
    if (localStorage.getItem(MOCK_SESSION_KEY)) {
        localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(updatedUser));
    }
    
    await new Promise(r => setTimeout(r, 300)); // Fake delay
    return updatedUser;
};

// Recupera sessão ao recarregar página
export const getMockSession = () => {
    const saved = localStorage.getItem(MOCK_SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
};
