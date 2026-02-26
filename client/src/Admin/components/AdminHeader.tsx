import { Flex, Link, Icon, ChakraProvider, defaultSystem, Text, Box } from "@chakra-ui/react";
import { ClerkProvider, SignOutButton } from "@clerk/clerk-react";
import { FiHome, FiLogOut, FiUpload } from "react-icons/fi";

const PUBLISHABLE_KEY = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;

export function AdminHeader() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
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

          {/* Main Navigation */}
          <Box flex={1}>
            <Link 
              href="/admin/Home" 
              display="flex" 
              alignItems="center" 
              p={3}
              mb={2}
              borderRadius="md"
              bg="rgba(59, 130, 246, 0.1)"
              color="#3b82f6"
              _hover={{ bg: "rgba(59, 130, 246, 0.15)" }}
              transition="all 0.2s"
              textDecoration="none"
            >
              <Icon as={FiUpload} fontSize="lg" mr={3} />
              <Text fontSize="sm" fontWeight="600">Subir Imágenes</Text>
            </Link>
            
            <Link 
              href="/admin" 
              display="flex" 
              alignItems="center" 
              p={3}
              borderRadius="md"
              color="white"
              _hover={{ bg: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}
              transition="all 0.2s"
              textDecoration="none"
            >
              <Icon as={FiHome} fontSize="lg" mr={3} />
              <Text fontSize="sm" fontWeight="400">Dashboard</Text>
            </Link>
          </Box>

          {/* Footer / Logout */}
          <Box mt="auto" pt={4} borderTop="1px solid rgba(148, 163, 184, 0.1)">
            <SignOutButton>
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
              >
                <Icon as={FiLogOut} fontSize="lg" mr={3} />
                <Text fontSize="sm">Cerrar sesión</Text>
              </Link>
            </SignOutButton>
          </Box>
        </Flex>
      </ChakraProvider>
    </ClerkProvider>
  );
}
