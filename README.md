# Prueba Técnica de Angular + Express

Esta prueba técnica fue generada usando Angular versión 19.

# ¿Qué tecnologías se usaron?

Se usó Express.js para crear un servidor para la autenticación con JWT. Se uso CSS para los estilos y se creó un componente para
el login.

## ¿Cómo hacer que funcione el proyecto?

Para instalar todos los recursos necesarios es necesario ejecutar:

```bash
npm install
```

Una vez que se han instalado todos los recursos necesarios, se inicia el proyecto de Angular en el puerto 4200:

```bash
ng serve
```

Una vez iniciado el proyecto de Angular, es necesario inicializar el servidor de Express para la autenticación con JWT:

```bash
node api/server.js
```

Una vez realizado todo lo anterior, es necesario ir a http://localhost:4200/login, en donde estará el formulario de inicio de sesión. Se puede acceder con el usuario admin y la contraseña admin o con el usuario usuario y la contraseña usuario, ya que están hardcodeados en la API de Express.
