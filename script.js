// ============================================
// CONFIGURAÇÃO DO FIREBASE
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
// UTILITÁRIOS DE MENSAGENS
// ============================================
function mostrarErro(mensagem) {
  const errorDiv = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  
  if (errorDiv && errorText) {
    errorText.textContent = mensagem;
    errorDiv.classList.add('show');
    
    // Remove a mensagem após 5 segundos
    setTimeout(() => {
      errorDiv.classList.remove('show');
    }, 5000);
  }
}

function mostrarSucesso(mensagem) {
  const successDiv = document.getElementById('successMessage');
  const successText = document.getElementById('successText');
  
  if (successDiv && successText) {
    successText.textContent = mensagem;
    successDiv.classList.add('show');
    
    setTimeout(() => {
      successDiv.classList.remove('show');
    }, 3000);
  }
}

function esconderMensagens() {
  const errorDiv = document.getElementById('errorMessage');
  const successDiv = document.getElementById('successMessage');
  
  if (errorDiv) errorDiv.classList.remove('show');
  if (successDiv) successDiv.classList.remove('show');
}

// Tradução de erros do Firebase
function traduzirErro(errorCode) {
  const erros = {
    'auth/invalid-email': 'E-mail inválido.',
    'auth/user-disabled': 'Usuário desabilitado.',
    'auth/user-not-found': 'Usuário não encontrado.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/email-already-in-use': 'Este e-mail já está em uso.',
    'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
    'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
    'auth/popup-closed-by-user': 'Login cancelado pelo usuário.',
    'auth/cancelled-popup-request': 'Login cancelado.',
    'auth/popup-blocked': 'Pop-up bloqueado. Permita pop-ups para este site.',
    'auth/invalid-credential': 'Credenciais inválidas. Verifique e-mail e senha.',
    'auth/operation-not-allowed': 'Operação não permitida.',
    'auth/account-exists-with-different-credential': 'Já existe uma conta com este e-mail.'
  };
  
  return erros[errorCode] || 'Erro ao fazer login. Tente novamente.';
}

// ============================================
// LÓGICA DA PÁGINA DE LOGIN (index.html)
// ============================================
function inicializarPaginaLogin() {
  console.log('Inicializando página de login...');
  
  const loginForm = document.getElementById('loginForm');
  const btnGoogle = document.getElementById('btnGoogle');
  const btnLogin = document.getElementById('btnLogin');
  const forgotPassword = document.getElementById('forgotPassword');
  
  // Verifica se o usuário já está logado
  auth.onAuthStateChanged(user => {
    if (user) {
      console.log('Usuário já logado, redirecionando para o painel...');
      mostrarSucesso('Redirecionando para o painel...');
      setTimeout(() => {
        window.location.href = 'painel.html';
      }, 1000);
    }
  });
  
  // Login com e-mail e senha
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      esconderMensagens();
      
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      
      if (!email || !password) {
        mostrarErro('Preencha todos os campos.');
        return;
      }
      
      // Adiciona loading ao botão
      btnLogin.classList.add('loading');
      btnLogin.disabled = true;
      
      try {
        console.log('Tentando fazer login com:', email);
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('Login bem-sucedido:', userCredential.user.email);
        
        mostrarSucesso('Login realizado com sucesso!');
        
        // Aguarda 1 segundo antes de redirecionar
        setTimeout(() => {
          window.location.href = 'painel.html';
        }, 1000);
        
      } catch (error) {
        console.error('Erro no login:', error.code, error.message);
        mostrarErro(traduzirErro(error.code));
        btnLogin.classList.remove('loading');
        btnLogin.disabled = false;
      }
    });
  }
  
  // Login com Google
  if (btnGoogle) {
    btnGoogle.addEventListener('click', async () => {
      esconderMensagens();
      
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      try {
        console.log('Iniciando login com Google...');
        const result = await auth.signInWithPopup(provider);
        console.log('Login com Google bem-sucedido:', result.user.email);
        
        mostrarSucesso('Login realizado com sucesso!');
        
        setTimeout(() => {
          window.location.href = 'painel.html';
        }, 1000);
        
      } catch (error) {
        console.error('Erro no login com Google:', error.code, error.message);
        
        // Não mostra erro se o usuário cancelou o popup
        if (error.code !== 'auth/popup-closed-by-user' && 
            error.code !== 'auth/cancelled-popup-request') {
          mostrarErro(traduzirErro(error.code));
        }
      }
    });
  }
  
  // Recuperação de senha (opcional)
  if (forgotPassword) {
    forgotPassword.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value.trim();
      
      if (!email) {
        mostrarErro('Digite seu e-mail no campo acima para recuperar a senha.');
        return;
      }
      
      try {
        await auth.sendPasswordResetEmail(email);
        mostrarSucesso('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
      } catch (error) {
        console.error('Erro ao enviar e-mail de recuperação:', error);
        mostrarErro(traduzirErro(error.code));
      }
    });
  }
}

// ============================================
// LÓGICA DE PROTEÇÃO DO PAINEL (painel.html)
// ============================================
function protegerPainel() {
  console.log('Verificando autenticação do painel...');
  
  // Mostra loading enquanto verifica
  const body = document.body;
  if (body) {
    body.style.opacity = '0';
  }
  
  auth.onAuthStateChanged(user => {
    if (!user) {
      // Usuário NÃO está logado - redireciona para login
      console.log('Usuário não autenticado. Redirecionando para login...');
      window.location.href = 'index.html';
    } else {
      // Usuário está logado - permite acesso ao painel
      console.log('Usuário autenticado:', user.email);
      
      // Mostra o conteúdo do painel
      if (body) {
        body.style.opacity = '1';
        body.style.transition = 'opacity 0.3s';
      }
      
      // Atualiza informações do usuário na interface (se houver)
      atualizarInfoUsuario(user);
      
      // Inicializa as funcionalidades do painel
      inicializarPainel();
    }
  });
}

// Atualiza informações do usuário no painel
function atualizarInfoUsuario(user) {
  // Se houver elementos para mostrar info do usuário
  const userNameElements = document.querySelectorAll('.user-name');
  const userEmailElements = document.querySelectorAll('.user-email');
  const userPhotoElements = document.querySelectorAll('.user-photo');
  
  userNameElements.forEach(el => {
    el.textContent = user.displayName || user.email.split('@')[0];
  });
  
  userEmailElements.forEach(el => {
    el.textContent = user.email;
  });
  
  userPhotoElements.forEach(el => {
    if (user.photoURL) {
      el.src = user.photoURL;
    }
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

// ============================================
// FUNCIONALIDADES DO PAINEL
// ============================================
function inicializarPainel() {
  console.log('Inicializando funcionalidades do painel...');
  
  // Referência ao banco de dados
  const dbRef = database.ref("anotacoes");
  
  // Botão de logout (se existir)
  const btnSair = document.getElementById('btnSair');
  if (btnSair) {
    btnSair.addEventListener('click', logout);
  }
  
  // Carrega anotações
  carregarAnotacoes(dbRef);
  
  // Botão para adicionar nova anotação
  const btnNovaAnotacao = document.getElementById('btnNovaAnotacao');
  if (btnNovaAnotacao) {
    btnNovaAnotacao.addEventListener('click', () => {
      const titulo = prompt("Título da anotação:");
      const conteudo = prompt("Conteúdo da anotação:");
      
      if (titulo && conteudo) {
        const user = auth.currentUser;
        dbRef.push({
          titulo,
          conteudo,
          criadoPor: user.email,
          criadoEm: new Date().toISOString()
        }).then(() => {
          console.log('Anotação adicionada com sucesso');
        }).catch(error => {
          console.error('Erro ao adicionar anotação:', error);
          alert('Erro ao adicionar anotação.');
        });
      }
    });
  }
  
  // Inicializa outros módulos do sistema
  inicializarModulosAdicionais();
}

// Função para carregar anotações em tempo real
function carregarAnotacoes(dbRef) {
  const lista = document.getElementById("lista-anotacoes");
  
  if (!lista) return;
  
  lista.innerHTML = "";
  
  dbRef.on("value", snapshot => {
    lista.innerHTML = "";
    const dados = snapshot.val();
    
    if (dados) {
      Object.keys(dados).forEach(chave => {
        const li = document.createElement("li");
        li.textContent = `${dados[chave].titulo}: ${dados[chave].conteudo}`;
        lista.appendChild(li);
      });
    } else {
      lista.innerHTML = '<li style="text-align: center; color: #9ca3af;">Nenhuma anotação cadastrada</li>';
    }
    
    // Atualiza badge
    const badge = document.getElementById('badge-anotacoes');
    if (badge) {
      const total = dados ? Object.keys(dados).length : 0;
      badge.textContent = total;
    }
  });
}

// Inicializa módulos adicionais (agendamentos, contas, etc.)
function inicializarModulosAdicionais() {
  // Aqui você pode adicionar a inicialização de outros módulos
  // como agendamentos, contas a pagar, peças, etc.
  
  console.log('Módulos adicionais inicializados');
  
  // Exemplo: Atualizar estatísticas do resumo financeiro
  atualizarEstatisticas();
}

// Atualiza estatísticas do painel
function atualizarEstatisticas() {
  // Busca dados do Firebase e atualiza os números na dashboard
  
  // Total de vendas do mês (exemplo)
  const totalVendasElement = document.getElementById('total-vendas-mes');
  if (totalVendasElement) {
    database.ref('vendas').once('value', snapshot => {
      const vendas = snapshot.val();
      let total = 0;
      
      if (vendas) {
        Object.values(vendas).forEach(venda => {
          total += parseFloat(venda.valor || 0);
        });
      }
      
      totalVendasElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    });
  }
  
  // Total de OS abertas
  const totalOsElement = document.getElementById('total-os-abertas');
  if (totalOsElement) {
    database.ref('ordens_servico').once('value', snapshot => {
      const os = snapshot.val();
      const total = os ? Object.keys(os).length : 0;
      totalOsElement.textContent = total;
    });
  }
}

// ============================================
// DETECÇÃO AUTOMÁTICA DA PÁGINA
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM carregado. Detectando página...');
  
  // Verifica qual página está sendo carregada
  const currentPage = window.location.pathname;
  const fileName = currentPage.substring(currentPage.lastIndexOf('/') + 1);
  
  console.log('Página atual:', fileName || 'index.html');
  
  if (fileName === 'painel.html' || currentPage.includes('painel')) {
    // Está na página do painel - protege o acesso
    protegerPainel();
  } else {
    // Está na página de login - inicializa o login
    inicializarPaginaLogin();
  }
});

// ============================================
// EXPORTA FUNÇÕES GLOBAIS
// ============================================
window.logout = logout;
window.mostrarErro = mostrarErro;
window.mostrarSucesso = mostrarSucesso;

console.log('Script de autenticação carregado com sucesso!');

// ============================================
// FUNÇÕES AUXILIARES PARA BADGES
// ============================================
function atualizarTodosBadges() {
  atualizarBadge('anotacoes', 'badge-anotacoes');
  atualizarBadge('agendamentos', 'badge-agendamentos');
  atualizarBadge('contas_pagar', 'badge-contas');
  atualizarBadge('pecas_pedir', 'badge-pecas');
  atualizarBadge('ordens_servico', 'badge-os');
  atualizarBadge('estoque', 'badge-estoque');
  atualizarBadge('clientes', 'badge-clientes');
  atualizarBadge('vendas', 'badge-vendas');
}

function atualizarBadge(caminho, badgeId) {
  const badgeElement = document.getElementById(badgeId);
  if (!badgeElement) return;
  
  database.ref(caminho).once('value', snapshot => {
    const dados = snapshot.val();
    const total = dados ? Object.keys(dados).length : 0;
    badgeElement.textContent = total;
  });
}

// ============================================
// INICIALIZAÇÃO COMPLETA DOS BOTÕES DO FOOTER
// ============================================
function inicializarBotoesFooter() {
  // Botão Backup
  const btnBackup = document.getElementById('btnBackup');
  if (btnBackup) {
    btnBackup.addEventListener('click', fazerBackup);
  }
  
  // Botão Configurações
  const btnConfiguracoes = document.getElementById('btnConfiguracoes');
  if (btnConfiguracoes) {
    btnConfiguracoes.addEventListener('click', abrirConfiguracoes);
  }
  
  // Botão Ajuda
  const btnAjuda = document.getElementById('btnAjuda');
  if (btnAjuda) {
    btnAjuda.addEventListener('click', abrirAjuda);
  }
}

// Função de backup
function fazerBackup() {
  if (!confirm('Deseja fazer backup de todos os dados do sistema?')) {
    return;
  }
  
  const user = auth.currentUser;
  if (!user) {
    alert('Você precisa estar logado para fazer backup.');
    return;
  }
  
  // Busca todos os dados do Firebase
  database.ref().once('value')
    .then(snapshot => {
      const dados = snapshot.val();
      const dataAtual = new Date().toISOString().split('T')[0];
      const nomeArquivo = `backup-oficina-${dataAtual}.json`;
      
      // Cria o arquivo de backup
      const dadosJson = JSON.stringify(dados, null, 2);
      const blob = new Blob([dadosJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Cria link para download
      const a = document.createElement('a');
      a.href = url;
      a.download = nomeArquivo;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Backup realizado com sucesso!');
    })
    .catch(error => {
      console.error('Erro ao fazer backup:', error);
      alert('Erro ao fazer backup. Tente novamente.');
    });
}

// Função de configurações
function abrirConfiguracoes() {
  const user = auth.currentUser;
  
  if (!user) {
    alert('Você precisa estar logado.');
    return;
  }
  
  const configuracoes = `
╔═══════════════════════════════════╗
          CONFIGURAÇÕES
╚═══════════════════════════════════╝

👤 Usuário Logado:
   ${user.displayName || 'Sem nome'}
   
📧 E-mail:
   ${user.email}
   
🆔 ID do Usuário:
   ${user.uid}
   
📅 Conta criada em:
   ${new Date(user.metadata.creationTime).toLocaleDateString('pt-BR')}
   
🔐 Último login:
   ${new Date(user.metadata.lastSignInTime).toLocaleDateString('pt-BR')} às ${new Date(user.metadata.lastSignInTime).toLocaleTimeString('pt-BR')}
   
🔄 Provedor de autenticação:
   ${user.providerData[0]?.providerId || 'Não disponível'}

═══════════════════════════════════

Deseja sair do sistema?
  `;
  
  if (confirm(configuracoes)) {
    logout();
  }
}

// Função de ajuda
function abrirAjuda() {
  const ajuda = `
╔═══════════════════════════════════╗
       AJUDA - SISTEMA OFICINA
╚═══════════════════════════════════╝

📌 PRINCIPAIS FUNCIONALIDADES:

🗒️ ANOTAÇÕES
   • Adicione lembretes importantes
   • Clique em "Nova Anotação"

📅 AGENDAMENTOS
   • Gerencie horários de clientes
   • Visualize a agenda do dia

💰 CONTAS A PAGAR
   • Controle suas despesas
   • Organize pagamentos

🔩 PEÇAS PARA PEDIR
   • Lista de peças necessárias
   • Evite falta de estoque

🛠️ ORDENS DE SERVIÇO
   • Gerencie todos os consertos
   • Acompanhe o status

📦 ESTOQUE
   • Controle de peças disponíveis
   • Atualize quantidades

👥 CLIENTES
   • Cadastro completo
   • Histórico de serviços

💵 VENDAS
   • Registre todas as vendas
   • Controle financeiro

═══════════════════════════════════

⌨️ ATALHOS DE TECLADO:
   • ESC - Fechar modais
   • Ctrl+N - Novo item (em algumas telas)

═══════════════════════════════════

🆘 PRECISA DE SUPORTE?
   Entre em contato com o administrador
   do sistema.

═══════════════════════════════════
  `;
  
  alert(ajuda);
}

// ============================================
// ATUALIZAÇÃO PERIÓDICA DE ESTATÍSTICAS
// ============================================
function iniciarAtualizacaoAutomatica() {
  // Atualiza estatísticas a cada 30 segundos
  setInterval(() => {
    atualizarEstatisticas();
    atualizarTodosBadges();
  }, 30000);
  
  // Primeira atualização imediata
  atualizarTodosBadges();
}

// ============================================
// VERIFICAÇÃO DE CONEXÃO COM INTERNET
// ============================================
function monitorarConexao() {
  window.addEventListener('online', () => {
    console.log('Conexão com internet restaurada');
    const mensagem = document.createElement('div');
    mensagem.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #d1fae5;
      color: #065f46;
      padding: 16px 24px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      font-weight: 600;
    `;
    mensagem.textContent = '✓ Conexão restaurada';
    document.body.appendChild(mensagem);
    
    setTimeout(() => {
      mensagem.remove();
    }, 3000);
  });
  
  window.addEventListener('offline', () => {
    console.log('Conexão com internet perdida');
    const mensagem = document.createElement('div');
    mensagem.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #fee2e2;
      color: #991b1b;
      padding: 16px 24px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      font-weight: 600;
    `;
    mensagem.textContent = '⚠️ Sem conexão com internet';
    document.body.appendChild(mensagem);
  });
}

// ============================================
// EXPORTA FUNÇÕES ADICIONAIS
// ============================================
window.fazerBackup = fazerBackup;
window.abrirConfiguracoes = abrirConfiguracoes;
window.abrirAjuda = abrirAjuda;

// Inicia monitoramento de conexão
monitorarConexao();
