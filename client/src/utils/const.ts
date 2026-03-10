import { createListCollection } from "@chakra-ui/react";

export const categories = createListCollection({
    items: [
        { label: "Comunicados Internos", value: "comunicaciones" },
        { label: "Eventos Corporativos", value: "eventos" },
        { label: "Productos y Servicios", value: "productos" },
        { label: "Equipo y Colaboradores", value: "equipo" },
        { label: "Instalaciones", value: "instalaciones" },
        { label: "Otros", value: "otros" },
    ],
})

export const AUTH_API_URL = import.meta.env.AUTH_API_URL as string;
export const API_URL = import.meta.env.PUBLIC_URL_API;
