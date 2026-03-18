import { Box, Button, Flex, Grid, Icon, Input, Text, Textarea } from "@chakra-ui/react";
import { LuUpload } from "react-icons/lu";
import { formatDate, normalizarPayload, normalizarUrlsImagenes } from "./utils";
import type { SubidaTipoListProps } from "../../../types/subiaTypes";

function PreviewsImagenesSeleccionadas({ files }: { files: File[] }) {
  if (files.length === 0) return null;

  return (
    <Box mt={2}>
      <Text fontSize="xs" color="blue.700" fontWeight="semibold" mb={1}>
        Vista previa de nuevas imagenes
      </Text>
      <Flex wrap="wrap" gap={2}>
        {files.map((file, index) => {
          const src = URL.createObjectURL(file);
          return (
            <img
              key={`${file.name}-${index}`}
              src={src}
              alt={`Nueva imagen ${index + 1}`}
              style={{
                width: "90px",
                height: "90px",
                objectFit: "cover",
                borderRadius: "0.5rem",
                border: "1px solid #cbd5e1",
              }}
              onLoad={() => URL.revokeObjectURL(src)}
            />
          );
        })}
      </Flex>
    </Box>
  );
}

function PreviewFormularioSeleccionado({ file }: { file: File | null }) {
  if (!file) return null;
  const src = URL.createObjectURL(file);

  return (
    <Box mt={2}>
      <img
        src={src}
        alt="Nueva imagen seleccionada"
        style={{
          width: "100%",
          maxWidth: "320px",
          height: "140px",
          objectFit: "cover",
          borderRadius: "0.75rem",
          border: "1px solid #3b82f6",
          boxShadow: "0 8px 20px rgba(15, 23, 42, 0.12)",
        }}
        onLoad={() => URL.revokeObjectURL(src)}
      />
      <Text fontSize="xs" color="blue.700" mt={1} fontWeight="semibold">
        Nueva imagen seleccionada
      </Text>
    </Box>
  );
}

export default function SubidaTipoList({
  items,
  tipoItem,
  modo,
  editingId,
  savingEdit,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  editProgramadoPara,
  setEditProgramadoPara,
  editCorreosDestino,
  setEditCorreosDestino,
  editTitulo,
  setEditTitulo,
  editCategoria,
  setEditCategoria,
  editUrl,
  setEditUrl,
  editDescripcion,
  setEditDescripcion,
  editImages,
  setEditImages,
  editFormImage,
  setEditFormImage,
}: SubidaTipoListProps) {
  const tituloTipo = tipoItem === "imagen" ? "Imagenes" : "Formularios";
  const colorAcento = modo === "pendiente" ? "#f59e0b" : modo === "fallido" ? "#ef4444" : "#10b981";
  const fondoTipo = tipoItem === "imagen" ? "#eff6ff" : "#ecfdf5";
  const textoTipo = tipoItem === "imagen" ? "#1d4ed8" : "#047857";

  return (
    <Box>
      <Flex align="center" justify="space-between" mb={2}>
        <Text fontSize="sm" fontWeight="bold" color="gray.700">
          {tituloTipo}
        </Text>
        <Box px={2.5} py={0.5} borderRadius="full" bg={fondoTipo} border="1px solid" borderColor="gray.200">
          <Text fontSize="xs" fontWeight="bold" color={textoTipo}>{items.length}</Text>
        </Box>
      </Flex>

      {items.length === 0 ? (
        <Text fontSize="xs" color="gray.500">Sin registros.</Text>
      ) : (
        <Flex direction="column" gap={3}>
          {items.map((item) => {
            const enEdicion = editingId === item.id;
            const payload = normalizarPayload(item.payload);
            const urlsImagenesActuales = normalizarUrlsImagenes(payload);
            const imagenesActuales = urlsImagenesActuales.length;

            return (
              <Box
                key={item.id}
                border="1px solid"
                borderColor="gray.200"
                borderLeft={`4px solid ${colorAcento}`}
                bg="linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)"
                borderRadius="xl"
                p={3.5}
                shadow="sm"
              >
                <Text fontSize="sm" fontWeight="bold" color="gray.800">
                  {String(payload.titulo || "Sin titulo")}
                </Text>

                <Text fontSize="xs" color="gray.600" mt={1}>
                  Tipo: {item.tipo} | Estado: {item.estado}
                </Text>

                {modo === "pendiente" ? (
                  <Text fontSize="xs" color="gray.600" mt={1}>
                    Programado: {formatDate(item.programado_para)}
                  </Text>
                ) : (
                  <Text fontSize="xs" color="gray.600" mt={1}>
                    Publicado: {formatDate(item.fecha_procesado)}
                  </Text>
                )}

                <Text fontSize="xs" color="gray.500" mt={1}>
                  Correos: {item.correos_destino}
                </Text>

                {item.error_mensaje ? (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    Error: {item.error_mensaje}
                  </Text>
                ) : null}

                {modo === "pendiente" && item.estado === "pendiente" ? (
                  <Flex mt={3} justify="flex-end" gap={2}>
                    {enEdicion ? null : (
                      <Button size="xs" variant="outline" onClick={() => onStartEdit(item)}>
                        Editar
                      </Button>
                    )}
                  </Flex>
                ) : null}

                {modo === "pendiente" && enEdicion ? (
                  <Box mt={3} borderTop="1px solid" borderColor="gray.100" pt={3}>
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                      <Box>
                        <Text fontSize="xs" fontWeight="bold" color="gray.700" mb={1}>Fecha y hora</Text>
                        <Input
                          type="datetime-local"
                          size="sm"
                          value={editProgramadoPara}
                          onChange={(e) => setEditProgramadoPara(e.target.value)}
                        />
                      </Box>

                      <Box>
                        <Text fontSize="xs" fontWeight="bold" color="gray.700" mb={1}>Correos</Text>
                        <Input
                          size="sm"
                          value={editCorreosDestino}
                          onChange={(e) => setEditCorreosDestino(e.target.value)}
                        />
                      </Box>

                      <Box>
                        <Text fontSize="xs" fontWeight="bold" color="gray.700" mb={1}>Titulo</Text>
                        <Input
                          size="sm"
                          value={editTitulo}
                          onChange={(e) => setEditTitulo(e.target.value)}
                        />
                      </Box>

                      {item.tipo === "imagen" ? (
                        <Box>
                          <Text fontSize="xs" fontWeight="bold" color="gray.700" mb={1}>Categoria</Text>
                          <Input
                            size="sm"
                            value={editCategoria}
                            onChange={(e) => setEditCategoria(e.target.value)}
                          />
                        </Box>
                      ) : (
                        <Box>
                          <Text fontSize="xs" fontWeight="bold" color="gray.700" mb={1}>URL</Text>
                          <Input
                            size="sm"
                            type="url"
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                          />
                        </Box>
                      )}
                    </Grid>

                    {item.tipo === "imagen" ? (
                      <Box mt={3}>
                        <Text fontSize="xs" fontWeight="bold" color="gray.700" mb={1}>
                          Imagenes (opcional, para reemplazar las actuales)
                        </Text>
                        {urlsImagenesActuales.length > 0 ? (
                          <Box mb={2}>
                            <Flex wrap="wrap" gap={2.5}>
                              {urlsImagenesActuales.map((url, index) => (
                                <Box key={`${item.id}-${index}`} position="relative">
                                  <img
                                    src={url}
                                    alt={`Imagen actual ${index + 1}`}
                                    style={{
                                      width: "110px",
                                      height: "110px",
                                      objectFit: "cover",
                                      borderRadius: "0.75rem",
                                      border: "1px solid #cbd5e1",
                                      boxShadow: "0 8px 20px rgba(15, 23, 42, 0.12)",
                                    }}
                                  />
                                  <Box
                                    position="absolute"
                                    top="6px"
                                    right="6px"
                                    px={1.5}
                                    py={0.5}
                                    borderRadius="full"
                                    bg="rgba(15, 23, 42, 0.72)"
                                  >
                                    <Text fontSize="10px" color="white" fontWeight="bold">{index + 1}</Text>
                                  </Box>
                                </Box>
                              ))}
                            </Flex>
                            <Text fontSize="xs" color="gray.500" mt={1}>
                              Imagenes actuales
                            </Text>
                          </Box>
                        ) : null}
                        <Box
                          as="label"
                          display="flex"
                          flexDirection="column"
                          alignItems="center"
                          justifyContent="center"
                          gap={1.5}
                          border="2px dashed"
                          borderColor="blue.300"
                          borderRadius="lg"
                          bg="linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
                          px={3}
                          py={4}
                          cursor="pointer"
                          transition="all 0.2s"
                          _hover={{ borderColor: "blue.500", transform: "translateY(-1px)" }}
                        >
                          <Box
                            p={2}
                            borderRadius="md"
                            bg="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                            color="white"
                            shadow="sm"
                          >
                            <Icon fontSize="md"><LuUpload /></Icon>
                          </Box>
                          <Text fontSize="xs" fontWeight="bold" color="blue.800" textAlign="center">
                            Seleccionar imagenes
                          </Text>
                          <Text fontSize="xs" color="blue.700" textAlign="center">
                            PNG, JPG, JPEG - Max. 5MB
                          </Text>
                          <Input
                            type="file"
                            accept="image/*"
                            multiple
                            display="none"
                            onChange={(e) => setEditImages(Array.from(e.target.files || []))}
                          />
                        </Box>
                        {editImages.length > 0 ? (
                          <>
                            <Text fontSize="xs" color="blue.700" mt={1} fontWeight="semibold">
                              Nuevas imagenes: {editImages.map((f) => f.name).join(", ")}
                            </Text>
                            <PreviewsImagenesSeleccionadas files={editImages} />
                          </>
                        ) : null}
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Actuales: {imagenesActuales}. Nuevas seleccionadas: {editImages.length}.
                        </Text>
                      </Box>
                    ) : (
                      <Box mt={3}>
                        <Text fontSize="xs" fontWeight="bold" color="gray.700" mb={1}>
                          Imagen del formulario (opcional, para reemplazar)
                        </Text>
                        {!editFormImage && payload.imagenUrl ? (
                          <Box mb={2}>
                            <img
                              src={String(payload.imagenUrl)}
                              alt="Imagen actual del formulario"
                              style={{
                                width: "100%",
                                maxWidth: "320px",
                                height: "140px",
                                objectFit: "cover",
                                borderRadius: "0.75rem",
                                border: "1px solid #cbd5e1",
                                boxShadow: "0 8px 20px rgba(15, 23, 42, 0.12)",
                              }}
                            />
                            <Text fontSize="xs" color="gray.500" mt={1}>Imagen actual</Text>
                          </Box>
                        ) : null}
                        <Box
                          as="label"
                          display="flex"
                          flexDirection="column"
                          alignItems="center"
                          justifyContent="center"
                          gap={1.5}
                          border="2px dashed"
                          borderColor="emerald.300"
                          borderRadius="lg"
                          bg="linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"
                          px={3}
                          py={4}
                          cursor="pointer"
                          transition="all 0.2s"
                          _hover={{ borderColor: "emerald.500", transform: "translateY(-1px)" }}
                        >
                          <Box
                            p={2}
                            borderRadius="md"
                            bg="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                            color="white"
                            shadow="sm"
                          >
                            <Icon fontSize="md"><LuUpload /></Icon>
                          </Box>
                          <Text fontSize="xs" fontWeight="bold" color="emerald.800" textAlign="center">
                            Seleccionar nueva imagen
                          </Text>
                          <Text fontSize="xs" color="emerald.700" textAlign="center">
                            PNG, JPG, JPEG - Max. 5MB
                          </Text>
                          <Input
                            type="file"
                            accept="image/*"
                            display="none"
                            onChange={(e) => setEditFormImage(e.target.files?.[0] || null)}
                          />
                        </Box>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          {editFormImage ? `Nueva imagen: ${editFormImage.name}` : "Se conservara la imagen actual si no seleccionas una nueva."}
                        </Text>
                        <PreviewFormularioSeleccionado file={editFormImage} />
                      </Box>
                    )}

                    <Box mt={3}>
                      <Text fontSize="xs" fontWeight="bold" color="gray.700" mb={1}>Descripcion</Text>
                      <Textarea
                        rows={2}
                        value={editDescripcion}
                        onChange={(e) => setEditDescripcion(e.target.value)}
                      />
                    </Box>

                    <Flex mt={3} justify="flex-end" gap={2}>
                      <Button size="xs" variant="outline" onClick={onCancelEdit}>
                        Cancelar
                      </Button>
                      <Button
                        size="xs"
                        bg="blue.600"
                        color="white"
                        loading={savingEdit}
                        onClick={() => onSaveEdit(item)}
                      >
                        Guardar cambios
                      </Button>
                    </Flex>
                  </Box>
                ) : null}
              </Box>
            );
          })}
        </Flex>
      )}
    </Box>
  );
}
