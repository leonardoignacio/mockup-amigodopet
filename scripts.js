const appRoot = document.getElementById('app-root');
const navLinks = document.getElementById('nav-links');

// ==========================================
// ROTEAMENTO E CONTROLE DE ESTADO DA SPA
// ==========================================
function updateNavbar() {
    const isLogged = !!sessionStorage.getItem('token');
    navLinks.innerHTML = `
        <li><a href="#vitrine"><i class="fas fa-search"></i> Vitrine de Pets</a></li>
        ${isLogged ? `
            <li><a href="#meus-pets"><i class="fas fa-dog"></i> Meus Pets</a></li>
            <li><a href="#doacoes"><i class="fas fa-hand-holding-heart"></i> Minhas Doações</a></li>
            <li><a href="#logout" onclick="handleLogout(event)"><i class="fas fa-sign-out-alt"></i> Sair</a></li>
        ` : `
            <li><a href="#login"><i class="fas fa-sign-in-alt"></i> Login</a></li>
            <li><a href="#cadastro-usuario"><i class="fas fa-user-plus"></i> Cadastrar</a></li>
        `}
    `;
}

function handleLogout(event) {
    event.preventDefault();
    sessionStorage.removeItem('token');
    window.location.hash = '#login';
}

async function router() {
    updateNavbar();
    const hash = window.location.hash || '#vitrine';
    appRoot.innerHTML = '<div style="text-align:center; padding: 3rem;"><i class="fas fa-spinner fa-spin fa-2x"></i> Carregando...</div>';

    try {
        switch (hash) {
            case '#login': return renderLogin();
            case '#cadastro-usuario': return renderCadastroUsuario();
            case '#vitrine': return await renderVitrine();
            case '#meus-pets': return await renderMeusPets();
            case '#form-pet': return renderFormPet();
            case '#doacoes': return await renderDoacoes();
            default: return await renderVitrine();
        }
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);

// ==========================================
// UTILITÁRIOS DA UI
// ==========================================
function showMessage(msg, type = 'success') {
    const div = document.createElement('div');
    div.className = `alert alert-${type}`;
    div.textContent = msg;
    appRoot.prepend(div);
    setTimeout(() => div.remove(), 4000);
}

// ==========================================
// VIEWS (Renderização de Telas)
// ==========================================

// --- TELA DE LOGIN ---
function renderLogin() {
    appRoot.innerHTML = `
        <div class="form-container">
            <h2><i class="fas fa-key"></i> Acesso ao Sistema</h2>
            <form id="formLogin" style="margin-top: 1.5rem;">
                <div class="form-group">
                    <label>E-mail</label>
                    <input type="email" id="loginEmail" required placeholder="Digite seu e-mail">
                </div>
                <div class="form-group">
                    <label>Senha</label>
                    <input type="password" id="loginSenha" required placeholder="Sua senha">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">Entrar</button>
            </form>
        </div>
    `;

    document.getElementById('formLogin').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const dados = {
                email: document.getElementById('loginEmail').value,
                senha: document.getElementById('loginSenha').value
            };
            const response = await ApiService.login(dados);
            sessionStorage.setItem('token', response.token); // Salva o token[cite: 1]
            window.location.hash = '#vitrine';
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });
}

// --- TELA DE CADASTRO DE USUÁRIO ---
function renderCadastroUsuario() {
    appRoot.innerHTML = `
        <div class="form-container">
            <h2><i class="fas fa-user-plus"></i> Criar Conta</h2>
            <form id="formCadastroUser" style="margin-top: 1.5rem;">
                <div class="form-group"><label>Nome</label><input type="text" id="regNome" required></div>
                <div class="form-group"><label>CPF</label><input type="text" id="regCpf" required></div>
                <div class="form-group"><label>Telefone</label><input type="text" id="regTel"></div>
                <div class="form-group"><label>E-mail</label><input type="email" id="regEmail" required></div>
                <div class="form-group"><label>Senha</label><input type="password" id="regSenha" required></div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Cadastrar-se</button>
            </form>
        </div>
    `;

    document.getElementById('formCadastroUser').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await ApiService.cadastrarUsuario({
                nome: document.getElementById('regNome').value,
                cpf: document.getElementById('regCpf').value,
                telefone: document.getElementById('regTel').value,
                email: document.getElementById('regEmail').value,
                senha: document.getElementById('regSenha').value
            });
            showMessage('Cadastro realizado com sucesso! Faça o login.');
            window.location.hash = '#login';
        } catch (error) { showMessage(error.message, 'error'); }
    });
}

// --- TELA DA VITRINE (Pública) ---
async function renderVitrine() {
    const pets = await ApiService.getVitrine(); // Retorna todos os animais disponíveis[cite: 1]
    const isLogged = !!sessionStorage.getItem('token');
    
    appRoot.innerHTML = `
        <div class="page-header">
            <h2><i class="fas fa-search"></i> Vitrine de Adoção</h2>
        </div>
        ${pets.length === 0 ? '<p>Nenhum pet disponível no momento.</p>' : `
            <div class="grid">
                ${pets.map(pet => `
                    <div class="card">
                        <div>
                            <div class="card-header">
                                <h3 class="card-title">${pet.nome}</h3>
                                <div class="card-meta">
                                    <span class="badge"><i class="fas fa-tag"></i> ${pet.especie} - ${pet.raca}</span>
                                    <span class="badge"><i class="fas fa-weight"></i> ${pet.peso} kg</span>
                                    <span class="badge"><i class="fas fa-ruler"></i> ${pet.tamanho}</span>
                                </div>
                            </div>
                            <p><strong>Idade:</strong> ${pet.idade} anos</p>
                            <p><strong>Observações:</strong> ${pet.obs || 'Nenhuma'}</p>
                        </div>
                        <div class="card-actions">
                            ${isLogged ? `
                                <button class="btn btn-primary" onclick="iniciarDoacao(${pet.id})" style="width: 100%; justify-content: center;">
                                    <i class="fas fa-heart"></i> Quero Adotar
                                </button>
                            ` : `<small style="color:var(--danger)">Faça login para adotar</small>`}
                        </div>
                    </div>
                `).join('')}
            </div>
        `}
    `;
}

// --- TELA DE MEUS PETS (Protegida) ---
async function renderMeusPets() {
    const pets = await ApiService.getMeusPets(); // Pets exclusivos do usuário autenticado[cite: 1]
    
    appRoot.innerHTML = `
        <div class="page-header">
            <h2><i class="fas fa-dog"></i> Meus Pets para Doação</h2>
            <a href="#form-pet" class="btn btn-primary"><i class="fas fa-plus"></i> Novo Pet</a>
        </div>
        ${pets.length === 0 ? '<p>Você não cadastrou nenhum pet ainda.</p>' : `
            <div class="grid">
                ${pets.map(pet => `
                    <div class="card">
                        <div>
                            <div class="card-header">
                                <h3 class="card-title">${pet.nome}</h3>
                                <span class="badge">${pet.especie}</span>
                            </div>
                            <p>${pet.obs}</p>
                        </div>
                        <div class="card-actions">
                            <button class="btn btn-danger" onclick="excluirPet(${pet.id})"><i class="fas fa-trash"></i> Excluir</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `}
    `;
}

// --- FORMULÁRIO DE CADASTRO DE PET ---
function renderFormPet() {
    appRoot.innerHTML = `
        <div class="page-header">
            <h2><i class="fas fa-plus"></i> Cadastrar Novo Pet</h2>
            <a href="#meus-pets" class="btn btn-outline">Voltar</a>
        </div>
        <div class="form-container" style="max-width: 800px;">
            <form id="formPet">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group"><label>Nome</label><input type="text" id="petNome" required></div>
                    <div class="form-group"><label>Espécie</label><input type="text" id="petEspecie" required></div>
                    <div class="form-group"><label>Raça</label><input type="text" id="petRaca" required></div>
                    <div class="form-group"><label>Sexo</label>
                        <select id="petSexo"><option value="M">Macho</option><option value="F">Fêmea</option></select>
                    </div>
                    <div class="form-group"><label>Peso (kg)</label><input type="number" step="0.1" id="petPeso"></div>
                    <div class="form-group"><label>Tamanho</label><input type="text" id="petTamanho"></div>
                    <div class="form-group"><label>Idade</label><input type="number" id="petIdade"></div>
                    <div class="form-group"><label>Doença Preexistente</label><input type="text" id="petDoenca"></div>
                </div>
                <div class="form-group"><label>Observações</label><textarea id="petObs" rows="3"></textarea></div>
                <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Salvar Pet</button>
            </form>
        </div>
    `;

    document.getElementById('formPet').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await ApiService.cadastrarPet({
                nome: document.getElementById('petNome').value,
                sexo: document.getElementById('petSexo').value,
                especie: document.getElementById('petEspecie').value,
                raca: document.getElementById('petRaca').value,
                peso: document.getElementById('petPeso').value,
                tamanho: document.getElementById('petTamanho').value,
                idade: document.getElementById('petIdade').value,
                doenca: document.getElementById('petDoenca').value,
                obs: document.getElementById('petObs').value
                // A API extrai a identidade do criador diretamente do Token JWT[cite: 1]
            });
            showMessage('Pet cadastrado com sucesso!');
            window.location.hash = '#meus-pets';
        } catch (error) { showMessage(error.message, 'error'); }
    });
}

// --- TELA DE DOAÇÕES ---
async function renderDoacoes() {
    const doacoes = await ApiService.getMinhasDoacoes(); // Consulta histórico[cite: 1]
    
    appRoot.innerHTML = `
        <div class="page-header">
            <h2><i class="fas fa-hand-holding-heart"></i> Minhas Solicitações de Adoção</h2>
        </div>
        ${doacoes.length === 0 ? '<p>Nenhuma interação de doação encontrada.</p>' : `
            <div class="grid">
                ${doacoes.map(d => `
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Pedido #${d.id}</h3>
                            <span class="badge" style="background: var(--warning); color: var(--dark);">${d.status}</span>
                        </div>
                        <p><strong>Pet ID:</strong> ${d.id_pet}</p>
                        <p><strong>Data de Interesse:</strong> ${new Date(d.data_interesse).toLocaleDateString()}</p>
                        <div class="card-actions">
                            <button class="btn btn-outline" onclick="concluirDoacao(${d.id})"><i class="fas fa-check"></i> Concluir</button>
                            <button class="btn btn-danger" onclick="cancelarDoacao(${d.id})"><i class="fas fa-times"></i> Cancelar</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `}
    `;
}

// ==========================================
// FUNÇÕES DE AÇÃO GLOBAIS
// ==========================================
window.excluirPet = async (id) => {
    if (confirm('Tem certeza que deseja excluir este pet?')) {
        try {
            await ApiService.deletarPet(id);
            renderMeusPets(); // Atualiza a tela
            showMessage('Pet excluído com sucesso.');
        } catch (e) { showMessage(e.message, 'error'); }
    }
};

window.iniciarDoacao = async (id_pet) => {
    try {
        await ApiService.registrarDoacao({
            id_pet: id_pet,
            status: "Interessado" 
            // data_interesse não deve ser enviado no JSON[cite: 1]
        });
        showMessage('Interesse de adoção registrado com sucesso!');
        window.location.hash = '#doacoes';
    } catch (e) { showMessage(e.message, 'error'); }
};

window.concluirDoacao = async (id_doacao) => {
    try {
        await ApiService.atualizarDoacao(id_doacao, {
            data_doacao: new Date().toISOString().split('T')[0],
            status: "Concluída"
        }); // Finaliza a doação ou altera o status[cite: 1]
        renderDoacoes();
        showMessage('Adoção concluída com sucesso!');
    } catch (e) { showMessage(e.message, 'error'); }
};

window.cancelarDoacao = async (id_doacao) => {
    if (confirm('Deseja cancelar esta doação?')) {
        try {
            await ApiService.cancelarDoacao(id_doacao);
            renderDoacoes();
            showMessage('Doação cancelada com sucesso.');
        } catch (e) { showMessage(e.message, 'error'); }
    }
};