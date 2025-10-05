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

// Função de proteção genérica para todas as páginas, exceto login
function protegerPagina() {
  auth.onAuthStateChanged(user => {
    if (!user) {
      // Usuário NÃO está logado - redireciona para a página de login
      console.log('Usuário não autenticado. Redirecionando para login...');
      window.location.href = 'index.html';
    }
    // Se o usuário estiver logado, a execução do script da página continua.
  });
}

// Função de logout
function logout() {
  if (confirm('Deseja realmente sair do sistema?')) {
    auth.signOut()
      .then(() => {
        console.log('Logout realizado com sucesso');
        window.location.href = 'index.html';
      })
      .catch(error => {
        console.error('Erro ao fazer logout:', error);
        alert('Erro ao fazer logout. Tente novamente.');
      });
  }
}

// Tradução de erros do Firebase para o usuário
function traduzirErro(errorCode) {
    const erros = {
      'auth/invalid-credential': 'Credenciais inválidas. Verifique seu e--mail e senha.',
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
// LÓGICA DA PÁGANA DE LOGIN (index.html)
// ============================================
function inicializarPaginaLogin() {
  console.log('Inicializando página de login...');
  
  const loginForm = document.getElementById('loginForm');
  const btnGoogle = document.getElementById('btnGoogle');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  // Verifica se o usuário já está logado para redirecioná-lo
  auth.onAuthStateChanged(user => {
    if (user) {
      console.log('Usuário já logado, redirecionando para o painel...');
      window.location.href = 'painel.html';
    }
  });
  
  // Evento de login com e-mail e senha
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput.value;
      const password = passwordInput.value;

      auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
          console.log('Login bem-sucedido:', userCredential.user.email);
          window.location.href = 'painel.html';
        })
        .catch(error => {
          alert(traduzirErro(error.code));
          console.error('Erro de login:', error.code, error.message);
        });
    });
  }
  
  // Evento de login com Google
  if (btnGoogle) {
    btnGoogle.addEventListener('click', () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider)
        .then(result => {
          console.log('Login com Google bem-sucedido:', result.user.email);
          window.location.href = 'painel.html';
        })
        .catch(error => {
            alert(traduzirErro(error.code));
            console.error('Erro no login com Google:', error.code, error.message);
        });
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

  // Adicione aqui outras funções específicas do painel, se houver
  // Ex: carregarAnotacoes(), atualizarEstatisticas()
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

  if (!grid) {
      console.error("Elementos da página de clientes não encontrados. Verifique o HTML.");
      return; 
  }

  // Funções do Modal (precisam ser globais para o HTML chamar)
  window.abrirModal = () => {
    editandoId = null;
    document.getElementById("modalTitle").textContent = "Novo Cliente";
    document.getElementById("modalIcon").textContent = "➕";
    formCliente.reset();
    document.getElementById("clienteId").value = "";
    modalCliente.classList.add("active");
  }

  window.fecharModal = () => {
    modalCliente.classList.remove("active");
    formCliente.reset();
    editandoId = null;
  }

  // Renderizar clientes na grid
  function renderizarClientes() {
    const searchTerm = searchInput.value.toLowerCase();
    grid.innerHTML = "";

    const clientesArray = Object.entries(clientesData).map(([id, data]) => ({ id, ...data }));
    const clientesFiltrados = clientesArray.filter(cliente => {
      const nome = (cliente.nome || "").toLowerCase();
      const telefone = (cliente.telefone || "").toLowerCase();
      const endereco = (cliente.endereco || "").toLowerCase();
      return nome.includes(searchTerm) || telefone.includes(searchTerm) || endereco.includes(searchTerm);
    });

    if (clientesFiltrados.length === 0) {
        emptyState.style.display = "block";
        grid.style.display = "none";
    } else {
        emptyState.style.display = "none";
        grid.style.display = "grid";
    }

    clientesFiltrados.forEach(cliente => {
      const iniciais = cliente.nome ? cliente.nome.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "??";
      const card = document.createElement("div");
      card.className = "cliente-card";
      card.innerHTML = `
        <div class="cliente-header">
          <div class="cliente-avatar">${iniciais}</div>
          <div class="cliente-info">
            <h3>${cliente.nome}</h3>
            <div class="cliente-id">ID: ${cliente.id.substring(0, 8)}</div>
          </div>
        </div>
        <div class="cliente-details">
          <div class="detail-item">
            <div class="detail-icon">📱</div>
            <span>${cliente.telefone || 'Não informado'}</span>
          </div>
          <div class="detail-item">
            <div class="detail-icon">📍</div>
            <span>${cliente.endereco || 'Não informado'}</span>
          </div>
        </div>
        <div class="cliente-actions">
          <button class="btn-action btn-edit" onclick="editarCliente('${cliente.id}')">✏️ Editar</button>
          <button class="btn-action btn-delete" onclick="confirmarExclusao('${cliente.id}', '${cliente.nome}')">🗑️ Excluir</button>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // Carregar clientes em tempo real
  clientesRef.on("value", snapshot => {
    clientesData = snapshot.val() || {};
    renderizarClientes();
  });

  // Salvar (criar ou editar)
  window.salvarCliente = (event) => {
    event.preventDefault();
    const aparelhosSelecionados = Array.from(document.getElementById("aparelhosCliente").selectedOptions).map(option => option.value);
    const dadosCliente = {
      nome: document.getElementById("nomeCliente").value,
      telefone: document.getElementById("telefoneCliente").value,
      cpf: document.getElementById("cpfCliente").value,
      email: document.getElementById("emailCliente").value,
      endereco: document.getElementById("enderecoCliente").value,
      cep: document.getElementById("cepCliente").value,
      cidade: document.getElementById("cidadeCliente").value,
      aparelhos: aparelhosSelecionados,
      observacoes: document.getElementById("observacoesCliente").value,
      dataAtualizacao: new Date().toISOString()
    };

    if (editandoId) {
      dadosCliente.historicoServicos = clientesData[editandoId].historicoServicos || 0;
      dadosCliente.dataCadastro = clientesData[editandoId].dataCadastro;
      clientesRef.child(editandoId).update(dadosCliente).then(() => fecharModal());
    } else {
      dadosCliente.historicoServicos = 0;
      dadosCliente.dataCadastro = new Date().toISOString();
      clientesRef.push(dadosCliente).then(() => fecharModal());
    }
  }

  // Editar
  window.editarCliente = (id) => {
    editandoId = id;
    const cliente = clientesData[id];
    document.getElementById("modalTitle").textContent = "Editar Cliente";
    document.getElementById("modalIcon").textContent = "✏️";
    document.getElementById("clienteId").value = id;
    document.getElementById("nomeCliente").value = cliente.nome || "";
    document.getElementById("telefoneCliente").value = cliente.telefone || "";
    document.getElementById("cpfCliente").value = cliente.cpf || "";
    document.getElementById("emailCliente").value = cliente.email || "";
    document.getElementById("enderecoCliente").value = cliente.endereco || "";
    document.getElementById("cepCliente").value = cliente.cep || "";
    document.getElementById("cidadeCliente").value = cliente.cidade || "";
    document.getElementById("observacoesCliente").value = cliente.observacoes || "";
    const select = document.getElementById("aparelhosCliente");
    Array.from(select.options).forEach(option => {
      option.selected = cliente.aparelhos && cliente.aparelhos.includes(option.value);
    });
    modalCliente.classList.add("active");
  }

  // Excluir
  window.confirmarExclusao = (id, nome) => {
    if (confirm(`Deseja realmente excluir o cliente "${nome}"?\n\nEsta ação não pode ser desfeita.`)) {
      clientesRef.child(id).remove();
    }
  }

  // Event Listeners da página
  searchInput.addEventListener("input", renderizarClientes);
  btnNovoCliente.addEventListener("click", abrirModal);
  formCliente.addEventListener("submit", salvarCliente);
}


// ============================================
// DETECÇÃO AUTOMÁTICA DA PÁGINA E INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname;
  const fileName = currentPage.substring(currentPage.lastIndexOf('/') + 1);
  
  const paginaAtual = fileName || 'index.html'; // Define 'index.html' como padrão
  console.log('Página atual:', paginaAtual);

  // Todas as páginas, exceto a de login, devem ser protegidas
  if (paginaAtual !== 'index.html') {
    protegerPagina();
  }

  // Executa a inicialização específica de cada página
  if (paginaAtual === 'index.html') {
    inicializarPaginaLogin();
  } else if (paginaAtual === 'painel.html') {
    inicializarPainel();
  } else if (paginaAtual === 'clientes.html') {
    inicializarPaginaClientes();
  }
});
