// utils.js
// Funções utilitárias reutilizáveis em todo o sistema

// ========================================
// FORMATAÇÃO DE DADOS
// ========================================

function formatarMoeda(valor) {
return new Intl.NumberFormat(‘pt-BR’, {
style: ‘currency’,
currency: ‘BRL’
}).format(valor || 0);
}

function formatarData(data) {
if (!data) return ‘-’;
return new Date(data).toLocaleDateString(‘pt-BR’);
}

function formatarDataHora(data) {
if (!data) return ‘-’;
return new Date(data).toLocaleString(‘pt-BR’);
}

function formatarTelefone(telefone) {
if (!telefone) return ‘’;
const numeros = telefone.replace(/\D/g, ‘’);
if (numeros.length === 11) {
return numeros.replace(/^(\d{2})(\d{5})(\d{4})$/, ‘($1) $2-$3’);
} else if (numeros.length === 10) {
return numeros.replace(/^(\d{2})(\d{4})(\d{4})$/, ‘($1) $2-$3’);
}
return telefone;
}

function formatarCPF(cpf) {
if (!cpf) return ‘’;
const numeros = cpf.replace(/\D/g, ‘’);
if (numeros.length === 11) {
return numeros.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, ‘$1.$2.$3-$4’);
}
return cpf;
}

function formatarCEP(cep) {
if (!cep) return ‘’;
const numeros = cep.replace(/\D/g, ‘’);
if (numeros.length === 8) {
return numeros.replace(/^(\d{5})(\d{3})$/, ‘$1-$2’);
}
return cep;
}

// ========================================
// MÁSCARAS DE INPUT
// ========================================

function aplicarMascaraTelefone(input) {
input.addEventListener(‘input’, function(e) {
let value = e.target.value.replace(/\D/g, ‘’);
if (value.length <= 11) {
value = value.replace(/^(\d{2})(\d)/g, ‘($1) $2’);
value = value.replace(/(\d)(\d{4})$/, ‘$1-$2’);
}
e.target.value = value;
});
}

function aplicarMascaraCPF(input) {
input.addEventListener(‘input’, function(e) {
let value = e.target.value.replace(/\D/g, ‘’);
if (value.length <= 11) {
value = value.replace(/(\d{3})(\d)/, ‘$1.$2’);
value = value.replace(/(\d{3})(\d)/, ‘$1.$2’);
value = value.replace(/(\d{3})(\d{1,2})$/, ‘$1-$2’);
}
e.target.value = value;
});
}

function aplicarMascaraCEP(input) {
input.addEventListener(‘input’, function(e) {
let value = e.target.value.replace(/\D/g, ‘’);
if (value.length <= 8) {
value = value.replace(/^(\d{5})(\d)/, ‘$1-$2’);
}
e.target.value = value;
});
}

function aplicarMascaraMoeda(input) {
input.addEventListener(‘blur’, function() {
if (this.value) {
this.value = parseFloat(this.value).toFixed(2);
}
});
}

// ========================================
// VALIDAÇÕES
// ========================================

function validarEmail(email) {
const regex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
return regex.test(email);
}

function validarCPF(cpf) {
cpf = cpf.replace(/\D/g, ‘’);
if (cpf.length !== 11) return false;

// Verifica se todos os dígitos são iguais
if (/^(\d)\1+$/.test(cpf)) return false;

// Validação dos dígitos verificadores
let soma = 0;
for (let i = 0; i < 9; i++) {
soma += parseInt(cpf.charAt(i)) * (10 - i);
}
let resto = 11 - (soma % 11);
let digitoVerificador = resto === 10 || resto === 11 ? 0 : resto;
if (digitoVerificador !== parseInt(cpf.charAt(9))) return false;

soma = 0;
for (let i = 0; i < 10; i++) {
soma += parseInt(cpf.charAt(i)) * (11 - i);
}
resto = 11 - (soma % 11);
digitoVerificador = resto === 10 || resto === 11 ? 0 : resto;
if (digitoVerificador !== parseInt(cpf.charAt(10))) return false;

return true;
}

function validarTelefone(telefone) {
const numeros = telefone.replace(/\D/g, ‘’);
return numeros.length === 10 || numeros.length === 11;
}

// ========================================
// BUSCA DE CEP
// ========================================

async function buscarCEP(cep, callbackSucesso, callbackErro) {
const cepLimpo = cep.replace(/\D/g, ‘’);

if (cepLimpo.length !== 8) {
if (callbackErro) callbackErro(‘CEP inválido’);
return;
}

try {
const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
const data = await response.json();

```
if (data.erro) {
  if (callbackErro) callbackErro('CEP não encontrado');
  return;
}

if (callbackSucesso) {
  callbackSucesso({
    logradouro: data.logradouro,
    bairro: data.bairro,
    cidade: data.localidade,
    estado: data.uf,
    cep: formatarCEP(cepLimpo)
  });
}
```

} catch (error) {
console.error(‘Erro ao buscar CEP:’, error);
if (callbackErro) callbackErro(‘Erro ao buscar CEP. Verifique sua conexão.’);
}
}

// ========================================
// MANIPULAÇÃO DE MODAIS
// ========================================

function abrirModal(modalId) {
const modal = document.getElementById(modalId);
if (modal) {
modal.classList.add(‘active’);
// Focar no primeiro input do modal
const primeiroInput = modal.querySelector(‘input:not([type=“hidden”]), textarea, select’);
if (primeiroInput) {
setTimeout(() => primeiroInput.focus(), 100);
}
}
}

function fecharModal(modalId) {
const modal = document.getElementById(modalId);
if (modal) {
modal.classList.remove(‘active’);
}
}

function fecharModalAoClicarFora(modalId) {
const modal = document.getElementById(modalId);
if (modal) {
modal.addEventListener(‘click’, function(e) {
if (e.target === this) {
fecharModal(modalId);
}
});
}
}

// ========================================
// CONFIRMAÇÕES E ALERTAS
// ========================================

function confirmarExclusao(itemNome, callback) {
const confirmacao = confirm(
`⚠️ ATENÇÃO!\n\nDeseja realmente excluir:\n"${itemNome}"?\n\nEsta ação não pode ser desfeita!`
);

if (confirmacao && callback) {
callback();
}

return confirmacao;
}

function mostrarSucesso(mensagem) {
alert(`✅ ${mensagem}`);
}

function mostrarErro(mensagem) {
alert(`❌ ${mensagem}`);
}

// ========================================
// MANIPULAÇÃO DE DATAS
// ========================================

function obterDataHoje() {
return new Date().toISOString().split(‘T’)[0];
}

function obterDataHoraAgora() {
return new Date().toISOString();
}

function calcularDiferencaDias(data1, data2) {
const d1 = new Date(data1);
const d2 = new Date(data2);
const diferenca = Math.abs(d2 - d1);
return Math.ceil(diferenca / (1000 * 60 * 60 * 24));
}

function adicionarDias(data, dias) {
const resultado = new Date(data);
resultado.setDate(resultado.getDate() + dias);
return resultado.toISOString().split(‘T’)[0];
}

function obterPrimeiroDiaMes(data = new Date()) {
return new Date(data.getFullYear(), data.getMonth(), 1).toISOString().split(‘T’)[0];
}

function obterUltimoDiaMes(data = new Date()) {
return new Date(data.getFullYear(), data.getMonth() + 1, 0).toISOString().split(‘T’)[0];
}

function obterNomeMes(numeroMes) {
const meses = [
‘Janeiro’, ‘Fevereiro’, ‘Março’, ‘Abril’, ‘Maio’, ‘Junho’,
‘Julho’, ‘Agosto’, ‘Setembro’, ‘Outubro’, ‘Novembro’, ‘Dezembro’
];
return meses[numeroMes] || ‘’;
}

// ========================================
// DEBOUNCE (para buscas em tempo real)
// ========================================

function debounce(func, wait) {
let timeout;
return function executedFunction(…args) {
const later = () => {
clearTimeout(timeout);
func(…args);
};
clearTimeout(timeout);
timeout = setTimeout(later, wait);
};
}

// ========================================
// GERAÇÃO DE IDs
// ========================================

function gerarId() {
return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ========================================
// INICIALIZAÇÃO DE ATALHOS
// ========================================

function inicializarAtalhosTeclado(atalhos) {
document.addEventListener(‘keydown’, function(e) {
// ESC para fechar modais
if (e.key === ‘Escape’) {
const modaisAbertos = document.querySelectorAll(’.modal.active’);
modaisAbertos.forEach(modal => modal.classList.remove(‘active’));
}

```
// Atalhos personalizados
if (atalhos) {
  atalhos.forEach(atalho => {
    if (atalho.key === e.key && atalho.ctrl === e.ctrlKey) {
      e.preventDefault();
      atalho.callback();
    }
  });
}
```

});
}

// ========================================
// EXPORT (disponibilizar globalmente)
// ========================================

console.log(‘✅ Utilitários carregados e prontos!’);