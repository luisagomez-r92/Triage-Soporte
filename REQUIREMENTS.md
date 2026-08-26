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
| Nivel 1 – Revisión | En revisión + en espera (sin asignar) + regresados de N2 para validar. | Por hora de asignación al agente N1 |
| Nivel 2 – Especialistas | En curso (borde azul) + cola colapsable. | En curso: por hora de asignación. En cola: por prioridad (Critical → Low), y dentro de cada prioridad por hora de escalado |
| Pendiente cliente | Tickets pausados esperando respuesta, con tiempo transcurrido visible. | Por hora en que pasó a pendiente |

### Columnas del Tablero general

| Columna | Descripción |
|---|---|
| Nivel 0 – Nuevos | Recién creados, sin asignar. FIFO estricto por hora de llegada. |
| Nivel 1 – Revisión | En atención por N1. Incluye casos en validación (borde verde izq.). |
| Nivel 2 – Especialistas | En curso (borde azul) y en cola, esta última ordenada por prioridad (Critical → Low) y, dentro de cada prioridad, por hora de escalado. Máx. 3 visibles, resto colapsado ("Ver más"). |
| Pendiente cliente | Con tiempo sin respuesta visible en la tarjeta. |

## 5. Funcionalidades principales

**Buscador global** (presente en todas las pestañas)
- Busca por número de ticket (FK-XXXX) o nombre del solicitante.
- Tablero: resalta coincidencias, atenúa el resto; lista resultados con su columna de origen.
- Pestañas de detalle: filtra tickets visibles; si la pestaña activa no tiene resultados,
  navega automáticamente a la correcta con banner informativo.
- Tickets colapsados se expanden automáticamente al buscar.
- Muestra conteo de resultados en tiempo real.

**Modal de detalle** (click en tarjeta del Tablero general)
- Barra de progreso, tarjetas de tiempo global y estado, responsable asignado (avatar + badge
  de nivel), historial completo con línea de tiempo vertical.

**Panel de detalle desplegable** (botón "Ver detalle" en pestañas N1, N2, Pendiente)
- Dos tarjetas de tiempo (global y estado actual), tarjeta de responsable con badge de nivel,
  historial con línea de tiempo.
- Alertas contextuales para tickets en validación y en apoyo por desborde.

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
