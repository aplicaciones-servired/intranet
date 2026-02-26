import { Box, Flex, Icon, Text } from "@chakra-ui/react"
import { LuInfo, LuX } from "react-icons/lu"

interface ToastProps {
    title: string
    description: string
    type?: "success" | "error" | "warning" | "info"
    onClose?: () => void
}

export default function Toast({ title, description, type = "info", onClose }: ToastProps) {
    const getTypeConfig = () => {
        switch (type) {
            case "success":
                return {
                    bg: "green.500",
                    icon: <LuInfo />
                }
            case "error":
                return {
                    bg: "red.500",
                    icon: <LuInfo />
                }
            case "warning":
                return {
                    bg: "orange.500",
                    icon: <LuInfo />
                }
            case "info":
            default:
                return {
                    bg: "blue.500",
                    icon: <LuInfo />
                }
        }
    }

    const config = getTypeConfig()

    return (
        <Box
            position="fixed"
            top={4}
            right={4}
            bg={config.bg}
            color="white"
            px={6}
            py={4}
            borderRadius="lg"
            shadow="2xl"
            maxW="md"
            zIndex={9999}
            animation="slideIn 0.3s ease-out"
        >
            <Flex alignItems="flex-start" gap={3}>
                <Icon fontSize="xl" color="white" mt={0.5}>
                    {config.icon}
                </Icon>
                <Box flex={1}>
                    <Text fontSize="sm" fontWeight="bold" mb={1}>
                        {title}
                    </Text>
                    <Text fontSize="xs">
                        {description}
                    </Text>
                </Box>
                {onClose && (
                    <Icon 
                        fontSize="lg" 
                        color="white" 
                        cursor="pointer"
                        onClick={onClose}
                        _hover={{ opacity: 0.8 }}
                    >
                        <LuX />
                    </Icon>
                )}
            </Flex>
        </Box>
    )
}
