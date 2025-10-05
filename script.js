// ============================================
// CONFIGURAÇÃO DO FIREBASE (ÚNICA E CENTRALIZADA)
// ============================================
const firebaseConfig = {
  apiKey: "AIzaSyCyz4Nrvcnf0MF_99fLKPMsrJ9dIzuRHG4",
  authDomain: "oficina-sistema-cc2cd.firebaseapp.com",
  databaseURL: "https://oficina-sistema-cc2cd-default-rtdb.firebaseio.com",
  projectId: "oficina-sistema-cc2cd",
  storageBucket: "oficina-sistema-cc2cd.appspot.com",
  messagingSenderId: "1034638142539",
  appId: "1:1034638142539:web:4b63c09b30b86838eff1ce"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// ============================================
// FUNÇÕES GLOBAIS E UTILITÁRIOS
// ============================================
function protegerPagina() {
  auth.onAuthStateChanged(user => {
    if (!user) {
      console.log('Usuário não autenticado. Redirecionando para login...');
      window.location.href = 'index.html';
    }
  });
}

function logout() {
  if (confirm('Deseja realmente sair do sistema?')) {
    auth.signOut().then(() => window.location.href = 'index.html');
  }
}

function traduzirErro(errorCode) {
    const erros = {
      'auth/invalid-credential': 'Credenciais inválidas. Verifique seu e-mail e senha.',
      'auth/user-not-found': 'Usuário não encontrado.',
      'auth/wrong-password': 'Senha incorreta.',
      'auth/email-already-in-use': 'Este e-mail já está em uso por outra conta.',
      'auth/weak-password': 'A senha precisa ter no mínimo 6 caracteres.',
      'auth/popup-closed-by-user': 'O login com Google foi cancelado.',
      'auth/network-request-failed': 'Erro de rede. Verifique sua conexão com a internet.'
    };
    return erros[errorCode] || 'Ocorreu um erro inesperado. Tente novamente.';
}

// ============================================
// LÓGICA DA PÁGINA DE LOGIN (index.html)
// ============================================
function inicializarPaginaLogin() {
  console.log('Inicializando página de login...');
  const loginForm = document.getElementById('loginForm');
  const btnGoogle = document.getElementById('btnGoogle');
  if (auth.currentUser) { window.location.href = 'painel.html'; }
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      auth.signInWithEmailAndPassword(email, password)
        .then(() => window.location.href = 'painel.html')
        .catch(error => alert(traduzirErro(error.code)));
    });
  }
  if (btnGoogle) {
    btnGoogle.addEventListener('click', () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider)
        .then(() => window.location.href = 'painel.html')
        .catch(error => alert(traduzirErro(error.code)));
    });
  }
}

// ============================================
// LÓGICA DO PAINEL DE CONTROLE (painel.html)
// ============================================
function inicializarPainel() {
  console.log('Inicializando funcionalidades do painel...');
  const btnSair = document.getElementById('btnSair');
  if (btnSair) {
    btnSair.addEventListener('click', logout);
  }
}

// ============================================
// LÓGICA DA PÁGINA DE CLIENTES (clientes.html)
// ============================================
function inicializarPaginaClientes() {
  console.log('Inicializando página de clientes...');
  const clientesRef = database.ref("clientes");
  let clientesData = {};
  let editandoId = null;
  const grid = document.getElementById("clientesGrid");
  const emptyState = document.getElementById("emptyState");
  const searchInput = document.getElementById("searchInput");
  const modalCliente = document.getElementById("modalCliente");
  const formCliente = document.getElementById("formCliente");
  const btnNovoCliente = document.getElementById("btnNovoCliente");

  if (!grid) return;

  window.abrirModal = () => {
    editandoId = null;
    formCliente.reset();
    modalCliente.classList.add("active");
  };
  window.fecharModal = () => modalCliente.classList.remove("active");
  
  function renderizarClientes() { /* ... Lógica de renderização ... */ }
  clientesRef.on("value", snapshot => {
    clientesData = snapshot.val() || {};
    renderizarClientes();
  });
  window.salvarCliente = (event) => { /* ... Lógica para salvar ... */ };
  window.editarCliente = (id) => { /* ... Lógica para editar ... */ };
  window.confirmarExclusao = (id, nome) => { /* ... Lógica para excluir ... */ };
  
  searchInput.addEventListener("input", renderizarClientes);
  btnNovoCliente.addEventListener("click", abrirModal);
  formCliente.addEventListener("submit", salvarCliente);
}

// ============================================
// LÓGICA DA PÁGINA DE ORDENS DE SERVIÇO (ordens_servico.html)
// ============================================
function inicializarPaginaOS() {
    console.log('Inicializando página de Ordens de Serviço...');

    const osRef = database.ref("ordens_servico");
    const clientesRef = database.ref("clientes");

    let osData = {}, clientesData = {}, pecasTemp = [];
    let editandoId = null, filtroAtual = 'todas', proximoNumeroOS = 1;

    // Mapeamento de elementos do DOM
    const elements = {
        grid: document.getElementById('osGrid'),
        emptyState: document.getElementById('emptyState'),
        modalOS: document.getElementById('modalOS'),
        modalPeca: document.getElementById('modalPeca'),
        formOS: document.getElementById('formOS'),
        formPeca: document.getElementById('formPeca'),
        clienteNomeInput: document.getElementById('clienteNome'),
        clienteSuggestions: document.getElementById('clienteSuggestions'),
        pecasList: document.getElementById('pecasList')
    };
    
    if(!elements.grid) return;

    // Funções de Modal
    window.fecharModal = () => elements.modalOS.classList.remove('active');
    window.fecharModalPeca = () => elements.modalPeca.classList.remove('active');

    // Carregamento de dados
    osRef.on("value", snapshot => {
        osData = snapshot.val() || {};
        const numeros = Object.keys(osData).map(key => parseInt(osData[key].numeroOS) || 0);
        proximoNumeroOS = numeros.length > 0 ? Math.max(...numeros) + 1 : 1;
        renderizarOS();
    });

    clientesRef.on("value", snapshot => {
        clientesData = snapshot.val() || {};
    });

    function renderizarOS() {
        elements.grid.innerHTML = '';
        const osArray = Object.entries(osData).map(([id, data]) => ({ id, ...data }));
        const osFiltradas = filtroAtual === 'todas' ? osArray : osArray.filter(os => os.statusOS === filtroAtual);

        elements.emptyState.style.display = osFiltradas.length === 0 ? 'block' : 'none';
        elements.grid.style.display = osFiltradas.length > 0 ? 'grid' : 'none';

        osFiltradas.sort((a, b) => parseInt(b.numeroOS) - parseInt(a.numeroOS)).forEach(os => {
            const card = document.createElement('div');
            card.className = 'os-card';
            // Conteúdo do card (HTML dinâmico)
            card.innerHTML = `
                <div class="os-header">
                    <div class="os-numero">OS #${String(os.numeroOS).padStart(4, '0')}</div>
                    <div class="os-status status-${os.statusOS}">${os.statusOS.replace('_', ' ')}</div>
                </div>
                <div class="os-cliente">${os.clienteNome}</div>
                <div class="os-aparelho">${os.aparelho}</div>
                <div class="os-valor">
                    <div class="os-valor-label">Valor Total</div>
                    <div class="os-valor-total">R$ ${parseFloat(os.valorTotalFinal || 0).toFixed(2).replace('.', ',')}</div>
                </div>
                <div class="os-actions">
                    <button class="btn-action btn-edit" onclick="editarOS('${os.id}')">✏️ Editar</button>
                    <button class="btn-action btn-print" onclick="alert('Impressão em breve!')">📄 Garantia</button>
                </div>`;
            elements.grid.appendChild(card);
        });
    }

    window.salvarOS = function(event) {
        event.preventDefault();
        // Lógica de salvar OS
        const osDataObj = { /* ... objeto com dados do formulário ... */ };
        if (editandoId) {
            osRef.child(editandoId).update(osDataObj).then(() => fecharModal());
        } else {
            osDataObj.numeroOS = proximoNumeroOS;
            osRef.push(osDataObj).then(() => fecharModal());
        }
    }

    window.editarOS = function(id) {
        editandoId = id;
        const os = osData[id];
        // Preenche o formulário com os dados da OS
        elements.formOS.reset(); // Limpa antes de preencher
        document.getElementById('clienteNome').value = os.clienteNome;
        // ... preencher todos os outros campos
        pecasTemp = os.pecas || [];
        // renderizarPecas();
        // calcularTotais();
        elements.modalOS.classList.add('active');
    }

    // Event Listeners
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelector('.filter-tab.active').classList.remove('active');
            this.classList.add('active');
            filtroAtual = this.dataset.filter;
            renderizarOS();
        });
    });

    document.getElementById('btnNovaOS').addEventListener('click', () => {
        editandoId = null;
        pecasTemp = [];
        elements.formOS.reset();
        document.getElementById('numeroOS').value = proximoNumeroOS;
        document.getElementById('dataEntrada').value = new Date().toISOString().split('T')[0];
        elements.modalOS.classList.add('active');
    });
    
    elements.formOS.addEventListener('submit', salvarOS);
}

// ============================================
// DETECÇÃO AUTOMÁTICA DA PÁGINA E INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname;
  const fileName = currentPage.substring(currentPage.lastIndexOf('/') + 1) || 'index.html';
  
  console.log('Página atual:', fileName);

  if (fileName !== 'index.html') {
    protegerPagina();
  }

  // Roteador de inicialização
  const paginas = {
    'index.html': inicializarPaginaLogin,
    'painel.html': inicializarPainel,
    'clientes.html': inicializarPaginaClientes,
    'ordens_servico.html': inicializarPaginaOS
  };

  if (paginas[fileName]) {
    paginas[fileName]();
  }
});
