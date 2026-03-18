import {
  Box,
  Button,
  Flex,
  Grid,
  Icon,
  Input,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { LuSend, LuUpload, LuX } from "react-icons/lu";
import InsertComponent from "../InsertComponent";
import TipoContenidoSelector from "./TipoContenidoSelector";
import type { Categoria } from "../../../services/categoria.service";
import type { TipoSubidaAutomatica } from "../../../services/subida_automatica.service";

interface SubidaProgramacionFormProps {
  tipo: TipoSubidaAutomatica | null;
  setTipo: (tipo: TipoSubidaAutomatica) => void;
  programadoPara: string;
  setProgramadoPara: (value: string) => void;
  categorias: Categoria[];
  imgCategoria: string;
  setImgCategoria: (value: string) => void;
  imgTitulo: string;
  setImgTitulo: (value: string) => void;
  imgDescripcion: string;
  setImgDescripcion: (value: string) => void;
  insertResetKey: number;
  setImages: (files: File[]) => void;
  formTitulo: string;
  setFormTitulo: (value: string) => void;
  formDescripcion: string;
  setFormDescripcion: (value: string) => void;
  formUrl: string;
  setFormUrl: (value: string) => void;
  formImage: File | null;
  setFormImage: (file: File | null) => void;
  formImagePreview: string | null;
  handleFormImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  saving: boolean;
}

export default function SubidaProgramacionForm({
  tipo,
  setTipo,
  programadoPara,
  setProgramadoPara,
  categorias,
  imgCategoria,
  setImgCategoria,
  imgTitulo,
  setImgTitulo,
  imgDescripcion,
  setImgDescripcion,
  insertResetKey,
  setImages,
  formTitulo,
  setFormTitulo,
  formDescripcion,
  setFormDescripcion,
  formUrl,
  setFormUrl,
  formImage,
  setFormImage,
  formImagePreview,
  handleFormImageChange,
  handleSubmit,
  saving,
}: SubidaProgramacionFormProps) {
  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="xl"
      p={6}
      mb={7}
      shadow="sm"
    >
      <TipoContenidoSelector tipo={tipo} onSelect={setTipo} />

      {!tipo ? (
        <Box mt={5} p={4} borderRadius="lg" bg="gray.50" border="1px solid" borderColor="gray.200">
          <Text fontSize="sm" color="gray.600">
            Selecciona una de las dos tarjetas para cargar el formulario y la informacion correspondiente.
          </Text>
        </Box>
      ) : (
        <>
          <Box mt={5}>
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={4}>
              <Box>
                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>Fecha y hora de publicacion *</Text>
                <Input
                  type="datetime-local"
                  value={programadoPara}
                  onChange={(e) => setProgramadoPara(e.target.value)}
                  size="sm"
                  borderRadius="lg"
                  required
                />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>Tipo seleccionado</Text>
                <Box
                  border="1px solid"
                  borderColor={tipo === "imagen" ? "blue.200" : "emerald.200"}
                  bg={tipo === "imagen" ? "blue.50" : "emerald.50"}
                  borderRadius="lg"
                  px={3}
                  py={2}
                >
                  <Text fontSize="sm" fontWeight="semibold" color={tipo === "imagen" ? "blue.800" : "emerald.800"}>
                    {tipo === "imagen" ? "Formulario de publicacion de imagenes" : "Formulario de publicacion de formularios"}
                  </Text>
                </Box>
              </Box>
            </Grid>
          </Box>

          {tipo === "imagen" ? (
            <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6} mt={5}>
              <Box>
                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>Archivos *</Text>
                <InsertComponent key={insertResetKey} onFilesChange={setImages} />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>Categoria *</Text>
                <select
                  value={imgCategoria}
                  onChange={(e) => setImgCategoria(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    height: "36px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    padding: "0 10px",
                    backgroundColor: "white",
                  }}
                >
                  <option value="">Selecciona una categoria</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.value}>{c.label}</option>
                  ))}
                </select>

                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2} mt={4}>Titulo *</Text>
                <Input
                  value={imgTitulo}
                  onChange={(e) => setImgTitulo(e.target.value)}
                  placeholder="Ej: Reunion anual"
                  size="sm"
                  borderRadius="lg"
                  required
                />

                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2} mt={4}>Descripcion</Text>
                <Textarea
                  value={imgDescripcion}
                  onChange={(e) => setImgDescripcion(e.target.value)}
                  rows={3}
                  borderRadius="lg"
                />
              </Box>
            </Grid>
          ) : (
            <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6} mt={5}>
              <Box>
                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>Titulo *</Text>
                <Input
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  size="sm"
                  borderRadius="lg"
                  required
                />

                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2} mt={4}>URL del formulario *</Text>
                <Input
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  type="url"
                  placeholder="https://forms.gle/..."
                  size="sm"
                  borderRadius="lg"
                  required
                />

                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2} mt={4}>Descripcion</Text>
                <Textarea
                  value={formDescripcion}
                  onChange={(e) => setFormDescripcion(e.target.value)}
                  rows={3}
                  borderRadius="lg"
                />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>Imagen del formulario *</Text>
                {formImagePreview ? (
                  <Box border="2px solid" borderColor="blue.200" borderRadius="xl" p={3} bg="blue.50">
                    <img
                      src={formImagePreview}
                      alt="Vista previa"
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "0.5rem",
                        marginBottom: "0.75rem",
                      }}
                    />
                    <Flex justify="space-between" align="center" gap={2}>
                      <Text
                        fontSize="xs"
                        color="gray.700"
                        fontWeight="medium"
                        style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {formImage?.name}
                      </Text>
                      <Button
                        type="button"
                        size="xs"
                        colorScheme="red"
                        variant="outline"
                        onClick={() => setFormImage(null)}
                      >
                        <Icon mr={1}><LuX /></Icon>
                        Quitar
                      </Button>
                    </Flex>
                  </Box>
                ) : (
                  <Box
                    as="label"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    border="3px dashed"
                    borderColor="blue.400"
                    borderRadius="xl"
                    p={8}
                    bg="linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)"
                    cursor="pointer"
                    transition="all 0.3s"
                    _hover={{
                      borderColor: "blue.600",
                      bg: "linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)",
                      transform: "scale(1.01)",
                    }}
                  >
                    <Box
                      p={4}
                      bg="linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
                      borderRadius="2xl"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      shadow="lg"
                      mb={4}
                    >
                      <Icon fontSize="3xl" color="white"><LuUpload /></Icon>
                    </Box>
                    <Text fontSize="2xl" fontWeight="bold" color="gray.800" textAlign="center">
                      Arrastra tu imagen aqui
                    </Text>
                    <Text fontSize="sm" color="gray.600" textAlign="center" mt={2}>
                      o haz clic para seleccionar desde tu computadora
                    </Text>
                    <Box mt={4} px={4} py={2} bg="blue.100" borderRadius="full">
                      <Text fontSize="xs" color="blue.700" fontWeight="semibold">
                        PNG, JPG, JPEG - Max. 5MB
                      </Text>
                    </Box>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFormImageChange}
                      display="none"
                    />
                  </Box>
                )}
              </Box>
            </Grid>
          )}

          <Flex justify="flex-end" mt={6}>
            <Button
              type="submit"
              size="sm"
              borderRadius="lg"
              bg="linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)"
              color="white"
              loading={saving}
            >
              <Icon mr={2}><LuSend /></Icon>
              Programar subida
            </Button>
          </Flex>
        </>
      )}
    </Box>
  );
}
