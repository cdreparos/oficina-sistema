// Função para carregar anotações
function carregarAnotacoes() {
  const lista = document.getElementById("lista-anotacoes");
  lista.innerHTML = "";
  db.collection("anotacoes").get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const li = document.createElement("li");
        li.textContent = `${doc.data().titulo}: ${doc.data().conteudo}`;
        lista.appendChild(li);
      });
    })
    .catch(err => console.error("Erro ao acessar Firestore:", err));
}

// Botão para adicionar nova anotação
document.getElementById("btnNovaAnotacao").addEventListener("click", () => {
  const titulo = prompt("Título da anotação:");
  const conteudo = prompt("Conteúdo:");
  if (titulo && conteudo) {
    db.collection("anotacoes").add({ titulo, conteudo })
      .then(() => carregarAnotacoes());
  }
});

// Carrega anotações ao iniciar
carregarAnotacoes();
