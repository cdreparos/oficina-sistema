// Funções de formatação e validação (utils.js)

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
}

// ########## FUNÇÃO CORRIGIDA ##########
function formatarData(stringData) {
  if (!stringData || typeof stringData !== 'string') return '-';
  // Criamos o objeto de data, que pode vir com o problema do fuso horário
  const dataObj = new Date(stringData);
  // Compensamos o fuso horário para garantir que a data seja a correta
  const offset = dataObj.getTimezoneOffset();
  const dataCorrigida = new Date(dataObj.getTime() + (offset * 60 * 1000));
  return dataCorrigida.toLocaleDateString('pt-BR');
}
// ######################################

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
    // ... outros casos de erro
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
  return formatarData(data); // Usando a função corrigida
}
