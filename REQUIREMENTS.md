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
| En espera | Nivel 1 / N0 | 0% | Caso recibido, sin asignar. Sin historial ni botón de detalle. |
| En revisión N1 | Nivel 1 | 30% | Tomado por agente N1. En análisis inicial. |
| Pendiente cliente | Pendiente cliente | 35% | Se requiere info del cliente. Muestra tiempo sin respuesta. |
| Escalado a N2 | Nivel 2 | 40% | Derivado a especialista. En cola esperando ser tomado. |
| En curso N2 | Nivel 2 | 60% | Desarrollador trabajando activamente en el caso. |
| En validación | Nivel 1 | 90% | N2 aplicó solución. N1 confirma cierre del caso. |

## 4. Estructura de navegación (4 pestañas)

| Pestaña | Contenido | Orden |
|---|---|---|
| Tablero general | Vista kanban: N0, Nivel 1, Nivel 2, Pendiente. Incluye buscador global. | Por columna según nivel |
| Nivel 1 – Revisión | Vista kanban con una columna por agente de N1. Cada columna lista los casos asignados a esa persona (en revisión y en validación). Los "en espera" (sin asignar) no aparecen aquí — se ven solo en el Tablero general hasta que un agente los toma. | Dentro de cada columna: por hora de asignación al agente (el primero asignado aparece primero) |
| Nivel 2 – Especialistas | Vista de dos columnas: "Escalados" (en cola, esperando ser tomados) y "En curso" (ya tomados por un desarrollador). | Columna "Escalados": por campo Rank de Jira. Columna "En curso": por hora de asignación al desarrollador |
| Pendiente cliente | Tickets pausados esperando respuesta, con tiempo transcurrido visible. | Por hora en que pasó a pendiente |

### Columnas del Tablero general

| Columna | Descripción |
|---|---|
| Nivel 0 – Nuevos | Recién creados, sin asignar. FIFO estricto por hora de llegada. |
| Nivel 1 – Revisión | En atención por N1. Incluye casos en validación (borde verde izq.). |
| Nivel 2 – Especialistas | En curso (borde azul) y en cola, esta última ordenada por el campo Rank de Jira. Máx. 3 visibles, resto colapsado ("Ver más"). *(Esta es la columna única del Tablero general — no confundir con la vista de dos columnas "Escalados"/"En curso" de la pestaña Nivel 2 – Especialistas, ver sección 5).* |
| Pendiente cliente | Con tiempo sin respuesta visible en la tarjeta. |

## 5. Funcionalidades principales

**Buscador global** (presente en todas las pestañas)
- Busca por número de ticket (FK-XXXX) o nombre del solicitante.
- Tablero: resalta coincidencias, atenúa el resto; lista resultados con su columna de origen.
- Pestañas de detalle: filtra tickets visibles; si la pestaña activa no tiene resultados,
  navega automáticamente a la correcta con banner informativo.
- Tickets colapsados se expanden automáticamente al buscar.
- Muestra conteo de resultados en tiempo real.

**Vista de dos columnas en Nivel 2 – Especialistas**

- La pestaña "Nivel 2 – Especialistas" se organiza en **dos columnas**, no una lista con
  sección colapsable como antes:
  - **Columna "Escalados":** tickets en cola, esperando ser **tomados** (iniciados) por el
    desarrollador. Orden: por el campo **Rank de Jira** (ver sección 6 y 9 — no recalcular
    prioridad + hora manualmente, respetar el orden que llega del API).
  - **Columna "En curso":** tickets ya tomados, en trabajo activo. Borde azul izquierdo
    (regla de la sección 6). Orden: por hora en que el desarrollador tomó el ticket.
- **Todo ticket escalado a N2 ya tiene un especialista asignado en Jira desde el momento del
  escalado**, incluso si aún está en la columna "Escalados" sin tomar. La tarjeta debe
  mostrar avatar + nombre del responsable en **ambas** columnas — la diferencia entre
  "Escalados" y "En curso" es si el especialista ya inició el trabajo, no si tiene o no
  responsable asignado.
- Cada columna muestra un contador de tickets en su encabezado.
- El badge de prioridad (Critical/High/Medium/Low) es visible en ambas columnas, ya que
  aplica a todo ticket de Nivel 2 (sección 6).
- El colapso de colas largas (sección 5, "Ver N más") aplica dentro de cada columna por
  separado si supera 3 tickets — no se comparte el límite entre ambas columnas.
- El buscador global y el panel de detalle desplegable (botón "Ver detalle") aplican igual
  en ambas columnas, reutilizando el diseño de "Tarjeta de ticket en pestañas de lista"
  descrito abajo.
- Un ticket pasa de la columna "Escalados" a "En curso" en el momento en que un desarrollador
  lo toma — este movimiento debe reflejarse en tiempo real (WebSocket/polling), igual que el
  resto del tablero.

**Vista kanban por agente en Nivel 1 – Revisión**

- La pestaña "Nivel 1 – Revisión" se organiza como un tablero kanban: **una columna por
  cada agente de N1** con casos asignados actualmente (no una lista única como en las demás
  pestañas de detalle).
- Cada columna muestra el nombre del agente como encabezado, con un contador de casos
  asignados a esa persona.
- Dentro de cada columna, los casos siguen el diseño de "Tarjeta de ticket en pestañas de
  lista" descrito arriba (metadatos, título=asunto, barra de progreso, chip discreto, botón
  Ver detalle, etc.) y se ordenan por hora de asignación (el primero asignado aparece primero
  dentro de esa columna).
- Los casos "en validación" (regresados de N2) aparecen **dentro de la columna del agente**
  que los tomó originalmente, conservando el borde verde izquierdo distintivo (regla de la
  sección 6) — no se agrupan aparte.
- Los tickets "En espera" (sin asignar) **no aparecen en esta vista**, ya que por definición
  no tienen agente asignado. Siguen siendo visibles únicamente en el Tablero general (columna
  Nivel 0 – Nuevos) hasta que un agente los toma; en ese momento pasan a la columna de esa
  persona en esta vista.
- El buscador global y el colapso de colas largas (sección 5) aplican también dentro de cada
  columna de agente, igual que en las demás pestañas.

**Tarjeta de ticket en pestañas de lista (Nivel 1, Nivel 2, Pendiente cliente)**

> Aplica al diseño de la tarjeta tal como aparece en la lista (antes de expandir el panel de
> detalle). No confundir con el Modal de detalle ni el Panel de detalle desplegable descritos
> abajo, que muestran información adicional al hacer clic.

- **Encabezado (metadatos):** en texto gris pequeño, sobre el título: número de ticket + hora
  de creación + hora en que fue tomado por el agente. Formato: `FK-1042 · 09:15 · tomado 09:18`.
- **Título de la tarjeta:** el asunto/descripción breve del caso (ej. "Error al cargar
  documentos de importación"), en negrita — **no** el número de ticket.
- **Solicitante:** nombre del solicitante y empresa si aplica (ej. "Laura Gómez -
  Importex S.A."), debajo del título.
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
- Barra de progreso, tarjetas de tiempo global y estado, responsable asignado (avatar + badge
  de nivel), historial completo con línea de tiempo vertical.

**Panel de detalle desplegable** (botón "Ver detalle" en pestañas N1, N2, Pendiente)
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

- Tickets "En espera": sin historial, sin botón "Ver detalle", sin agente asignado.
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
- Prioridades N2: Critical → High → Medium → Low (solo visible en tickets de Nivel 2;
  corresponde al campo "Priority" de Jira).
- Tiempo sin respuesta visible en tarjetas y detalle de "Pendiente cliente".

## 7. Diseño visual (tokens de marca Finkargo)

| Token | Hex | Uso |
|---|---|---|
| Navy | `#1A1D4E` | Texto principal, bordes activos, botones primarios |
| Sidebar | `#2D3172` | Fondo del sidebar de navegación lateral |
| Accent | `#3B5BDB` | Borde tickets N2 en curso, badges de nivel, links |
| Lavanda | `#E8EAF5` | Fondo de la pestaña activa |
| Verde | `#22c55e` | Borde tickets en validación, paso completado en historial |
| Naranja | `#C2410C` | Estado "Pendiente cliente", tiempo sin respuesta |
| Fondo | `#F8F9FC` | Fondo general de la aplicación |

- **Sidebar:** fondo `#2D3172`; ícono/texto en blanco inactivo; ítem activo con fondo blanco
  y texto/ícono navy `#1A1D4E`.
- **Pestañas:** inactiva = texto gris plano sin fondo/borde; activa = fondo lavanda `#E8EAF5`,
  borde inferior navy `#1A1D4E` de 2.5px, esquinas superiores redondeadas (6px).

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
| Prioridades Nivel 2 | Critical → High → Medium → Low (campo "Priority" de Jira) |
| Orden manual cola N2 | Campo interno **"Rank"** de Jira (LexoRank) — leer, no recalcular |
| Repositorio | `luisagomez-r92/Triage-Soporte` |

### Campo "Rank" de Jira — sincronización del orden manual en Nivel 2

- Jira guarda el orden visual de las tarjetas del tablero (incluido el drag & drop manual)
  en un campo interno llamado **Rank**, independiente del campo "Priority".
- Al consultar los issues de un tablero vía la API de Jira Software (`/rest/agile/1.0/...`),
  estos vienen **ordenados por Rank por defecto**, siempre que el filtro del tablero tenga
  `ORDER BY Rank ASC` (ya activo, dado que hoy el equipo reordena arrastrando tarjetas).
- La app debe consumir ese orden directamente en cada actualización (polling/WebSocket) y
  usarlo para renderizar la cola de Nivel 2 — **sin reordenar por su cuenta** combinando
  prioridad y hora, ya que Rank ya incorpora cualquier ajuste manual del equipo.
- Nota de investigación técnica pendiente para el desarrollo: confirmar el nombre exacto
  del custom field de Rank en la instancia de Finkargo (suele ser `customfield_10019` u
  otro ID similar, específico de cada instancia de Jira) y validar si se requiere el
  endpoint de la API Agile (`/rest/agile/1.0/board/{boardId}/issue`) en vez de la API
  core v3 para obtenerlo, ya que el Rank es una función de Jira Software (Agile), no del
  API core de issues.

## 10. Próximos pasos

**Prioridad principal:** implementar la integración real con Jira API v3 para reemplazar
los datos estáticos del prototipo por datos en tiempo real.

- Validar el prototipo con el equipo de soporte (N1 y N2) para ajustes de UX antes del desarrollo.
- Conectar con Jira API v3 y reemplazar todos los datos estáticos del prototipo.
- Implementar WebSockets o polling para actualización automática en tiempo real.
- Definir criterios de alerta visual para tickets "Pendiente cliente" con tiempo de espera crítico.
- Iniciar diseño del Módulo 2: dashboard de reportería para liderazgo.

---

*Fuente: sesión de diseño iterativo Finkargo · Triage de Soporte Módulo 1.*
*Este documento es la fuente de verdad funcional para el desarrollo con Claude Code.*
