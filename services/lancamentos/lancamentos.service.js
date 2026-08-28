import {
    db,
    collection,
    addDoc,
    getDocs,
    updateDoc,
    query,
    orderBy,
    doc,
    deleteDoc,
    serverTimestamp
} from "../../firebase.config.js";
 
 import { getUser } from "../auth/auth.service.js";

export async function salvarLancamento(
    tipo,
    valor,
    categoria,
    descricao,
    data = null
) {
    try {

        const user = getUser();

        if (!user)
            throw new Error("Nenhum usuário autenticado.");

        let dataLancamento;

        if (data) {

            // separa data e hora (se existir)
            const [dataTexto, horaTexto] = data.split(" ");

            const [dia, mes, ano] = dataTexto.split("/");

            let hora = 0;
            let minuto = 0;

            if (horaTexto) {
                [hora, minuto] = horaTexto.split(":").map(Number);
            } else {
                const agora = new Date();
                hora = agora.getHours();
                minuto = agora.getMinutes();
            }

            dataLancamento = new Date(
                Number(ano),
                Number(mes) - 1,
                Number(dia),
                hora,
                minuto,
                0
            );

            if (isNaN(dataLancamento.getTime())) {
                throw new Error("Data inválida: " + data);
            }

        } else {

            dataLancamento = new Date();

        }

        const docRef = await addDoc(
            collection(db, "lancamentos"),
            {
                uid: user.uid,
                userName: user.displayName,
                userEmail: user.email,
                userPhoto: user.photoURL || null,

                tipo,
                categoria,
                valor,
                descricao,

                data: dataLancamento,
                createdAt: serverTimestamp()
            }
        );

        console.log("Documento salvo:", docRef.id);

    } catch (error) {

        console.error("Erro ao salvar:", error);
        throw error;

    }
}
export async function listarLancamentos() {

    try {

        const q = query(
            collection(db, "lancamentos"),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

    } catch (error) {

        console.error(error);

        return [];

    }

}

export async function excluirLancamento(id) {

    try {

        await deleteDoc(
            doc(db, "lancamentos", id)
        );

        console.log("Documento excluído:", id);

    } catch (error) {

        console.error("Erro ao excluir:", error);

        throw error;

    }

}
export async function atualizarLancamento(id, dados) {

    try {

        if (dados.data) {

            const [dia, mes, ano] = dados.data.split("/");

            const agora = new Date();

            dados.data = new Date(
                Number(ano),
                Number(mes) - 1,
                Number(dia),
                agora.getHours(),
                agora.getMinutes(),
                agora.getSeconds()
            );
        }

        await updateDoc(
            doc(db, "lancamentos", id),
            dados
        );

        console.log("Documento atualizado:", id);

    } catch (error) {

        console.error("Erro ao atualizar:", error);
        throw error;

    }
}