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
| Nivel 2 – Especialistas | En curso (borde azul) y en cola, esta última ordenada por el campo Rank de Jira. Máx. 3 visibles, resto colapsado ("Ver más"). **Badge de prioridad (Critical/High/Medium/Low) visible en cada tarjeta**, igual que en la pestaña dedicada de Nivel 2 (sección 5). *(Esta es la columna única del Tablero general — no confundir con la vista de tres columnas "Escalados"/"En curso"/"Pendiente Tech" de la pestaña Nivel 2 – Especialistas, ver sección 5).* |
| Pendiente cliente | Con tiempo sin respuesta visible en la tarjeta, **incluyendo el color escalonado y la alerta crítica** definidos en la sección 5 ("Alerta de tiempo crítico en Pendiente cliente") — no solo un texto plano. |

## 5. Funcionalidades principales

**Buscador global** (presente en todas las pestañas)
- Contador estático "Todos los casos [N]" siempre visible junto al buscador (N = total de
  tickets activos en esa pestaña), independiente de si se está buscando algo o no. Aplica
  también al **Tablero general** — no es exclusivo de las pestañas de detalle.
- Busca por número de ticket (ST-XXXX) o nombre del solicitante.
- Tablero: resalta coincidencias, atenúa el resto; lista resultados con su columna de origen.
- Pestañas de detalle: filtra tickets visibles; si la pestaña activa no tiene resultados,
  navega automáticamente a la correcta con banner informativo.
- Tickets colapsados se expanden automáticamente al buscar.
- Muestra conteo de resultados en tiempo real (este es un conteo aparte del "Todos los casos
  [N]" de arriba — aparece solo mientras se está escribiendo algo en el buscador).

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
- El badge de prioridad (Critical/High/Medium/Low) es visible en las tres columnas, ya que
  aplica a todo ticket de Nivel 2 (sección 6).
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
- **Título de la tarjeta:** el asunto/descripción breve del caso (ej. "Error al cargar
  documentos de importación"), en negrita — **no** el número de ticket.
- **Solicitante:** nombre del solicitante y empresa si aplica (ej. "Laura Gómez -
  Importex S.A."), debajo del título. El dato de empresa viene del campo **"Company"**
  de Jira (`customfield_10076`) — confirmado, no usar ninguno de los otros campos
  candidatos (Organizations, Nombre del cliente, Nit Empresa, etc.).
- **Barra de progreso:** visible directamente en la tarjeta de la lista (no solo en el
  detalle), con el porcentaje según la tabla de estados de la sección 3, alineado a la
  derecha de la barra.
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
| Fondo | `#F8F9FC` | Fondo general de la aplicación |

- **Sidebar:** fondo `#2D3172`; ícono/texto en blanco inactivo; ítem activo con fondo blanco
  y texto/ícono navy `#1A1D4E`.
- **Pestañas:** inactiva = texto gris plano sin fondo/borde; activa = fondo lavanda `#E8EAF5`,
  borde inferior navy `#1A1D4E` de 2.5px, esquinas superiores redondeadas (6px).

### Layout general — encabezado de marca y sidebar (pendiente de construir)

> Estos elementos están definidos en color/estilo desde el prototipo original, pero aún no
> se han construido como componentes — hoy la app solo muestra el contenido de las pestañas
> sin este marco alrededor.

- **Encabezado superior izquierdo:** logo "finkargo®" (texto o logo de marca), visible en
  todas las pantallas de la app, no solo en una pestaña.
- **Sidebar de navegación lateral:** columna fija a la izquierda, fondo `#2D3172`, con al
  menos un ítem "Triage de Soporte" (el módulo actual) con su ícono, siguiendo el estilo de
  la tabla de colores de esta sección. Pensado como espacio para futuros módulos/apps
  adicionales de Finkargo en la misma barra, aunque hoy solo tenga este ítem.
- Este encabezado + sidebar envuelve a las 4 pestañas existentes (Tablero general, Nivel 1,
  Nivel 2, Pendiente cliente) — no las reemplaza ni cambia su navegación interna.

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
