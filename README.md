# EkoBUAP

**Aplicación web para promover y dar seguimiento a las acciones ambientales dentro de la Benemérita Universidad Autónoma de Puebla (BUAP).**

EkoBUAP es un proyecto que busca fomentar la participación de la comunidad universitaria en el cuidado del medio ambiente mediante herramientas digitales que facilitan el registro y seguimiento de acciones ambientales.

La plataforma contempla el uso de códigos QR asociados a elementos ambientales del campus, un sistema de usuarios, un historial de actividades y un mecanismo de insignias para reconocer la participación.

> **Estado del proyecto:** En desarrollo. La estructura de la base de datos, el backend y la primera versión de la interfaz web se encuentran implementados.

---

## Objetivo del proyecto

Desarrollar una aplicación web que permita registrar y consultar acciones ambientales dentro de la BUAP, facilitando la participación de los usuarios y el seguimiento de sus actividades mediante una interfaz accesible e intuitiva.

## Funcionalidades

### Implementadas

* **Interfaz web:** página de inicio con una presentación del proyecto.
* **Registro de usuarios:** formulario para crear una cuenta.
* **Inicio de sesión:** autenticación de usuarios mediante el backend.
* **Gestión de sesión:** conservación del token de autenticación y consulta de la sesión.
* **Dashboard:** panel principal con información del usuario y elementos de seguimiento.
* **Backend REST:** API desarrollada con Node.js y Express.
* **Base de datos:** estructura relacional en MySQL para almacenar usuarios y registros del sistema.

### Contempladas para el desarrollo

* Escaneo de códigos QR asociados a elementos ambientales.
* Registro y consulta del historial de actividades.
* Sistema de puntos, niveles e insignias.
* Información sobre acciones ambientales.
* Registro de reportes.
* Panel de administración para la gestión y consulta de usuarios.

Las funcionalidades de esta segunda sección se irán integrando y verificando conforme avance el desarrollo.

---

## Tecnologías utilizadas

| Tecnología   | Uso                                               |
| ------------ | ------------------------------------------------- |
| React        | Construcción de la interfaz de usuario            |
| Vite         | Entorno de desarrollo y compilación del frontend  |
| JavaScript   | Lógica de la aplicación                           |
| CSS          | Diseño y adaptación de la interfaz                |
| Node.js      | Entorno de ejecución del backend                  |
| Express      | Creación de la API REST                           |
| MySQL        | Gestión de la base de datos relacional            |
| Axios        | Comunicación entre el frontend y el backend       |
| React Router | Navegación entre páginas                          |
| JWT          | Autenticación basada en tokens                    |
| bcrypt       | Protección de contraseñas mediante hash           |
| Lucide React | Iconografía de la interfaz                        |
| html5-qrcode | Biblioteca prevista para el escaneo de códigos QR |

---

## Estructura del proyecto

La estructura general del repositorio es la siguiente:

```text
EkoBUAP/
├── backend/
│   ├── ...                 # API REST y lógica del servidor
│   └── .env                # Configuración local (no se sube a Git)
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── context/        # Contexto de autenticación
│   │   ├── pages/          # Páginas de la aplicación
│   │   ├── services/       # Comunicación con la API
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env                # Configuración local (no se sube a Git)
│   └── ...
│
├── .gitignore
└── README.md
```

La estructura puede ampliarse conforme se incorporen nuevas funcionalidades y módulos.

---

## Requisitos previos

Antes de instalar el proyecto, asegúrate de contar con:

* [Node.js](https://nodejs.org/) y npm.
* [MySQL](https://www.mysql.com/) o un servidor compatible.
* [Git](https://git-scm.com/).
* Un editor de código, como [Visual Studio Code](https://code.visualstudio.com/).

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
https://github.com/Mau22v/EkoBarnProyecto.git
cd EkoBUAP
```

### 2. Configurar la base de datos

Inicia el servicio de MySQL y crea la base de datos:

```sql
CREATE DATABASE ekobuap
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Importa el archivo SQL del proyecto que contiene la estructura de las tablas. Si todavía no se encuentra dentro del repositorio, guarda y agrega el script de creación de la base de datos antes de distribuir el proyecto.

La estructura contempla las siguientes tablas:

* `usuarios`
* `qr_items`
* `escaneos`
* `insignias`
* `usuario_insignias`
* `reportes`

Configura las credenciales de conexión en el archivo de variables de entorno del backend, respetando los nombres de variables que utiliza el código.

### 3. Configurar y ejecutar el backend

Abre una terminal en la raíz del proyecto y ejecuta:

```bash
cd backend
npm install
```

Configura las variables de entorno necesarias para la conexión con MySQL, el puerto del servidor y la clave secreta de JWT.

A continuación, inicia el servidor:

```bash
npm run dev
```

Si el proyecto no cuenta con un script `dev` en su `package.json`, utiliza el comando de inicio definido allí.

El backend está preparado para ejecutarse en el puerto `3000` en el entorno de desarrollo actual.

### 4. Configurar y ejecutar el frontend

Abre **otra terminal** desde la raíz del repositorio:

```bash
cd frontend
npm install
```

Crea el archivo `.env` del frontend con la dirección de la API:

```env
VITE_API_URL=http://localhost:3000/api
```

Inicia Vite:

```bash
npm run dev
```

Abre en el navegador la dirección que indique la terminal. En la configuración habitual de Vite será:

```text
http://localhost:5173
```

Para utilizar la aplicación, mantén en ejecución tanto el backend como el frontend.

---

## 🔌 API del proyecto

El backend expone endpoints para las operaciones principales del sistema.

| Método | Endpoint                     | Descripción                         |
| ------ | ---------------------------- | ----------------------------------- |
| `POST` | `/api/auth/registro`         | Registro de usuarios                |
| `POST` | `/api/auth/login`            | Inicio de sesión                    |
| `GET`  | `/api/auth/me`               | Consulta del usuario autenticado    |
| `GET`  | `/api/usuarios/me`           | Información del perfil              |
| `GET`  | `/api/usuarios/me/historial` | Consulta del historial              |
| `GET`  | `/api/usuarios/insignias`    | Consulta de insignias               |
| `GET`  | `/api/qr`                    | Consulta de elementos QR            |
| `POST` | `/api/qr/escanear`           | Operación de escaneo de QR          |
| `POST` | `/api/reportes`              | Registro de reportes                |
| `GET`  | `/api/admin/usuarios`        | Consulta administrativa de usuarios |

Las rutas que requieren autenticación deben recibir el token correspondiente mediante el encabezado `Authorization: Bearer <token>`. El acceso administrativo debe restringirse a usuarios autorizados.

---

## Seguridad

El proyecto contempla las siguientes medidas:

* Contraseñas protegidas mediante hash con bcrypt.
* Autenticación basada en tokens JWT.
* Separación entre la interfaz, la API y la base de datos.
* Uso de variables de entorno para la configuración sensible.
* Exclusión de archivos `.env` y dependencias instaladas mediante `.gitignore`.

**Importante:** no publiques contraseñas, tokens, claves secretas ni credenciales reales en el repositorio.

---

## Estado del desarrollo

El proyecto se encuentra en una etapa inicial de implementación funcional. La autenticación, la estructura de datos, la comunicación entre el frontend y el backend, y la interfaz inicial constituyen la base para integrar los siguientes módulos.

El desarrollo continuará con la implementación del escaneo QR, el historial de actividades, las insignias, la información ambiental y las herramientas administrativas.

## Propósito

EkoBUAP busca facilitar la participación de la comunidad universitaria en iniciativas ambientales mediante una plataforma digital que permita registrar actividades, consultar avances y reconocer la participación de sus usuarios.

---

## Desarrollo

Proyecto académico desarrollado para la comunidad de la Benemérita Universidad Autónoma de Puebla (BUAP).

**Repositorio:** [EkoBUAP en GitHub](https://github.com/Mau22v/EkoBarnProyecto)

<img width="937" height="413" alt="Captura de pantalla 2026-10-08 221353" src="https://github.com/user-attachments/assets/6581c6f8-5b97-4bb9-80b7-35138da4fa36" />
<img width="935" height="415" alt="Captura de pantalla 2026-10-08 221521" src="https://github.com/user-attachments/assets/ba500b74-e17a-45a7-8e38-84b379a172ed" />

