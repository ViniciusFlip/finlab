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
     getCategorias,
     categoriaExiste
 } from "./services/categorias/categorias.service.js";

 // console.log("cats",getCategorias());
 console.log("APP CARREGOU");
 let data = [];

 let editandoId = null;


 onAuthChange((user) => {

     if (user) {

         console.log("Usuário logado:");

         console.log(user);
         atualizarUsuario(user);

     } else {

         console.log("Nenhum usuário logado");

     }

 });


 function atualizarUsuario(user) {

     const nome = document.getElementById("user-name");
     const email = document.getElementById("user-email");
     const photo = document.getElementById("user-photo");

     if (!nome || !email || !photo) return;

     if (user) {

         photo.src = user.photoURL || "assets/img/avatar.png";

         nome.textContent = user.displayName || "Usuário";

         email.textContent = user.email || "";

     } else {

         photo.src = "assets/img/avatar.png";

         nome.textContent = "Não autenticado";

         email.textContent = "";

     }

 }

 async function testarLogin() {

     try {

         const user = await loginGoogle();

         console.log(user);

     } catch (error) {

         console.error(error);

     }

 }

 async function atualizarTela() {
     console.trace("ATUALIZAR TELA CHAMOU");

     data = await listarLancamentos();

     render();

 }


 function atualizarDashboard() {

     let entradas = 0;
     let saidas = 0;

     data.forEach(item => {

         if (item.tipo === "entrada") {

             entradas += item.valor;

         } else {

             saidas += item.valor;

         }

     });

     const saldo = entradas - saidas;
console.log(saldo)
     document.getElementById("entradas").innerHTML =
         `R$ ${entradas.toFixed(2)}`;

     document.getElementById("saidas").innerHTML =
         `R$ ${saidas.toFixed(2)}`;

     const saldoEl = document.getElementById("saldo");

     saldoEl.innerHTML =
         `R$ ${saldo.toFixed(2)}`;

     saldoEl.className =
         `text-3xl font-bold mt-2 ${
            saldo >= 0
                ? "text-blue-600"
                : "text-red-600"
        }`;

 }

atualizarDashboard()
 function cancelarEdicao() {

     editandoId = null;

     const input = document.getElementById("command");
     input.value = "";

     document.getElementById("btnAdicionar").textContent = "Adicionar";

     document.getElementById("btnCancelar").classList.add("hidden");

     input.focus();

 }

 function render() {

     const tbody = document.getElementById("tbody");

     tbody.innerHTML = "";

     data.forEach((item, index) => {


         // console.log("DATA RAW:", item.data?.toDate?.());
         // console.log("CREATED RAW:", item.createdAt?.toDate?.());

         const dataBase = item.data || item.createdAt;

         const dataFormatada = dataBase ?
             dataBase.toDate().toLocaleString("pt-BR", {
                 day: "2-digit",
                 month: "2-digit",
                 year: "numeric",
                 hour: "2-digit",
                 minute: "2-digit"
             }) :
             "--";

         // console.log(item);

         tbody.innerHTML += `

<tr class="
    border-b border-gray-200 
    ${item.tipo==="entrada" 
        ? "bg-green-50 hover:bg-green-100" 
        : "bg-red-50 hover:bg-red-100"}
    transition
">

<td class="p-5 h-24 text-gray-700 dark:text-white">
    ${dataFormatada}
</td>


<td class="p-5">

<span class="
px-4 py-2 rounded-full text-sm font-semibold
${item.tipo==="entrada" 
    ? "bg-green-200 text-green-700" 
    : "bg-red-200 text-red-700"}
">

${item.tipo}

</span>

</td>


<td class="p-5 text-gray-700 dark:text-white">
${item.categoria || "—"}
</td>


<td class="p-5">

<span class="
text-lg font-bold
${item.tipo==="entrada" 
    ? "text-green-700" 
    : "text-red-700"}
">

R$ ${item.valor.toFixed(2)}

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
h-10 px-5 rounded-xl
bg-yellow-400 hover:bg-yellow-500
text-white font-semibold
transition active:scale-95
">

Editar

</button>


<button
onclick="remover('${item.id}')"
class="
h-10 px-5 rounded-xl
bg-red-500 hover:bg-red-600
text-white font-semibold
transition active:scale-95
">

Excluir

</button>


</div>

</td>


</tr>

`;

     });

     // atualizarDashboard();

 }
 async function adicionar() {

     const input = document.getElementById("command");

     const texto = input.value.trim();

     if (!texto) return;



     const partes = texto.split(" ");

     const tipo = partes[0].toLowerCase();
     const valor = parseFloat(partes[1].replace(",", "."));
     const categoria = partes[2];

     const dataRegex = /^\d{2}\/\d{2}\/\d{4}(\s\d{2}:\d{2})?$/;

     let data = null;

     for (let i = partes.length - 1; i >= 0; i--) {

         const possivelData = partes.slice(i).join(" ");

         if (dataRegex.test(possivelData)) {
             data = possivelData;
             partes.splice(i);
             break;
         }
     }
     const descricao = partes.slice(3).join(" ");

     console.log({
         tipo,
         valor,
         categoria,
         descricao,
         data
     });


     if (
         (tipo !== "entrada" && tipo !== "saida") ||
         isNaN(valor)
     ) {
         alert("Comando inválido");
         return;
     }

     if (!categoriaExiste(tipo, categoria)) {

         alert(
             `Categoria "${categoria}" não encontrada para ${tipo}.`
         );

         return;

     }
     if (editandoId) {

         await atualizarLancamento(editandoId, {
             tipo,
             valor,
             categoria,
             descricao,
             data
         });
         editandoId = null;
         document.getElementById("btnAdicionar").textContent = "Adicionar";
         document.getElementById("btnCancelar").classList.add("hidden");
     } else {

         await salvarLancamento(
             tipo,
             valor,
             categoria,
             descricao,
             data
         );

     }

     input.value = "";

     await atualizarTela();

 }
 async function remover(id) {

     const confirmar = confirm(
         "Deseja realmente excluir este lançamento?"
     );

     if (!confirmar) return;

     await excluirLancamento(id);

     await atualizarTela();

 }

 function editar(id) {

     const lancamento = data.find(item => item.id === id);

     if (!lancamento) return;

     const input = document.getElementById("command");

     const dataObj = lancamento.data || lancamento.createdAt;

     let dataFormatada = "";

     if (dataObj) {

         const d = dataObj.toDate();

         const dia = String(d.getDate()).padStart(2, "0");
         const mes = String(d.getMonth() + 1).padStart(2, "0");
         const ano = d.getFullYear();
         dataFormatada = `${dia}/${mes}/${ano}`;
     }
     input.value =
         `${lancamento.tipo} ${lancamento.valor} ${lancamento.categoria} ${lancamento.descricao}` +
         (dataFormatada ? ` ${dataFormatada}` : "");

     editandoId = id;

     document.getElementById("btnAdicionar").textContent = "Salvar alterações";
     document.getElementById("btnCancelar").classList.remove("hidden");

     input.focus();
 }
 document.getElementById("btnAdicionar")
     .addEventListener("click", adicionar);

 document.getElementById("command")
     .addEventListener("keypress", (e) => {

         if (e.key === "Enter")
             adicionar();

     });

 document.getElementById("themeBtn")
     .addEventListener("click", () => {

         document.documentElement.classList.toggle("dark");

     });

 (async () => {
     await atualizarTela();
 })();


 window.adicionar
 window.editar = editar;
 window.remover = remover;
 window.cancelarEdicao = cancelarEdicao;


 window.testarLogin = testarLogin;