import { categorias } from "./categorias.data.js";

export function getCategorias() {
    return categorias;
}

export function getCategoriasByTipo(tipo) {
    return categorias[tipo] || [];
}

export function categoriaExiste(tipo, categoria) {
    return getCategoriasByTipo(tipo).some(
        item => item.toLowerCase() === categoria.toLowerCase()
    );
}