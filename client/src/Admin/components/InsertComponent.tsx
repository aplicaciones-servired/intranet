import { Box, ChakraProvider, defaultSystem, FileUpload, Float, Icon, Text, Flex } from "@chakra-ui/react"
import { LuUpload, LuX } from "react-icons/lu"

//Dropzone component - VERSION MEJORADA
const Dropzone = () => (
    <FileUpload.Dropzone
        border="3px dashed"
        borderColor="blue.400"
        borderRadius="xl"
        p={16}
        bg="linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)"
        transition="all 0.3s"
        _hover={{ 
            borderColor: "blue.600", 
            bg: "linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)",
            transform: "scale(1.01)"
        }}
        cursor="pointer"
    >
        <Flex direction="column" alignItems="center" gap={6}>
            <Box 
                p={5} 
                bg="linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
                borderRadius="2xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                shadow="lg"
                transition="all 0.3s"
                _hover={{ 
                    transform: "scale(1.1) rotate(5deg)",
                    shadow: "xl"
                }}
            >
                <Icon fontSize="4xl" color="white"><LuUpload /></Icon>
            </Box>
            <FileUpload.DropzoneContent>
                <Text fontSize="xl" fontWeight="bold" color="gray.800" textAlign="center">
                    Arrastra tus imágenes aquí
                </Text>
                <Text fontSize="md" color="gray.600" textAlign="center" mt={3}>
                    o haz clic para seleccionar desde tu computadora
                </Text>
                <Box mt={6} px={4} py={2} bg="blue.100" borderRadius="full">
                    <Text fontSize="sm" color="blue.700" fontWeight="semibold">
                        📸 PNG, JPG, JPEG • Máx. 5MB
                    </Text>
                </Box>
            </FileUpload.DropzoneContent>
        </Flex>
    </FileUpload.Dropzone>
)

//Preview component - VERSION MEJORADA
const Preview = ({ file }: { file: File }) => (
    <FileUpload.Item 
        file={file} 
        key={file.name} 
        flexDir="column" 
        h="240px" 
        p="4" 
        position="relative"
        bg="white"
        borderRadius="xl"
        border="2px solid"
        borderColor="gray.200"
        transition="all 0.3s"
        _hover={{ 
            shadow: "xl",
            borderColor: "blue.400",
            transform: "translateY(-4px)"
        }}
    >
        <Box 
            position="relative" 
            h="160px" 
            bg="gray.100" 
            borderRadius="lg" 
            overflow="hidden"
            mb={3}
        >
            <FileUpload.ItemPreviewImage 
                w="full" 
                h="full" 
                objectFit="cover" 
            />
        </Box>
        <Float placement="top-end" mt="2" mr="2">
            <FileUpload.ItemDeleteTrigger 
                boxSize="8" 
                bg="red.500"
                color="white"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                transition="all 0.2s"
                shadow="md"
                _hover={{ 
                    bg: "red.600",
                    transform: "scale(1.15)",
                    shadow: "lg"
                }}
            >
                <LuX size={18} />
            </FileUpload.ItemDeleteTrigger>
        </Float>
        <Box textAlign="center" mt="2" px={2}>
            <FileUpload.ItemName 
                fontSize="sm" 
                fontWeight="semibold"
                color="gray.800"
            />
            <FileUpload.ItemSizeText 
                fontSize="xs" 
                color="gray.500"
                mt={2}
            />
        </Box>
    </FileUpload.Item>
)

export default function InsertComponent() {
    return (
        <ChakraProvider value={defaultSystem}>
            <FileUpload.Root 
                maxW="full" 
                alignItems="stretch" 
                maxFiles={10}
                accept="image/png,image/jpeg,image/jpg"
            >
                <FileUpload.HiddenInput />
                <FileUpload.Context>
                    {({ acceptedFiles }) =>
                        acceptedFiles.length > 0 ? (
                            <Box>
                                <Flex 
                                    justifyContent="space-between" 
                                    alignItems="center" 
                                    mb={6}
                                    p={5}
                                    bg="blue.50"
                                    borderRadius="lg"
                                    border="1px solid"
                                    borderColor="blue.200"
                                >
                                    <Flex alignItems="center" gap={3}>
                                        <Box bg="blue.500" p={2} borderRadius="md">
                                            <Text fontSize="lg" fontWeight="bold" color="white">
                                                {acceptedFiles.length}
                                            </Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="md" fontWeight="bold" color="gray.800">
                                                {acceptedFiles.length === 1 ? 'Imagen seleccionada' : 'Imágenes seleccionadas'}
                                            </Text>
                                            <Text fontSize="xs" color="gray.600">
                                                Listo para subir
                                            </Text>
                                        </Box>
                                    </Flex>
                                    <FileUpload.Trigger
                                        px={4}
                                        py={2}
                                        bg="blue.500"
                                        color="white"
                                        borderRadius="lg"
                                        fontSize="sm"
                                        fontWeight="bold"
                                        cursor="pointer"
                                        transition="all 0.2s"
                                        shadow="md"
                                        _hover={{ 
                                            bg: "blue.600",
                                            shadow: "lg",
                                            transform: "scale(1.05)"
                                        }}
                                    >
                                        + Agregar más
                                    </FileUpload.Trigger>
                                </Flex>
                                <FileUpload.ItemGroup
                                    display="grid"
                                    gridTemplateColumns="repeat(auto-fill, minmax(180px, 1fr))"
                                    gap={5}
                                >
                                    {acceptedFiles.map(f => <Preview key={f.name} file={f} />)}
                                </FileUpload.ItemGroup>
                            </Box>
                        ) : (
                            <Dropzone />
                        )
                    }
                </FileUpload.Context>
            </FileUpload.Root>
        </ChakraProvider>
    )
}
