import { Flex, Link, Icon, ChakraProvider, defaultSystem, Text, Box } from "@chakra-ui/react";
import axios from "axios";
import { FiHome, FiLogOut, FiUpload } from "react-icons/fi";
import { LuTag, LuLayoutDashboard, LuFileText, LuClipboardList } from "react-icons/lu";

async function handleLogout() {
  try {
    await axios.post("/api/auth/logout", { method: "POST" });

  } catch (_error) {
    // Si falla la petición, redirigir de todas formas
    console.log('first', _error);
  } finally {
    window.location.href = "/";
  }
}

export function AdminHeader() {
  return (
    <ChakraProvider value={defaultSystem}>
        <Flex
          direction="column"
          position="fixed"
          top={0}
          left={0}
          w="240px"
          h="100vh"
          bg="#0f172a"
          color="white"
          p={4}
          borderRight="1px solid rgba(148, 163, 184, 0.1)"
          overflowY="auto"
          zIndex={10}
        >
          {/* Logo / Brand */}
          <Box mb={8} mt={2}>
            <Text fontSize="2xl" fontWeight="bold" color="white">Intranet</Text>
            <Text fontSize="xs" color="gray.400">Información Corporativa</Text>
          </Box>

          <Link
            href="/"
            display="flex"
            alignItems="center"
            p={3}
            mb={2}
            borderRadius="md"
            color="white"
            _hover={{ bg: "rgba(59, 130, 246, 0.1)", color: "#60a5fa" }}
            transition="all 0.2s"
            textDecoration="none"
          >
            <Icon fontSize="lg" mr={3}><FiHome /></Icon>
            <Text fontSize="sm" fontWeight="400">ir al inicio</Text>
          </Link>


          {/* Main Navigation */}
          <Box flex={1}>

            <Link
              href="/admin/Categories"
              display="flex"
              alignItems="center"
              p={3}
              mb={2}
              borderRadius="md"
              color="white"
              _hover={{ bg: "rgba(124, 58, 237, 0.1)", color: "#a78bfa" }}
              transition="all 0.2s"
              textDecoration="none"
            >
              <Icon fontSize="lg" mr={3}><LuTag /></Icon>
              <Text fontSize="sm" fontWeight="400">Categorías</Text>
            </Link>

            <Link
              href="/admin/Spaces"
              display="flex"
              alignItems="center"
              p={3}
              mb={2}
              borderRadius="md"
              color="white"
              _hover={{ bg: "rgba(124, 58, 237, 0.1)", color: "#a78bfa" }}
              transition="all 0.2s"
              textDecoration="none"
            >
              <Icon fontSize="lg" mr={3}><LuLayoutDashboard /></Icon>
              <Text fontSize="sm" fontWeight="400">Espacios</Text>
            </Link>

            <Link
              href="/admin/Home"
              display="flex"
              alignItems="center"
              p={3}
              mb={2}
              borderRadius="md"
              color="white"
              _hover={{ bg: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}
              transition="all 0.2s"
              textDecoration="none"
            >
              <Icon as={FiUpload} fontSize="lg" mr={3} />
              <Text fontSize="sm" fontWeight="400">Subir Imágenes</Text>
            </Link>

            <Link
              href="/admin/Formularios"
              display="flex"
              alignItems="center"
              p={3}
              mb={2}
              borderRadius="md"
              color="white"
              _hover={{ bg: "rgba(34, 197, 94, 0.1)", color: "#4ade80" }}
              transition="all 0.2s"
              textDecoration="none"
            >
              <Icon fontSize="lg" mr={3}><LuFileText /></Icon>
              <Text fontSize="sm" fontWeight="400">Formularios</Text>
            </Link>

            <Link
              href="/admin/CartasLaborales"
              display="flex"
              alignItems="center"
              p={3}
              mb={2}
              borderRadius="md"
              color="white"
              _hover={{ bg: "rgba(59, 130, 246, 0.1)", color: "#60a5fa" }}
              transition="all 0.2s"
              textDecoration="none"
            >
              <Icon fontSize="lg" mr={3}><LuClipboardList /></Icon>
              <Text fontSize="sm" fontWeight="400">Cartas Laborales</Text>
            </Link>


          </Box>

          {/* Footer / Logout */}
          <Box mt="auto" pt={4} borderTop="1px solid rgba(148, 163, 184, 0.1)">
            <Link
              display="flex"
              alignItems="center"
              p={3}
              borderRadius="md"
              color="red.300"
              _hover={{ bg: "rgba(239, 68, 68, 0.1)", color: "red.400" }}
              transition="all 0.2s"
              cursor="pointer"
              textDecoration="none"
              onClick={handleLogout}
            >
              <Icon as={FiLogOut} fontSize="lg" mr={3} />
              <Text fontSize="sm">Cerrar sesión</Text>
            </Link>
          </Box>
        </Flex>
      </ChakraProvider>
  );
}
