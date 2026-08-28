import {
    salvarLancamento,
    listarLancamentos,
    excluirLancamento,
    atualizarLancamento,

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



/* =========================
   AUTENTICAÇÃO
========================= */

onAuthChange((user) => {

    if (user) {

        console.log("Usuário logado:");

        console.log(user);

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


    if (!nome || !email) return;


    if (user) {

        if (photo) {

            photo.src =
                user.photoURL ||
                "assets/img/avatar.png";

        }


        nome.textContent =
            user.displayName ||
            "Usuário";


        email.textContent =
            user.email ||
            "";


    } else {

        if (photo) {

            photo.src =
                "assets/img/avatar.png";

        }


        nome.textContent =
            "Não autenticado";


        email.textContent =
            "";

    }

}



/* =========================
   LOGIN
========================= */

async function testarLogin() {

    try {

        const user =
            await loginGoogle();

        console.log(user);

    } catch (error) {

        console.error(error);

    }

}



/* =========================
   ATUALIZAR TELA
========================= */

async function atualizarTela() {

    console.trace(
        "ATUALIZAR TELA CHAMOU"
    );


    data =
        await listarLancamentos();


    render();


    atualizarDashboard();

}



/* =========================
   FORMATAR DINHEIRO
========================= */

function formatarMoeda(valor) {

    return Number(valor || 0)
        .toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

}



/* =========================
   DASHBOARD FINANCEIRO
========================= */

function atualizarDashboard() {


    let entradas = 0;

    let saidas = 0;



    data.forEach((item) => {


        const valor =
            Number(item.valor) || 0;


        if (item.tipo === "entrada") {

            entradas += valor;

        } else if (item.tipo === "saida") {

            saidas += valor;

        }


    });



    /*
    =========================

    SALDO ATUAL REAL

    Tudo que entrou
    MENOS
    Tudo que saiu

    =========================
    */

    const saldo =
        entradas - saidas;



    /*
    =========================

    DINHEIRO DISPONÍVEL

    Se o saldo for negativo,
    não dividimos dinheiro
    que não existe.

    =========================
    */

    const dinheiroDisponivel =
        Math.max(saldo, 0);



    /*
    =========================

    DIVISÃO DO DINHEIRO
    BASEADA NO SALDO ATUAL

    50% Necessidades
    20% Reserva
    20% Oportunidades
    10% Livre

    =========================
    */

    const necessidades =
        dinheiroDisponivel * 0.50;


    const reserva =
        dinheiroDisponivel * 0.20;


    const oportunidades =
        dinheiroDisponivel * 0.20;


    const livre =
        dinheiroDisponivel * 0.10;



    /* =========================
       ELEMENTOS
    ========================= */

    const entradasEl =
        document.getElementById(
            "entradas"
        );


    const saidasEl =
        document.getElementById(
            "saidas"
        );


    const saldoEl =
        document.getElementById(
            "saldo"
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



    /* =========================
       ATUALIZAR VALORES
    ========================= */


    if (entradasEl) {

        entradasEl.textContent =
            formatarMoeda(
                entradas
            );

    }



    if (saidasEl) {

        saidasEl.textContent =
            formatarMoeda(
                saidas
            );

    }



    if (saldoEl) {

        saldoEl.textContent =
            formatarMoeda(
                saldo
            );


        /*
        Saldo positivo = azul

        Saldo negativo = vermelho
        */

        saldoEl.className =
            `
            text-3xl
            font-bold
            mt-2
            ${
                saldo >= 0
                    ? "text-blue-600"
                    : "text-red-600"
            }
            `;

    }



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



    /*
    =========================

    CONSOLE PARA CONFERÊNCIA

    =========================
    */

    console.log({

        entradas,

        saidas,

        saldo,

        necessidades,

        reserva,

        oportunidades,

        livre

    });

}



/* =========================
   CANCELAR EDIÇÃO
========================= */

function cancelarEdicao() {

    editandoId = null;


    const input =
        document.getElementById(
            "command"
        );


    input.value = "";


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
        .classList
        .add(
            "hidden"
        );


    input.focus();

}



/* =========================
   RENDERIZAR TABELA
========================= */

function render() {


    const tbody =
        document.getElementById(
            "tbody"
        );


    if (!tbody) return;


    tbody.innerHTML = "";



    data.forEach((item) => {


        /*
        DATA

        Pode existir:
        item.data

        ou:
        item.createdAt
        */

        const dataBase =
            item.data ||
            item.createdAt;



        let dataFormatada =
            "--";



        if (
            dataBase &&
            typeof dataBase.toDate === "function"
        ) {

            dataFormatada =
                dataBase
                    .toDate()
                    .toLocaleString(
                        "pt-BR",
                        {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                        }
                    );

        }



        tbody.innerHTML += `

<tr
    class="
    border-b
    border-gray-200
    ${
        item.tipo === "entrada"
            ? "bg-green-50 hover:bg-green-100"
            : "bg-red-50 hover:bg-red-100"
    }
    transition
    "
>


<td class="p-5 h-24 text-gray-700 dark:text-white">

    ${dataFormatada}

</td>



<td class="p-5">


<span
    class="
    px-4
    py-2
    rounded-full
    text-sm
    font-semibold
    ${
        item.tipo === "entrada"
            ? "bg-green-200 text-green-700"
            : "bg-red-200 text-red-700"
    }
    "
>

    ${item.tipo}

</span>


</td>



<td class="p-5 text-gray-700 dark:text-white">

    ${item.categoria || "—"}

</td>



<td class="p-5">


<span
    class="
    text-lg
    font-bold
    ${
        item.tipo === "entrada"
            ? "text-green-700"
            : "text-red-700"
    }
    "
>

    ${formatarMoeda(item.valor)}

</span>


</td>



<td class="p-5 text-gray-700 dark:text-white">

    ${item.userName || "—"}

</td>



<td class="p-5 text-gray-700 dark:text-white">

    ${item.descricao || "—"}

</td>



<td class="p-5">


<div class="flex gap-3 justify-center">


<button
    onclick="editar('${item.id}')"
    class="
    h-10
    px-5
    rounded-xl
    bg-yellow-400
    hover:bg-yellow-500
    text-white
    font-semibold
    transition
    active:scale-95
    "
>

    Editar

</button>



<button
    onclick="remover('${item.id}')"
    class="
    h-10
    px-5
    rounded-xl
    bg-red-500
    hover:bg-red-600
    text-white
    font-semibold
    transition
    active:scale-95
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



/* =========================
   ADICIONAR LANÇAMENTO
========================= */

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
                .replace(",", ".")
        );



    const categoria =
        partes[2];



    /*
    =========================

    DETECTAR DATA

    Exemplo:

    25/08/2026

    ou

    25/08/2026 14:30

    =========================
    */

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



            partes.splice(
                i
            );


            break;

        }

    }



    const descricao =
        partes
            .slice(3)
            .join(" ");



    console.log({

        tipo,

        valor,

        categoria,

        descricao,

        data:
            dataLancamento

    });



    /*
    =========================

    VALIDAR TIPO E VALOR

    =========================
    */

    if (

        (
            tipo !== "entrada" &&
            tipo !== "saida"
        )

        ||

        isNaN(valor)

    ) {


        alert(
            "Comando inválido"
        );


        return;

    }



    /*
    =========================

    VALIDAR CATEGORIA

    =========================
    */

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



    /*
    =========================

    EDITANDO

    =========================
    */

    if (editandoId) {


        await atualizarLancamento(

            editandoId,

            {

                tipo,

                valor,

                categoria,

                descricao,

                data:
                    dataLancamento

            }

        );



        editandoId =
            null;



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
            .classList
            .add(
                "hidden"
            );


    } else {


        /*
        =========================

        NOVO LANÇAMENTO

        =========================
        */

        await salvarLancamento(

            tipo,

            valor,

            categoria,

            descricao,

            dataLancamento

        );


    }



    input.value =
        "";



    await atualizarTela();

}



/* =========================
   REMOVER
========================= */

async function remover(id) {


    const confirmar =
        confirm(
            "Deseja realmente excluir este lançamento?"
        );



    if (!confirmar) return;



    await excluirLancamento(
        id
    );



    await atualizarTela();

}



/* =========================
   EDITAR
========================= */

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
        lancamento.data ||
        lancamento.createdAt;



    let dataFormatada =
        "";



    if (

        dataObj &&

        typeof dataObj.toDate === "function"

    ) {


        const d =
            dataObj.toDate();



        const dia =
            String(
                d.getDate()
            )
            .padStart(
                2,
                "0"
            );



        const mes =
            String(
                d.getMonth() + 1
            )
            .padStart(
                2,
                "0"
            );



        const ano =
            d.getFullYear();



        dataFormatada =
            `${dia}/${mes}/${ano}`;

    }



    input.value =
        `${lancamento.tipo} ${lancamento.valor} ${lancamento.categoria} ${lancamento.descricao || ""}`
        +
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
        "Salvar alterações";



    document
        .getElementById(
            "btnCancelar"
        )
        .classList
        .remove(
            "hidden"
        );



    input.focus();

}



/* =========================
   EVENTOS
========================= */


document
    .getElementById(
        "btnAdicionar"
    )
    .addEventListener(
        "click",
        adicionar
    );



document
    .getElementById(
        "command"
    )
    .addEventListener(
        "keypress",
        (e) => {

            if (
                e.key === "Enter"
            ) {

                adicionar();

            }

        }
    );



document
    .getElementById(
        "themeBtn"
    )
    .addEventListener(
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



/* =========================
   INICIAR APP
========================= */

(async () => {

    await atualizarTela();

})();



/* =========================
   FUNÇÕES GLOBAIS
========================= */

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