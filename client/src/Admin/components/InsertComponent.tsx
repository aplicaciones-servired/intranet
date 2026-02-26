import { Box, ChakraProvider, defaultSystem, FileUpload, Float, Icon } from "@chakra-ui/react"
import { LuUpload, LuX } from "react-icons/lu"

//Dropzone component to handle file selection
const Dropzone = () => (
    <FileUpload.Dropzone>
        <Icon size="md" color="fg.muted"><LuUpload /></Icon>
        <FileUpload.DropzoneContent>
            <Box>Arrastra o haz clic para seleccionar archivos</Box>
            <Box color="fg.muted">.png, .jpg hasta 5MB</Box>
        </FileUpload.DropzoneContent>
    </FileUpload.Dropzone>
)

//Preview component to show selected files
const Preview = ({ file }: { file: File }) => (
    <FileUpload.Item file={file} key={file.name} flexDir="column" h="300px" p="2" position="relative">
        <FileUpload.ItemPreviewImage w="full" h="240px" objectFit="contain" />
        <Float placement="top-end" mt="1" mr="1">
            <FileUpload.ItemDeleteTrigger boxSize="6" layerStyle="fill.solid" borderRadius="full">
                <LuX />
            </FileUpload.ItemDeleteTrigger>
        </Float>
        <Box textAlign="center" mt="1">
            <FileUpload.ItemName fontSize="sm" />
            <FileUpload.ItemSizeText fontSize="xs" color="fg.muted" />
        </Box>
    </FileUpload.Item>
)

export default function InsertComponent() {
    return (
        <ChakraProvider value={defaultSystem}>
            <FileUpload.Root maxW="xl" alignItems="stretch" maxFiles={10} cursor="pointer">
                <FileUpload.HiddenInput />
                <FileUpload.Context>
                    {({ acceptedFiles }) =>
                        acceptedFiles.length > 0
                            ? <FileUpload.ItemGroup>{acceptedFiles.map(f => <Preview key={f.name} file={f} />)}</FileUpload.ItemGroup>
                            : <Dropzone />
                    }
                </FileUpload.Context>
            </FileUpload.Root>
        </ChakraProvider>
    )
}
