// Função para carregar anotações em tempo real
function carregarAnotacoes() {
  const lista = document.getElementById("lista-anotacoes");
  lista.innerHTML = "";

  dbRef.on("value", snapshot => {
    lista.innerHTML = ""; // limpa a lista antes de atualizar
    const dados = snapshot.val();
    if (dados) {
      Object.keys(dados).forEach(chave => {
        const li = document.createElement("li");
        li.textContent = `${dados[chave].titulo}: ${dados[chave].conteudo}`;
        lista.appendChild(li);
      });
    }
  });
}

// Botão para adicionar nova anotação
document.getElementById("btnNovaAnotacao").addEventListener("click", () => {
  const titulo = prompt("Título da anotação:");
  const conteudo = prompt("Conteúdo da anotação:");
  if (titulo && conteudo) {
    dbRef.push({ titulo, conteudo });
  }
});

// Inicializa a lista
carregarAnotacoes();
