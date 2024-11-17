Una vez copiado el git

Hacer un .env con el uri de mongo

MONGO_URI=mongodb+srv://user:pass@cluster0.ku9m1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

Crear network de docker

docker network create soa

Traer el docker del bus

docker run -d -p 5000:5000 --name soabus --network soa jrgiadach/soabus:v1

Correr el docker

docker compose up --build

Y luego iniciar sesion en rabbitmq con http://localhost:15672 , iniciando sesion con credenciales

user: your_username
pass: your_password

FINALMENTE correr el main.js

node main.js
