/*
 * Requerimentos.js
 * ------------------------------------------------------------------
 * Implementação das Histórias de Usuário:
 * - CARTÃO 1: Seleção do tipo de requerimento (Cenários 1 e 2)
 * - CARTÃO 2: Escrita do requerimento (Cenários 1 e 2)
 */

const usuarioLogado = exigirLogin();

// Restrição de acesso para porteiro
if (ehPorteiro(usuarioLogado)) {
    window.location.replace(caminho("index.html"));
}

const formRequerimento = document.getElementById("form-requerimento");
const campoTipo = document.getElementById("requerimento-tipo");
const campoTexto = document.getElementById("requerimento-texto");
const mensagemRequerimento = document.getElementById("mensagem-requerimento");
const listaRequerimentos = document.getElementById("lista-requerimentos");

/**
 * Preenche o dropdown com os tipos disponíveis (Cartão 1)
 */
function preencherTiposRequerimento() {
    tiposRequerimentoMock.forEach(tipo => {
        const opcao = document.createElement("option");
        opcao.value = tipo.id;
        opcao.textContent = tipo.nome;
        campoTipo.appendChild(opcao);
    });
}

/**
 * Renderiza a lista de requerimentos cadastrados no sistema
 */
function renderizarListaRequerimentos() {
    listaRequerimentos.innerHTML = "";

    const requerimentos = carregarRequerimentos()
        .filter(req => ehAdministrador(usuarioLogado) || req.moradorId === usuarioLogado.id)
        .sort((a, b) => b.data.localeCompare(a.data));

    if (requerimentos.length === 0) {
        const vazio = document.createElement("li");
        vazio.className = "registro-item";
        vazio.textContent = "Nenhum requerimento registrado.";
        listaRequerimentos.appendChild(vazio);
        return;
    }

    requerimentos.forEach(req => {
        const tipoObj = tiposRequerimentoMock.find(t => t.id === req.tipo);
        const morador = buscarUsuario(req.moradorId);

        const item = document.createElement("li");
        item.className = "registro-item";

        const info = document.createElement("div");

        const titulo = document.createElement("p");
        titulo.className = "registro-titulo";
        titulo.textContent = `${tipoObj ? tipoObj.nome : req.tipo} — ${formatarDataBR(req.data)} [${req.status}]`;

        const desc = document.createElement("p");
        desc.className = "registro-detalhe";
        desc.textContent = req.descricao;

        info.append(titulo, desc);

        if (ehAdministrador(usuarioLogado) && morador) {
            const autor = document.createElement("p");
            autor.className = "registro-detalhe";
            autor.textContent = `Solicitante: ${morador.nome} (${morador.apartamento || 'Geral'})`;
            info.appendChild(autor);
        }

        item.appendChild(info);
        listaRequerimentos.appendChild(item);
    });
}

/**
 * Validação BDD das duas histórias:
 * - Cartão 1 / Cenário 2 (Falha): Dispara erro se nenhum tipo for selecionado.
 * - Cartão 2 / Cenário 2 (Falha): Dispara erro se a descrição estiver em branco.
 */
function validarCenariosBDD(tipo, texto) {
    if (!tipo) {
        return "Por favor, selecione um tipo de requerimento.";
    }
    if (!texto) {
        return "O campo do requerimento deve ser preenchido.";
    }
    return null;
}

/**
 * Submissão do formulário cobrindo os cenários de Sucesso:
 * - Cartão 1 / Cenário 1: Registra o tipo selecionado.
 * - Cartão 2 / Cenário 1: Registra e permite o envio do texto preenchido.
 */
function salvarRequerimento(e) {
    e.preventDefault();
    esconderMensagem(mensagemRequerimento);

    const tipo = campoTipo.value;
    const texto = campoTexto.value.trim();

    // Verificação dos Cenários de Falha
    const mensagemErro = validarCenariosBDD(tipo, texto);
    if (mensagemErro) {
        mostrarMensagem(mensagemRequerimento, "erro", mensagemErro);
        return;
    }

    // Processamento do Cenário de Sucesso
    const novoRequerimento = {
        id: `req-${Date.now()}`,
        tipo: tipo,
        descricao: texto,
        moradorId: usuarioLogado.id,
        data: dataDeHoje(),
        status: "Pendente"
    };

    const requerimentosSalvos = lerArmazenamento(CHAVE_REQUERIMENTOS, []);
    requerimentosSalvos.push(novoRequerimento);
    salvarArmazenamento(CHAVE_REQUERIMENTOS, requerimentosSalvos);

    mostrarMensagem(mensagemRequerimento, "sucesso", "Requerimento registrado e enviado com sucesso!");
    formRequerimento.reset();
    renderizarListaRequerimentos();
}

// Inicialização da tela
if (usuarioLogado) {
    renderizarTopo("requerimentos");
    preencherTiposRequerimento();
    renderizarListaRequerimentos();
    formRequerimento.addEventListener("submit", salvarRequerimento);
}