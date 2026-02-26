import { Box, Flex, Text, ChakraProvider, createSystem, defaultConfig, Icon } from "@chakra-ui/react";
import { FiFileText, FiUsers, FiFolder, FiSettings } from "react-icons/fi";

const system = createSystem(defaultConfig);

interface Activity {
  id: number;
  type: "document" | "user" | "folder" | "settings";
  title: string;
  description: string;
  time: string;
}

const activities: Activity[] = [
  {
    id: 1,
    type: "document",
    title: "Nuevo documento creado",
    description: "manual_procedimientos.pdf subido por Juan Pérez",
    time: "Hace 5 minutos"
  },
  {
    id: 2,
    type: "user",
    title: "Nuevo usuario registrado",
    description: "María González se unió al equipo",
    time: "Hace 1 hora"
  },
  {
    id: 3,
    type: "folder",
    title: "Carpeta compartida",
    description: "Proyecto Q1 2024 fue compartida con el equipo",
    time: "Hace 3 horas"
  },
  {
    id: 4,
    type: "settings",
    title: "Configuración actualizada",
    description: "Políticas de seguridad modificadas",
    time: "Hace 1 día"
  }
];

const iconMap = {
  document: FiFileText,
  user: FiUsers,
  folder: FiFolder,
  settings: FiSettings
};

const colorMap = {
  document: "#3b82f6",
  user: "#10b981",
  folder: "#f59e0b",
  settings: "#6366f1"
};

export function RecentActivity() {
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
            Actividad Reciente
          </Text>
        </Box>
        <Box>
          {activities.map((activity, index) => (
            <Flex
              key={activity.id}
              p={4}
              alignItems="start"
              gap={4}
              borderBottom={index !== activities.length - 1 ? "1px solid" : "none"}
              borderColor="gray.100"
              _hover={{ bg: "gray.50" }}
              transition="all 0.2s"
            >
              <Box
                bg={`${colorMap[activity.type]}20`}
                borderRadius="lg"
                p={2}
                flexShrink={0}
              >
                <Icon as={iconMap[activity.type]} color={colorMap[activity.type]} fontSize="lg" />
              </Box>
              <Box flex={1}>
                <Text fontSize="sm" fontWeight="600" color="gray.800" mb={1}>
                  {activity.title}
                </Text>
                <Text fontSize="xs" color="gray.600" mb={1}>
                  {activity.description}
                </Text>
                <Text fontSize="xs" color="gray.400">
                  {activity.time}
                </Text>
              </Box>
            </Flex>
          ))}
        </Box>
      </Box>
    </ChakraProvider>
  );
}
