import {
  Box, Flex, Text, Button, Icon,
  ChakraProvider, defaultSystem,
} from "@chakra-ui/react";
import { LuTriangleAlert, LuX } from "react-icons/lu";

interface Props {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({ title, description, onConfirm, onCancel, loading }: Props) {
  return (
    <ChakraProvider value={defaultSystem}>
      {/* Backdrop */}
      <Box
        position="fixed" inset={0} bg="blackAlpha.600" zIndex={50}
        display="flex" alignItems="center" justifyContent="center"
        onClick={onCancel}
      >
        <Box
          bg="white" borderRadius="2xl" shadow="2xl" p={6} maxW="400px" w="90%"
          onClick={(e) => e.stopPropagation()}
        >
          <Flex align="flex-start" gap={4} mb={5}>
            <Box bg="red.50" p={2.5} borderRadius="lg" flexShrink={0}>
              <Icon color="red.500" fontSize="xl"><LuTriangleAlert /></Icon>
            </Box>
            <Box>
              <Text fontWeight="bold" color="gray.900" fontSize="md">{title}</Text>
              <Text color="gray.500" fontSize="sm" mt={1}>{description}</Text>
            </Box>
            <Button variant="ghost" size="sm" ml="auto" onClick={onCancel} flexShrink={0}>
              <Icon><LuX /></Icon>
            </Button>
          </Flex>
          <Flex gap={3} justify="flex-end">
            <Button variant="outline" size="sm" onClick={onCancel} borderRadius="lg">
              Cancelar
            </Button>
            <Button
              bg="red.500" color="white" size="sm" borderRadius="lg"
              _hover={{ bg: "red.600" }}
              onClick={onConfirm}
              loading={loading}
            >
              Eliminar
            </Button>
          </Flex>
        </Box>
      </Box>
    </ChakraProvider>
  );
}
