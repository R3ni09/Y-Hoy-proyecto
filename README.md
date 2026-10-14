# ¿Y hoy? — Plataforma de Descubrimiento Cultural Litoral

**¿Y hoy?** es una plataforma moderna para el descubrimiento de actividades, recitales frente al río, teatro, ferias gastronómicas y experiencias culturales en Corrientes y Chaco, con arquitectura preparada para escalar a todo el país.

---

## 1. Rediseño UX/UI de la Homepage

### Diagnóstico del diseño anterior
- **Sobrecarga de estímulos:** La versión anterior presentaba un exceso de botones de filtrado, chips de momento del día, paneles flotantes y bloques repetitivos compitiendo en el primer pliegue (*viewport*).
- **Fatiga de decisión:** El usuario enfrentaba más de 12 decisiones inmediatas antes de ver un solo plan cultural.
- **Glassmorphism desmedido:** Todos los elementos (botones, tarjetas, badges) tenían bordes reflectivos y blur simultáneos, restándole protagonismo al contenido real.

### Nueva propuesta y principios aplicados
1. **Header Minimalista:** Reducido a la esencia: Marca, Acceso directo a Explorar, Favoritos guardados, selector sutil de región territorial (Corrientes / Resistencia) y botón de acceso a perfil/login. El botón de publicar evento es discreto y no compite con la exploración.
2. **Hero Principal enfocado:** Mensaje de valor inmediato (*"¿Y hoy, qué hacemos?"*) y subtítulo que clarifica la propuesta en un segundo.
3. **Buscador Único y Prominente:** Una sola barra central con selector rápido de fecha (Hoy / Fin de semana / Cualquier día) y acción clara: **Explorar**.
4. **Sección única curada ("Planes para descubrir"):** Segmentador simple en 3 opciones (*Hoy*, *Este fin de semana*, *Próximamente*) que alimenta una cuadrícula limpia de 6 eventos de alta calidad.
5. **Tarjetas orientadas a la fotografía:** Cada tarjeta prioriza imagen con proporción editorial, fecha/hora clara, nombre del evento, ubicación y precio (o etiqueta destacada *Gratis*).
6. **Glassmorphism con moderación:** Reservado para la barra de navegación flotante, la cápsula de búsqueda y modales, manteniendo superficies de lectura limpias y opacas.

---

## 2. Arquitectura de Datos Cloud Firestore

La estructura está documentada en `firebase-blueprint.json`, `firestore.rules` y `firestore.indexes.json`.

### Colecciones Principales
- **`cities`**: Catálogo de ciudades activas (`corrientes`, `resistencia`), coordenadas y estado.
- **`categories`**: Taxonomía cultural (`musica`, `teatro`, `aire-libre`, `ferias`, `gastronomia`, `artes-visuales`, `talleres`).
- **`organizers`**: Perfiles de creadores, bandas, centros culturales y teatros con `ownerIds` array para control de permisos.
- **`events`**: Colección principal con control estricto de `publicationStatus` (`draft`, `pending_review`, `published`, `rejected`).
- **`users/{userId}`**: Perfil y preferencias privadas del usuario.
  - **`users/{userId}/favorites/{eventId}`**: Subcolección de favoritos individuales para consultas $O(1)$ sin límite de crecimiento de documentos.

### Estrategia de Desnormalización
- En cada evento se copian datos clave de lectura frecuente (`cityName`, `categoryName`, `categoryEmoji`, `organizerName`, `venueName`).
- **Fuente de verdad:** La actualización de un nombre de organizador o categoría se propaga mediante Cloud Functions asíncronas para mantener la consistencia sin penalizar el rendimiento de las lecturas públicas.

---

## 3. Seguridad y Reglas de Firestore (`firestore.rules`)
- **Default-Deny Catch-All:** Todo acceso no contemplado está cerrado por defecto.
- **Validación de publicación:** Los usuarios regulares solo pueden crear eventos en estado `draft` o `pending_review`. Solo usuarios autorizados o administradores pueden cambiar el estado a `published`.
- **Aislamiento de favoritos:** Cada usuario únicamente puede leer o modificar su propia subcolección de favoritos (`users/{userId}/favorites`).

---

## 4. Estructura del Código Frontend (Vue 3 + Vite)

```text
src/
├── app/
│   └── router/               # Rutas lazy-loaded con Vue Router
├── assets/                   # Recursos estáticos
├── components/
│   ├── events/
│   │   └── EventCard.vue     # Tarjeta de evento de alto impacto visual
│   └── navigation/
│       ├── AppHeader.vue     # Header flotante minimalista
│       └── AppFooter.vue     # Pie editorial con estado de conexión
├── data/
│   └── seedData.ts           # Eventos reales y curados de Corrientes y Chaco
├── repositories/
│   └── eventsRepository.ts   # Abstracción de datos (Firestore + Demo cache)
├── services/
│   └── firebase/
│       └── config.ts         # Inicialización SDK y manejo de errores FirestoreErrorInfo
├── stores/
│   ├── authStore.ts          # Estado de usuario, roles (User/Org/Admin) y favoritos
│   ├── cityStore.ts          # Contexto territorial seleccionado
│   └── eventsStore.ts        # Filtros reactivos, listados y moderación
├── types/
│   └── index.ts              # Contratos de TypeScript
├── views/
│   ├── HomeView.vue          # Homepage limpia, hero, buscador y planes
│   ├── ExploreView.vue       # Cartelera con filtros progresivos
│   ├── EventDetailView.vue   # Ficha completa, entradas y mapa
│   ├── PublishEventView.vue  # Formulario por pasos para la comunidad
│   ├── FavoritesView.vue     # Listado de eventos guardados
│   ├── ModerationView.vue    # Panel de aprobación para curadores
│   └── ProfileView.vue       # Preferencias del usuario
├── App.vue                   # Marco general y luces ambientales
├── main.ts                   # Montaje Vue + Pinia + Router
└── index.css                 # Tailwind CSS v4 y tokens de diseño
```

---

## 5. Ejecución Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Validar tipos TypeScript
npm run lint
```
