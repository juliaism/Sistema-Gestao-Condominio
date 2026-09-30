/*
 * Login.js
 * ------------------------------------------------------------------
 * Lógica da tela de login (login.html):
 *   - mostra os perfis (Síndica, Morador) e o que cada um pode fazer;
 *   - lista os usuários do perfil escolhido; clicar em um deles faz o login;
 *   - permite também entrar digitando e-mail e senha;
 *   - após o login, abre a página inicial.
 *
 * Depende de DadosMock.js e Comum.js.
 */

// Página aberta depois que o usuário entra no sistema (caminho a partir da raiz).
const PAGINA_INICIAL = "index.html";

// Referências aos elementos da tela.
const listaPerfis = document.getElementById("lista-perfis");
const permissoesPerfil = document.getElementById("permissoes-perfil");
const listaUsuarios = document.getElementById("lista-usuarios");
const formLogin = document.getElementById("form-login");
const campoEmail = document.getElementById("email");
const campoSenha = document.getElementById("senha");
const mensagemLogin = document.getElementById("mensagem-login");

// Perfil escolhido no momento (começa pelo primeiro da lista).
let perfilSelecionado = perfisMock[0].id;

// Se o usuário já estiver logado, não faz sentido mostrar o login de novo.
if (usuarioAtual()) {
    window.location.replace(caminho(PAGINA_INICIAL));
}

/**
 * Tenta fazer login. Se der certo, abre a página inicial;
 * se não, mostra a mensagem de erro.
 */
function entrar(email, senha) {
    const usuario = fazerLogin(email, senha);
    if (!usuario) {
        mostrarMensagem(mensagemLogin, "erro", "E-mail ou senha inválidos.");
        return;
    }
    window.location.href = caminho(PAGINA_INICIAL);
}

/**
 * Cria um botão para cada perfil. O perfil escolhido fica destacado
 * (aria-pressed="true") e define quais usuários aparecem abaixo.
 */
function renderizarPerfis() {
    listaPerfis.innerHTML = "";

    perfisMock.forEach(perfil => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "perfil-opcao";
        botao.setAttribute("aria-pressed", String(perfil.id === perfilSelecionado));

        const nome = document.createElement("span");
        nome.className = "perfil-nome";
        nome.textContent = perfil.nome;

        const resumo = document.createElement("span");
        resumo.className = "perfil-resumo";
        resumo.textContent = perfil.resumo;

        botao.append(nome, resumo);
        botao.addEventListener("click", () => {
            perfilSelecionado = perfil.id;
            esconderMensagem(mensagemLogin);
            renderizarPerfis();
            renderizarUsuarios();
        });

        listaPerfis.appendChild(botao);
    });
}

/**
 * Mostra as permissões do perfil escolhido e um cartão para cada
 * usuário desse perfil. Clicar no cartão faz o login com esse usuário.
 */
function renderizarUsuarios() {
    const perfil = perfisMock.find(p => p.id === perfilSelecionado);

    // Lista "o que este perfil pode fazer"
    permissoesPerfil.innerHTML = "";
    perfil.permissoes.forEach(texto => {
        const item = document.createElement("li");
        item.textContent = texto;
        permissoesPerfil.appendChild(item);
    });

    // Cartões dos usuários do perfil
    listaUsuarios.innerHTML = "";
    usuariosMock
        .filter(usuario => usuario.perfil === perfilSelecionado)
        .forEach(usuario => {
            const cartao = document.createElement("button");
            cartao.type = "button";
            cartao.className = "usuario-card";

            // Círculo com as iniciais do nome
            const avatar = document.createElement("span");
            avatar.className = "avatar";
            avatar.textContent = iniciais(usuario.nome);

            const info = document.createElement("span");
            info.className = "usuario-info";

            const nome = document.createElement("span");
            nome.className = "usuario-nome";
            nome.textContent = usuario.nome;

            const detalhe = document.createElement("span");
            detalhe.className = "usuario-detalhe";
            detalhe.textContent = usuario.apartamento
                ? `Apto ${usuario.apartamento} | ${usuario.email}`
                : `${usuario.cargo} | ${usuario.email}`;

            info.append(nome, detalhe);

            const acao = document.createElement("span");
            acao.className = "usuario-entrar";
            acao.textContent = "Entrar";

            cartao.append(avatar, info, acao);
            cartao.addEventListener("click", () => entrar(usuario.email, usuario.senha));

            listaUsuarios.appendChild(cartao);
        });
}

// Envio do formulário de e-mail e senha.
formLogin.addEventListener("submit", (evento) => {
    evento.preventDefault(); // impede o recarregamento padrão da página
    entrar(campoEmail.value.trim(), campoSenha.value);
});

// Monta a tela ao abrir a página.
renderizarPerfis();
renderizarUsuarios();
