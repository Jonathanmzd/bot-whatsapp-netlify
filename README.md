### CHATBOT Whatsapp (Baileys Provider)

<p align="center">
  <img width="300" src="https://i.imgur.com/Oauef6t.png">
</p>


**Con esta librería, puedes construir flujos automatizados de conversación de manera agnóstica al proveedor de WhatsApp,** configurar respuestas automatizadas para preguntas frecuentes, recibir y responder mensajes de manera automatizada, y hacer un seguimiento de las interacciones con los clientes.  Además, puedes configurar fácilmente disparadores que te ayudaran a expandir las funcionalidades sin límites. **[Ver más informacion](https://bot-whatsapp.netlify.app/)**

```js
const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowPrincipal])

    const adapterProvider = createProvider(BaileysProvider, {
        accountSid: process.env.ACC_SID,
        authToken: process.env.ACC_TOKEN,
        vendorNumber: process.env.ACC_VENDOR,
    })

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
}
```

```
mkdir bot_sessions sino existe la carpeta
npm install
npm start
```

---
## Recursos
- [📄 Documentación](https://bot-whatsapp.netlify.app/)
- [🚀 Roadmap](https://github.com/orgs/codigoencasa/projects/1)
- [💻 Discord](https://link.codigoencasa.com/DISCORD)
- [👌 Twitter](https://twitter.com/leifermendez)
- [🎥 Youtube](https://www.youtube.com/watch?v=5lEMCeWEJ8o&list=PL_WGMLcL4jzWPhdhcUyhbFU6bC0oJd2BR)


## WhatsApp Bot con Node.js, MySQL y Socket.io

Este proyecto es un bot de WhatsApp que utiliza Node.js, MySQL y Socket.io para gestionar un flujo de conversaciones automatizado. Se conecta a una base de datos MySQL para almacenar y consultar datos de los usuarios y maneja el estado de las conversaciones mediante flujos.

### Estructura del Proyecto

### Archivos y Directorios Clave

- **`app.js`**: Archivo principal que inicializa el bot, conecta la base de datos y gestiona el flujo de conversaciones.
- **`idle-custom.js`**: Contiene funciones para gestionar el estado del bot (iniciar, detener y reiniciar el flujo).
- **`base datos bot.sql`**: Script SQL para la creación de la base de datos.
- **`.env`**: Archivo para configurar variables de entorno sensibles (host, usuario, contraseña, etc.).
- **`Dockerfile`**: Configuración para la creación de un contenedor Docker del proyecto.

### Dependencias Principales
- `@bot-whatsapp/bot` – Framework principal para la creación del bot de WhatsApp.
- `@bot-whatsapp/portal` – Portal web para escanear el código QR necesario para iniciar sesión en el bot.
- `@bot-whatsapp/provider/baileys` – Proveedor de mensajería basado en la librería Baileys.
- `@bot-whatsapp/database/mysql` – Conector MySQL para gestionar la base de datos.
- `axios` – Cliente HTTP para realizar solicitudes externas.

## Configuración

### Instalación
1. Clona este repositorio.
2. Instala las dependencias necesarias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno en un archivo `.env`:
   ```env
   MYSQL_DB_HOST=192.168.xx.xx
   MYSQL_DB_USER=gateway
   MYSQL_DB_PASSWORD=7layer
   MYSQL_DB_NAME=bot
   MYSQL_DB_PORT=3306
   ```
4. Ejecuta el bot:
   ```bash
   node app.js
   ```

## Flujos del Bot

### `flowInicio`
- Inicia el flujo solicitando el nombre del usuario.
- Valida si el usuario quiere salir del flujo.
- Si el usuario proporciona su nombre, se le solicitará su correo electrónico.

### `flowCorreo`
- Solicita el correo electrónico del usuario.
- Valida el formato del correo usando una expresión regular.

### `flowInicio1`
- Solicita una opción de menú al usuario.
- Obtiene datos desde una API externa mediante una solicitud HTTP utilizando `axios`.
- Gestiona opciones y flujos en función de las respuestas del usuario.

### `flow1`
- Determina el flujo de acuerdo a las opciones seleccionadas.
- Maneja diferentes flujos, como `welcome_flow` o `answer_flow`.

### `flow2`
- Permite al usuario continuar con el flujo o finalizar la conversación.

## Base de Datos
El bot se conecta a una base de datos MySQL que gestiona la información del flujo y las interacciones del usuario.

### Estructura de la Tabla Principal
```sql
CREATE TABLE conversaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(100),
    correo VARCHAR(100),
    opciones TEXT,
    step VARCHAR(50),
    flow VARCHAR(50),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Despliegue con Docker
1. Construye la imagen del contenedor:
   ```bash
   docker build -t whatsapp-bot .
   ```
2. Ejecuta el contenedor:
   ```bash
   docker run -d -p 3000:3000 whatsapp-bot
   ```

## Notas Importantes
- El sistema maneja errores robustamente, garantizando que el usuario reciba mensajes claros en caso de fallos.
- El bot reinicia automáticamente el flujo si el usuario se equivoca o selecciona opciones inválidas.
- Se incluyen mensajes de bienvenida y de cierre para garantizar una experiencia de usuario fluida.

## Contacto
Si tienes alguna pregunta o sugerencia, no dudes en abrir un issue o enviar un correo al desarrollador.

---

¡Gracias por usar este proyecto! 🚀

