/*
 * Comum.js
 * ------------------------------------------------------------------
 * Funções compartilhadas por todas as telas do sistema:
 *   - armazenamento local (salvar/ler dados no navegador);
 *   - sessão do usuário (login, logout e verificação de perfil);
 *   - cabeçalho de navegação;
 *   - exibição de mensagens de sucesso/erro;
 *   - utilitários de data e texto.
 *
 * Depende de DadosMock.js (usa a lista usuariosMock).
 */

// Chaves usadas para guardar informações no navegador.
const CHAVE_SESSAO = "condominio:usuario";     // id do usuário logado (sessionStorage)
const CHAVE_EVENTOS = "condominio:eventos";    // eventos criados pela síndica (localStorage)
const CHAVE_RESERVAS = "condominio:reservas";  // reservas criadas pelos moradores (localStorage)
const CHAVE_PESSOAS = "condominio:pessoas";    // pessoas permitidas cadastradas pelo porteiro (localStorage)
const CHAVE_VEICULOS = "condominio:veiculos";  // veículos permitidos cadastrados pelo porteiro (localStorage)
const CHAVE_ACESSOS = "condominio:acessos";    // registro de entradas/consultas da portaria (localStorage)

// Páginas que aparecem no menu do cabeçalho.
// "id" é usado para destacar a página em que o usuário está.
// "arquivo" é o caminho a partir da raiz do projeto (ver caminho()).
// "perfis" limita quem vê o link (sem "perfis", todos veem).
const PAGINAS = [
    { id: "inicio", titulo: "Início", arquivo: "index.html" },
    { id: "calendario", titulo: "Calendário", arquivo: "pages/calendario-condominial.html" },
    { id: "reservas", titulo: "Reservas", arquivo: "pages/reservas.html", perfis: ["admin", "morador"] },
    { id: "portaria", titulo: "Portaria", arquivo: "pages/portaria.html", perfis: ["porteiro"] }
];

// Tela de login, a partir da raiz do projeto.
const PAGINA_LOGIN = "pages/login.html";

/**
 * Converte um caminho escrito a partir da raiz do projeto
 * (ex.: "pages/reservas.html") em um caminho que funciona na página atual.
 * Cada página informa onde fica a raiz no atributo data-raiz do <body>:
 *   index.html        -> data-raiz=""    (já está na raiz)
 *   pages/*.html      -> data-raiz="../" (um nível abaixo)
 */
function caminho(arquivo) {
    const raiz = document.body ? (document.body.dataset.raiz || "") : "";
    return raiz + arquivo;
}

// ---------- Armazenamento local (persiste os dados mockados entre páginas) ----------

/**
 * Lê um valor salvo no localStorage e converte de JSON para objeto.
 * Se não houver nada salvo (ou o navegador bloquear o acesso),
 * devolve o valorPadrao informado.
 */
function lerArmazenamento(chave, valorPadrao) {
    try {
        const valor = localStorage.getItem(chave);
        return valor ? JSON.parse(valor) : valorPadrao;
    } catch (erro) {
        return valorPadrao;
    }
}

/**
 * Converte o valor para JSON e salva no localStorage.
 * Assim, eventos e reservas criados continuam existindo ao
 * recarregar a página ou trocar de tela.
 */
function salvarArmazenamento(chave, valor) {
    try {
        localStorage.setItem(chave, JSON.stringify(valor));
    } catch (erro) {
        console.warn("Não foi possível salvar os dados localmente.", erro);
    }
    // Avisa o painel "Dados mockados" (DadosTeste.js) para se atualizar.
    window.dispatchEvent(new Event("dados-atualizados"));
}

// ---------- Sessão (autenticação mockada) ----------

/**
 * Procura um usuário com o e-mail e a senha informados.
 * Se encontrar, guarda o id dele no sessionStorage (a "sessão")
 * e devolve o usuário; caso contrário, devolve null.
 * O sessionStorage é apagado quando a aba do navegador é fechada.
 */
function fazerLogin(email, senha) {
    const usuario = usuariosMock.find(u =>
        u.email.toLowerCase() === email.toLowerCase() && u.senha === senha
    );
    if (!usuario) return null;

    try {
        sessionStorage.setItem(CHAVE_SESSAO, usuario.id);
    } catch (erro) {
        console.warn("Não foi possível iniciar a sessão.", erro);
    }
    return usuario;
}

/**
 * Devolve o usuário que está logado no momento,
 * ou null se ninguém tiver feito login.
 */
function usuarioAtual() {
    let id = null;
    try {
        id = sessionStorage.getItem(CHAVE_SESSAO);
    } catch (erro) {
        return null;
    }
    return usuariosMock.find(u => u.id === id) || null;
}

/**
 * Indica se o usuário tem perfil administrativo (síndica).
 * Usado para liberar ou bloquear o registro de eventos.
 */
function ehAdministrador(usuario) {
    return Boolean(usuario) && usuario.perfil === "admin";
}

/**
 * Indica se o usuário é porteiro (acesso ao controle de portaria).
 */
function ehPorteiro(usuario) {
    return Boolean(usuario) && usuario.perfil === "porteiro";
}

/**
 * Protege as páginas internas: se não houver usuário logado,
 * redireciona para a tela de login. Devolve o usuário logado (ou null).
 */
function exigirLogin() {
    const usuario = usuarioAtual();
    if (!usuario) {
        window.location.replace(caminho(PAGINA_LOGIN));
    }
    return usuario;
}

/**
 * Encerra a sessão (remove o id salvo) e volta para o login.
 */
function sair() {
    try {
        sessionStorage.removeItem(CHAVE_SESSAO);
    } catch (erro) {
        // sessão já indisponível, nada a remover
    }
    window.location.href = caminho(PAGINA_LOGIN);
}

/**
 * Devolve os dados do perfil (nome, resumo e permissões) de um usuário.
 */
function buscarPerfil(usuario) {
    return perfisMock.find(perfil => perfil.id === usuario.perfil) || null;
}

// ---------- Consultas aos dados ----------

/**
 * Devolve todas as reservas: as mockadas (DadosMock.js) somadas às
 * criadas pelos moradores durante o uso (salvas no localStorage).
 */
function carregarReservas() {
    return reservasMock.concat(lerArmazenamento(CHAVE_RESERVAS, []));
}

/**
 * Devolve todos os eventos do condomínio, ordenados por data e horário:
 * os de exemplo do calendário (mockEventos, declarado em Calendario.js)
 * somados aos registrados pela síndica (salvos no localStorage).
 * Cada item tem o formato { data, titulo, horario, local }.
 * Se a página não carregou Calendario.js, usa só os registrados.
 */
function carregarTodosEventos() {
    const eventos = [];

    // Eventos de exemplo do calendário, agrupados por data
    if (typeof mockEventos !== "undefined") {
        Object.entries(mockEventos).forEach(([data, lista]) => {
            lista.forEach(evento => {
                // Eventos registrados pela síndica (id "evt-...") também são copiados
                // para mockEventos no calendário; aqui vêm só do localStorage.
                if (String(evento.id).startsWith("evt-")) return;
                eventos.push({ data, titulo: evento.titulo, horario: evento.horario, local: evento.local });
            });
        });
    }

    // Eventos registrados pela síndica
    lerArmazenamento(CHAVE_EVENTOS, []).forEach(evento => {
        eventos.push({
            data: evento.data,
            titulo: evento.titulo,
            horario: `${evento.inicio} - ${evento.fim}`,
            local: evento.local
        });
    });

    return eventos.sort((a, b) => (a.data + a.horario).localeCompare(b.data + b.horario));
}

/**
 * Busca uma área comum pelo id. Devolve null se não existir.
 */
function buscarArea(areaId) {
    return areasComunsMock.find(area => area.id === areaId) || null;
}

/**
 * Busca um usuário pelo id. Devolve null se não existir.
 */
function buscarUsuario(usuarioId) {
    return usuariosMock.find(usuario => usuario.id === usuarioId) || null;
}

// ---------- Portaria: CPF, placas, pessoas e veículos ----------

// Nomes dos tipos de pessoa/veículo permitidos, usados nas telas.
const TIPOS_ACESSO = {
    morador: "Morador",
    visitante: "Visitante",
    funcionario: "Funcionário"
};

/**
 * Deixa só os números de um CPF (ex.: "123.456.789-09" -> "12345678909").
 */
function limparCpf(cpf) {
    return String(cpf || "").replace(/\D/g, "");
}

/**
 * Formata 11 números como CPF (ex.: "12345678909" -> "123.456.789-09").
 * Se não tiver 11 números, devolve o texto como veio.
 */
function formatarCpf(cpf) {
    const n = limparCpf(cpf);
    if (n.length !== 11) return String(cpf || "");
    return `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6, 9)}-${n.slice(9)}`;
}

/**
 * Confere se o CPF é válido: 11 números, não repetidos (111.111.111-11)
 * e com os dois dígitos verificadores corretos.
 */
function validarCpf(cpf) {
    const n = limparCpf(cpf);
    if (n.length !== 11 || /^(\d)\1{10}$/.test(n)) return false;

    const digito = (tamanho) => {
        let soma = 0;
        for (let i = 0; i < tamanho; i++) {
            soma += Number(n[i]) * (tamanho + 1 - i);
        }
        const resto = (soma * 10) % 11;
        return resto === 10 ? 0 : resto;
    };
    return digito(9) === Number(n[9]) && digito(10) === Number(n[10]);
}

/**
 * Coloca a placa em maiúsculas e sem hífen/espaços (ex.: "abc-1d23" -> "ABC1D23").
 */
function normalizarPlaca(placa) {
    return String(placa || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/**
 * Aceita o padrão antigo (ABC1234) e o Mercosul (ABC1D23).
 */
function validarPlaca(placa) {
    return /^[A-Z]{3}\d[A-Z0-9]\d{2}$/.test(normalizarPlaca(placa));
}

/**
 * Mostra a placa como é vista na rua: "ABC-1234" (antiga) ou "ABC1D23" (Mercosul).
 */
function formatarPlaca(placa) {
    const p = normalizarPlaca(placa);
    return /^[A-Z]{3}\d{4}$/.test(p) ? `${p.slice(0, 3)}-${p.slice(3)}` : p;
}

/**
 * Devolve todas as pessoas permitidas no condomínio, no formato
 * { id, nome, cpf, tipo, detalhe, origem }:
 *   - os usuários do sistema (moradores, síndica e porteiro);
 *   - as pessoas mockadas (pessoasMock);
 *   - as cadastradas pelo porteiro durante o uso (localStorage).
 */
function carregarPessoas() {
    const usuarios = usuariosMock.map(usuario => ({
        id: usuario.id,
        nome: usuario.nome,
        cpf: usuario.cpf,
        tipo: usuario.perfil === "morador" ? "morador" : "funcionario",
        detalhe: usuario.apartamento
            ? `Apto ${usuario.apartamento}`
            : (usuario.perfil === "porteiro" ? "Portaria" : "Administração"),
        origem: "Exemplo"
    }));
    const exemplos = pessoasMock.map(pessoa => ({ ...pessoa, origem: "Exemplo" }));
    const criadas = lerArmazenamento(CHAVE_PESSOAS, []).map(pessoa => ({ ...pessoa, origem: "Cadastrada" }));
    return usuarios.concat(exemplos, criadas);
}

/**
 * Devolve todos os veículos permitidos (mockados + cadastrados pelo porteiro),
 * no formato { id, placa, modelo, cor, tipo, proprietario, detalhe, origem }.
 */
function carregarVeiculos() {
    const exemplos = veiculosMock.map(veiculo => ({ ...veiculo, origem: "Exemplo" }));
    const criados = lerArmazenamento(CHAVE_VEICULOS, []).map(veiculo => ({ ...veiculo, origem: "Cadastrado" }));
    return exemplos.concat(criados);
}

// ---------- Cabeçalho ----------

/**
 * Monta o cabeçalho no elemento <header id="topo"> da página:
 * nome do sistema, menu de navegação, nome/cargo do usuário e botão "Sair".
 * paginaAtiva: id da página atual (ver PAGINAS), para destacar no menu.
 *
 * Os elementos são criados com createElement/textContent (e não innerHTML)
 * para que nenhum texto seja interpretado como HTML.
 */
function renderizarTopo(paginaAtiva) {
    const topo = document.getElementById("topo");
    const usuario = usuarioAtual();
    if (!topo || !usuario) return;

    topo.innerHTML = "";

    // Nome do sistema (lado esquerdo)
    const marca = document.createElement("span");
    marca.className = "topo-marca";
    marca.textContent = "Gestão Condominial";

    // Menu com um link para cada página
    const nav = document.createElement("nav");
    nav.className = "topo-nav";
    PAGINAS.filter(pagina => !pagina.perfis || pagina.perfis.includes(usuario.perfil)).forEach(pagina => {
        const link = document.createElement("a");
        link.className = "topo-link";
        link.href = caminho(pagina.arquivo);
        link.textContent = pagina.titulo;
        if (pagina.id === paginaAtiva) {
            link.classList.add("ativo");                  // destaque visual
            link.setAttribute("aria-current", "page");    // acessibilidade: página atual
        }
        nav.appendChild(link);
    });

    // Informações do usuário logado (lado direito)
    const areaUsuario = document.createElement("div");
    areaUsuario.className = "topo-usuario";

    const nome = document.createElement("span");
    nome.textContent = usuario.apartamento
        ? `${usuario.nome} (Apto ${usuario.apartamento})`
        : usuario.nome;

    const perfil = document.createElement("span");
    perfil.className = "perfil-badge";
    perfil.textContent = usuario.cargo;

    const botaoSair = document.createElement("button");
    botaoSair.type = "button";
    botaoSair.className = "btn btn-secundario btn-pequeno";
    botaoSair.textContent = "Sair";
    botaoSair.addEventListener("click", sair);

    areaUsuario.append(nome, perfil, botaoSair);
    topo.append(marca, nav, areaUsuario);
}

// ---------- Mensagens ----------

/**
 * Mostra uma mensagem na caixa indicada.
 * tipo: "sucesso" (verde) ou "erro" (vermelho); ver classes em Sistema.css.
 */
function mostrarMensagem(elemento, tipo, texto) {
    elemento.textContent = texto;
    elemento.className = `mensagem mensagem-${tipo}`;
}

/**
 * Limpa e esconde a caixa de mensagem.
 */
function esconderMensagem(elemento) {
    elemento.textContent = "";
    elemento.className = "mensagem hidden";
}

// ---------- Utilitários ----------

/**
 * Devolve a data de hoje no formato AAAA-MM-DD (o mesmo usado pelos
 * campos <input type="date"> e pelos dados). Nesse formato, datas podem
 * ser comparadas diretamente como texto (ex.: "2026-10-01" < "2026-10-15").
 */
function dataDeHoje() {
    const hoje = new Date();
    const mm = String(hoje.getMonth() + 1).padStart(2, "0");  // getMonth() começa em 0
    const dd = String(hoje.getDate()).padStart(2, "0");
    return `${hoje.getFullYear()}-${mm}-${dd}`;
}

/**
 * Converte uma data AAAA-MM-DD para o formato brasileiro DD/MM/AAAA.
 */
function formatarDataBR(dataString) {
    const [ano, mes, dia] = dataString.split("-");
    return `${dia}/${mes}/${ano}`;
}

/**
 * Devolve as iniciais do nome (ex.: "Fernanda Lima" -> "FL"),
 * usadas no avatar dos usuários.
 */
function iniciais(nome) {
    return nome
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(parte => parte[0])
        .join("")
        .toUpperCase();
}

/**
 * Troca caracteres especiais do HTML (<, >, &, aspas) por códigos seguros.
 * Necessário quando um texto digitado pelo usuário vai ser exibido com
 * innerHTML: assim ele aparece como texto, sem virar código na página.
 */
function escaparHtml(texto) {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
