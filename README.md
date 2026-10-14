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

> **Servicios Firebase en uso:** el proyecto funciona únicamente con **Hosting** y **Cloud Firestore** (compatible con el plan gratuito Spark). **Firebase Authentication y Firebase Storage fueron eliminados**: la identidad es de *visitante local* (ID aleatorio en `localStorage`) y las imágenes se cargan por URL.

### Colecciones Principales
- **`cities`**: Catálogo de ciudades activas (`corrientes`, `resistencia`), coordenadas y estado.
- **`categories`**: Taxonomía cultural (`musica`, `teatro`, `aire-libre`, `ferias`, `gastronomia`, `artes-visuales`, `talleres`).
- **`organizers`**: Perfiles de creadores, bandas, centros culturales y teatros.
- **`events`**: Colección principal con control estricto de `publicationStatus` (`draft`, `pending_review`, `published`, `rejected`).
- **`users/{visitorId}`**: Perfil y preferencias del visitante (sin cuentas: el `visitorId` se genera localmente y se guarda en `localStorage`).
  - **`users/{visitorId}/favorites/{eventId}`**: Subcolección de favoritos para consultas $O(1)$ sin límite de crecimiento de documentos.

### Estrategia de Desnormalización
- En cada evento se copian datos clave de lectura frecuente (`cityName`, `categoryName`, `categoryEmoji`, `organizerName`, `venueName`).
- **Consistencia:** al no usar Cloud Functions, la actualización de nombres de organizadores o categorías se propaga mediante el script de seed (`scripts/seed.ts`) o desde la consola de Firebase.

---

## 3. Seguridad y Reglas de Firestore (`firestore.rules`)
- **Default-Deny Catch-All:** Todo acceso no contemplado está cerrado por defecto.
- **Sin Firebase Auth:** no existe `request.auth`; la "propiedad" de un perfil/favoritos se basa en la posesión del `visitorId` aleatorio (imposible de adivinar, generado con `crypto.randomUUID`). Es seguridad de nivel demo, adecuada para un hackathon.
- **Taxonomías públicas de solo lectura:** `cities`, `categories`, `venues` y `organizers` solo se alimentan con el seed (Admin SDK) o la consola.
- **Flujo de publicación controlado:** la web siempre crea eventos comunitarios en `pending_review` con verificación `pending`; las reglas impiden que se auto-publiquen o auto-verifiquen.
- **Curaduría con clave simple:** el panel de moderación se desbloquea con `VITE_ADMIN_KEY` (barrera de demostración: la clave viaja en el JS del cliente).

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
│   ├── firebase/
│   │   └── config.ts         # Inicialización SDK (solo Firestore) y manejo de errores
│   └── visitor/
│       └── visitor.ts        # Identidad de visitante local + desbloqueo de curaduría
├── stores/
│   ├── userStore.ts          # Perfil de visitante, favoritos y modo curador (sin Firebase Auth)
│   ├── cityStore.ts          # Contexto territorial seleccionado
│   └── eventsStore.ts        # Filtros reactivos, listados y moderación
├── types/
│   └── index.ts              # Contratos de TypeScript
├── views/
│   ├── HomeView.vue          # Homepage limpia, hero, buscador y planes
│   ├── ExploreView.vue       # Cartelera con filtros progresivos
│   ├── EventDetailView.vue   # Ficha completa, entradas y mapa
│   ├── PublishEventView.vue  # Formulario por pasos (imagen por URL) para la comunidad
│   ├── FavoritesView.vue     # Listado de eventos guardados
│   ├── ModerationView.vue    # Panel de curaduría protegido por clave simple
│   └── ProfileView.vue       # Preferencias del visitante
├── App.vue                   # Marco general y luces ambientales
├── main.ts                    # Montaje Vue + Pinia + Router
└── index.css                  # Tailwind CSS v4 y tokens de diseño
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

### Variables de entorno (`.env`)

```env
# Solo Hosting + Firestore: no se necesitan claves de Auth ni Storage
VITE_FIREBASE_API_KEY="..."
VITE_FIREBASE_PROJECT_ID="..."
VITE_FIREBASE_APP_ID="..."

# Clave del panel de moderación (demo, no seguridad real)
VITE_ADMIN_KEY="..."

# Seed con Admin SDK (requiere clave de cuenta de servicio)
GOOGLE_APPLICATION_CREDENTIALS="./serviceAccount.json"
```

### Poblar la base de datos (seed)

El seed usa el **Admin SDK** (el cliente web ya no puede escribir taxonomías ni eventos
publicados con las reglas estrictas y sin Firebase Auth):

1. Consola de Firebase → Configuración del proyecto → Cuentas de servicio
   → *Generar nueva clave privada* → guardar como `serviceAccount.json`.
2. En `.env`: `GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json`
3. Ejecutar:

```bash
npm run seed
```

### Despliegue (Hosting + Firestore)

```bash
npm run build
npx firebase deploy --only hosting,firestore
```
