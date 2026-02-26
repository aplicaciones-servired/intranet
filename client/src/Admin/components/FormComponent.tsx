import {
    Box,
    ChakraProvider,
    defaultSystem,
    Icon,
    Text,
    Flex,
    Heading,
    Container,
    Grid,
    GridItem,
    VStack,
    Input,
    Textarea,
    Button,
    SelectRoot,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValueText,
    createListCollection,
    Field
} from "@chakra-ui/react"
import { LuUpload, LuImage, LuFileText, LuFolder, LuMessageSquare, LuInfo, LuSend, LuCircle } from "react-icons/lu"
import InsertComponent from "./InsertComponent"

const categories = createListCollection({
    items: [
        { label: "Comunicados Internos", value: "comunicados" },
        { label: "Eventos Corporativos", value: "eventos" },
        { label: "Productos y Servicios", value: "productos" },
        { label: "Equipo y Colaboradores", value: "equipo" },
        { label: "Instalaciones", value: "instalaciones" },
        { label: "Otros", value: "otros" },
    ],
})

export default function FormComponent() {
    return (
        <ChakraProvider value={defaultSystem}>
            <Container maxW="8xl" px={6} py={4}>
                {/* Page Header */}
                <Flex
                    justifyContent="center"
                    alignItems="center"
                    gap={4}
                    mb={8}
                    direction={{ base: "column", md: "row" }}
                >
                    <Box
                        bg="linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
                        p={3}
                        borderRadius="xl"
                        shadow="lg"
                    >
                        <Icon fontSize="2xl" color="white"><LuImage /></Icon>
                    </Box>
                    <VStack gap={0} alignItems={{ base: "center", md: "flex-start" }}>
                        <Heading size="xl" color="gray.900">Subir Imágenes Corporativas</Heading>
                        <Text color="gray.600" fontSize="sm">
                            Completa la información y selecciona las imágenes que deseas compartir
                        </Text>
                    </VStack>
                </Flex>

                {/* Layout de 2 Columnas */}
                <Grid
                    templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
                    gap={6}
                    mb={6}
                >
                    {/* COLUMNA IZQUIERDA - Subida de Imágenes */}
                    <GridItem>
                        <Box
                            bg="white"
                            borderRadius="2xl"
                            shadow="xl"
                            border="1px solid"
                            borderColor="gray.200"
                            p={6}
                        >
                            <Flex alignItems="center" gap={3} mb={4}>
                                <Box bg="blue.500" p={2} borderRadius="lg">
                                    <Icon fontSize="lg" color="white"><LuUpload /></Icon>
                                </Box>
                                <Heading size="lg" color="gray.900">Seleccionar Imágenes</Heading>
                            </Flex>

                            <InsertComponent />
                        </Box>
                    </GridItem>

                    {/* COLUMNA DERECHA - Formulario */}
                    <GridItem>
                        <Box
                            bg="white"
                            borderRadius="2xl"
                            shadow="xl"
                            border="1px solid"
                            borderColor="gray.200"
                            p={6}
                        >
                            <Flex alignItems="center" gap={3} mb={6}>
                                <Box bg="purple.500" p={2} borderRadius="lg">
                                    <Icon fontSize="lg" color="white"><LuFileText /></Icon>
                                </Box>
                                <Heading size="lg" color="gray.900">Información del Contenido</Heading>
                            </Flex>

                            <VStack gap={6} alignItems="stretch">
                                {/* Categoría */}
                                <Box>
                                    <Field.Root required>
                                        <Field.Label
                                            fontSize="md"
                                            fontWeight="bold"
                                            color="gray.800"
                                            mb={3}
                                            display="flex"
                                            alignItems="center"
                                            gap={2}
                                        >
                                            <Icon fontSize="xl" color="orange.500"><LuFolder /></Icon>
                                            Categoría
                                        </Field.Label>
                                        <SelectRoot collection={categories} size="md" width="100%">
                                            <SelectTrigger>
                                                <SelectValueText placeholder="Selecciona una categoría" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.items.map((category) => (
                                                    <SelectItem key={category.value} item={category}>
                                                        {category.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </SelectRoot>
                                    </Field.Root>
                                </Box>

                                {/* Título */}
                                <Box>
                                    <Field.Root>
                                        <Field.Label
                                            fontSize="md"
                                            fontWeight="bold"
                                            color="gray.800"
                                            mb={3}
                                            display="flex"
                                            alignItems="center"
                                            gap={2}
                                        >
                                            <Icon fontSize="xl" color="blue.500"><LuFileText /></Icon>
                                            Título
                                        </Field.Label>
                                        <Input
                                            size="md"
                                            placeholder="Ej: Reunión anual 2026"
                                            borderWidth="2px"
                                            _focus={{ borderColor: "blue.500", shadow: "md" }}
                                        />
                                    </Field.Root>
                                </Box>

                                {/* Descripción */}
                                <Box>
                                    <Field.Root>
                                        <Field.Label
                                            fontSize="md"
                                            fontWeight="bold"
                                            color="gray.800"
                                            mb={3}
                                            display="flex"
                                            alignItems="center"
                                            gap={2}
                                        >
                                            <Icon fontSize="xl" color="purple.500"><LuMessageSquare /></Icon>
                                            Descripción
                                        </Field.Label>
                                        <Textarea
                                            size="md"
                                            placeholder="Describe el contenido de las imágenes..."
                                            rows={4}
                                            borderWidth="2px"
                                            resize="none"
                                            _focus={{ borderColor: "blue.500", shadow: "md" }}
                                        />
                                    </Field.Root>
                                </Box>
                            </VStack>

                            {/* Botones de Acción */}
                            <Flex gap={4} justifyContent="center" flexWrap="wrap" marginTop="7">
                                <Button
                                    size="lg"
                                    px={10}
                                    py={6}
                                    bg="linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)"
                                    color="white"
                                    fontSize="md"
                                    fontWeight="bold"
                                    borderRadius="xl"
                                    shadow="xl"
                                    transition="all 0.3s"
                                    _hover={{
                                        transform: "translateY(-2px) scale(1.05)",
                                        shadow: "lg"
                                    }}
                                    _active={{
                                        transform: "scale(0.95)"
                                    }}
                                >
                                    <Icon fontSize="xl" mr={2}><LuSend /></Icon>
                                    Subir Imágenes
                                </Button>
                                <Button
                                    size="lg"
                                    px={8}
                                    py={6}
                                    bg="linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)"
                                    color="gray.700"
                                    fontSize="md"
                                    fontWeight="bold"
                                    borderRadius="xl"
                                    border="2px solid"
                                    borderColor="gray.300"
                                    shadow="md"
                                    transition="all 0.3s"
                                    _hover={{
                                        transform: "scale(1.05)",
                                        shadow: "lg",
                                        bg: "linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%)"
                                    }}
                                    _active={{
                                        transform: "scale(0.95)"
                                    }}
                                >
                                    <Icon fontSize="xl" mr={2}><LuCircle /></Icon>
                                    Cancelar
                                </Button>
                            </Flex>
                        </Box>
                    </GridItem>
                </Grid>
            </Container>
        </ChakraProvider>
    )
}
