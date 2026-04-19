#Proyecto tusturnos
## 🧠 Contexto del sistema

```yaml
  app:
  admin: "Backoffice para gestionar agenda, clientes, servicios, profesionales y reportes"
  api: "Capa backend con endpoints para lógica de negocio, datos y autenticación"
  auth: "Flujos de autenticación (login, registro, callbacks)"
  cliente: "Interfaz de usuario para explorar profesionales y reservar turnos"
  cuenta: "Gestión de cuenta del usuario (credenciales y seguridad)"
  tusturnos_empresa: "Entorno multi-tenant por empresa con branding y catálogo propio"
  offline: "Soporte offline y fallback de la aplicación"
  profesional: "Panel del profesional para gestionar agenda, horarios y reservas"

relaciones_clave:

  - flujo: "Autenticación"
    path:
      - cliente/auth
      - profesional/auth
      - admin/auth
      - api/auth
    descripcion: "Todos los tipos de usuario se autentican vía API centralizada"

  - flujo: "Explorar y reservar turno"
    path:
      - cliente/explorar_profesionales
      - cliente/reservar
      - api (reservas)
      - profesional/agenda
    descripcion: "El cliente explora, reserva y la reserva impacta en la agenda del profesional"

  - flujo: "Gestión de reservas (admin)"
    path:
      - admin/gestion_reservas
      - api/admin
      - api (reservas)
    descripcion: "El admin crea, modifica o cancela reservas usando endpoints administrativos"

  - flujo: "Configuración de disponibilidad"
    path:
      - profesional/horarios
      - admin/horarios
      - api
    descripcion: "Horarios definidos por profesional o admin afectan disponibilidad de reservas"

  - flujo: "Gestión de clientes"
    path:
      - admin/clientes
      - api/admin/clientes
    descripcion: "El admin gestiona la base de clientes utilizada en reservas"

  - flujo: "Multi-tenant (empresa)"
    path:
      - tusturnos_empresa
      - auth
      - api
    descripcion: "Cada empresa tiene su propio contexto, branding y usuarios asociados"

  - flujo: "Agenda"
    path:
      - profesional/agenda
      - admin/agenda
      - api (reservas)
    descripcion: "Las agendas consumen reservas desde la API y las representan visualmente"

  - flujo: "Servicios"
    path:
      - admin/servicios
      - api
      - cliente/reservar
    descripcion: "Los servicios definidos impactan directamente en lo que el cliente puede reservar"

  - flujo: "Offline/PWA"
    path:
      - offline
      - api/sw
      - api/manifest
    descripcion: "Cacheo y funcionamiento offline mediante service worker y configuración PWA"

dependencias:

  cliente: ["api", "auth", "tusturnos_empresa"]
  profesional: ["api", "auth"]
  admin: ["api", "auth"]
  cuenta: ["api", "auth"]
  tusturnos_empresa: ["api", "auth"]
  offline: ["api/sw", "api/manifest"]

notas_arquitectura:

  - "API es el núcleo: toda la lógica de negocio pasa por ahí"
  - "Arquitectura multi-tenant basada en empresa (tusturnos/[empresa])"
  - "Separación clara de roles: cliente, profesional y admin"
  - "Reservas son la entidad central del sistema"
  - "Agenda es una proyección visual de reservas + disponibilidad"