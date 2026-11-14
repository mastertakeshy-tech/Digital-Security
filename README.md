# Digital Security — Interactive Learning Module

Prototipo educativo móvil sobre contraseñas, phishing, protección de información personal y buenas prácticas de seguridad digital.

## Funcionalidad

- Cuatro lecciones con introducción, contenido y recursos visuales accesibles.
- Escenario universitario interactivo con pistas y retroalimentación.
- Evaluación de cuatro preguntas con retroalimentación específica y puntuación. Después de cada respuesta se explica el motivo y se permite continuar sin repetir la pregunta; el reinicio completo del cuestionario es opcional al final.
- Confetti al alcanzar el 100 % del módulo, sin repetir la animación por una simple recarga y con soporte para `prefers-reduced-motion`.
- Progreso real y guardado automático mediante `localStorage`.
- Recuperación de la pantalla, lección, escenario y respuestas después de recargar o cerrar el navegador.
- Recomendaciones finales, guías, glosario, preguntas frecuentes y enlaces de ayuda.
- Diseño adaptable, controles táctiles y navegación accesible.

**Importante:** el progreso se guarda únicamente en el navegador y dispositivo utilizados. No hay cuentas ni sincronización en la nube. Borrar los datos del navegador elimina el progreso.

## Ajustes de Sprint 2

- Las opciones del escenario y del cuestionario mantienen colores neutros antes y después de responder. La selección se identifica con un borde azul, sin usar rojo o verde para revelar la respuesta.
- Después de la selección aparecen etiquetas de texto visibles: `Your answer` y `Correct answer`. Así, el resultado no depende solamente del color.
- La retroalimentación correcta o incorrecta y su explicación se muestran únicamente después de seleccionar una opción.
- Las opciones incluyen el estado accesible `aria-pressed` para comunicar cuál fue seleccionada.
- Al avanzar a otra pregunta, el enfoque vuelve al contenido principal para facilitar la navegación con teclado y tecnologías de asistencia.
- Se aumentaron los textos auxiliares que estaban por debajo de 12 px y se comprobó la adaptación móvil sin desplazamiento horizontal.

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
- Se respondieron las cuatro preguntas incorrectamente en una prueba deliberada: todas mostraron la explicación, permitieron avanzar y no presentaron `Try again` por pregunta.
- Confetti verificado al llegar al 100 %, independientemente de la puntuación; no vuelve a aparecer por recargar un 100 % guardado y se desactiva con movimiento reducido.
- Resultado de 3/4 calculado correctamente en una prueba deliberada.
- Reinicio opcional del quiz completo con todas las respuestas habilitadas nuevamente.
- Persistencia del avance y del resultado después de recargar.
- Pruebas a 320, 375, 390, 768, 1024 y 1440 px, sin desbordamiento horizontal.
- Cuestionario y escenario revisados a 390 × 844 px, sin errores de consola ni solicitudes fallidas.
- Opciones neutras verificadas antes y después de responder, con etiquetas textuales y retroalimentación posterior a la selección.
