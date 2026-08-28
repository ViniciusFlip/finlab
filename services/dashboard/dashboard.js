import { listarLancamentos } from "../lancamentos/lancamentos.service.js";


function calcularSeteDias(lista){

    const hoje = new Date();

    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(hoje.getDate() - 7);

    let entradas = 0;
    let saidas = 0;

    lista.forEach(item => {

        const data = pegarData(item);

        if (!data) return;

        // verifica se está dentro dos últimos 7 dias
        const dentroDos7Dias = data >= seteDiasAtras && data <= hoje;

        if (!dentroDos7Dias) return;

        const valor = Number(item.valor);

        if (item.tipo === "entrada") {
            entradas += valor;
        }

        if (item.tipo === "saida") {
            saidas += valor;
        }

    });

    return {
        entradas,
        saidas
    };
}

function atualizarSeteDias(dados){

    const elEntradas = document.querySelector("#seteEntradas");
    const elSaidas = document.querySelector("#seteSaidas");

    if (elEntradas) {
        elEntradas.innerHTML = formatarMoeda(dados.entradas);
    }

    if (elSaidas) {
        elSaidas.innerHTML = formatarMoeda(dados.saidas);
    }
}
function mesmoDia(data){

    const hoje = new Date();

    return (
        data.getFullYear() === hoje.getFullYear() &&
        data.getMonth() === hoje.getMonth() &&
        data.getDate() === hoje.getDate()
    );

}
function formatarMoeda(valor){

    return valor.toLocaleString("pt-BR", {
        style:"currency",
        currency:"BRL"
    });

}


function atualizarHoje(dados){

    document.querySelector("#hojeEntradas")
    .innerHTML = formatarMoeda(dados.entradas);


    document.querySelector("#hojeSaidas")
    .innerHTML = formatarMoeda(dados.saidas);

}


function pegarData(item){

    if(item.createdAt?.toDate){

        return item.createdAt.toDate();

    }

    return null;

}
function calcularHoje(lista){

    const hoje = new Date();

    let entradas = 0;
    let saidas = 0;


    lista.forEach(item=>{


        const data = pegarData(item);


        if(!data) return;



        const mesmoDia =
            data.getFullYear() === hoje.getFullYear()
            &&
            data.getMonth() === hoje.getMonth()
            &&
            data.getDate() === hoje.getDate();



        if(!mesmoDia) return;



        const valor = Number(item.valor);



        if(item.tipo === "entrada"){

            entradas += valor;

        }


        if(item.tipo === "saida"){

            saidas += valor;

        }


    });



    return {
        entradas,
        saidas
    };

}
export async function carregarDashboard(){


    const lancamentos = await listarLancamentos();


    const hoje = calcularHoje(lancamentos);
    const seteDias = calcularSeteDias(lancamentos);

    atualizarHoje(hoje);
    atualizarSeteDias(seteDias);


}
carregarDashboard();