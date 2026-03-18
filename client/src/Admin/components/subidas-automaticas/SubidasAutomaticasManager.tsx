import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  ChakraProvider,
  Container,
  defaultSystem,
  Flex,
  Grid,
  Icon,
  Input,
  Spinner,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { LuCalendarClock, LuClock3, LuFileText, LuImage, LuListFilter, LuSend, LuUpload, LuX } from "react-icons/lu";
import InsertComponent from "../InsertComponent";
import Toast from "../Toast";
import { getCategorias, type Categoria } from "../../../services/categoria.service";
import {
  createSubidaAutomatica,
  getSubidasAutomaticas,
  type SubidaAutomatica,
  type TipoSubidaAutomatica,
} from "../../../services/subida_automatica.service";

function formatDate(value?: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDateTimeLocalInput(date: Date): string {
  const tzOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

export default function SubidasAutomaticasManager() {
  const [tipo, setTipo] = useState<TipoSubidaAutomatica>("imagen");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [programadoPara, setProgramadoPara] = useState(toDateTimeLocalInput(new Date(Date.now() + 60 * 60 * 1000)));

  const [imgCategoria, setImgCategoria] = useState("");
  const [imgTitulo, setImgTitulo] = useState("");
  const [imgDescripcion, setImgDescripcion] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [insertResetKey, setInsertResetKey] = useState(0);

  const [formTitulo, setFormTitulo] = useState("");
  const [formDescripcion, setFormDescripcion] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formImage, setFormImage] = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subidas, setSubidas] = useState<SubidaAutomatica[]>([]);
  const [toast, setToast] = useState<{
    title: string;
    description: string;
    type: "success" | "error" | "warning";
  } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, listado] = await Promise.all([
        getCategorias(),
        getSubidasAutomaticas(),
      ]);
      setCategorias(cats.filter((c) => c.activa));
      setSubidas(listado);
    } catch {
      setToast({
        title: "Error",
        description: "No se pudo cargar la configuración de subidas automáticas.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendientes = useMemo(
    () => subidas.filter((s) => s.estado === "pendiente" || s.estado === "procesando"),
    [subidas],
  );

  const publicadas = useMemo(
    () => subidas.filter((s) => s.estado === "publicado" || s.estado === "error"),
    [subidas],
  );

  const handleFormImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setFormImage(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setToast({ title: "Archivo inválido", description: "Debes seleccionar una imagen.", type: "warning" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({ title: "Archivo muy grande", description: "La imagen no debe superar 5MB.", type: "warning" });
      return;
    }
    setFormImage(file);
  };

  useEffect(() => {
    if (!formImage) {
      setFormImagePreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(formImage);
    setFormImagePreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [formImage]);

  const resetForm = () => {
    setProgramadoPara(toDateTimeLocalInput(new Date(Date.now() + 60 * 60 * 1000)));
    setImgCategoria("");
    setImgTitulo("");
    setImgDescripcion("");
    setImages([]);
    setInsertResetKey((prev) => prev + 1);
    setFormTitulo("");
    setFormDescripcion("");
    setFormUrl("");
    setFormImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!programadoPara) {
      setToast({ title: "Fecha requerida", description: "Debes indicar fecha y hora de publicación.", type: "warning" });
      return;
    }

    const formData = new FormData();
    formData.append("tipo", tipo);
    formData.append("programadoPara", programadoPara);

    if (tipo === "imagen") {
      if (!imgCategoria || !imgTitulo || images.length === 0) {
        setToast({ title: "Campos incompletos", description: "Para imágenes debes indicar categoría, título y archivos.", type: "warning" });
        return;
      }

      formData.append("categoria", imgCategoria);
      formData.append("titulo", imgTitulo);
      formData.append("descripcion", imgDescripcion);
      for (const image of images) {
        formData.append("images", image);
      }
    } else {
      if (!formTitulo || !formUrl || !formImage) {
        setToast({ title: "Campos incompletos", description: "Para formularios debes indicar título, URL e imagen.", type: "warning" });
        return;
      }
      formData.append("titulo", formTitulo);
      formData.append("descripcion", formDescripcion);
      formData.append("url", formUrl);
      formData.append("imagen", formImage);
    }

    setSaving(true);
    try {
      await createSubidaAutomatica(formData);
      setToast({
        title: "Programación creada",
        description: "La subida automática quedó programada correctamente.",
        type: "success",
      });
      resetForm();
      await loadData();
    } catch (error: any) {
      setToast({
        title: "No se pudo programar",
        description: error?.response?.data?.error || "Ocurrió un error al crear la programación.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ChakraProvider value={defaultSystem}>
      <Container maxW="7xl" px={6} py={4}>
        {toast && (
          <Toast
            title={toast.title}
            description={toast.description}
            type={toast.type}
            onClose={() => setToast(null)}
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
          <Button size="sm" onClick={loadData} variant="outline" borderRadius="lg">
            <Icon mr={2}><LuListFilter /></Icon>
            Actualizar listados
          </Button>
        </Flex>

        {loading ? (
          <Flex justify="center" align="center" h="220px" direction="column" gap={3}>
            <Spinner size="lg" color="blue.500" />
            <Text color="gray.600" fontSize="sm">Cargando información...</Text>
          </Flex>
        ) : (
          <>
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
              <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
                <Box>
                  <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>Tipo de contenido *</Text>
                  <Flex gap={2}>
                    <Button
                      type="button"
                      size="sm"
                      variant={tipo === "imagen" ? "solid" : "outline"}
                      bg={tipo === "imagen" ? "blue.600" : undefined}
                      color={tipo === "imagen" ? "white" : undefined}
                      onClick={() => setTipo("imagen")}
                    >
                      <Icon mr={2}><LuImage /></Icon>
                      Imágenes
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={tipo === "formulario" ? "solid" : "outline"}
                      bg={tipo === "formulario" ? "emerald.600" : undefined}
                      color={tipo === "formulario" ? "white" : undefined}
                      onClick={() => setTipo("formulario")}
                    >
                      <Icon mr={2}><LuFileText /></Icon>
                      Formularios
                    </Button>
                  </Flex>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>Fecha y hora de publicación *</Text>
                  <Input
                    type="datetime-local"
                    value={programadoPara}
                    onChange={(e) => setProgramadoPara(e.target.value)}
                    size="sm"
                    borderRadius="lg"
                    required
                  />
                </Box>
              </Grid>

              {tipo === "imagen" ? (
                <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6} mt={5}>
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>Archivos *</Text>
                    <InsertComponent key={insertResetKey} onFilesChange={setImages} />
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>Categoría *</Text>
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
                      <option value="">Selecciona una categoría</option>
                      {categorias.map((c) => (
                        <option key={c.id} value={c.value}>{c.label}</option>
                      ))}
                    </select>

                    <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2} mt={4}>Título *</Text>
                    <Input
                      value={imgTitulo}
                      onChange={(e) => setImgTitulo(e.target.value)}
                      placeholder="Ej: Reunión anual"
                      size="sm"
                      borderRadius="lg"
                      required
                    />

                    <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2} mt={4}>Descripción</Text>
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
                    <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>Título *</Text>
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

                    <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2} mt={4}>Descripción</Text>
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
                      <Box
                        border="2px solid"
                        borderColor="blue.200"
                        borderRadius="xl"
                        p={3}
                        bg="blue.50"
                      >
                        <Box
                          as="img"
                          src={formImagePreview}
                          alt="Vista previa"
                          w="100%"
                          h="200px"
                          objectFit="cover"
                          borderRadius="lg"
                          mb={3}
                        />
                        <Flex justify="space-between" align="center" gap={2}>
                          <Text fontSize="xs" color="gray.700" fontWeight="medium" noOfLines={1}>
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
                          Arrastra tu imagen aquí
                        </Text>
                        <Text fontSize="sm" color="gray.600" textAlign="center" mt={2}>
                          o haz clic para seleccionar desde tu computadora
                        </Text>
                        <Box mt={4} px={4} py={2} bg="blue.100" borderRadius="full">
                          <Text fontSize="xs" color="blue.700" fontWeight="semibold">
                            PNG, JPG, JPEG • Máx. 5MB
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
            </Box>

            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
              <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="xl" p={5}>
                <Flex align="center" gap={2} mb={3}>
                  <Icon color="orange.500"><LuClock3 /></Icon>
                  <Text fontSize="md" fontWeight="bold">Pendientes de subir ({pendientes.length})</Text>
                </Flex>
                {pendientes.length === 0 ? (
                  <Text fontSize="sm" color="gray.500">No hay elementos pendientes.</Text>
                ) : (
                  <Flex direction="column" gap={3}>
                    {pendientes.map((item) => (
                      <Box key={item.id} border="1px solid" borderColor="gray.100" borderRadius="lg" p={3}>
                        <Text fontSize="sm" fontWeight="bold" color="gray.800">
                          {item.tipo === "imagen" ? item.payload?.titulo : item.payload?.titulo}
                        </Text>
                        <Text fontSize="xs" color="gray.600" mt={1}>
                          Tipo: {item.tipo} | Estado: {item.estado}
                        </Text>
                        <Text fontSize="xs" color="gray.600" mt={1}>
                          Programado: {formatDate(item.programado_para)}
                        </Text>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Correos: {item.correos_destino}
                        </Text>
                      </Box>
                    ))}
                  </Flex>
                )}
              </Box>

              <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="xl" p={5}>
                <Flex align="center" gap={2} mb={3}>
                  <Icon color="green.500"><LuCalendarClock /></Icon>
                  <Text fontSize="md" fontWeight="bold">Ya subidos / procesados ({publicadas.length})</Text>
                </Flex>
                {publicadas.length === 0 ? (
                  <Text fontSize="sm" color="gray.500">Aún no hay publicaciones procesadas.</Text>
                ) : (
                  <Flex direction="column" gap={3}>
                    {publicadas.map((item) => (
                      <Box key={item.id} border="1px solid" borderColor="gray.100" borderRadius="lg" p={3}>
                        <Text fontSize="sm" fontWeight="bold" color="gray.800">
                          {item.tipo === "imagen" ? item.payload?.titulo : item.payload?.titulo}
                        </Text>
                        <Text fontSize="xs" color="gray.600" mt={1}>
                          Tipo: {item.tipo} | Estado: {item.estado}
                        </Text>
                        <Text fontSize="xs" color="gray.600" mt={1}>
                          Publicado: {formatDate(item.fecha_procesado)}
                        </Text>
                        {item.error_mensaje ? (
                          <Text fontSize="xs" color="red.500" mt={1}>
                            Error: {item.error_mensaje}
                          </Text>
                        ) : null}
                      </Box>
                    ))}
                  </Flex>
                )}
              </Box>
            </Grid>
          </>
        )}
      </Container>
    </ChakraProvider>
  );
}
