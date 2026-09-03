# Triage de Soporte – Finkargo (Módulo 1)

Sistema de visualización en tiempo real de la cola de tickets de soporte de Finkargo,
diferenciando Nivel 1 y Nivel 2, con visibilidad para solicitantes y equipo interno.

- **Cobertura:** Colombia · México
- **Versión:** 1.0 – Prototipo → en desarrollo
- **Repositorio de referencia:** `luisagomez-r92/Triage-Soporte`

---

## 1. Problema que resuelve

- Los clientes no saben en qué estado está su caso ni cuánto tiempo llevan esperando respuesta.
- No existe una vista unificada de la cola de tickets por nivel para el equipo de soporte.
- La falta de visibilidad del escalado genera re-consultas innecesarias al equipo de Nivel 1.
- No hay indicador de tiempo transcurrido por estado ni alerta para tickets "Pendiente cliente"
  sin respuesta.

## 2. Flujo de atención

```
Nivel 0 (Nuevo) → Nivel 1 (Revisión) → Nivel 2 (Especialista) → Validación (regresa a N1) → Resuelto
                                                    ↕
                                          Pendiente cliente (retoma N1 al responder)
```

- Los tickets en **validación** regresan a Nivel 1 para confirmar que la solución aplicada
  por Nivel 2 resuelve el caso.
- Si no pasa la validación, se re-escala automáticamente a Nivel 2.

## 3. Estados del ticket

| Estado | Pestaña | Progreso | Descripción |
|---|---|---|---|
| En espera | Nivel 1 / N0 | 0% | Caso recibido, en cola sin tomar activamente. Puede o no tener responsable ya asignado en Jira. Sin historial ni botón de detalle. |
| En revisión N1 | Nivel 1 | 30% | Tomado por agente N1. En análisis inicial. |
| Pendiente cliente | Pendiente cliente | 35% | Se requiere info del cliente. Muestra tiempo sin respuesta. |
| Escalado a N2 | Nivel 2 | 40% | Derivado a especialista. En cola esperando ser tomado. |
| Pendiente Tech | Nivel 2 | 45% | Variante de "Escalado a N2": el ticket quedó esperando a que un agente de Tech lo tome, en una columna propia dentro de Nivel 2 – Especialistas (distinta de "Escalados" y "En curso"). Corresponde al status real de Jira "Pendiente" (columna PENDIENTE TECH). |
| En curso N2 | Nivel 2 | 60% | Desarrollador trabajando activamente en el caso. |
| En validación | Nivel 1 | 90% | N2 aplicó solución. N1 confirma cierre del caso. |

## 4. Estructura de navegación (4 pestañas)

| Pestaña | Contenido | Orden |
|---|---|---|
| Tablero general | Vista kanban: N0, Nivel 1, Nivel 2, Pendiente. Incluye buscador global. | Por columna según nivel |
| Nivel 1 – Revisión | Vista kanban con una columna por agente de N1. Cada columna lista TODOS los casos con esa persona como responsable (En espera ya asignados, En revisión N1, En validación) — el criterio es tener agente asignado, no el estado del ticket. Los "en espera" que aún NO tienen agente asignado no aparecen aquí — se ven solo en el Tablero general hasta que alguien los toma. | Dentro de cada columna: por hora de asignación al agente (el primero asignado aparece primero) |
| Nivel 2 – Especialistas | Vista de tres columnas, en este orden de izquierda a derecha: "Escalados" (en cola, esperando ser tomados), "En curso" (ya tomados por un desarrollador), "Pendiente Tech" (esperando que Tech lo tome, variante de escalado). | Columnas "Escalados" y "Pendiente Tech": por campo Rank de Jira. Columna "En curso": por hora de asignación al desarrollador |
| Pendiente cliente | Tickets pausados esperando respuesta, con tiempo transcurrido visible. | Por hora en que pasó a pendiente |

### Columnas del Tablero general

| Columna | Descripción |
|---|---|
| Nivel 0 – Nuevos | Recién creados, estado "En espera" (puede o no tener responsable ya asignado en Jira). FIFO estricto por hora de llegada. |
| Nivel 1 – Revisión | En atención por N1. Incluye casos en validación (borde verde izq.). |
| Nivel 2 – Especialistas | En curso (borde azul) y en cola, esta última ordenada por el campo Rank de Jira. Máx. 3 visibles, resto colapsado ("Ver más"). **Incluye el badge de posición por persona** (ver sección 5, "Badge de posición por persona") sobre el avatar del responsable — mismo cálculo y misma exclusión de tickets "Pendiente Tech" (que en el Tablero general no tienen columna propia, pero si un ticket corresponde a ese estado, tampoco lleva este badge). *(Esta es la columna única del Tablero general — no confundir con la vista de tres columnas "Escalados"/"En curso"/"Pendiente Tech" de la pestaña Nivel 2 – Especialistas, ver sección 5).* |
| Pendiente cliente | Con tiempo sin respuesta visible en la tarjeta, **incluyendo el color escalonado y la alerta crítica** definidos en la sección 5 ("Alerta de tiempo crítico en Pendiente cliente") — no solo un texto plano. |

## 5. Funcionalidades principales

**Buscador global** (presente en todas las pestañas)
- **Estilo visual:** el contador "Todos los casos [N]" y el campo de búsqueda forman un
  bloque visual unificado, con borde redondeado envolviendo ambos elementos y una línea
  divisoria vertical sutil entre el contador y el input de búsqueda (ver sección 5, imagen
  de referencia del prototipo) — no dos elementos sueltos sin relación visual entre sí.
- Contador estático "Todos los casos [N]" siempre visible junto al buscador (N = total de
  tickets activos en esa pestaña), independiente de si se está buscando algo o no. Aplica
  también al **Tablero general** — no es exclusivo de las pestañas de detalle.
- Busca por número de ticket (ST-XXXX) o nombre del solicitante.
- Tablero: resalta coincidencias, atenúa el resto; lista resultados con su columna de origen.
- Pestañas de detalle: filtra tickets visibles dentro de la pestaña activa. **(Actualiza y
  reemplaza la regla anterior de "navegar automáticamente" — ver "Mensajes de búsqueda según
  estado del ticket" más abajo, con el comportamiento correcto y ya decidido.)**
- Tickets colapsados se expanden automáticamente al buscar.
- Muestra conteo de resultados en tiempo real (este es un conteo aparte del "Todos los casos
  [N]" de arriba — aparece solo mientras se está escribiendo algo en el buscador).

**Navegación entre resultados de búsqueda (scroll automático + indicador flotante)**

> Resuelve que un resultado resaltado quede fuera de la vista visible (ej. al final de una
> columna larga) y el usuario no lo note. Aplica al Tablero general y a las pestañas de
> detalle (N1, N2, Pendiente).

- Al escribir una búsqueda con al menos 1 coincidencia, la vista hace **scroll automático**
  hasta la tarjeta del primer resultado (no depende de que el usuario se dé cuenta de que
  hay que desplazarse).
- Si hay **más de un resultado**, aparece un indicador flotante pequeño (ej. esquina
  inferior derecha del área de resultados) mostrando "[posición actual] de [total]" (ej.
  "2 de 3"), con dos flechas (▲/▼) para saltar entre resultados sin perder el resaltado ni
  tener que hacer scroll manual.
- Con un solo resultado, el indicador **no se muestra** — el scroll automático ya es
  suficiente.
- El indicador desaparece al borrar la búsqueda o cuando no hay coincidencias.

**Mensajes de búsqueda según estado del ticket (todas las pestañas, incluido Tablero general)**

> Cuando se busca un número de ticket específico y no aparece, la app no debe limitarse a
> un genérico "0 resultados" — debe distinguir tres situaciones reales:

1. **El ticket existe y está activo, pero en OTRA pestaña:** aplica a las pestañas de
   detalle (N1, N2, Pendiente) — la app ya tiene ese ticket cargado (viene en el mismo set
   de datos activos del polling, sección 9), solo no pertenece a la pestaña donde se está
   buscando. Mostrar un mensaje amigable, acorde al tono de la plataforma, que indique en
   qué pestaña sí está — ej. *"Este caso está abierto, pero en Nivel 2 – Especialistas"* —
   sin cambiar automáticamente de pestaña, solo informar. **No aplica al Tablero general**,
   ya que ahí todas las columnas (N0 a Pendiente) están visibles simultáneamente — si el
   ticket está activo, ya se resalta en su columna correspondiente sin necesidad de este
   mensaje.
2. **El ticket existe pero ya está cerrado** (status category "Done" — fuera del filtro
   JQL de tickets activos, ver sección 9): mostrar un mensaje distinto indicando que el
   caso ya no aparece en el tablero porque fue cerrado — ej. *"Este caso ya fue cerrado y
   no aparece en el tablero"*. **Aplica también al Tablero general** — si se busca un
   ticket cerrado ahí, debe mostrar el mismo tipo de mensaje en vez de simplemente no
   resaltar nada. Esto requiere una consulta aparte a Jira (por fuera del set de datos
   activos ya cargado) para confirmar que el ticket existe y su estado real — confirmar con
   Claude Code si es viable antes de implementar, similar a como se investigó el campo Rank
   o el mapeo de estados.
3. **El ticket no existe en absoluto** (ni activo ni cerrado, o el número no es válido):
   mantener el mensaje genérico actual de "Sin resultados"/"0 resultados" — aplica a todas
   las pestañas por igual, incluido el Tablero general.

**Vista de tres columnas en Nivel 2 – Especialistas**

- La pestaña "Nivel 2 – Especialistas" se organiza en **tres columnas**, no una lista con
  sección colapsable como antes. **Orden de izquierda a derecha: Escalados → En curso →
  Pendiente Tech.**
  - **Columna "Escalados":** tickets en cola, esperando ser **tomados** (iniciados) por el
    desarrollador. Orden interno: por el campo **Rank de Jira** (ver sección 6 y 9 — no
    recalcular prioridad + hora manualmente, respetar el orden que llega del API).
  - **Columna "En curso":** tickets ya tomados, en trabajo activo. Borde azul izquierdo
    (regla de la sección 6). Orden interno: por hora en que el desarrollador tomó el ticket.
  - **Columna "Pendiente Tech":** variante de "Escalado a N2" — tickets esperando a que un
    agente de Tech los tome, correspondiente al status real de Jira "Pendiente" (columna
    PENDIENTE TECH). Mismo criterio de orden interno que "Escalados" (campo Rank de Jira).
- **Todo ticket escalado a N2 ya tiene un especialista asignado en Jira desde el momento del
  escalado**, incluso si aún está en la columna "Escalados" o "Pendiente Tech" sin tomar. La
  tarjeta debe mostrar avatar + nombre del responsable en **las tres** columnas — la
  diferencia con "En curso" es si el especialista ya inició el trabajo, no si tiene o no
  responsable asignado.
- Cada columna muestra un contador de tickets en su encabezado.
- **El badge de prioridad (Critical/High/Medium/Low) NO se muestra visualmente en la
  tarjeta** — se eliminó la categorización visible por decisión del equipo. El dato de
  prioridad sigue existiendo y siendo relevante para el orden (vía el campo Rank de Jira,
  sección 6 y 9), solo se removió del diseño de la tarjeta.
- **Badge de posición por persona (número junto al avatar del responsable):** el orden
  global de la lista (por Rank de Jira) no cambia, pero cada tarjeta debe mostrar además un
  pequeño número — superpuesto en la esquina del avatar del responsable, como una
  notificación — indicando en qué posición está ese ticket dentro de la cola de **esa
  persona específica**, no la posición global de la lista.
  - **Cálculo:** para cada responsable, se cuenta primero su ticket en **"En curso"** (si
    tiene uno ahí, ese es su posición 1), y luego se continúa la numeración con sus tickets
    en **"Escalados"**, en el mismo orden interno de esa columna (Rank de Jira) — ej. si
    Liceth tiene 1 ticket en curso y 2 en escalados, sus tickets muestran 1 (en curso), 2 y
    3 (en escalados, en orden de Rank). Si no tiene ticket en curso, su primer ticket en
    escalados ya es el 1.
  - **"Pendiente Tech" queda fuera de este conteo** — los tickets en esa columna no llevan
    este badge de posición (aunque sí mantienen avatar + nombre del responsable como ya
    está definido).
  - El conteo es independiente por persona — dos personas distintas pueden tener ambas un
    ticket marcado "1" al mismo tiempo, cada una en su propia cola.
  - **Alcance:** este badge aplica tanto en la pestaña "Nivel 2 – Especialistas" (columnas
    Escalados y En curso) como en la **columna Nivel 2 del Tablero general** (sección 4) —
    mismo cálculo en ambos lugares, ya que ambos reflejan los mismos tickets de Nivel 2.
- El colapso de colas largas (sección 5, "Ver N más") aplica dentro de cada columna por
  separado si supera 3 tickets — no se comparte el límite entre columnas.
- El buscador global y el panel de detalle desplegable (botón "Ver detalle") aplican igual
  en las tres columnas, reutilizando el diseño de "Tarjeta de ticket en pestañas de lista"
  descrito abajo.
- Un ticket pasa de la columna "Escalados" a "En curso" en el momento en que un desarrollador
  lo toma — este movimiento debe reflejarse en tiempo real (WebSocket/polling), igual que el
  resto del tablero.

**Vista kanban por agente en Nivel 1 – Revisión**

- La pestaña "Nivel 1 – Revisión" se organiza como un tablero kanban: **una columna por
  cada agente de N1**, listando **todo ticket que tenga a esa persona como responsable**,
  sin importar su estado exacto (no una lista única como en las demás pestañas de detalle).
- Cada columna muestra el nombre del agente como encabezado, con un contador de casos
  asignados a esa persona.
- Dentro de cada columna, los casos siguen el diseño de "Tarjeta de ticket en pestañas de
  lista" descrito arriba (metadatos, título=asunto, barra de progreso, chip discreto, botón
  Ver detalle, etc.) y se ordenan por hora de asignación (el primero asignado aparece primero
  dentro de esa columna).
- Los casos "En espera" que **ya tienen agente asignado** en Jira (aunque aún no los hayan
  tomado activamente) sí aparecen en la columna de ese agente. La ausencia de botón "Ver
  detalle" e historial en esos casos sigue dependiendo del estado (sección 6), no de si
  aparecen o no en esta vista.
- Los casos "en validación" (regresados de N2) aparecen **dentro de la columna del agente**
  que los tomó originalmente, conservando el borde verde izquierdo distintivo (regla de la
  sección 6) — no se agrupan aparte.
- Los tickets "En espera" que **todavía NO tienen agente asignado** son los únicos que no
  aparecen en esta vista — siguen siendo visibles únicamente en el Tablero general (columna
  Nivel 0 – Nuevos) hasta que alguien los toma; en ese momento pasan a la columna de esa
  persona en esta vista.
- El buscador global y el colapso de colas largas (sección 5) aplican también dentro de cada
  columna de agente, igual que en las demás pestañas.

**Alerta de tiempo crítico en Pendiente cliente**

> Basado en el proceso real del equipo: Jira envía un recordatorio automático al cliente
> cada 2 horas sin respuesta, y a las 24 horas sin respuesta el caso se cierra
> automáticamente. La app debe reflejar visualmente qué tan cerca está un ticket de ese
> cierre, no solo mostrar el tiempo transcurrido de forma neutra.

- **Ventana total de referencia: 24 horas** desde que el ticket pasó a "Pendiente cliente"
  (mismo momento que ya se usa para calcular "Sin respuesta: Xh").
- **Color escalonado según cercanía al cierre automático** (aplica al texto del tiempo sin
  respuesta, tanto en la tarjeta de lista como en el panel de detalle):

  | Rango de tiempo sin respuesta | Color | Estilo adicional |
  |---|---|---|
  | 0h – 8h | Naranja `#C2410C` (el mismo de hoy) | Ninguno |
  | 8h – 16h | Naranja `#C2410C` | Texto en negrita |
  | 16h – 22h | Rojo alerta `#DC2626` | Ícono de advertencia ⚠️ junto al tiempo |
  | 22h – 24h | Rojo alerta `#DC2626` | Ícono ⚠️ + texto en negrita + mensaje "Se cierra
  pronto" visible junto al tiempo |

- **Cuenta regresiva hacia el cierre:** además del tiempo transcurrido ("Sin respuesta:
  1d 2h"), mostrar cuánto falta para el cierre automático a las 24h (ej. "Se cierra en 6h
  si no hay respuesta"). Ambos datos se calculan del mismo timestamp — no requiere ninguna
  llamada adicional a Jira.
- Si el ticket ya superó las 24h (el cierre automático de Jira aún no se reflejó, por
  ejemplo por demora del ciclo de polling), mostrar el estado como vencido en vez de un
  número negativo (ej. "Tiempo de respuesta vencido" en vez de "Se cierra en -2h").
- Esta alerta es puramente visual — no dispara ninguna acción automática desde la app (el
  cierre real del caso lo sigue haciendo Jira, no esta herramienta).

**Tarjeta de ticket en pestañas de lista (Nivel 1, Nivel 2, Pendiente cliente)**

> Aplica al diseño de la tarjeta tal como aparece en la lista (antes de expandir el panel de
> detalle). No confundir con el Modal de detalle ni el Panel de detalle desplegable descritos
> abajo, que muestran información adicional al hacer clic.

- **Encabezado (metadatos):** en texto gris pequeño, sobre el título: número de ticket + hora
  de creación + hora en que fue tomado por el agente. Formato: `ST-1042 · 09:15 · tomado 09:18`.
- **Título de la tarjeta (asunto):** el asunto/descripción breve del caso (ej. "Error al
  cargar documentos de importación"), en negrita, **tamaño de fuente moderado (más pequeño
  que el título actual, sin dejar de destacarse del resto de la tarjeta)** — **no** el
  número de ticket y **no** el email/nombre del solicitante. Viene del campo estándar
  **`summary`** de Jira (el campo nativo de "resumen"/asunto del issue, no un custom field).
  **Formato de texto (capitalización uniforme):** Jira suele traer este campo en MAYÚSCULAS
  o con capitalización inconsistente — la app debe normalizarlo a "tipo oración" (solo la
  primera letra en mayúscula, el resto en minúsculas), sin importar cómo venga escrito en
  Jira. Ej. "TERDIS CON MONTO INCORRECTO" → "Terdis con monto incorrecto".
- **Solicitante:** nombre del solicitante y empresa si aplica (ej. "Laura Gómez -
  Importex S.A."), debajo del título, con **tamaño de fuente más pequeño** que el título —
  nunca como reemplazo del título. El dato de empresa viene del campo **"Company"** de Jira
  (`customfield_10076`) — confirmado, no usar ninguno de los otros campos candidatos
  (Organizations, Nombre del cliente, Nit Empresa, etc.).
- **Barra de progreso:** visible directamente en la tarjeta de la lista (no solo en el
  detalle), con el porcentaje según la tabla de estados de la sección 3, alineado a la
  derecha de la barra. **Debe aparecer una sola vez por tarjeta/panel — nunca duplicada.**
- **Chip de estado:** versión discreta — pequeño, con punto/ícono indicador, no un chip
  grande de color de fondo.
- **Responsable:** avatar + nombre, alineado a la izquierda en la parte inferior de la
  tarjeta.
- **Botón "Ver detalle":** estilo píldora con borde, alineado a la derecha en la parte
  inferior. Ausente en tickets "En espera" (ver sección 6).
- **Agrupación:** los tickets se agrupan bajo encabezados de sección en gris y mayúsculas
  (ej. "REVISIÓN INICIAL - ORDEN DE ASIGNACIÓN"), con un contador de tickets por grupo a la
  derecha del encabezado — no solo un contador total para toda la pestaña.
- **Buscador visible:** cada pestaña de lista muestra la barra de búsqueda y el contador
  "Todos los casos [N]" arriba de los grupos, igual que en el Tablero general.
- **Diferenciación visual entre tarjetas — colores (CONFIRMADO, invierte una versión
  anterior):** el fondo general de la página/columnas debe ser **blanco** (`#FFFFFF`), y
  cada **tarjeta individual** debe tener fondo **gris claro** (reutilizar el token `Fondo`
  `#F8F9FC` de la sección 7, ahora aplicado a la tarjeta, no al fondo general de la app) más
  un borde visible (no solo una línea casi imperceptible). Esto es lo opuesto de una versión
  previa donde el fondo general era gris y la tarjeta blanca — quedó así porque hacía que
  las tarjetas no se distinguieran lo suficiente del fondo de su columna.
- **Manejo de texto largo:** ningún campo de texto (asunto, nombre de solicitante, empresa,
  nombre de responsable) debe desbordar el ancho de la tarjeta ni romper el layout. Usar
  salto de línea (wrap) cuando el texto quepa en 2 líneas, o truncar con "…" (ellipsis) si
  aun así no cabe — nunca dejar que el texto se salga del contorno de la tarjeta.

**Modal de detalle** (click en tarjeta del Tablero general)
- Barra de progreso **con el porcentaje numérico visible** (ej. "60%"), tarjetas de tiempo
  global y estado, responsable asignado (avatar + badge de nivel), historial completo con
  línea de tiempo vertical.

**Panel de detalle desplegable** (botón "Ver detalle" en pestañas N1, N2, Pendiente)
- Barra de progreso **con el porcentaje numérico visible** (misma regla que en el Modal —
  nunca mostrar la barra sin el número al lado).
- Dos tarjetas de tiempo (global y estado actual), tarjeta de responsable con badge de nivel,
  historial con línea de tiempo.
- Alertas contextuales para tickets en validación y en apoyo por desborde.
- Nota: la barra de progreso de este panel es adicional a la que ya se ve en la tarjeta de la
  lista (ver "Tarjeta de ticket en pestañas de lista" arriba); no es la única ubicación donde
  aparece.

**Colapso de colas largas**
- Columnas/secciones con más de 3 tickets muestran los primeros y colapsan el resto bajo
  "Ver N más". Se expanden automáticamente al buscar.

## 6. Reglas de negocio

- Tickets "En espera": sin historial, sin botón "Ver detalle". **Sí pueden tener responsable
  asignado** en Jira aunque el ticket siga sin moverse de columna (ej. Jira ya le asignó
  alguien pero aún no lo tomó activamente) — en ese caso, la tarjeta debe mostrar avatar +
  nombre del responsable con normalidad. La ausencia de historial/detalle depende del
  **estado** del ticket, no de si tiene o no responsable asignado.
- Orden Nivel 0: estrictamente FIFO por hora de creación.
- Orden Nivel 1: por hora de asignación al agente N1.
- Orden Nivel 2 en curso: por hora en que fue tomado por el desarrollador.
- **Orden Nivel 2 en cola — debe reflejar el campo "Rank" de Jira, no recalcularse en la app:**
  - El criterio base sigue siendo prioridad (`Critical → High → Medium → Low`) y, dentro de
    una misma prioridad, hora de escalado (más antiguo primero).
  - **El equipo puede alterar manualmente ese orden en el tablero de Jira** (arrastrando una
    tarjeta al inicio de su fila cuando un ticket es más urgente que los demás, aunque no
    haya cambiado su campo de prioridad). Ese ajuste manual queda guardado por Jira en un
    campo interno llamado **Rank** (sistema LexoRank), no solo como un efecto visual.
  - **La aplicación NO debe recalcular el orden combinando prioridad + hora por su cuenta.**
    En su lugar, debe **leer y respetar el Rank de Jira tal cual viene en la respuesta de la
    API**, para que cualquier reordenamiento manual hecho en Jira se refleje automáticamente
    en la web en el siguiente ciclo de actualización (WebSocket o polling).
  - Requisito técnico: el filtro que alimenta el tablero de Jira debe tener la cláusula
    `ORDER BY Rank ASC` habilitada (ya lo está, porque el drag & drop manual funciona hoy);
    de lo contrario el campo Rank no se actualiza al arrastrar tarjetas.
  - Ver sección 9 (Notas técnicas) para el detalle de cómo consultar este campo vía Jira API v3.
- Orden Pendiente cliente: por hora en que pasó a ese estado.
- Validación post-N2 es obligatoria antes de cerrar el ticket.
- Borde verde en tarjeta = regresado de N2 para validación en N1.
- Borde azul en tarjeta = en curso activo por desarrollador de N2.
- **Prioridades N2 — mapeo de 5 niveles de Jira a 4 niveles en la app** (solo visible en
  tickets de Nivel 2; campo "Priority" de Jira):

  | Prioridad real en Jira | Se muestra como |
  |---|---|
  | Highest | Critical |
  | High | High |
  | Medium | Medium |
  | Low | Low |
  | Lowest | Low |

  Highest colapsa a Critical y Lowest colapsa a Low; High y Medium se mapean 1 a 1.
- Tiempo sin respuesta visible en tarjetas y detalle de "Pendiente cliente".

## 7. Diseño visual (tokens de marca Finkargo)

| Token | Hex | Uso |
|---|---|---|
| Navy | `#1A1D4E` | Texto principal, bordes activos, botones primarios |
| Sidebar | `#2D3172` | Fondo del sidebar de navegación lateral |
| Accent | `#3B5BDB` | Borde tickets N2 en curso, badges de nivel, links |
| Lavanda | `#E8EAF5` | Fondo de la pestaña activa |
| Verde | `#22c55e` | Borde tickets en validación, paso completado en historial |
| Naranja | `#C2410C` | Estado "Pendiente cliente", tiempo sin respuesta (0-16h) |
| Rojo alerta | `#DC2626` | Tiempo sin respuesta en zona crítica (16-24h), ver sección 5 |
| Fondo tarjeta | `#F8F9FC` | Fondo de cada tarjeta de ticket |
| Fondo general | `#FFFFFF` | Fondo general de la app (página, columnas) |

- **Sidebar:** fondo `#2D3172`; ícono/texto en blanco inactivo; ítem activo con fondo blanco
  y texto/ícono navy `#1A1D4E`.
- **Pestañas:** inactiva = texto gris plano sin fondo/borde; activa = fondo lavanda `#E8EAF5`,
  borde inferior navy `#1A1D4E` de 2.5px, esquinas superiores redondeadas (6px).

### Layout general — encabezado de marca, sidebar y título de página

- **Encabezado superior izquierdo:** logo "finkargo®" (texto o logo de marca), visible en
  todas las pantallas de la app, no solo en una vista.
- **Sidebar de navegación lateral:** columna fija a la izquierda, fondo `#2D3172`, **ancho
  compacto**. Pensado como espacio para futuros módulos/apps adicionales de Finkargo en la
  misma barra.
- **Dos ítems de menú en el sidebar, en este orden de arriba hacia abajo (CONFIRMADO):**
  1. **"Triage de Soporte"** (primero) — nueva vista de **resumen ejecutivo** (dashboard),
     ver sección dedicada más abajo ("Dashboard resumen — 'Triage de Soporte'"). Es la vista
     que se muestra al entrar a este ítem del sidebar.
  2. **"Tablero"** (segundo, debajo) — aquí vive TODO lo construido hasta ahora: las 4
     pestañas (Tablero general, Nivel 1 – Revisión, Nivel 2 – Especialistas, Pendiente
     cliente) descritas en la sección 4 y 5, sin ningún cambio de funcionalidad — solo se
     mudan de estar "sueltas" a vivir bajo este ítem del sidebar.
- **Título de página:** cada vista (Tablero, Triage de Soporte) muestra su propio título
  (h1) en el área de contenido, por encima de su navegación interna (pestañas para
  "Tablero"; sin pestañas internas para "Triage de Soporte").
- **Pestañas a todo el ancho (dentro de "Tablero"):** las 4 pestañas deben distribuirse
  ocupando todo el ancho disponible del área de contenido.

## Dashboard resumen — "Triage de Soporte" (nueva vista)

> Vista de resumen ejecutivo: qué está pasando ahora mismo en el equipo de soporte, sin
> necesidad de navegar por las 4 pestañas del "Tablero". Es una vista de **solo lectura**,
> no reemplaza ninguna funcionalidad del Tablero — es un complemento a alto nivel.

### Estilo visual — CORRECCIÓN de alcance (el tema oscuro es solo de los 2 paneles superiores)

> Corrige una versión anterior de esta sección, que decía incorrectamente que TODA la vista
> era de tema oscuro. El fondo general de la página y las listas "Próximos" son **claros**
> (blanco), igual que el resto de la app — el tema oscuro aplica únicamente a los 2 paneles
> superiores ("Nivel 1 · En Gestión" y "Nivel 2 · En Curso"), tratados como dos widgets
> oscuros flotando sobre un fondo blanco, no como un tema de página completo.

- **Fondo general de la página:** blanco `#FFFFFF` (igual que el resto de la app).
- **Los 2 paneles superiores** ("Nivel 1 · En Gestión", "Nivel 2 · En Curso") tienen fondo
  azul marino oscuro (aprox. `#1E2150` – `#242868`), texto blanco, metadatos en gris
  claro/azulado tenue, y badges de prioridad con sus colores distintivos (rojo/rosado
  "Highest", ámbar "High") — esto sí se mantiene como estaba.
- **Las listas "Próximos · Nivel 1" y "Próximos · Nivel 2"** son de **tema claro** (fondo
  blanco, texto negro/gris) — ver diseño detallado en "Estructura de la vista" más abajo.

### Estructura de la vista

**Dos paneles lado a lado en la parte superior:**

1. **"Nivel 1 · En Gestión"** — una fila por cada agente de N1 que tiene **actualmente un
   ticket activo** en estado "En revisión N1" (es decir, el ticket que está trabajando en
   este momento, no su cola completa). **Sin lista de agentes "disponibles"/inactivos** —
   solo se muestran agentes con ticket activo ahora mismo; si nadie tiene uno, el panel
   puede quedar vacío o mostrar un mensaje breve tipo "Nadie en gestión en este momento".
   - **Orden de la tarjeta (CORRECCIÓN — cambia el layout anterior):** de arriba hacia
     abajo: (1) número de ticket, (2) asunto (título) del ticket, (3) avatar + nombre del
     agente. **Se elimina por completo la línea de metadatos de tiempo** ("Xh Ym en este
     estado · Xh Ym desde que llegó") — ya no se muestra en esta tarjeta. El avatar +
     nombre del agente pasa a ocupar el espacio donde antes estaba esa línea de tiempo
     (parte inferior de la tarjeta), en vez de estar arriba del todo como antes.
   - **Tamaño compacto (CORRECCIÓN — el desarrollo quedó con fuentes demasiado grandes):**
     el número de ticket y el asunto deben verse notablemente más pequeños que como se
     implementó — referencia aproximada: número de ticket ~18-20px (no ~32px como quedó),
     asunto ~14-15px regular (no ~20px), avatar+nombre en tamaño pequeño (~12-13px). El
     objetivo es que cada tarjeta ocupe bastante menos alto del que ocupa hoy, permitiendo
     ver más tickets sin scroll.
   - **Fondo de cada tarjeta ligeramente distinto al fondo del panel** (CORRECCIÓN — hoy
     se ven del mismo color, solo separadas por una línea): cada tarjeta de ticket dentro
     del panel debe tener un tono de azul marino sutilmente más claro que el fondo general
     del panel, para que se distinga como una tarjeta propia, no solo una fila separada por
     una línea divisoria.
   - **Sin contador tipo "2/2"** junto al título del panel — se decidió no incluirlo.
   - **Sin pie de panel con conteos** (ej. "X en pendiente cliente") — se decidió no
     incluirlo, se eliminó de esta vista.
2. **"Nivel 2 · En Curso"** — mismo patrón que el panel de Nivel 1 (incluido el nuevo
   orden: ticket → asunto → avatar/nombre, sin línea de tiempo), pero para agentes de N2
   con ticket activo en estado "En curso N2". Cada fila incluye además el **badge de
   prioridad** (Highest/High/Medium/Low — aquí SÍ se muestra, a diferencia de las tarjetas
   del Tablero donde se ocultó por decisión previa; esta vista de resumen es un contexto
   distinto, también con tamaño de fuente compacto para el badge). **Supuesto a confirmar:**
   como se eliminó la línea de tiempo donde antes vivía este badge, se ubica ahora junto a
   la fila de avatar/nombre del agente (parte inferior de la tarjeta) — avisar si se
   prefiere otra posición. **Mismas correcciones de tamaño compacto y fondo de tarjeta
   diferenciado** que el panel de Nivel 1, arriba. **Sin lista de "disponibles"**, igual
   que el panel de N1. **Sin contador tipo "2/3"**. **Sin pie de panel con conteos** (ej.
   "X devuelto a Nivel 1") — se decidió no incluirlo, se eliminó de esta vista.

**Dos listas "Próximos" debajo, lado a lado — TEMA CLARO (fondo blanco, no oscuro):**

> Diseño de fila (aplica a ambas listas): número de posición dentro de un **círculo navy
> con número blanco** (mismo estilo de badge ya usado en otras partes de la app), luego el
> **número de ticket + asunto en negro/negrita** en la misma línea (ej. "ST-11985 · No
> refleja el abono realizado en la operación"), y alineado a la derecha: nombre del
> solicitante (Nivel 1) o badge de prioridad (Nivel 2), en gris/tenue según corresponda.
> **Sin línea de tiempo (CORRECCIÓN — se elimina en ambas listas):** ya no se muestra
> "Xh Ym desde que llegó" ni "Xh Ym en ese estado" debajo del nombre del solicitante o del
> badge de prioridad — el dato de la derecha queda solo, sin una segunda línea debajo.

3. **"Próximos · Nivel 1"** — los tickets de Nivel 0 (estado "En espera"), en el mismo
   orden FIFO ya definido (sección 6). Numeración secuencial simple (1, 2, 3...) según ese
   orden — no es el badge de posición por persona (eso es exclusivo de Nivel 2, sección 5).
4. **"Próximos · Nivel 2"** — los tickets en estado "Escalado a N2" (columna "Escalados"),
   en el mismo orden por Rank de Jira ya definido (sección 6 y 9). Numeración secuencial
   simple (1, 2, 3...) según ese orden — igual que arriba, no es el badge de posición por
   persona. En vez del nombre del solicitante a la derecha, muestra el **badge de
   prioridad** (Highest/High/Medium/Low).

### Actualización en tiempo real

- Esta vista se actualiza con el mismo mecanismo de polling ya construido (sección 9) —
  reutiliza los mismos datos que alimentan el "Tablero", no requiere una fuente de datos
  aparte. El indicador "Actualizado justo ahora · HH:MM" ya existe (`LastUpdatedIndicator`)
  y se reutiliza aquí también.

## 8. Fuera del alcance – Módulo 1

- Dashboard de reportería para liderazgo y tecnología (Módulo 2).
- Envío automático de reportes quincenales por Slack.
- Autenticación y gestión de roles de usuario por perfil.
- Análisis de causa raíz de tickets recurrentes.
- Relación de tickets con despliegues de código o versiones de plataforma.

## 9. Notas técnicas

> **Integración con Jira API v3 es obligatoria desde el Módulo 1**, no es opcional.

| Componente | Tecnología propuesta |
|---|---|
| Frontend | React + TypeScript + Tailwind CSS |
| Backend / API | Jira API v3 (datos en tiempo real) |
| Actualización en tiempo real | WebSockets o polling cada 30–60 s |
| Avatares de agentes | Slack API (no Jira) |
| Prioridades Nivel 2 | Ver mapeo de 5→4 niveles en sección 6 (campo "Priority" de Jira) |
| Orden manual cola N2 | Campo interno **"Rank"** de Jira (LexoRank) — leer, no recalcular |
| Prefijo de ticket | `ST-` (proyecto "Soporte Tech"), no `FK-` — usar la key real de Jira tal cual |
| Repositorio | `luisagomez-r92/Triage-Soporte` |

### Campo "Rank" de Jira — CONFIRMADO

- Custom field: **`customfield_10019`**, nombre interno "Rank" (se muestra como
  "Clasificación" en la UI de Jira), tipo `com.pyxis.greenhopper.jira:gh-lexo-rank`.
- Confirmado: solo viene poblado a través del endpoint de la **API Agile**
  (`/rest/agile/1.0/board/{boardId}/issue`) — el API core v3 **no** lo trae.
- Jira guarda el orden visual de las tarjetas del tablero (incluido el drag & drop manual)
  en este campo, independiente del campo "Priority".
- La app debe consumir ese orden directamente en cada actualización (polling/WebSocket) y
  usarlo para renderizar las colas de Nivel 2 — **sin reordenar por su cuenta** combinando
  prioridad y hora, ya que Rank ya incorpora cualquier ajuste manual del equipo.

### Mapeo de estados Jira → REQUIREMENTS.md — CONFIRMADO

| Columna del tablero Jira | Status real (`fields.status.name`) | Estado en la app |
|---|---|---|
| SIN REVISIÓN | Esperando por ayuda | En espera |
| GESTIÓN LVL 1 | Gestión Nivel 1 | En revisión N1 |
| ESCALADO LVL 2 | Escalado Nivel 2 | Escalado a N2 |
| PENDIENTE TECH | Pendiente | Pendiente Tech (columna propia en Nivel 2, ver sección 5) |
| GESTIÓN LVL 2 | Gestion Nivel 2 (sin tilde, tal cual en Jira) | En curso N2 |
| ESPERANDO RESPUESTA CLIENTE | Esperando respuesta de cliente | Pendiente cliente |
| EN Validación | Proceso de Validación | En validación |
| — | Resuelto, Listo, CERRADA, Cancelado (`statusCategory: done`) | Fuera de la cola — no se muestra |

### Filtrado de tickets activos

- El tablero de Jira tiene ~11,886 issues totales (casi todos históricos/cerrados); solo
  ~27 están activos hoy. Traer todo el tablero sin filtro es ineficiente.
- Usar el parámetro `jql` del mismo endpoint Agile (ej. `statusCategory != Done`) para
  filtrar — confirmado que esto **no** rompe el orden por Rank, ya que no lleva un
  `ORDER BY` propio que lo sobrescriba.

### Nombre del solicitante — nota conocida, no bloqueante

- Algunas cuentas de Jira no tienen "nombre para mostrar" configurado, así que el campo
  `solicitante` puede venir como email (ej. `nando.gonzalez@finkargo.com`) en vez de nombre
  completo. No es un error del mapeo — la app debe mostrar el dato tal cual viene, sin
  intentar adivinar o formatear un nombre a partir del email.

### Responsable y nivel (N1/N2) — CONFIRMADO

- El responsable de cada ticket se toma del campo **"persona asignada"** (assignee) de
  Jira — no se mantiene una lista/roster estático separado.
- El **nivel del badge (N1/N2)** que acompaña al responsable se deriva del **estado actual
  del ticket**, no de la identidad de la persona (Jira no distingue si un usuario es agente
  N1 o N2 como atributo propio):
  - Estados que mapean a N1 (badge N1): "En espera", "En revisión N1", "En validación".
  - Estados que mapean a N2 (badge N2): "Escalado a N2", "Pendiente Tech", "En curso N2".
  - **"Pendiente cliente" es ambiguo** — el ticket pudo pausarse estando en N1 o en N2, y
    hoy no hay forma de saberlo sin el historial de cambios (que está diferido, ver abajo).
    Mientras el historial no esté implementado, la tarjeta de "Pendiente cliente" muestra
    avatar + nombre del responsable **sin badge de nivel** — no forzar una inferencia
    incorrecta. Una vez esté disponible el historial (changelog), se puede resolver
    tomando el último nivel conocido antes de pasar a "Pendiente cliente".

### Historial del ticket — implementación

- El endpoint de listado de issues del tablero (Agile API) **no** incluye el changelog
  (historial de cambios de estado). Obtenerlo requiere una llamada aparte por ticket:
  `GET /rest/api/3/issue/{id}?expand=changelog`.
- **Estrategia: carga bajo demanda (lazy), no parte del polling general.** Pedir el
  historial de los ~27 tickets activos en cada ciclo de polling (cada 30s) sería una
  sobrecarga innecesaria a la API de Jira. En su lugar:
  - El historial se solicita **solo cuando el usuario abre** el Modal de detalle o el
    Panel de detalle desplegable de un ticket específico (endpoint propio, ej.
    `GET /api/jira/tickets/:id/history` en el backend, que a su vez llama al endpoint de
    Jira de arriba).
  - Mientras se carga, mostrar un estado de "Cargando historial…" dentro del modal/panel
    (no bloquear el resto de la información que ya se muestra).
  - Si la llamada falla, mostrar "Historial no disponible" (mismo mensaje que se usaba
    como placeholder) en vez de romper el modal/panel.
  - Una vez cargado, mostrarlo en la línea de tiempo vertical ya construida en el
    Modal/Panel (diseño ya implementado, solo faltan los datos reales).
- Este historial no se guarda en el store principal de tickets (el que alimenta las 4
  pestañas) — vive únicamente en el estado local del componente Modal/Panel mientras está
  abierto, para no complicar el polling general.

## 10. Próximos pasos

**Prioridad principal:** implementar la integración real con Jira API v3 para reemplazar
los datos estáticos del prototipo por datos en tiempo real.

- Validar el prototipo con el equipo de soporte (N1 y N2) para ajustes de UX antes del desarrollo.
- Conectar con Jira API v3 y reemplazar todos los datos estáticos del prototipo.
- Implementar WebSockets o polling para actualización automática en tiempo real.
- ~~Definir criterios de alerta visual para tickets "Pendiente cliente" con tiempo de espera
  crítico.~~ Definido — ver sección 5, "Alerta de tiempo crítico en Pendiente cliente".
- Iniciar diseño del Módulo 2: dashboard de reportería para liderazgo.

---

*Fuente: sesión de diseño iterativo Finkargo · Triage de Soporte Módulo 1.*
*Este documento es la fuente de verdad funcional para el desarrollo con Claude Code.*
