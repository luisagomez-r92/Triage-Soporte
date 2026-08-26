# CLAUDE.md

Este archivo se carga automáticamente por Claude Code al iniciar sesión en este repositorio.
Contiene el **cómo** técnico del proyecto. El **qué** (reglas de negocio, estados, diseño
visual) vive en `REQUIREMENTS.md` — léelo siempre antes de tocar lógica de negocio.

## Contexto funcional

> **Antes de escribir código de features, lee `REQUIREMENTS.md`.** Ahí está la especificación
> completa: flujo de tickets, estados, reglas de orden (incluida la regla del campo `Rank` de
> Jira para la cola de Nivel 2), diseño visual y alcance del Módulo 1.

Proyecto: **Triage de Soporte – Finkargo (Módulo 1)**. Visualización en tiempo real de la cola
de tickets de soporte (Colombia/México), con niveles N1/N2 e integración obligatoria con Jira
API.

## Stack técnico

| Capa | Tecnología | Nota |
|---|---|---|
| Frontend | React + TypeScript + Tailwind CSS | Vite como bundler |
| Backend | Node.js + Express + TypeScript | Actúa como proxy/agregador de Jira API — ver "Supuesto" abajo |
| Base de datos | PostgreSQL + Prisma ORM | Cache de snapshots y métricas, no fuente de verdad — ver "Supuesto" abajo |
| Tiempo real | WebSocket (`ws` o Socket.IO) | Con fallback a polling cada 30–60 s si el WS falla |
| Integración externa | Jira API v3 (core) + Jira Agile API (`/rest/agile/1.0`) | La segunda es necesaria para el campo `Rank` — ver `REQUIREMENTS.md` §9 |
| Avatares de agentes | Slack API | No viene de Jira |
| Testing | Vitest (unit) + Playwright (E2E) | Astrid ya tiene experiencia con Playwright |
| Linting/Formato | ESLint + Prettier | Config estándar de Airbnb o similar, a definir en setup |

> **Supuesto que estoy tomando (avísame si prefieres algo distinto):** propongo un backend
> ligero en Node/Express en vez de que el frontend llame a Jira directamente, porque (1) las
> credenciales de la API de Jira no deben viajar al navegador, y (2) el backend puede
> centralizar el polling/WebSocket para todos los usuarios conectados en vez de que cada
> navegador golpee la API de Jira por separado. La base de datos es opcional para el Módulo 1
> estricto (Jira es la fuente de verdad), pero recomiendo Postgres desde ya para cachear
> snapshots y reducir llamadas a Jira, y porque el Módulo 2 (reportería) sí la va a necesitar.
> Si prefieren serverless (ej. funciones en Vercel) en vez de un backend persistente, dímelo y
> ajustamos esta sección.

## Estructura de carpetas

```
triage-soporte/
├── REQUIREMENTS.md          # Fuente de verdad funcional
├── CLAUDE.md                 # Este archivo
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes de UI (tarjetas, modal, tabs, sidebar)
│   │   ├── features/         # Lógica por pestaña (tablero, n1, n2, pendiente)
│   │   ├── hooks/             # useTickets, useWebSocket, useSearch
│   │   ├── types/             # Tipos TS compartidos (Ticket, Estado, Prioridad)
│   │   └── lib/                # Utilidades (formateo de tiempo, colores por estado)
│   └── tailwind.config.ts     # Tokens de color de la sección 7 de REQUIREMENTS.md
├── backend/
│   ├── src/
│   │   ├── jira/               # Cliente Jira API v3 + Agile API (rank)
│   │   ├── slack/              # Cliente Slack API (avatares)
│   │   ├── websocket/          # Servidor WS / broadcast de cambios
│   │   ├── db/                  # Esquema Prisma, migraciones
│   │   └── routes/              # Endpoints REST que consume el frontend
│   └── prisma/schema.prisma
└── e2e/                          # Tests Playwright
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta frontend (Vite) y backend en paralelo |
| `npm run dev:frontend` | Solo frontend, puerto 5173 |
| `npm run dev:backend` | Solo backend, puerto 3001 |
| `npm run build` | Build de producción de ambos |
| `npm run test` | Corre tests unitarios (Vitest) |
| `npm run test:e2e` | Corre tests E2E (Playwright) |
| `npm run lint` | ESLint sobre todo el repo |
| `npx prisma studio` | UI para inspeccionar la base de datos local |
| `npx prisma migrate dev` | Aplica migraciones en desarrollo |

*(Estos comandos son la convención propuesta — ajústalos cuando el `package.json` real esté
creado, y actualiza esta tabla si cambian.)*

## Variables de entorno

Nunca hardcodear credenciales. Usar `.env` (ignorado en `.gitignore`) con al menos:

```
JIRA_BASE_URL=
JIRA_EMAIL=
JIRA_API_TOKEN=
JIRA_BOARD_ID=
SLACK_BOT_TOKEN=
DATABASE_URL=
```

## Convenciones de código

- **TypeScript estricto** (`strict: true`), evitar `any`.
- **Componentes React**: funcionales, un componente por archivo, nombre en PascalCase.
- **Nombres de estado de ticket**: usar exactamente los strings de la tabla de la sección 3
  de `REQUIREMENTS.md` (ej. `"Escalado a N2"`) al mapear el status de Jira, para evitar
  desalineación entre el dato crudo de Jira y lo que se muestra en pantalla.
- **Commits**: Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`).
- **Ramas**: `feature/nombre-corto`, `fix/nombre-corto`.
- **Idioma**: código y nombres de variables en inglés; UI, comentarios de negocio y
  commits en español (consistente con cómo trabaja el equipo).

## Reglas para Claude Code en este proyecto

- Antes de implementar cualquier regla de orden, estado o prioridad, verificar contra
  `REQUIREMENTS.md` — no asumir comportamiento "estándar" de kanban.
- El campo `Rank` de Jira es la fuente de verdad para el orden de la cola de Nivel 2 (no
  recalcular combinando prioridad + hora en el frontend ni backend).
- Al tocar el cliente de Jira, preferir tareas pequeñas y verificables (ej. "trae los
  tickets de un board" antes de "sincroniza todo en tiempo real").
- No commitear el `.env` ni tokens reales, ni siquiera de ejemplo con valores parecidos a
  los reales.
- Si una tarea requiere una decisión de arquitectura no cubierta aquí (ej. cómo manejar
  reconexión de WebSocket), proponer opciones antes de implementar, no decidir en silencio.

## Fuera del alcance (recordatorio técnico)

Ver sección 8 de `REQUIREMENTS.md`. En particular: no implementar autenticación/roles,
dashboard de reportería, ni integraciones con despliegues de código en este módulo.
