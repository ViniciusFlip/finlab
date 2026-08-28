import {
    salvarLancamento,
    listarLancamentos,
    excluirLancamento,
    atualizarLancamento
} from "./services/lancamentos/lancamentos.service.js";

import {
    loginGoogle,
    onAuthChange
} from "./services/auth/auth.service.js";

import {
    categoriaExiste
} from "./services/categorias/categorias.service.js";


console.log("APP CARREGOU");

let data = [];
let editandoId = null;


/* ================================
   FORMATAÇÃO
================================ */

function formatarMoeda(valor) {

    return Number(valor || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


/* ================================
   DATA DO LANÇAMENTO
================================ */

function obterData(item) {

    const dataBase =
        item.data ||
        item.createdAt;

    if (!dataBase) return null;


    if (typeof dataBase.toDate === "function") {

        return dataBase.toDate();

    }


    if (dataBase instanceof Date) {

        return dataBase;

    }


    return null;

}


/* ================================
   AUTENTICAÇÃO
================================ */

onAuthChange((user) => {

    if (user) {

        console.log("Usuário logado:", user);

        atualizarUsuario(user);

    } else {

        console.log("Nenhum usuário logado");

        atualizarUsuario(null);

    }

});


function atualizarUsuario(user) {

    const nome =
        document.getElementById("user-name");

    const email =
        document.getElementById("user-email");

    const photo =
        document.getElementById("user-photo");


    if (!nome || !email || !photo) return;


    if (user) {

        photo.src =
            user.photoURL ||
            "assets/img/avatar.png";

        nome.textContent =
            user.displayName ||
            "Usuário";

        email.textContent =
            user.email ||
            "";

    } else {

        photo.src =
            "assets/img/avatar.png";

        nome.textContent =
            "Não autenticado";

        email.textContent =
            "";

    }

}


async function testarLogin() {

    try {

        const user =
            await loginGoogle();

        console.log(user);

    } catch (error) {

        console.error(error);

        alert(
            "Não foi possível realizar o login."
        );

    }

}


/* ================================
   CARREGAR DADOS
================================ */

async function atualizarTela() {

    console.log(
        "Atualizando tela..."
    );


    data =
        await listarLancamentos();


    atualizarDashboard();

    render();

}


/* ================================
   FILTRO DE PERÍODO
================================ */

function filtrarPorPeriodo(lista) {

    const select =
        document.getElementById("periodo");


    const periodo =
        select
            ? select.value
            : "todo";


    if (periodo === "todo") {

        return lista;

    }


    const agora =
        new Date();


    return lista.filter((item) => {

        const dataItem =
            obterData(item);


        if (!dataItem) {

            return false;

        }


        /* HOJE */

        if (periodo === "hoje") {

            return (
                dataItem.getDate() ===
                    agora.getDate() &&

                dataItem.getMonth() ===
                    agora.getMonth() &&

                dataItem.getFullYear() ===
                    agora.getFullYear()
            );

        }


        /* ESTE MÊS */

        if (periodo === "mes") {

            return (
                dataItem.getMonth() ===
                    agora.getMonth() &&

                dataItem.getFullYear() ===
                    agora.getFullYear()
            );

        }


        /* ESTA SEMANA */

        if (periodo === "semana") {

            const hoje =
                new Date(
                    agora.getFullYear(),
                    agora.getMonth(),
                    agora.getDate()
                );


            const diaSemana =
                hoje.getDay();


            const inicioSemana =
                new Date(hoje);


            inicioSemana.setDate(
                hoje.getDate() -
                (
                    diaSemana === 0
                        ? 6
                        : diaSemana - 1
                )
            );


            const fimSemana =
                new Date(inicioSemana);


            fimSemana.setDate(
                inicioSemana.getDate() + 6
            );


            fimSemana.setHours(
                23,
                59,
                59,
                999
            );


            return (
                dataItem >= inicioSemana &&
                dataItem <= fimSemana
            );

        }


        return true;

    });

}


/* ================================
   DASHBOARD
================================ */

function atualizarDashboard() {


    /* --------------------------------
       SALDO REAL

       Sempre calcula TODOS
       os lançamentos.
    -------------------------------- */

    let entradasTotais = 0;

    let saidasTotais = 0;


    data.forEach((item) => {

        const valor =
            Number(item.valor || 0);


        if (
            item.tipo === "entrada"
        ) {

            entradasTotais +=
                valor;

        }


        if (
            item.tipo === "saida"
        ) {

            saidasTotais +=
                valor;

        }

    });


    const saldo =
        entradasTotais -
        saidasTotais;


    /* --------------------------------
       MOVIMENTAÇÃO DO PERÍODO
    -------------------------------- */

    const dadosPeriodo =
        filtrarPorPeriodo(data);


    let entradasPeriodo = 0;

    let saidasPeriodo = 0;


    dadosPeriodo.forEach((item) => {

        const valor =
            Number(item.valor || 0);


        if (
            item.tipo === "entrada"
        ) {

            entradasPeriodo +=
                valor;

        }


        if (
            item.tipo === "saida"
        ) {

            saidasPeriodo +=
                valor;

        }

    });


    /* --------------------------------
       DIVISÃO DO SALDO ATUAL

       50% Necessidades
       20% Reserva
       20% Oportunidades
       10% Livre
    -------------------------------- */


    const saldoPositivo =
        Math.max(0, saldo);


    const necessidades =
        saldoPositivo * 0.50;


    const reserva =
        saldoPositivo * 0.20;


    const oportunidades =
        saldoPositivo * 0.20;


    const livre =
        saldoPositivo * 0.10;


    /* --------------------------------
       POSSO GASTAR AGORA
    -------------------------------- */

    const possoGastar =
        livre;


    /* --------------------------------
       ATUALIZAR ELEMENTOS
    -------------------------------- */


    const saldoEl =
        document.getElementById(
            "saldo"
        );


    const entradasEl =
        document.getElementById(
            "entradas"
        );


    const saidasEl =
        document.getElementById(
            "saidas"
        );


    const necessidadesEl =
        document.getElementById(
            "necessidades"
        );


    const reservaEl =
        document.getElementById(
            "reserva"
        );


    const oportunidadesEl =
        document.getElementById(
            "oportunidades"
        );


    const livreEl =
        document.getElementById(
            "livre"
        );


    const possoGastarEl =
        document.getElementById(
            "possoGastar"
        );


    /* SALDO */

    if (saldoEl) {

        saldoEl.textContent =
            formatarMoeda(saldo);


        saldoEl.className =
            `
            text-4xl
            font-bold
            mt-2
            ${
                saldo >= 0
                    ? "text-blue-600"
                    : "text-red-600"
            }
            `;

    }


    /* PERÍODO */

    if (entradasEl) {

        entradasEl.textContent =
            formatarMoeda(
                entradasPeriodo
            );

    }


    if (saidasEl) {

        saidasEl.textContent =
            formatarMoeda(
                saidasPeriodo
            );

    }


    /* DIVISÃO */

    if (necessidadesEl) {

        necessidadesEl.textContent =
            formatarMoeda(
                necessidades
            );

    }


    if (reservaEl) {

        reservaEl.textContent =
            formatarMoeda(
                reserva
            );

    }


    if (oportunidadesEl) {

        oportunidadesEl.textContent =
            formatarMoeda(
                oportunidades
            );

    }


    if (livreEl) {

        livreEl.textContent =
            formatarMoeda(
                livre
            );

    }


    /* POSSO GASTAR */

    if (possoGastarEl) {

        possoGastarEl.textContent =
            formatarMoeda(
                possoGastar
            );

    }

}


/* ================================
   CANCELAR EDIÇÃO
================================ */

function cancelarEdicao() {

    editandoId = null;


    const input =
        document.getElementById(
            "command"
        );


    if (input) {

        input.value = "";

        input.focus();

    }


    const btnAdicionar =
        document.getElementById(
            "btnAdicionar"
        );


    const btnCancelar =
        document.getElementById(
            "btnCancelar"
        );


    if (btnAdicionar) {

        btnAdicionar.textContent =
            "Adicionar";

    }


    if (btnCancelar) {

        btnCancelar.classList.add(
            "hidden"
        );

    }

}


/* ================================
   RENDERIZAR TABELA
================================ */

function render() {

    const tbody =
        document.getElementById(
            "tbody"
        );


    if (!tbody) return;


    tbody.innerHTML = "";


    data.forEach((item) => {


        const dataObj =
            obterData(item);


        const dataFormatada =
            dataObj
                ? dataObj.toLocaleString(
                    "pt-BR",
                    {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                )
                : "--";


        const tipoClasse =
            item.tipo === "entrada"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700";


        const valorClasse =
            item.tipo === "entrada"
                ? "text-green-600"
                : "text-red-600";


        tbody.innerHTML += `

        <tr class="hover:bg-gray-50 transition">

            <td class="p-4 text-gray-700 whitespace-nowrap">

                ${dataFormatada}

            </td>


            <td class="p-4">

                <span
                    class="
                    inline-flex
                    px-3
                    py-1
                    rounded-full
                    text-xs
                    font-semibold
                    ${tipoClasse}
                    "
                >

                    ${item.tipo}

                </span>

            </td>


            <td class="p-4 text-gray-700">

                ${item.categoria || "—"}

            </td>


            <td class="p-4">

                <span
                    class="
                    font-bold
                    ${valorClasse}
                    "
                >

                    ${formatarMoeda(item.valor)}

                </span>

            </td>


            <td class="p-4 text-gray-600">

                ${item.userName || "—"}

            </td>


            <td class="p-4 text-gray-600">

                ${item.descricao || "—"}

            </td>


            <td class="p-4">


                <div class="flex justify-center gap-2">


                    <button
                        onclick="editar('${item.id}')"
                        class="
                        h-9
                        px-4
                        rounded-xl
                        bg-yellow-400
                        text-white
                        text-sm
                        font-semibold
                        hover:bg-yellow-500
                        transition
                        "
                    >

                        Editar

                    </button>



                    <button
                        onclick="remover('${item.id}')"
                        class="
                        h-9
                        px-4
                        rounded-xl
                        bg-red-500
                        text-white
                        text-sm
                        font-semibold
                        hover:bg-red-600
                        transition
                        "
                    >

                        Excluir

                    </button>


                </div>


            </td>


        </tr>

        `;

    });

}


/* ================================
   ADICIONAR / EDITAR
================================ */

async function adicionar() {

    const input =
        document.getElementById(
            "command"
        );


    const texto =
        input.value.trim();


    if (!texto) return;


    const partes =
        texto.split(" ");


    const tipo =
        partes[0].toLowerCase();


    const valor =
        parseFloat(
            partes[1]
                ?.replace(",", ".")
        );


    const categoria =
        partes[2];


    const dataRegex =
        /^\d{2}\/\d{2}\/\d{4}(\s\d{2}:\d{2})?$/;


    let dataLancamento =
        null;


    for (
        let i =
            partes.length - 1;

        i >= 0;

        i--
    ) {

        const possivelData =
            partes
                .slice(i)
                .join(" ");


        if (
            dataRegex.test(
                possivelData
            )
        ) {

            dataLancamento =
                possivelData;


            partes.splice(i);

            break;

        }

    }


    const descricao =
        partes
            .slice(3)
            .join(" ");


    if (

        (
            tipo !== "entrada" &&
            tipo !== "saida"
        )

        ||

        isNaN(valor)

    ) {

        alert(
            "Comando inválido."
        );

        return;

    }


    if (!categoria) {

        alert(
            "Informe uma categoria."
        );

        return;

    }


    if (
        !categoriaExiste(
            tipo,
            categoria
        )
    ) {

        alert(
            `Categoria "${categoria}" não encontrada para ${tipo}.`
        );

        return;

    }


    /* EDITANDO */

    if (editandoId) {

        await atualizarLancamento(
            editandoId,
            {
                tipo,
                valor,
                categoria,
                descricao,
                data: dataLancamento
            }
        );


        editandoId = null;


        document
            .getElementById(
                "btnAdicionar"
            )
            .textContent =
                "Adicionar";


        document
            .getElementById(
                "btnCancelar"
            )
            .classList.add(
                "hidden"
            );

    }


    /* NOVO LANÇAMENTO */

    else {

        await salvarLancamento(
            tipo,
            valor,
            categoria,
            descricao,
            dataLancamento
        );

    }


    input.value = "";


    await atualizarTela();

}


/* ================================
   REMOVER
================================ */

async function remover(id) {

    const confirmar =
        confirm(
            "Deseja realmente excluir este lançamento?"
        );


    if (!confirmar) return;


    await excluirLancamento(id);


    await atualizarTela();

}


/* ================================
   EDITAR
================================ */

function editar(id) {

    const lancamento =
        data.find(
            item =>
                item.id === id
        );


    if (!lancamento) return;


    const input =
        document.getElementById(
            "command"
        );


    const dataObj =
        obterData(
            lancamento
        );


    let dataFormatada =
        "";


    if (dataObj) {

        const dia =
            String(
                dataObj.getDate()
            ).padStart(
                2,
                "0"
            );


        const mes =
            String(
                dataObj.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const ano =
            dataObj.getFullYear();


        dataFormatada =
            `${dia}/${mes}/${ano}`;

    }


    input.value =
        `${lancamento.tipo} ` +
        `${lancamento.valor} ` +
        `${lancamento.categoria} ` +
        `${lancamento.descricao || ""}` +
        (
            dataFormatada
                ? ` ${dataFormatada}`
                : ""
        );


    editandoId =
        id;


    document
        .getElementById(
            "btnAdicionar"
        )
        .textContent =
            "Salvar";


    document
        .getElementById(
            "btnCancelar"
        )
        .classList.remove(
            "hidden"
        );


    input.focus();

}


/* ================================
   EVENTOS
================================ */

const btnAdicionar =
    document.getElementById(
        "btnAdicionar"
    );


if (btnAdicionar) {

    btnAdicionar.addEventListener(
        "click",
        adicionar
    );

}


const command =
    document.getElementById(
        "command"
    );


if (command) {

    command.addEventListener(
        "keypress",
        (e) => {

            if (
                e.key === "Enter"
            ) {

                adicionar();

            }

        }
    );

}


/* SELETOR DE PERÍODO */

const periodo =
    document.getElementById(
        "periodo"
    );


if (periodo) {

    periodo.addEventListener(
        "change",
        () => {

            atualizarDashboard();

        }
    );

}


/* TEMA */

const themeBtn =
    document.getElementById(
        "themeBtn"
    );


if (themeBtn) {

    themeBtn.addEventListener(
        "click",
        () => {

            document
                .documentElement
                .classList
                .toggle(
                    "dark"
                );

        }
    );

}


/* ================================
   INICIAR APP
================================ */

(async () => {

    await atualizarTela();

})();


/* ================================
   FUNÇÕES GLOBAIS
================================ */

window.adicionar =
    adicionar;


window.editar =
    editar;


window.remover =
    remover;


window.cancelarEdicao =
    cancelarEdicao;


window.testarLogin =
    testarLogin;