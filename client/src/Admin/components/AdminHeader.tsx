import { Flex, Link, Icon, ChakraProvider, defaultSystem, Text, Box } from "@chakra-ui/react";
import axios from "axios";
import { FiClock, FiHome, FiLogOut, FiUpload } from "react-icons/fi";
import { LuTag, LuLayoutDashboard, LuFileText, LuClipboardList, LuImage } from "react-icons/lu";


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

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  isActive?: boolean;
}

function NavItem({ href, label, icon, description, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      display="flex"
      alignItems="center"
      gap={3}
      p="12px"
      mb={1}
      borderRadius="md"
      color={isActive ? "#60a5fa" : "white"}
      bg={isActive ? "rgba(59, 130, 246, 0.15)" : "transparent"}
      borderLeft={isActive ? "3px solid #60a5fa" : "3px solid transparent"}
      _hover={{
        bg: "rgba(59, 130, 246, 0.1)",
        color: "#60a5fa",
        pl: "13px"
      }}
      _focus={{
        outline: "2px solid #60a5fa",
        outlineOffset: "2px"
      }}
      transition="all 0.2s"
      textDecoration="none"
      role="menuitem"
      title={description}
      aria-label={description ? `${label} - ${description}` : label}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon fontSize="lg" flexShrink={0}>{icon}</Icon>
      <Text fontSize="sm" fontWeight={isActive ? "600" : "400"}>
        {label}
      </Text>
    </Link>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <Text
      fontSize="xs"
      fontWeight="700"
      color="gray.400"
      textTransform="uppercase"
      letterSpacing="0.05em"
      mt={6}
      mb={3}
      px={3}
    >
      {children}
    </Text>
  );
}

export function AdminHeader() {
  // Obtener ruta actual desde window.location
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  const isActive = (path: string) => {
    return currentPath.includes(path);
  };

  return (
    <ChakraProvider value={defaultSystem}>
      <Flex
        direction="column"
        position="fixed"
        top={0}
        left={0}
        w="240px"
        h="100vh"
        bg="linear-gradient(180deg, #0f172a 0%, #1a1f3a 100%)"
        color="white"
        p={0}
        borderRight="1px solid rgba(148, 163, 184, 0.15)"
        overflowY="auto"
        zIndex={10}
        role="navigation"
        aria-label="Menú de Administración"
        css={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(148, 163, 184, 0.2) transparent",
          "&::-webkit-scrollbar": {
            width: "6px"
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent"
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(148, 163, 184, 0.2)",
            borderRadius: "3px"
          }
        }}
      >
        {/* Logo / Brand */}
        <Box p={4} pb={6}>
          <Text fontSize="2xl" fontWeight="bold" color="white">
            Intranet
          </Text>
          <Text fontSize="xs" color="gray.400">
            Panel Administrativo
          </Text>
        </Box>

        {/* Navigation Groups */}
        <Box flex={1} px={2}>
          {/* Principal */}
          <NavItem
            href="/"
            label="Volver al Inicio"
            icon={<FiHome />}
            description="Ir a la página principal"
            isActive={currentPath === '/'}
          />

          {/* Documentos */}
          <SectionHeader>Documentos</SectionHeader>
          <NavItem
            href="/admin/CartasLaborales"
            label="Cartas Laborales"
            icon={<LuClipboardList />}
            description="Gestionar cartas laborales"
            isActive={isActive('CartasLaborales')}
          />
          <NavItem
            href="/admin/Formularios"
            label="Formularios"
            icon={<LuFileText />}
            description="Administrar formularios"
            isActive={isActive('Formularios')}
          />

          {/* Contenido */}
          <SectionHeader>Contenido</SectionHeader>
          <NavItem
            href="/admin/Categories"
            label="Categorías"
            icon={<LuTag />}
            description="Gestionar categorías"
            isActive={isActive('Categories')}
          />
          <NavItem
            href="/admin/Spaces"
            label="Espacios"
            icon={<LuLayoutDashboard />}
            description="Administrar espacios"
            isActive={isActive('Spaces')}
          />

          {/* Multimedia */}
          <SectionHeader>Multimedia</SectionHeader>
          <NavItem
            href="/admin/Home"
            label="Subir Imágenes"
            icon={<FiUpload />}
            description="Subir nuevas imágenes"
            isActive={isActive('/admin/Home')}
          />
          <NavItem
            href="/admin/imagenes"
            label="Gestión de Imágenes"
            icon={<LuImage />}
            description="Ver y organizar imágenes"
            isActive={isActive('imagenes')}
          />

          {/* Automatización */}
          <SectionHeader>Automatización</SectionHeader>
          <NavItem
            href="/admin/SubidaAutomatica"
            label="Subida Automática"
            icon={<FiClock />}
            description="Configurar subidas automáticas"
            isActive={isActive('SubidaAutomatica')}
          />
        </Box>

        {/* Footer / Logout */}
        <Box p={2} borderTop="1px solid rgba(148, 163, 184, 0.1)">
          <Link
            display="flex"
            alignItems="center"
            gap={3}
            p="12px"
            borderRadius="md"
            color="red.300"
            _hover={{
              bg: "rgba(239, 68, 68, 0.15)",
              color: "red.200",
              borderLeftColor: "red.400"
            }}
            _focus={{
              outline: "2px solid red.400",
              outlineOffset: "2px"
            }}
            borderLeft="3px solid transparent"
            transition="all 0.2s"
            cursor="pointer"
            textDecoration="none"
            onClick={handleLogout}
            role="menuitem"
            aria-label="Cerrar sesión"
          >
            <Icon as={FiLogOut} fontSize="lg" flexShrink={0} />
            <Text fontSize="sm" fontWeight="500">Cerrar sesión</Text>
          </Link>
        </Box>
      </Flex>
    </ChakraProvider>
  );
}
