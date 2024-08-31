## Multiplayer Server
Este proyecto configura y ejecuta un servidor multiplayer utilizando Docker. Sigue los pasos a continuación para construir y correr el servidor en un contenedor Docker.

## Requisitos
- **Docker**: Asegúrate de tener Docker instalado en tu sistema. Puedes descargarlo e instalarlo desde Docker's official website.
Instrucciones
### 1. Construir la Imagen Docker
Para construir la imagen Docker del servidor, navega al directorio donde se encuentra el archivo Dockerfile y ejecuta el siguiente comando:


Copiar código

```bash
docker build -t multiplayer_server .
```

Este comando construirá una imagen Docker llamada multiplayer_server basada en la configuración especificada en el Dockerfile.

### 2. Ejecutar el Contenedor
Después de construir la imagen, puedes ejecutar el servidor en un contenedor Docker con el siguiente comando:

bash
Copiar código
```bash
    docker run -d -p 3000:3000 --name multiplayer_server_c1 multiplayer_server
```

-d: Ejecuta el contenedor en modo desacoplado (en segundo plano).
-p 3000:3000: Mapea el puerto 3000 del contenedor al puerto 3000 de la máquina local.
--name multiplayer_server_c1: Asigna el nombre multiplayer_server_c1 al contenedor.
El servidor ahora estará corriendo en segundo plano y será accesible en http://localhost:3000.