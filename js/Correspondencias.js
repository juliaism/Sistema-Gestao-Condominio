/*
 * Correspondencias.js
 * ------------------------------------------------------------------
 * Correspondências do condomínio (correspondencias.html). Duas partes:
 *
 *   1. Gerenciamento (somente porteiro): registra a chegada de uma encomenda
 *      ou carta para um apartamento. O apartamento, o tipo de pacote e a
 *      data são obrigatórios; o item entra no inventário como "pendente".
 *   2. Registro (síndica e porteiro): histórico geral das encomendas e
 *      cartas recebidas. Cada linha mostra o apartamento, o destinatário,
 *      o tipo, o remetente, a data/hora de recebimento, o status (pendente
 *      ou entregue) e, quando já entregue, quem retirou e quando.
 *
 * Filtros: apartamento/destinatário, status e tipo. Se nenhum registro
 * atender aos filtros (ou se o sistema não tiver correspondências), a
 * tabela é escondida e aparece a mensagem
 * "Nenhum registro de correspondência encontrado".
 *
 * Depende de DadosMock.js e Comum.js.
 */

// Garante que há alguém logado (senão redireciona para o login).
const usuarioLogado = exigirLogin();

// Mensagem exibida quando a lista fica vazia, seja porque o sistema não tem
// correspondências, seja porque nada atende ao filtro (cenário 2 da história).
const TEXTO_SEM_REGISTROS = "Nenhum registro de correspondência encontrado";

// Referências aos elementos da tela.
const conteudoCorrespondencias = document.getElementById("conteudo-correspondencias");
const mensagemAcesso = document.getElementById("mensagem-acesso");
const campoBusca = document.getElementById("filtro-busca");
const campoStatus = document.getElementById("filtro-status");
const campoTipo = document.getElementById("filtro-tipo");
const botaoLimpar = document.getElementById("btn-limpar");
const corpoTabela = document.getElementById("corpo-tabela");
const tabelaRolagem = document.getElementById("tabela-rolagem");
const listaVazia = document.getElementById("lista-vazia");
const totalItens = document.getElementById("total-itens");
const totalPendentes = document.getElementById("total-pendentes");
const totalEntregues = document.getElementById("total-entregues");

// Bloco de registro da chegada (só aparece para o porteiro).
const blocoRegistro = document.getElementById("bloco-registro");
const formRegistro = document.getElementById("form-registro");
const mensagemRegistro = document.getElementById("mensagem-registro");
const campoApartamento = document.getElementById("registro-apartamento");
const campoTipoPacote = document.getElementById("registro-tipo");
const campoData = document.getElementById("registro-data");
const campoHora = document.getElementById("registro-hora");
const campoDestinatario = document.getElementById("registro-destinatario");
const campoRemetente = document.getElementById("registro-remetente");

/**
 * Deixa o texto comparável: sem espaços nas pontas e em minúsculas.
 */
function normalizarBusca(texto) {
    return String(texto || "").trim().toLowerCase();
}

/**
 * Aplica os filtros escolhidos ao histórico completo.
 * A busca livre vale para o apartamento e para o nome do destinatário.
 */
function filtrarCorrespondencias() {
    const busca = normalizarBusca(campoBusca.value);
    const status = campoStatus.value;
    const tipo = campoTipo.value;

    return carregarCorrespondencias().filter(item => {
        if (status !== "todos" && item.status !== status) return false;
        if (tipo !== "todos" && item.tipo !== tipo) return false;
        if (!busca) return true;

        const apartamento = normalizarBusca(item.apartamento);
        const destinatario = normalizarBusca(item.destinatario);
        return apartamento.includes(busca) || destinatario.includes(busca);
    });
}

/**
 * Atualiza os totais do resumo (registros, pendentes e entregues)
 * com base na lista que está sendo exibida.
 */
function renderizarResumo(itens) {
    totalItens.textContent = itens.length;
    totalPendentes.textContent = itens.filter(item => item.status === "pendente").length;
    totalEntregues.textContent = itens.filter(item => item.status === "entregue").length;
}

/**
 * Cria a célula de status com a etiqueta colorida
 * ("Pendente" em vermelho, "Entregue" em verde).
 */
function criarCelulaStatus(item) {
    const celula = document.createElement("td");
    const etiqueta = document.createElement("span");
    etiqueta.className = item.status === "entregue" ? "tag tag-ok" : "tag tag-pendente";
    etiqueta.textContent = nomeStatusCorrespondencia(item.status);
    celula.appendChild(etiqueta);
    return celula;
}

/**
 * Monta a célula "Retirado por": o nome de quem retirou e a data/hora da
 * entrega. Itens pendentes ainda estão na portaria.
 */
function criarCelulaRetirada(item) {
    const celula = document.createElement("td");

    if (item.status !== "entregue") {
        celula.className = "celula-secundaria";
        celula.textContent = "Aguardando retirada";
        return celula;
    }

    const nome = document.createElement("span");
    nome.className = "celula-principal";
    nome.textContent = item.retiradoPor || "Não informado";

    const quando = document.createElement("span");
    quando.className = "celula-secundaria";
    quando.textContent = formatarDataHoraBR(item.dataEntrega, item.horaEntrega);

    celula.className = "celula-dupla";
    celula.append(nome, quando);
    return celula;
}

/**
 * Cria uma célula simples de texto.
 */
function criarCelula(texto, classe) {
    const celula = document.createElement("td");
    if (classe) celula.className = classe;
    celula.textContent = texto || "-";
    return celula;
}

/**
 * Desenha uma linha da tabela a partir de uma correspondência.
 */
function criarLinha(item) {
    const linha = document.createElement("tr");
    linha.append(
        criarCelula(item.apartamento ? `Apto ${item.apartamento}` : "-", "celula-principal"),
        criarCelula(item.destinatario),
        criarCelula(nomeTipoCorrespondencia(item.tipo)),
        criarCelula(item.remetente, "celula-secundaria"),
        criarCelula(formatarDataHoraBR(item.data, item.hora)),
        criarCelulaStatus(item),
        criarCelulaRetirada(item)
    );
    return linha;
}

/**
 * Desenha a tabela do histórico com os filtros aplicados.
 * Sem resultados, esconde a tabela e mostra a mensagem de lista vazia
 * (o texto muda se o sistema não tiver nenhuma correspondência cadastrada).
 */
function renderizarCorrespondencias() {
    const itens = filtrarCorrespondencias();
    renderizarResumo(itens);
    corpoTabela.innerHTML = "";

    if (itens.length === 0) {
        listaVazia.textContent = TEXTO_SEM_REGISTROS;
        listaVazia.classList.remove("hidden");
        tabelaRolagem.classList.add("hidden");
        return;
    }

    listaVazia.classList.add("hidden");
    tabelaRolagem.classList.remove("hidden");
    itens.forEach(item => corpoTabela.appendChild(criarLinha(item)));
}

// ---------- Registrar a chegada de uma correspondência ----------

/**
 * Sugere o destinatário quando o porteiro não informa o nome: procura um
 * morador do apartamento (usuários do sistema e pessoas permitidas).
 * Sem ninguém cadastrado, devolve "Morador do Apto <número>".
 */
function sugerirDestinatario(apartamento) {
    const morador = carregarPessoas().find(pessoa =>
        pessoa.tipo === "morador" && normalizarBusca(pessoa.detalhe) === `apto ${normalizarBusca(apartamento)}`
    );
    return morador ? morador.nome : `Morador do Apto ${apartamento}`;
}

/**
 * Confere os campos obrigatórios do registro (apartamento, tipo de pacote
 * e data). Devolve o texto do erro encontrado, ou null se estiver tudo certo.
 */
function validarRegistro(apartamento, tipo, data) {
    if (!apartamento) return "Erro: O número do apartamento é obrigatório";
    if (!tipo) return "Erro: O tipo de pacote é obrigatório";
    if (!data) return "Erro: A data do recebimento é obrigatória";
    if (data > dataDeHoje()) return "Erro: A data do recebimento não pode ser futura";
    return null;
}

/**
 * Envio do formulário ("Registrar"):
 * 1. valida os campos obrigatórios;
 * 2. salva a correspondência como "pendente" no inventário (localStorage);
 * 3. confirma na tela. A tabela se atualiza pelo evento "dados-atualizados".
 */
function registrarCorrespondencia(evento) {
    evento.preventDefault();
    esconderMensagem(mensagemRegistro);

    const apartamento = campoApartamento.value.trim();
    const tipo = campoTipoPacote.value;
    const data = campoData.value;

    const erro = validarRegistro(apartamento, tipo, data);
    if (erro) {
        mostrarMensagem(mensagemRegistro, "erro", erro);
        return;
    }

    const correspondencia = {
        id: `cor-${Date.now()}`,   // id único baseado no horário atual
        tipo,
        apartamento,
        destinatario: campoDestinatario.value.trim() || sugerirDestinatario(apartamento),
        remetente: campoRemetente.value.trim() || "Não informado",
        data,
        hora: campoHora.value || horaDeAgora(),
        recebidoPor: usuarioLogado.id,
        status: "pendente",        // fica na portaria até o morador retirar
        dataEntrega: null,
        horaEntrega: null,
        retiradoPor: null
    };

    const salvas = lerArmazenamento(CHAVE_CORRESPONDENCIAS, []);
    salvas.push(correspondencia);
    salvarArmazenamento(CHAVE_CORRESPONDENCIAS, salvas);

    // Limpa os filtros para que o item recém-registrado apareça no histórico.
    limparFiltros();

    formRegistro.reset();
    prepararFormularioRegistro();
    mostrarMensagem(mensagemRegistro, "sucesso", "Correspondência registrada com sucesso");
}

/**
 * Deixa o formulário pronto para um novo registro: data de hoje, hora atual
 * e sem datas futuras no seletor.
 */
function prepararFormularioRegistro() {
    campoData.max = dataDeHoje();
    campoData.value = dataDeHoje();
    campoHora.value = horaDeAgora();
}

/**
 * Volta os filtros ao estado inicial e mostra o histórico completo.
 */
function limparFiltros() {
    campoBusca.value = "";
    campoStatus.value = "todos";
    campoTipo.value = "todos";
    renderizarCorrespondencias();
}

// Inicialização da página (somente se houver usuário logado).
if (usuarioLogado) {
    renderizarTopo("correspondencias");

    if (!podeVerCorrespondencias(usuarioLogado)) {
        // Moradores não consultam o histórico geral do condomínio.
        conteudoCorrespondencias.classList.add("hidden");
        mostrarMensagem(mensagemAcesso, "erro", "Acesso negado: apenas a síndica e o porteiro podem consultar o registro de correspondências.");
    } else {
        // Quem recebe os itens é o porteiro; a síndica apenas consulta.
        if (ehPorteiro(usuarioLogado)) {
            prepararFormularioRegistro();
            formRegistro.addEventListener("submit", registrarCorrespondencia);
        } else {
            blocoRegistro.classList.add("hidden");
        }

        campoBusca.addEventListener("input", renderizarCorrespondencias);
        campoStatus.addEventListener("change", renderizarCorrespondencias);
        campoTipo.addEventListener("change", renderizarCorrespondencias);
        botaoLimpar.addEventListener("click", limparFiltros);

        // Mantém a tabela atualizada se algo for salvo em outra parte do sistema.
        window.addEventListener("dados-atualizados", renderizarCorrespondencias);

        renderizarCorrespondencias();
    }
}
