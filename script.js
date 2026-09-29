/* ==========================================================
   BOLETIM DIGITAL — script.js
   Dados fictícios (9º Ano) — apenas para demonstração
   ========================================================== */

/* ----------------------------------------------------------
   CONCEITOS RÁPIDOS (leia uma vez, é só para entender):

   • variável → um "potinho" onde guardamos um valor.
                Ex.: const nome = "Ana";
   • array    → uma lista ordenada de valores.
                Ex.: [10, 20, 30]
   • objeto   → um conjunto de pares "chave: valor".
                Ex.: { disciplina: "Matemática", tri1: 55 }
   • função   → um bloco de código que faz uma tarefa e pode
                ser chamado várias vezes.
   • if       → "se isso for verdade, faça aquilo".
   • forEach  → percorre cada item de um array, um por um.
   • DOM      → é a representação do HTML dentro do JavaScript.
                Usamos o DOM para criar/alterar elementos da página.
   ---------------------------------------------------------- */


/* ==========================================================
   1) DADOS BRUTOS (fictícios, 9º Ano)
   ========================================================== */

// Array de objetos: cada objeto é uma disciplina.
const dadosBrutos = [
  { disciplina: "Língua Portuguesa", tri1: 78, tri2: "8,2", tri3: 8.6, faltas: [2, 2, 1] },
  { disciplina: "Matemática", tri1: 55, tri2: "5,4", tri3: null, faltas: [3, 2, 2] },
  { disciplina: "Ciências", tri1: 84, tri2: 7.9, tri3: "8,3", faltas: [1, 1, 1] },
  { disciplina: "História", tri1: "7,1", tri2: 82, tri3: null, faltas: [1, 2, 1] },
  { disciplina: "Geografia", tri1: 69, tri2: "7,5", tri3: 7.8, faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 88, tri2: 8.4, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Arte", tri1: "9,2", tri2: 87, tri3: 9.0, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 96, tri2: "9,3", tri3: null, faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 91, tri2: 8.9, tri3: "9,4", faltas: [1, 1, 0] },
  { disciplina: "Educação Financeira", tri1: 76, tri2: "7,2", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Rec. Aprend. Matemática", tri1: 58, tri2: "5,9", tri3: 6.2, faltas: [2, 2, 1] },
  { disciplina: "Leitura Rec. Aprend. Lingua Portuguesa", tri1: 72, tri2: "7,6", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 49, tri2: 5.5, tri3: "5,8", faltas: [2, 2, 2] },
  { disciplina: "Literatura Arte e Movimento", tri1: "8,0", tri2: 84, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Práticas Experimentais", tri1: 64, tri2: "6,6", tri3: 7.0, faltas: [1, 1, 1] }
];

// Média mínima de referência (a partir dela, é "bom desempenho")
const MEDIA_MINIMA = 6.0;

// Frequência DEMONSTRATIVA (apenas fictícia nesta etapa).
// Em versões futuras, isso será calculado de outra forma.
const FREQUENCIA_DEMONSTRATIVA = 92;


/* ==========================================================
   2) FUNÇÃO: normalizarNota(valor)
   Converte qualquer formato de nota para a escala 0–10.
   ========================================================== */

function normalizarNota(valor) {
  // Vazio, null ou undefined → nota ainda não lançada
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // Se for string, troca vírgula por ponto e tenta virar número.
  let numero;
  if (typeof valor === "string") {
    numero = Number(valor.replace(",", "."));
  } else {
    numero = Number(valor);
  }

  // Se não for um número válido, retorna null (inválido)
  if (isNaN(numero)) {
    return null;
  }

  // Regra: entre 0 e 10 → permanece igual
  if (numero >= 0 && numero <= 10) {
    return numero;
  }

  // Regra: maior que 10 e menor ou igual a 100 → divide por 10
  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }

  // Fora das regras → inválido
  return null;
}


/* ==========================================================
   3) FUNÇÃO: calcularMedia(notas)
   Calcula a média usando SOMENTE as notas disponíveis.
   Nota ausente NUNCA vira zero.
   ========================================================== */

function calcularMedia(notas) {
  // Filtra apenas as notas que existem (não nulas)
  const validas = notas.filter(function (n) {
    return n !== null;
  });

  // Se não há nenhuma nota válida, retorna null
  if (validas.length === 0) {
    return null;
  }

  // Soma todas e divide pela quantidade
  let soma = 0;
  validas.forEach(function (n) {
    soma = soma + n;
  });

  return soma / validas.length;
}


/* ==========================================================
   4) FUNÇÃO: definirSituacao(media)
   Decide a situação da disciplina com base na média.
   ========================================================== */

function definirSituacao(media) {
  if (media === null) {
    return "Nota ainda não disponível";
  }
  if (media >= MEDIA_MINIMA) {
    return "Bom desempenho";
  }
  return "Atenção";
}


/* ==========================================================
   5) FUNÇÃO: formatarNota(valor)
   Mostra a nota com uma casa decimal ou "—" se não existir.
   ========================================================== */

function formatarNota(valor) {
  if (valor === null) {
    return "—";
  }
  return valor.toFixed(1).replace(".", ",");
}


/* ==========================================================
   6) PREPARAR OS DADOS (normalizar tudo antes de exibir)
   ========================================================== */

// Para cada disciplina, criamos um novo objeto já "limpo".
const disciplinas = dadosBrutos.map(function (d) {
  // Normaliza as três notas
  const n1 = normalizarNota(d.tri1);
  const n2 = normalizarNota(d.tri2);
  const n3 = normalizarNota(d.tri3);

  // Soma as faltas dos três trimestres
  const totalFaltas = d.faltas[0] + d.faltas[1] + d.faltas[2];

  // Calcula a média com as notas disponíveis
  const media = calcularMedia([n1, n2, n3]);

  // Define a situação
  const situacao = definirSituacao(media);

  // Retorna o objeto já pronto
  return {
    disciplina: d.disciplina,
    tri1: n1,
    tri2: n2,
    tri3: n3,
    media: media,
    faltas: totalFaltas,
    situacao: situacao
  };
});


/* ==========================================================
   7) PREENCHER A TABELA (DOM)
   ========================================================== */

// Pegamos o <tbody> pelo id
const corpoTabela = document.getElementById("corpo-tabela");

// forEach: percorre cada disciplina e cria uma linha <tr>
disciplinas.forEach(function (d) {
  // Cria a linha
  const linha = document.createElement("tr");

  // Decide a classe CSS da situação
  let classeSituacao = "situacao-neutro";
  if (d.situacao === "Bom desempenho") classeSituacao = "situacao-bom";
  if (d.situacao === "Atenção") classeSituacao = "situacao-atencao";

  // Monta o HTML da linha
  linha.innerHTML =
    "<td>" + d.disciplina + "</td>" +
    "<td>" + formatarNota(d.tri1) + "</td>" +
    "<td>" + formatarNota(d.tri2) + "</td>" +
    "<td>" + formatarNota(d.tri3) + "</td>" +
    "<td>" + formatarNota(d.media) + "</td>" +
    "<td>" + d.faltas + "</td>" +
    "<td class='" + classeSituacao + "'>" + d.situacao + "</td>";

  // Adiciona a linha ao corpo da tabela
  corpoTabela.appendChild(linha);
});


/* ==========================================================
   8) PREENCHER OS CARDS DE RESUMO
   ========================================================== */

// --- Média geral (média das médias disponíveis) ---
const mediasValidas = disciplinas
  .map(function (d) { return d.media; })
  .filter(function (m) { return m !== null; });

let mediaGeral = null;
if (mediasValidas.length > 0) {
  let soma = 0;
  mediasValidas.forEach(function (m) { soma = soma + m; });
  mediaGeral = soma / mediasValidas.length;
}

document.getElementById("card-media").textContent = formatarNota(mediaGeral);

// --- Total de faltas (soma de todas as disciplinas) ---
let totalFaltas = 0;
disciplinas.forEach(function (d) {
  totalFaltas = totalFaltas + d.faltas;
});
document.getElementById("card-faltas").textContent = totalFaltas;

// --- Quantas disciplinas com bom desempenho ---
let qtdBom = 0;
disciplinas.forEach(function (d) {
  if (d.situacao === "Bom desempenho") qtdBom = qtdBom + 1;
});
document.getElementById("card-bom").textContent = qtdBom;

// --- Quantas disciplinas precisam de atenção ---
let qtdAtencao = 0;
disciplinas.forEach(function (d) {
  if (d.situacao === "Atenção") qtdAtencao = qtdAtencao + 1;
});
document.getElementById("card-atencao").textContent = qtdAtencao;

// --- Frequência (apenas demonstrativa nesta etapa) ---
document.getElementById("card-frequencia").textContent =
  FREQUENCIA_DEMONSTRATIVA + "%";
document.getElementById("card-frequencia-texto").textContent =
  "Frequência adequada";