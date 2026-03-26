import {
  Box,
  Button,
  ChakraProvider,
  Container,
  defaultSystem,
  Flex,
  Icon,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { LuCalendarClock, LuListFilter } from "react-icons/lu";
import Toast from "../Toast";
import SubidaProgramacionForm from "./SubidaProgramacionForm";
import SubidasEstadoGrid from "./SubidasEstadoGrid";
import { useSubidasAutomaticasManager } from "./useSubidasAutomaticasManager";

export default function SubidasAutomaticasManager() {
  const manager = useSubidasAutomaticasManager();

  return (
    <ChakraProvider value={defaultSystem}>
      <Container maxW="7xl" px={6} py={4}>
        {manager.toast && (
          <Toast
            title={manager.toast.title}
            description={manager.toast.description}
            type={manager.toast.type}
            onClose={() => manager.setToast(null)}
          />
        )}

        <Flex align="center" justify="space-between" mb={6} wrap="wrap" gap={3}>
          <Box>
            <Flex align="center" gap={3} mb={1}>
              <Box bg="linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)" p={2.5} borderRadius="lg">
                <Icon color="white" fontSize="xl"><LuCalendarClock /></Icon>
              </Box>
              <Text fontSize="2xl" fontWeight="bold" color="gray.900"> 
                Subida Automática
              </Text>
            </Flex>
            <Text color="gray.600" fontSize="sm">
              Programa imágenes o formularios para publicarse en una fecha y hora específicas.
            </Text>
          </Box>
          <Button size="sm" onClick={manager.loadData} variant="outline" borderRadius="lg" color={"white"} bg={"blue.500"} _hover={{ bg: "teal.600" }}>
            <Icon mr={2}><LuListFilter /></Icon>
            Actualizar listados
          </Button>
        </Flex>

        {manager.loading ? (
          <Flex justify="center" align="center" h="220px" direction="column" gap={3}>
            <Spinner size="lg" color="blue.500" />
            <Text color="gray.600" fontSize="sm">Cargando información...</Text>
          </Flex>
        ) : (
          <>
            <SubidaProgramacionForm
              tipo={manager.tipo}
              setTipo={manager.setTipo}
              programadoPara={manager.programadoPara}
              setProgramadoPara={manager.setProgramadoPara}
              categorias={manager.categorias}
              imgCategoria={manager.imgCategoria}
              setImgCategoria={manager.setImgCategoria}
              imgTitulo={manager.imgTitulo}
              setImgTitulo={manager.setImgTitulo}
              imgDescripcion={manager.imgDescripcion}
              setImgDescripcion={manager.setImgDescripcion}
              insertResetKey={manager.insertResetKey}
              setImages={manager.setImages}
              formTitulo={manager.formTitulo}
              setFormTitulo={manager.setFormTitulo}
              formDescripcion={manager.formDescripcion}
              setFormDescripcion={manager.setFormDescripcion}
              formUrl={manager.formUrl}
              setFormUrl={manager.setFormUrl}
              formImage={manager.formImage}
              setFormImage={manager.setFormImage}
              formImagePreview={manager.formImagePreview}
              handleFormImageChange={manager.handleFormImageChange}
              handleSubmit={manager.handleSubmit}
              saving={manager.saving}
            />

            <SubidasEstadoGrid
              tipo={manager.tipo}
              pendientesCount={manager.pendientes.length}
              fallidasCount={manager.fallidas.length}
              procesadasCount={manager.procesadas.length}
              pendientesImagen={manager.pendientesImagen}
              pendientesFormulario={manager.pendientesFormulario}
              fallidasImagen={manager.fallidasImagen}
              fallidasFormulario={manager.fallidasFormulario}
              procesadasImagen={manager.procesadasImagen}
              procesadasFormulario={manager.procesadasFormulario}
              listProps={{
                editingId: manager.editingId,
                savingEdit: manager.savingEdit,
                onStartEdit: manager.iniciarEdicionPendiente,
                onCancelEdit: manager.cancelarEdicionPendiente,
                onSaveEdit: manager.guardarEdicionPendiente,
                editProgramadoPara: manager.editProgramadoPara,
                setEditProgramadoPara: manager.setEditProgramadoPara,
                editCorreosDestino: manager.editCorreosDestino,
                setEditCorreosDestino: manager.setEditCorreosDestino,
                editTitulo: manager.editTitulo,
                setEditTitulo: manager.setEditTitulo,
                editCategoria: manager.editCategoria,
                setEditCategoria: manager.setEditCategoria,
                editUrl: manager.editUrl,
                setEditUrl: manager.setEditUrl,
                editDescripcion: manager.editDescripcion,
                setEditDescripcion: manager.setEditDescripcion,
                editImages: manager.editImages,
                setEditImages: manager.setEditImages,
                editFormImage: manager.editFormImage,
                setEditFormImage: manager.setEditFormImage,
              }}
            />
          </>
        )}
      </Container>
    </ChakraProvider>
  );
}
