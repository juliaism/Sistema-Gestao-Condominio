/*
 * DadosMock.js
 * ------------------------------------------------------------------
 * Dados "falsos" (mockados) usados pelo sistema, já que o projeto não
 * possui backend nem banco de dados. Estes valores são o estado inicial
 * da aplicação; o que o usuário cria durante o uso (eventos, reservas,
 * pessoas e veículos permitidos) é salvo separadamente no localStorage
 * (ver Comum.js).
 *
 * Este arquivo deve ser carregado ANTES de Comum.js e das demais telas,
 * pois elas usam as constantes declaradas aqui.
 */

/*
 * Perfis de acesso do sistema, exibidos na tela de login e na página inicial.
 * - id:         valor usado no campo "perfil" dos usuários
 * - nome:       nome do perfil mostrado na tela
 * - resumo:     frase curta abaixo do nome
 * - permissoes: o que o perfil pode fazer no sistema
 */
const perfisMock = [
    {
        id: "admin",
        nome: "Síndica",
        resumo: "Administração",
        permissoes: [
            "Registrar eventos no calendário condominial",
            "Ver todas as reservas de áreas comuns",
            "Reservar áreas comuns"
        ]
    },
    {
        id: "morador",
        nome: "Morador",
        resumo: "Residente",
        permissoes: [
            "Ver os eventos do calendário condominial",
            "Reservar áreas comuns",
            "Acompanhar as próprias reservas"
        ]
    },
    {
        id: "porteiro",
        nome: "Porteiro",
        resumo: "Portaria",
        permissoes: [
            "Controlar a entrada de pessoas pelo CPF",
            "Controlar o acesso à garagem pela placa do veículo",
            "Cadastrar novas pessoas e veículos permitidos",
            "Consultar o calendário e as reservas do condomínio"
        ]
    }
];

/*
 * Usuários do sistema (quem faz login).
 * - id:          identificador único do usuário (usado na sessão e nas reservas)
 * - nome:        nome exibido no cabeçalho
 * - cpf:         CPF (somente números), usado no controle de entrada
 * - email/senha: credenciais usadas no login (texto puro, só para demonstração)
 * - perfil:      "admin" | "morador" | "porteiro"
 * - cargo:       rótulo exibido ao lado do nome
 * - apartamento: número do apartamento (null para quem não mora no condomínio)
 */
const usuariosMock = [
    { id: "u1", nome: "Fernanda Lima", cpf: "52998224725", email: "sindica@condominio.com", senha: "123456", perfil: "admin", cargo: "Síndica", apartamento: null },
    { id: "u2", nome: "Carlos Mendes", cpf: "12345678909", email: "carlos@condominio.com", senha: "123456", perfil: "morador", cargo: "Morador", apartamento: "302" },
    { id: "u3", nome: "João Pereira", cpf: "98765432100", email: "joao@condominio.com", senha: "123456", perfil: "morador", cargo: "Morador", apartamento: "1401" },
    { id: "u4", nome: "Roberto Alves", cpf: "24681357928", email: "porteiro@condominio.com", senha: "123456", perfil: "porteiro", cargo: "Porteiro", apartamento: null }
];

/*
 * Outras pessoas permitidas no condomínio (além dos usuários acima, que
 * também são considerados pessoas permitidas).
 * - tipo:    "morador" | "visitante" | "funcionario"
 * - detalhe: apartamento visitado / apartamento de residência / setor
 */
const pessoasMock = [
    { id: "p1", nome: "Helena Mendes", cpf: "13579246828", tipo: "morador", detalhe: "Apto 302" },
    { id: "p2", nome: "Mariana Costa", cpf: "11122233396", tipo: "visitante", detalhe: "Visita ao Apto 302" },
    { id: "p3", nome: "Paulo Souza", cpf: "22233344405", tipo: "visitante", detalhe: "Visita ao Apto 1401" },
    { id: "p4", nome: "Ana Ribeiro", cpf: "33344455508", tipo: "funcionario", detalhe: "Limpeza" },
    { id: "p5", nome: "Marcos Teixeira", cpf: "44455566619", tipo: "funcionario", detalhe: "Manutenção" }
];

/*
 * Veículos com acesso liberado à garagem (somente moradores, visitantes
 * e funcionários). A placa é guardada sem hífen e em maiúsculas; aceita
 * o padrão antigo (ABC1234) e o Mercosul (ABC1D23).
 */
const veiculosMock = [
    { id: "v1", placa: "ABC1D23", modelo: "Honda Civic", cor: "Preto", tipo: "morador", proprietario: "Carlos Mendes", detalhe: "Apto 302" },
    { id: "v2", placa: "RST4E56", modelo: "Toyota Corolla", cor: "Prata", tipo: "morador", proprietario: "João Pereira", detalhe: "Apto 1401" },
    { id: "v3", placa: "JKL9876", modelo: "Fiat Uno", cor: "Branco", tipo: "visitante", proprietario: "Mariana Costa", detalhe: "Visita ao Apto 302" },
    { id: "v4", placa: "QWE2R34", modelo: "Chevrolet Onix", cor: "Vermelho", tipo: "funcionario", proprietario: "Marcos Teixeira", detalhe: "Manutenção" },
    { id: "v5", placa: "MNO5P67", modelo: "Hyundai HB20", cor: "Azul", tipo: "funcionario", proprietario: "Fernanda Lima", detalhe: "Administração" }
];

/*
 * Áreas comuns que podem ser reservadas pelos moradores.
 * - id:         identificador da área (usado nas reservas)
 * - nome:       nome exibido na tela
 * - capacidade: número máximo de pessoas (informativo)
 * - horarios:   faixas de horário que podem ser reservadas em cada dia
 */
const areasComunsMock = [
    {
        id: "salao",
        nome: "Salão de Festas",
        capacidade: 80,
        horarios: ["10:00 - 14:00", "14:00 - 18:00", "18:00 - 23:00"]
    },
    {
        id: "churrasqueira",
        nome: "Churrasqueira",
        capacidade: 30,
        horarios: ["11:00 - 15:00", "15:00 - 19:00", "19:00 - 23:00"]
    },
    {
        id: "piscina",
        nome: "Piscina",
        capacidade: 20,
        horarios: ["08:00 - 10:00", "10:00 - 12:00", "14:00 - 16:00", "16:00 - 18:00"]
    },
    {
        id: "quadra",
        nome: "Quadra Poliesportiva",
        capacidade: 16,
        horarios: ["08:00 - 10:00", "10:00 - 12:00", "14:00 - 16:00", "16:00 - 18:00", "18:00 - 20:00", "20:00 - 22:00"]
    }
];

/*
 * Reservas que já existem no sistema (feitas por outros moradores).
 * Servem para mostrar horários "Ocupados" e testar o conflito de horário.
 * - areaId:    qual área foi reservada (ver areasComunsMock)
 * - data:      dia da reserva no formato AAAA-MM-DD
 * - horario:   uma das faixas de horário da área
 * - moradorId: quem fez a reserva (ver usuariosMock)
 */
const reservasMock = [
    { id: "r1", areaId: "salao", data: "2026-10-15", horario: "14:00 - 18:00", moradorId: "u3" },
    { id: "r2", areaId: "churrasqueira", data: "2026-10-10", horario: "11:00 - 15:00", moradorId: "u3" },
    { id: "r3", areaId: "piscina", data: "2026-10-03", horario: "10:00 - 12:00", moradorId: "u2" },
    { id: "r4", areaId: "quadra", data: "2026-10-03", horario: "18:00 - 20:00", moradorId: "u3" }
];

/*
 * Tipos de evento do calendário condominial.
 * Avisos, manutenções, assembleias e eventos são registrados SOMENTE
 * pela síndica (perfil "admin"). O tipo "reserva" não aparece no
 * formulário: ele identifica as reservas de áreas comuns feitas pelos
 * moradores na tela de Reservas, que também aparecem no calendário.
 */
const tiposEventoMock = [
    { id: "aviso", nome: "Aviso" },
    { id: "manutencao", nome: "Manutenção" },
    { id: "assembleia", nome: "Assembleia" },
    { id: "evento", nome: "Evento" }
];

/*
 * Eventos de exemplo do calendário condominial, agrupados por data
 * (AAAA-MM-DD). Os eventos registrados pela síndica são salvos à parte.
 * - tipo: um dos ids de tiposEventoMock
 * As reservas (ex.: Salão de Festas em 15/10) vêm de reservasMock e são
 * colocadas no calendário automaticamente, por isso não ficam aqui.
 */
const mockEventos = {
    "2026-10-08": [
        { id: "4", tipo: "aviso", titulo: "Corte de água para limpeza da caixa d'água", horario: "09:00 - 13:00", local: "Todo o condomínio" }
    ],
    "2026-10-14": [
        { id: "1", tipo: "evento", titulo: "Aula de natação particular", horario: "08:00 - 10:00", local: "Piscina" },
        { id: "2", tipo: "manutencao", titulo: "Reparo Ar-Condicionado", horario: "10:15 - 12:15", local: "Academia" }
    ],
    "2026-10-20": [
        { id: "5", tipo: "assembleia", titulo: "Assembleia ordinária", horario: "19:00 - 21:00", local: "Hall de entrada" }
    ]
};

/* ==========================================================================
   Módulos de Requerimentos (Cartões 1 e 2)
   ========================================================================== */
const tiposRequerimentoMock = [
    { id: "manutencao", nome: "Manutenção / Reparação" },
    { id: "reclamacao", nome: "Reclamação" },
    { id: "duvida", nome: "Dúvida / Esclarecimento" },
    { id: "sugestao", nome: "Sugestão" },
    { id: "outros", nome: "Outros" }
];

const requerimentosMock = [
    {
        id: "req-101",
        tipo: "manutencao",
        descricao: "Lâmpada do corredor do 3º andar fundida.",
        moradorId: "u2",
        data: "2026-10-01",
        status: "Pendente"
    }
];
