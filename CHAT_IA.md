Debes Actuar y desarrollar como el Tech Lead y Arquitecto del proyecto.

CONTEXTO:
El archivo @MVP_ROADMAP.md contiene la definición completa de arquitectura, tareas y análisis del proyecto. Úsalo como tu base de conocimiento absoluta. Solo tenlo en memoria.

INSTRUCCIÓN DE BUCLE :
Vamos a trabajar en modo "Ciclo de Lectura".
Tu tarea principal NO es responderme en este chat, sino monitorear el archivo @chat_ia.txt

Regla de comportamiento:

1. Al terminar cualquier respuesta, SIEMPRE ejecuta un comando para leer el contenido de @chat_ia.txt .
2. Si encuentras una nueva pregunta o instrucción en ese archivo que no hayas respondido, genera la respuesta (puedes modificar archivos del proyecto si la instrucción lo pide) y luego escribe en el chat "Tarea completada. Esperando nuevas instrucciones en chat_ia.txt..." y pideme permiso para leer de nuevo @chat_ia.txt tipo para continuar.
3. Inmediatamente después, vuelve a sugerir/ejecutar el comando de lectura de @chat_ia.txt
4. Mantén este ciclo infinito.

lee @RESPUESTAS_IA.md que es algunas respuestas anteriores, ademas agrega todo lo nuevo que hiciste en el mismo formato. Tambien analiza los archivos necesarios para completar todas las tareas correspondientes.

Para DESARROLLAR (mobile-first):
Todos los cambios que hagas recuerda que tambien tengas en cuenta a mobile, no solo desktop. Ahora resuelve:

1. Crea en la VIP (/events/[id]) un boton de volver a ver todos los eventos
2. En el span de publicado de admin/events/ nada mas deja el padding right de 12px, el resto eliminalos.
3. En el checkout/[id] Cuando voy hago scroll, el header oculta una parte de la card que muestra "Resumen del pedido" arregla esto para que nunca lo haga cuando se hace scroll en desktop.
4. En la congrats, el servicio de "https://yscqvjs2zg.us-east-1.awsapprunner.com/api/public/v1/checkout/session/3351d67b-2b50-4d6c-9681-1fb79440a078__cf41ea0e-03d6-4570-b602-e7e45cef62ca__1__1767562821347/buy" nos trae de response esto : "{
   "qrCodes": [
   "https://www.tuentradaya.com/admin/events/3351d67b-2b50-4d6c-9681-1fb79440a078/validate?sale-id=50c2131f-5468-4938-b1dc-32b77144a636"
   ]}" Con respecto a esta respuesta, en esa pantalla de la congrats , ejemplo: "http://localhost:3000/checkout/congrats?sessionId=3351d67b-2b50-4d6c-9681-1fb79440a078**cf41ea0e-03d6-4570-b602-e7e45cef62ca**1\_\_1767562821347" reformula el diseño de la pantalla para mostrarle el qrCode al comprador y que sepa que ese QR es el de su boleta. Si vienen mas de una url en la respuesta, ejemplo : "{
   "qrCodes": [
   "https://www.tuentradaya.com/admin/events/84b2a74a-84c5-4c9e-8f16-9d1c216d82df/validate?sale-id=f916e9c2-37e4-4ddf-ab32-da23ff305439",
   "https://www.tuentradaya.com/admin/events/84b2a74a-84c5-4c9e-8f16-9d1c216d82df/validate?sale-id=2038aae5-03af-4391-bdfa-14462cc1bc20"
   ]}" Menciona que que el QR 1 es del asistente 1 y el QR 2 es del asistente 2, hazlo escalable y mantenible e intuitivo el obtener estas boletas por si el usuario quiere tomarle screenshot a su boleta.
