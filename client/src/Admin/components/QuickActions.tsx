import { Box, Flex, Text, ChakraProvider, createSystem, defaultConfig, Icon } from "@chakra-ui/react";
import { FiPlus, FiUpload, FiUsers, FiFileText, FiFolder, FiMail } from "react-icons/fi";

const system = createSystem(defaultConfig);

interface QuickAction {
  id: number;
  icon: any;
  title: string;
  description: string;
  color: string;
  href: string;
}

const actions: QuickAction[] = [
  {
    id: 1,
    icon: FiUpload,
    title: "Subir Archivo",
    description: "Cargar documentos",
    color: "#3b82f6",
    href: "/admin/archivos"
  },
  {
    id: 2,
    icon: FiUsers,
    title: "Nuevo Usuario",
    description: "Agregar miembro",
    color: "#10b981",
    href: "/admin/usuarios/nuevo"
  },
  {
    id: 3,
    icon: FiFileText,
    title: "Crear Documento",
    description: "Nuevo documento",
    color: "#f59e0b",
    href: "/admin/documentos/nuevo"
  },
  {
    id: 4,
    icon: FiFolder,
    title: "Nueva Carpeta",
    description: "Organizar archivos",
    color: "#6366f1",
    href: "/admin/carpetas/nueva"
  },
  {
    id: 5,
    icon: FiMail,
    title: "Enviar Mensaje",
    description: "Comunicar al equipo",
    color: "#ec4899",
    href: "/admin/mensajes/nuevo"
  },
  {
    id: 6,
    icon: FiPlus,
    title: "Ver Más",
    description: "Todas las acciones",
    color: "#8b5cf6",
    href: "/admin/acciones"
  }
];

export function QuickActions() {
  return (
    <ChakraProvider value={system}>
      <Box
        bg="white"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="gray.200"
        overflow="hidden"
      >
        <Box p={6} borderBottom="1px solid" borderColor="gray.200">
          <Text fontSize="lg" fontWeight="bold" color="gray.800">
            Accesos Rápidos
          </Text>
        </Box>
        <Box p={4}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", 
            gap: "1rem" 
          }}>
            {actions.map((action) => (
              <a
                key={action.id}
                href={action.href}
                style={{ textDecoration: "none" }}
              >
                <Flex
                  direction="column"
                  alignItems="center"
                  p={4}
                  borderRadius="lg"
                  bg="gray.50"
                  _hover={{ bg: "gray.100", transform: "translateY(-2px)" }}
                  transition="all 0.2s"
                  cursor="pointer"
                  textAlign="center"
                >
                  <Box
                    bg={action.color}
                    borderRadius="lg"
                    p={3}
                    mb={3}
                  >
                    <Icon as={action.icon} fontSize="xl" color="white" />
                  </Box>
                  <Text fontSize="sm" fontWeight="600" color="gray.800" mb={1}>
                    {action.title}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {action.description}
                  </Text>
                </Flex>
              </a>
            ))}
          </div>
        </Box>
      </Box>
    </ChakraProvider>
  );
}
