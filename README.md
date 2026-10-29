# Digital Security — Interactive Learning Module

Prototipo educativo móvil sobre contraseñas, phishing, protección de información personal y buenas prácticas de seguridad digital.

## Funcionalidad

- Cuatro lecciones con introducción, contenido y recursos visuales accesibles.
- Escenario universitario interactivo con pistas y retroalimentación.
- Evaluación de cuatro preguntas con retroalimentación específica, puntuación y opción de volver a intentarlo.
- Progreso real y guardado automático mediante `localStorage`.
- Recuperación de la pantalla, lección, escenario y respuestas después de recargar o cerrar el navegador.
- Recomendaciones finales, guías, glosario, preguntas frecuentes y enlaces de ayuda.
- Diseño adaptable, controles táctiles y navegación accesible.

**Importante:** el progreso se guarda únicamente en el navegador y dispositivo utilizados. No hay cuentas ni sincronización en la nube. Borrar los datos del navegador elimina el progreso.

## Ejecutar localmente

Requiere Node.js 20 o posterior.

```bash
npm ci
npm run dev
```

Para comprobar la compilación de producción:

```bash
npm run build
npm run preview
```

## Subir el proyecto a GitHub

1. Crea un repositorio vacío en GitHub.
2. Descarga este proyecto y abre una terminal dentro de su carpeta.
3. Ejecuta los siguientes comandos, sustituyendo la URL por la de tu repositorio:

```bash
git init
git add .
git commit -m "Prototipo funcional de seguridad digital"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
git push -u origin main
```

Si la carpeta ya contiene un repositorio Git y `git init` lo indica, continúa con los demás comandos. Si ya existe un remoto `origin`, actualízalo con:

```bash
git remote set-url origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
```

## Publicarlo para que el profesor pueda abrirlo

El proyecto incluye `.github/workflows/deploy.yml`, que compila y publica la aplicación automáticamente.

1. En GitHub, entra en **Settings → Pages**.
2. En **Build and deployment → Source**, selecciona **GitHub Actions**.
3. Entra en **Actions** y espera a que termine correctamente el flujo **Deploy to GitHub Pages**. Si no se inició al subir los archivos, selecciona **Run workflow**.
4. La dirección pública tendrá esta forma:

```text
https://TU-USUARIO.github.io/TU-REPOSITORIO/
```

La configuración de Vite usa rutas relativas (`base: './'`), por lo que los recursos funcionan tanto en un dominio principal como en la subcarpeta de GitHub Pages.

## Verificación realizada

- Compilación de producción sin errores.
- Respuestas incorrectas y correctas con retroalimentación inmediata.
- Resultado de 3/4 calculado correctamente en una prueba deliberada.
- Reinicio del quiz con todas las respuestas habilitadas nuevamente.
- Persistencia del avance y del resultado después de recargar.
- Prueba móvil a 390 × 844 px, sin desbordamiento horizontal ni errores de consola o red.
