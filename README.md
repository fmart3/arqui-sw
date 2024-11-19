## Servicio de Base de Datos

El servicio de base de datos está compuesto por varios archivos que permiten la conexión y la sincronización con una base de datos MySQL. A continuación se describen los archivos principales:

1. index.js (Archivo principal)
Este archivo es el encargado de iniciar el servicio de base de datos. Utiliza la función iniciarServicio para conectar con el bus de mensajes y procesar las solicitudes.

2. db.js (Configuración de la base de datos)
Este archivo se encarga de establecer la conexión con la base de datos MySQL utilizando Sequelize. Además, realiza la sincronización de las tablas.

3. query.js (Manejo de consultas SQL)
Este archivo define la función procesarQuery, que recibe una consulta SQL, la ejecuta en la base de datos y retorna los resultados.

4. configService.js (Configuración global del servicio)
Este archivo configura el servicio de manera global, manejando la conexión al bus y el envío de respuestas. Cada servicio debe usar este archivo para iniciar el servicio y conectarse al bus.

---

## Servicio de Autenticación
El servicio de autenticación permite manejar las solicitudes de inicio de sesión de los usuarios. Utiliza el servicio de base de datos para validar las credenciales.

1. index.js (Archivo principal)
El archivo inicia el servicio de autenticación y delega la lógica a la función procesarMensaje.

2. login.js (Manejo del inicio de sesión)
Este archivo define la lógica del inicio de sesión, que recibe el RUT y la contraseña, realiza la consulta a la base de datos, y retorna el resultado.

3. configClient.js
Este archivo contiene las funciones necesarias para enviar y recibir mensajes a través del bus de mensajes. Utiliza sockets para establecer la comunicación con los servicios y manejar las respuestas.

---

## Cliente (auth)
El cliente es la interfaz de usuario que interactúa con el sistema a través de una consola de terminal. El cliente hace las consultas al bus, que a su vez las pasa a los servicios correspondientes. por ahora solo sirve para autenticar, falta las funcionalidades principales

1. index.js (Archivo principal)
Este archivo inicia el menú de inicio de sesión cuando se ejecuta el cliente.

2. login.js (Manejo del inicio de sesión en cliente)
Este archivo permite que el cliente interactúe con el bus para enviar los datos de inicio de sesión.

3. configClient.js

---

## Consideraciones adicionales

- cada carpeta debe tener un archivo .env.

este es el archivo .env para el servicio de base de datos:
DB_HOST=localhost
DB_USER=user
DB_PASSWORD=password
DB_NAME=db1
DB_PORT=3306
BUS_HOST=localhost
BUS_PORT=5000

para los otros componenetes, el archivo .env es el siguiente:
BUS_HOST=localhost
BUS_PORT=5000

- se debe tener un archivo que maneje la logica.

- para iniciar base de datos:
// carpeta db
docker-compose up -d

- para interactuar con la base de datos (agregar tablas, datos, etc)
1. docker exec -it db-mysql bash
2. mysql -u user -p
3. password
4. USE db1;
5. escribir lo que se quiere en sql

- para utilizar proyecto:
1. clonar repo o ponerse al día con el repo
2. npm install
3. archivos .env
4. levantar bus
5. levantar base de datos
6. npm run dev en cada carpeta de cada componente