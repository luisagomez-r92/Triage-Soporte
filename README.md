# [Nombre del Proyecto]

> Breve descripción de qué hace este proyecto y para qué sirve.

---

## Tabla de Contenidos

- [Descripción](#descripción)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Configuración de Slack (botón "Abrir en Slack")](#configuración-de-slack-botón-abrir-en-slack)
- [Contribución](#contribución)
- [Contacto](#contacto)

---

## Descripción

[Explicación más detallada del proyecto: problema que resuelve, contexto de negocio, usuarios objetivo.]

---

## Requisitos

- [Tecnología / versión requerida, ej: Node.js >= 18]
- [Otra dependencia o herramienta necesaria]

---

## Instalación

```bash
# Clonar el repositorio
git clone [URL del repositorio]
cd [nombre-del-proyecto]

# Instalar dependencias
[comando de instalación, ej: npm install / pip install -r requirements.txt]

# Configurar variables de entorno
cp .env.example .env
# Editar .env con los valores correspondientes
```

---

## Uso

```bash
# Comando para ejecutar el proyecto
[comando de ejecución]
```

[Descripción de los flujos principales o ejemplos de uso.]

---

## Estructura del Proyecto

```
[nombre-del-proyecto]/
├── [carpeta-principal]/
│   └── [descripción]
├── [otra-carpeta]/
│   └── [descripción]
└── README.md
```

---

## Configuración de Slack (botón "Abrir en Slack")

> Opcional: si no se configura, el botón "Abrir en Slack" de las tarjetas del Kanban
> (Tablero general) simplemente queda deshabilitado — no rompe ninguna otra funcionalidad.

Cada caso se publica en un canal de Slack de soporte mencionando su llave de Jira (ej.
`ST-1042`). El backend busca ese mensaje y resuelve el link directo — para que esto
funcione hace falta crear una Slack App y conectarla al canal correspondiente.

### 1. Crear la Slack App

1. Ir a [api.slack.com/apps](https://api.slack.com/apps) → **Create New App** → **From scratch**.
2. Elegir el nombre (ej. "Triage de Soporte") y el workspace de Finkargo.
3. En el menú lateral, ir a **OAuth & Permissions**.

### 2. Agregar los scopes necesarios

En **OAuth & Permissions → Scopes → Bot Token Scopes**, agregar:

- **`channels:history`** si el canal de soporte es público, o **`groups:history`** si es
  privado — permite leer los mensajes del canal para encontrar el que menciona cada
  ticket.
- **`channels:read`** (público) o **`groups:read`** (privado) — necesario para
  `chat.getPermalink`, el endpoint que arma el link directo al mensaje.

Después de agregar los scopes, hacer clic en **Install to Workspace** (arriba de la misma
página) y copiar el **Bot User OAuth Token** (empieza con `xoxb-`) — ese es el valor de
`SLACK_BOT_TOKEN`.

### 3. Invitar el bot al canal

La Slack App no ve los mensajes de un canal solo por tener los scopes — hay que invitarla
explícitamente. Desde el canal de soporte en Slack:

```
/invite @NombreDeLaApp
```

### 4. Obtener el ID del canal

En Slack (cliente de escritorio o web): abrir el canal → clic en el nombre del canal
arriba → al final del panel que se abre aparece el **Channel ID** (empieza con `C` o
`G`, ej. `C0123456789`). Ese es el valor de `SLACK_CHANNEL_ID`.

### 5. Variables de entorno a configurar

Local (`backend/.env`, nunca se commitea):

```
SLACK_BOT_TOKEN=xoxb-...
SLACK_CHANNEL_ID=C0123456789
```

**En producción, el backend vive en Render (no en Netlify)** — configurar las mismas dos
variables ahí: panel del Web Service → **Environment** → agregar `SLACK_BOT_TOKEN` y
`SLACK_CHANNEL_ID` con los mismos valores. Netlify solo aloja el frontend y no necesita
ninguna de estas variables.

---

## Contribución

1. Crear una rama desde `main`: `git checkout -b feature/nombre-de-la-feature`
2. Hacer los cambios y commitear: `git commit -m "descripción del cambio"`
3. Abrir un Pull Request hacia `main`

---

## Contacto

Equipo: [nombre del equipo]
Email: [correo de contacto]
