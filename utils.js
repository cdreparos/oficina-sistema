// Funções de formatação e validação (utils.js)

// Funções que você já tinha:
function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
}

function formatarData(data) {
  if (!data) return '-';
  // Adiciona 1 dia para corrigir problemas comuns de fuso horário ao converter strings
  const dataObj = new Date(data);
  dataObj.setDate(dataObj.getDate() + 1);
  return dataObj.toLocaleDateString('pt-BR');
}

// Funções que estavam faltando para o Login e outras páginas:
function validarEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function traduzirErroFirebase(code) {
  switch (code) {
    case 'auth/user-not-found':
      return 'Usuário não encontrado. Verifique o e-mail.';
    case 'auth/wrong-password':
      return 'Senha incorreta. Tente novamente.';
    case 'auth/invalid-email':
      return 'O e-mail fornecido é inválido.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está em uso por outra conta.';
    case 'auth/weak-password':
      return 'A senha é muito fraca. Tente uma mais forte.';
    default:
      return 'Ocorreu um erro. Tente novamente mais tarde.';
  }
}

function formatarDataHora(data) {
  if (!data) return '';
  const dataObj = new Date(data);
  return dataObj.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatarDataRelativa(data) {
  if (!data) return '';
  const agora = new Date();
  const dataObj = new Date(data);
  const diff = agora - dataObj;
  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (dias === 0) return 'Hoje';
  if (dias === 1) return 'Ontem';
  if (dias < 7) return `${dias} dias atrás`;
  return dataObj.toLocaleDateString('pt-BR');
}
