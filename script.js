/* ==========================================================
   BOLETIM DIGITAL — script.js
   Dados fictícios (9º Ano) — apenas para demonstração
   ========================================================== */

/* ----------------------------------------------------------
   CONFIGURAÇÃO FIXA DO ALUNO
   ---------------------------------------------------------- */
const CONFIG_ALUNO = {
  turma: "9C",
  numeroChamada: 39,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// Média mínima de referência
const MEDIA_MINIMA = 6.0;

// Frequência DEMONSTRATIVA
const FREQUENCIA_DEMONSTRATIVA = 92;

// PIN armazenado apenas na memória durante a sessão ativada
let pinSessao = "";

// Lista atual de disciplinas em exibição/memória
let disciplinasAtuais = [];

/* ==========================================================
   VARIÁVEIS DE INSTÂNCIA DOS GRÁFICOS (CHART.JS)
   ========================================================== */
let graficoMedias = null;
let graficoEvolucao = null;
let graficoFaltas = null;

/* ==========================================================
   1) DADOS BRUTOS (fictícios, 9º Ano)
   ========================================================== */
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

/* ==========================================================
   2) FUNÇÕES DE NORMALIZAÇÃO E CÁLCULO
   ========================================================== */

function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }
  let numero;
  if (typeof valor === "string") {
    numero = Number(valor.replace(",", "."));
  } else {
    numero = Number(valor);
  }
  if (isNaN(numero)) {
    return null;
  }
  if (numero >= 0 && numero <= 10) {
    return numero;
  }
  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }
  return null;
}

function calcularMedia(notas) {
  const validas = notas.filter(function (n) {
    return n !== null;
  });
  if (validas.length === 0) {
    return null;
  }
  let soma = 0;
  validas.forEach(function (n) {
    soma = soma + n;
  });
  return soma / validas.length;
}

function definirSituacao(media) {
  if (media === null) {
    return "Nota ainda não disponível";
  }
  if (media >= MEDIA_MINIMA) {
    return "Bom desempenho";
  }
  return "Atenção";
}

function formatarNota(valor) {
  if (valor === null) {
    return "—";
  }
  return valor.toFixed(1).replace(".", ",");
}

/* ==========================================================
   3) CARREGAMENTO INICIAL DOS DADOS FICTÍCIOS LOCAIS
   ========================================================== */

function obterDisciplinasIniciais() {
  return dadosBrutos.map(function (d) {
    const n1 = normalizarNota(d.tri1);
    const n2 = normalizarNota(d.tri2);
    const n3 = normalizarNota(d.tri3);

    const f1 = (Array.isArray(d.faltas) && d.faltas[0] !== undefined) ? Number(d.faltas[0]) : 0;
    const f2 = (Array.isArray(d.faltas) && d.faltas[1] !== undefined) ? Number(d.faltas[1]) : 0;
    const f3 = (Array.isArray(d.faltas) && d.faltas[2] !== undefined) ? Number(d.faltas[2]) : 0;

    const totalFaltas = f1 + f2 + f3;
    const media = calcularMedia([n1, n2, n3]);
    const situacao = definirSituacao(media);

    return {
      disciplina: d.disciplina,
      tri1: n1,
      tri2: n2,
      tri3: n3,
      f1: f1,
      f2: f2,
      f3: f3,
      media: media,
      faltas: totalFaltas,
      situacao: situacao
    };
  });
}

/* ==========================================================
   4) ATUALIZAÇÃO DA TELA (TABELA E CARDS)
   ========================================================== */

function renderizarTela(listaDisciplinas) {
  disciplinasAtuais = listaDisciplinas;

  // Limpar tabela
  const corpoTabela = document.getElementById("corpo-tabela");
  corpoTabela.textContent = "";

  listaDisciplinas.forEach(function (d) {
    const linha = document.createElement("tr");

    let classeSituacao = "situacao-neutro";
    if (d.situacao === "Bom desempenho") classeSituacao = "situacao-bom";
    if (d.situacao === "Atenção") classeSituacao = "situacao-atencao";

    const tdNome = document.createElement("td");
    tdNome.textContent = d.disciplina;

    const tdTri1 = document.createElement("td");
    tdTri1.textContent = formatarNota(d.tri1);

    const tdTri2 = document.createElement("td");
    tdTri2.textContent = formatarNota(d.tri2);

    const tdTri3 = document.createElement("td");
    tdTri3.textContent = formatarNota(d.tri3);

    const tdMedia = document.createElement("td");
    tdMedia.textContent = formatarNota(d.media);

    const tdFaltas = document.createElement("td");
    tdFaltas.textContent = d.faltas;

    const tdSituacao = document.createElement("td");
    tdSituacao.textContent = d.situacao;
    tdSituacao.className = classeSituacao;

    linha.appendChild(tdNome);
    linha.appendChild(tdTri1);
    linha.appendChild(tdTri2);
    linha.appendChild(tdTri3);
    linha.appendChild(tdMedia);
    linha.appendChild(tdFaltas);
    linha.appendChild(tdSituacao);

    corpoTabela.appendChild(linha);
  });

  // Atualizar cards
  const mediasValidas = listaDisciplinas
    .map(function (d) { return d.media; })
    .filter(function (m) { return m !== null; });

  let mediaGeral = null;
  if (mediasValidas.length > 0) {
    let soma = 0;
    mediasValidas.forEach(function (m) { soma = soma + m; });
    mediaGeral = soma / mediasValidas.length;
  }

  document.getElementById("card-media").textContent = formatarNota(mediaGeral);

  let totalFaltas = 0;
  listaDisciplinas.forEach(function (d) {
    totalFaltas = totalFaltas + d.faltas;
  });
  document.getElementById("card-faltas").textContent = totalFaltas;

  let qtdBom = 0;
  listaDisciplinas.forEach(function (d) {
    if (d.situacao === "Bom desempenho") qtdBom = qtdBom + 1;
  });
  document.getElementById("card-bom").textContent = qtdBom;

  let qtdAtencao = 0;
  listaDisciplinas.forEach(function (d) {
    if (d.situacao === "Atenção") qtdAtencao = qtdAtencao + 1;
  });
  document.getElementById("card-atencao").textContent = qtdAtencao;

  document.getElementById("card-frequencia").textContent = FREQUENCIA_DEMONSTRATIVA + "%";
  document.getElementById("card-frequencia-texto").textContent = "Frequência adequada";

  // Atualizar a camada visual de gráficos se houver função definida
  if (typeof atualizarGraficos === "function") {
    atualizarGraficos();
  }
}

/* ==========================================================
   5) PROCESSAR DADOS RECEBIDOS DA API
   ========================================================== */

function processarDadosAPI(dadosAPI) {
  if (!dadosAPI || !Array.isArray(dadosAPI.disciplinas) || dadosAPI.disciplinas.length === 0) {
    return obterDisciplinasIniciais();
  }

  return dadosAPI.disciplinas.map(function (d) {
    const n1 = normalizarNota(d.tri1);
    const n2 = normalizarNota(d.tri2);
    const n3 = normalizarNota(d.tri3);

    let f1 = 0, f2 = 0, f3 = 0;
    if (Array.isArray(d.faltas)) {
      f1 = Number(d.faltas[0]) || 0;
      f2 = Number(d.faltas[1]) || 0;
      f3 = Number(d.faltas[2]) || 0;
    } else {
      f1 = Number(d.f1) || 0;
      f2 = Number(d.f2) || 0;
      f3 = Number(d.f3) || 0;
    }

    const totalFaltas = f1 + f2 + f3;
    const media = calcularMedia([n1, n2, n3]);
    const situacao = definirSituacao(media);

    return {
      disciplina: d.disciplina,
      tri1: n1,
      tri2: n2,
      tri3: n3,
      f1: f1,
      f2: f2,
      f3: f3,
      media: media,
      faltas: totalFaltas,
      situacao: situacao
    };
  });
}

/* ==========================================================
   6) EVENTOS DE AUTENTICAÇÃO (LOGIN / CONEXÃO)
   ========================================================== */

const formLogin = document.getElementById("form-login");
const inputPin = document.getElementById("input-pin");
const msgStatus = document.getElementById("mensagem-status");
const areaAcesso = document.getElementById("area-acesso");
const areaBoletim = document.getElementById("area-boletim");

formLogin.addEventListener("submit", function (e) {
  e.preventDefault();
  const pinDigitado = inputPin.value.trim();

  if (!pinDigitado) {
    msgStatus.textContent = "Por favor, digite o PIN.";
    return;
  }

  msgStatus.textContent = "Conectando...";

  fetch(CONFIG_ALUNO.apiUrl + "/api/v1/boletins/abrir", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      turma: CONFIG_ALUNO.turma,
      numero_chamada: CONFIG_ALUNO.numeroChamada,
      pin: pinDigitado
    })
  })
  .then(function (resposta) {
    if (resposta.status === 401) {
      throw new Error("Turma, chamada ou PIN inválidos.");
    }
    if (resposta.status === 429) {
      throw new Error("Muitas tentativas. Aguarde um minuto e tente novamente.");
    }
    if (!resposta.ok) {
      throw new Error("Não foi possível conectar ao servidor. Tente novamente.");
    }
    return resposta.json();
  })
  .then(function (dadosRecebidos) {
    pinSessao = pinDigitado;
    inputPin.value = "";
    msgStatus.textContent = "";

    areaAcesso.classList.add("oculto");
    areaBoletim.classList.remove("oculto");

    let listaParaExibir;
    if (dadosRecebidos && dadosRecebidos.dados) {
      listaParaExibir = processarDadosAPI(dadosRecebidos.dados);
    } else {
      listaParaExibir = obterDisciplinasIniciais();
    }

    renderizarTela(listaParaExibir);
  })
  .catch(function (erro) {
    if (erro.message) {
      msgStatus.textContent = erro.message;
    } else {
      msgStatus.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
    }
  });
});

/* ==========================================================
   7) EDIÇÃO E VALIDAÇÃO DE NOTAS E FALTAS
   ========================================================== */

const btnAlterar = document.getElementById("btn-alterar");
const modalEdicao = document.getElementById("modal-edicao");
const corpoEdicao = document.getElementById("corpo-edicao");
const btnCancelar = document.getElementById("btn-cancelar");
const btnSalvar = document.getElementById("btn-salvar");
const erroEdicao = document.getElementById("erro-edicao");

btnAlterar.addEventListener("click", function () {
  corpoEdicao.textContent = "";
  erroEdicao.classList.add("oculto");
  erroEdicao.textContent = "";

  disciplinasAtuais.forEach(function (d, idx) {
    const tr = document.createElement("tr");

    const tdNome = document.createElement("td");
    tdNome.textContent = d.disciplina;
    tr.appendChild(tdNome);

    function criarInputNota(val) {
      const inp = document.createElement("input");
      inp.type = "text";
      inp.value = val !== null ? String(val).replace(".", ",") : "";
      return inp;
    }

    function criarInputFalta(val) {
      const inp = document.createElement("input");
      inp.type = "text";
      inp.value = val !== null && val !== undefined ? String(val) : "0";
      return inp;
    }

    const inpN1 = criarInputNota(d.tri1);
    const inpN2 = criarInputNota(d.tri2);
    const inpN3 = criarInputNota(d.tri3);

    const inpF1 = criarInputFalta(d.f1);
    const inpF2 = criarInputFalta(d.f2);
    const inpF3 = criarInputFalta(d.f3);

    [inpN1, inpN2, inpN3, inpF1, inpF2, inpF3].forEach(function (inp) {
      const td = document.createElement("td");
      td.appendChild(inp);
      tr.appendChild(td);
    });

    tr.dataset.index = idx;
    corpoEdicao.appendChild(tr);
  });

  modalEdicao.classList.remove("oculto");
});

btnCancelar.addEventListener("click", function () {
  modalEdicao.classList.add("oculto");
});

function validarNotaDigitada(str) {
  const v = str.trim();
  if (v === "") return { valida: true, valor: null };
  const num = Number(v.replace(",", "."));
  if (isNaN(num) || num < 0 || num > 10) {
    return { valida: false, valor: null };
  }
  return { valida: true, valor: num };
}

function validarFaltaDigitada(str) {
  const v = str.trim();
  if (v === "") return { valida: false, valor: null };
  const num = Number(v);
  if (isNaN(num) || !Number.isInteger(num) || num < 0) {
    return { valida: false, valor: null };
  }
  return { valida: true, valor: num };
}

btnSalvar.addEventListener("click", function () {
  erroEdicao.classList.add("oculto");
  erroEdicao.textContent = "";

  const linhas = corpoEdicao.querySelectorAll("tr");
  let temErro = false;
  const disciplinasEditadas = [];

  linhas.forEach(function (tr) {
    const inputs = tr.querySelectorAll("input");
    inputs.forEach(function (i) { i.classList.remove("campo-invalido"); });

    const valN1 = validarNotaDigitada(inputs[0].value);
    const valN2 = validarNotaDigitada(inputs[1].value);
    const valN3 = validarNotaDigitada(inputs[2].value);

    const valF1 = validarFaltaDigitada(inputs[3].value);
    const valF2 = validarFaltaDigitada(inputs[4].value);
    const valF3 = validarFaltaDigitada(inputs[5].value);

    if (!valN1.valida) { inputs[0].classList.add("campo-invalido"); temErro = true; }
    if (!valN2.valida) { inputs[1].classList.add("campo-invalido"); temErro = true; }
    if (!valN3.valida) { inputs[2].classList.add("campo-invalido"); temErro = true; }

    if (!valF1.valida) { inputs[3].classList.add("campo-invalido"); temErro = true; }
    if (!valF2.valida) { inputs[4].classList.add("campo-invalido"); temErro = true; }
    if (!valF3.valida) { inputs[5].classList.add("campo-invalido"); temErro = true; }

    const nomeDisc = tr.cells[0].textContent;

    if (!temErro) {
      disciplinasEditadas.push({
        disciplina: nomeDisc,
        tri1: valN1.valor,
        tri2: valN2.valor,
        tri3: valN3.valor,
        faltas: [valF1.valor, valF2.valor, valF3.valor]
      });
    }
  });

  if (temErro) {
    erroEdicao.textContent = "Verifique os campos destacados. Notas devem ser entre 0 e 10 e faltas devem ser números inteiros (0 ou mais).";
    erroEdicao.classList.remove("oculto");
    return;
  }

  const payload = {
    turma: CONFIG_ALUNO.turma,
    numero_chamada: CONFIG_ALUNO.numeroChamada,
    pin: pinSessao,
    dados: {
      disciplinas: disciplinasEditadas
    }
  };

  btnSalvar.disabled = true;
  btnSalvar.textContent = "Salvando...";

  fetch(CONFIG_ALUNO.apiUrl + "/api/v1/boletins/salvar", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(function (resposta) {
    if (!resposta.ok) {
      throw new Error("Erro ao salvar alterações no servidor.");
    }
    return resposta.json();
  })
  .then(function () {
    modalEdicao.classList.add("oculto");
    btnSalvar.disabled = false;
    btnSalvar.textContent = "Salvar Alterações";
    renderizarTela(processarDadosAPI({ disciplinas: disciplinasEditadas }));
  })
  .catch(function (erro) {
    btnSalvar.disabled = false;
    btnSalvar.textContent = "Salvar Alterações";
    erroEdicao.textContent = erro.message || "Erro ao salvar alterações.";
    erroEdicao.classList.remove("oculto");
  });
});