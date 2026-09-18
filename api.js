const API_BASE_URL = 'https://amigodopet-deploy-1.onrender.com';

class ApiService {
    static async request(endpoint, method = 'GET', data = null) {
        const token = sessionStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = { method, headers };
        if (data) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            
            // Tratamento global de erro de autenticação (Redirecionamento para Login)
            if (response.status === 401 || response.status === 403) {
                sessionStorage.removeItem('token');
                window.location.hash = '#login';
                throw new Error('Sessão expirada ou acesso negado. Faça login novamente.');
            }

            const responseData = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(responseData?.message || `Erro HTTP: ${response.status}`);
            }

            return responseData;
        } catch (error) {
            console.error(`Erro na API [${method} ${endpoint}]:`, error);
            throw error;
        }
    }

    // Autenticação
    static login(credenciais) { return this.request('/login', 'POST', credenciais); }

    // Usuários
    static cadastrarUsuario(dados) { return this.request('/usuarios', 'POST', dados); }
    static atualizarUsuario(id, dados) { return this.request(`/usuario/${id}`, 'PUT', dados); }

    // Pets
    static getVitrine() { return this.request('/vitrine', 'GET'); }
    static getMeusPets() { return this.request('/pet', 'GET'); }
    static cadastrarPet(dados) { return this.request('/pet', 'POST', dados); }
    static atualizarPet(id, dados) { return this.request(`/pet/${id}`, 'PUT', dados); }
    static deletarPet(id) { return this.request(`/pet/${id}`, 'DELETE'); }

    // Doações
    static registrarDoacao(dados) { return this.request('/doacao', 'POST', dados); }
    static getMinhasDoacoes() { return this.request('/doacao', 'GET'); }
    static atualizarDoacao(id, dados) { return this.request(`/doacao/${id}`, 'PUT', dados); }
    static cancelarDoacao(id) { return this.request(`/doacao/${id}`, 'DELETE'); }
}