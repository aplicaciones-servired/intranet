import { Flex, Link, Icon, ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ClerkProvider, SignOutButton } from "@clerk/clerk-react";
import { FiHome, FiLogOut } from "react-icons/fi";

const PUBLISHABLE_KEY = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;

export function AdminHeader() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ChakraProvider value={defaultSystem}>
        <Flex direction="column" w="220px" h="100vh" bg="#0f172a" color="white" p={4}>
          <Link href="#" mb={4} display="flex" alignItems="center" color="white" fontSize="lg">
            <Icon as={FiHome} mr={2} /> Dashboard
          </Link>
          <Flex mt="auto">
            <SignOutButton>
              <Link display="flex" alignItems="center" color="red.300" fontSize="lg" cursor="pointer">
                <Icon as={FiLogOut} mr={2} /> Cerrar sesión
              </Link>
            </SignOutButton>
          </Flex>
        </Flex>
      </ChakraProvider>
    </ClerkProvider>
  );
}
