# Contexto Integral del Proyecto: ¿Y hoy? — Plataforma de Descubrimiento Cultural del Litoral

> **Documento de Contexto Técnico, de Negocio y de Arquitectura de Producto**  
> **Versión:** 1.0 (MVP Hackathon & Base de Escalabilidad)  
> **Autores / Creadores:** Franco Martin Varela & Renata Villalba Ruiz Diaz  
> **Área geográfica inicial:** Corrientes (Capital), Resistencia (Chaco) y Paso de la Patria (Corrientes), Argentina.  
> **Repositorio:** [y-hoy-cultural](file:///c:/Users/franc/OneDrive/Escritorio/Personal/Hackaton/Y%20Hoy/Y-Hoy-proyecto)

---

## 1. Identidad y Visión General del Proyecto

### 1.1 ¿Qué es "¿Y hoy?"?
**¿Y hoy?** es una plataforma digital de descubrimiento y difusión cultural urbana diseñada para responder a la pregunta cotidiana y espontánea: **"¿Y hoy, qué hacemos?"**. Centraliza en un solo lugar la vibrante oferta cultural, recreativa, comunitaria y gastronómica del Litoral argentino, combinando curaduría editorial con participación abierta de la comunidad.

### 1.2 Misión, Visión y Valores
- **Misión:** Que ninguna persona vuelva a quedarse sin plan por falta de información y que ningún artista, centro cultural o emprendimiento quede invisible por falta de canales de difusión.
- **Visión:** Convertirse en la capa de descubrimiento cultural y turístico de referencia de la región del Litoral argentino y, progresivamente, escalar como plataforma multi-ciudad en el resto del país y mercados limítrofes.
- **Valores Nucleares:**
  - *Localismo e Identidad:* Enraizado en el pulso cultural de la costa del río Paraná, el chamamé, el arte urbano, las ferias y la escena independiente.
  - *Democratización Cultural:* Un recital acústico en un bar de barrio tiene la misma oportunidad de ser descubierto que un megafestival provincial.
  - *Confianza y Calidad:* Curaduría humana y moderación estricta para garantizar información certera, verificada y actualizada.
  - *Cero Fricción:* Exploración inmediata sin muros de registro obligatorio ni descargas forzadas.

---

## 2. Diagnóstico del Problema y Propuesta de Valor

### 2.1 El Problema (Pain Points del Mercado)
1. **Dispersión y Fragmentación Extrema:** La cartelera de eventos está atomizada en historias de Instagram (efímeras y difíciles de buscar), grupos de WhatsApp cerrados, afiches en la calle, gacetillas de prensa y sitios municipales estáticos.
2. **Invisibilidad del Mediano y Pequeño Productor:** Los eventos independientes carecen del presupuesto publicitario para competir contra grandes producciones en los algoritmos de redes sociales.
3. **Fatiga y Pérdida de Oportunidad del Usuario:** Las personas suelen enterarse de las actividades cuando ya sucedieron ("me enteré al día siguiente por las fotos").
4. **Falta de Canales Centralizados para Gobiernos y Turismo:** Los municipios y entes de turismo no disponen de una radiografía viva y en tiempo real de lo que acontece en sus ciudades más allá de los actos oficiales.

### 2.2 Propuesta de Valor Diferenciada

```
+-----------------------------------------------------------------------------------+
|                            PROPUESTA DE VALOR: ¿Y HOY?                           |
|       AGREGACIÓN MULTI-FUENTE  +  PARTICIPACIÓN COMUNITARIA  +  DESCUBRIMIENTO    |
+-----------------------------------------------------------------------------------+
```

- **Para el Usuario (Lado de la Demanda):**
  - Respuesta en 5 segundos a *"¿Qué hay para hacer hoy, este finde o la próxima semana?"*.
  - Filtros intuitivos por momento temporal, precio (*Gratis* vs. *Pago*), categoría y cercanía.
  - Acceso inmediato como *Visitante* con favoritos y personalización guardada en el navegador sin fricción de contraseñas.
- **Para Productores, Artistas y Espacios (Lado de la Oferta):**
  - Publicación ágil y gratuita en minutos mediante un formulario guiado por pasos.
  - Acceso directo a una audiencia activa con intención genuina de salir y consumir cultura.
  - Canal con paridad visual y badges de organizador verificado.
- **Para Municipios y Entidades de Turismo (B2G):**
  - Mapeo en tiempo real del ecosistema cultural, flujo turístico y dinamización de la economía nocturna y diurna sin burocracia técnica.

### 2.3 Comparativa Competitiva

| Alternativa Actual | Limitación Principal | Ventaja Competitiva de **¿Y hoy?** |
| :--- | :--- | :--- |
| **Redes Sociales (Instagram / TikTok)** | Información efímera, no estructurada cronológicamente, secuestrada por algoritmos. | Motor de búsqueda estructurado por fecha exacta, ciudad, categoría y precio. |
| **Agendas y Carteleras Municipales** | Circunscritas a actos oficiales e institucionales; nula participación comunitaria; UX desactualizada. | Experiencia viva de doble vía (oficial + independiente + comunitario) con UX moderna. |
| **Portales y Diarios Locales** | Unidireccionales, sin filtros interactivos, desprovistos de micro-eventos barriales. | Enfoque 100% interactivo, con guardado de favoritos y fichas geolocalizadas. |
| **Ticketeras (Passline, Eventbrite)** | Solo listan eventos comerciales con cobro de entrada; excluyen ferias, talleres y actividades gratuitas. | Inclusión total: actividades gratuitas, a la gorra y eventos pagos con enlace directo a compra. |
| **Google Maps / Redes Genéricas** | Pensados para lugares fijos permanentes, no para la agenda viva y dinámica del día a día. | Diseñado exclusivamente para responder eventos temporales y planes efímeros. |

---

## 3. Business Model Canvas (Matriz de Negocio)

Basado en el diseño estratégico del modelo de negocio del proyecto:

```
+---------------------+-----------------------+---------------------+-----------------------+---------------------+
| 8. SOCIOS CLAVE     | 7. ACTIVIDADES CLAVE  | 2. PROPUESTA VALOR  | 4. RELACIÓN CLIENTE   | 1. SEGMENTOS        |
| - Gobiernos/Turismo | - Curaduría/Moderación| - App única central | - Autoservicio guiado | - Mercado 2 Lados:  |
| - Teatros y Bares   | - Carga semilla       | - Sin fricción      | - Moderación/Calidad  |   * Demanda (Salidas|
| - Universidades     | - Desarrollo PWA      | - Paridad cultural  | - Insignias verificadas|   * Oferta (Bandas, |
| - Proveedores Cloud | - Marketing territorial| - Radiografía viva | - Newsletters         |     bares, teatros) |
+---------------------+-----------------------+---------------------+-----------------------+---------------------+
| 6. RECURSOS CLAVE                           | 3. CANALES                                                        |
| - Plataforma PWA (Vue 3 + Firebase)         | - Web App PWA / Responsive                                         |
| - Base de Datos Centralizada                | - Redes Sociales (curaduría diaria)                                |
| - Marca & Identidad Regional                | - Widgets Embebibles                                              |
| - Motor Editorial & Workflow                | - Viralidad orgánica de eventos compartidos                       |
+---------------------------------------------+-------------------------------------------------------------------+
| 9. ESTRUCTURA DE COSTOS                     | 5. FUENTES DE INGRESOS (POR FASES)                                |
| - Desarrollo continuo & QA                  | - Fase 1: Gratuito total (captura de masa crítica y tracción)     |
| - Infraestructura Cloud, Base de Datos, CDN | - Fase 2: Destacados / Promociones + Perfiles Premium             |
| - Moderación editorial y soporte comunitario| - Fase 3: Ticketing (comisión de entradas) + Convenios B2G Turismo|
+---------------------------------------------+-------------------------------------------------------------------+
```

### 3.1 Monetización Evolutiva en 3 Fases
1. **Fase 1 (MVP actual & Lanzamiento): Gratuidad Total.** Foco absoluto en vencer el problema del *arranque en frío* (*cold start*), asegurar tracción, poblar el inventario y consolidar el efecto de red de dos lados.
2. **Fase 2 (Validación y Tracción): Destacados y Herramientas Premium.**
   - Posicionamiento patrocinado de eventos en carruseles y primeros resultados.
   - Perfil de Organizador Pro (estadísticas de clics, guardados, visibilidad en múltiples ciudades y personalización de marca).
3. **Fase 3 (Escala y Madurez): Transaccionalidad & B2G.**
   - Comisión porcentual por venta de tickets directa integrada a la plataforma.
   - Licencias de software y convenios con Secretarías de Cultura y Turismo provinciales/municipales (widgets y analítica urbana de demanda turística).

---

## 4. Experiencia de Usuario (UX/UI) y Filosofía de Diseño

El diseño de **¿Y hoy?** fue concebido tras un diagnóstico profundo que eliminó la sobrecarga de estímulos del prototipo inicial:

### 4.1 Principios Rectores de UX
1. **Anti-Fatiga de Decisión:** La pantalla de inicio no atosiga al usuario con docenas de selectores o preguntas. El objetivo es ver un plan atractivo en menos de 2 interacciones.
2. **Header Minimalista y Flotante:** Componente no intrusivo con logotipo, navegación a Cartelera/Explorar, acceso a Favoritos, selector de ciudad (`Corrientes` / `Resistencia` / `Paso de la Patria`), y acceso a perfil/publicación.
3. **Hero & Buscador Predictivo:** Mensaje directo (*"¿Y hoy, qué hacemos?"*) acompañado de una barra de búsqueda que segmenta por fecha en un clic (*Hoy*, *Este fin de semana*, *Cualquier día*).
4. **Cards Fotográficas Editoriales:** Tarjetas de eventos con ratios de imagen cuidados, badges legibles de fecha/hora, categoría con emoji temático, precio destacado (o badge verde esmeralda `Gratis`) y botón de guardado inmediato.
5. **Glassmorphism Calibrado:** El desenfoque y efecto translúcido se reserva exclusivamente para barras de navegación, modales y cápsulas de filtrado, garantizando legibilidad y fondos oscuros limpios (`#0B0F17` / `#131B2E`).

### 4.2 Vistas del Sistema

| Vista | Ruta | Responsabilidad |
| :--- | :--- | :--- |
| **Home** | `/` (`HomeView.vue`) | Primer impacto, selector rápido de fecha, carrusel curado de 6 planes destacados y llamada a la exploración. |
| **Explorar** | `/explorar` (`ExploreView.vue`) | Cartelera completa con filtros progresivos: texto libre, categoría, ciudad, ventana de tiempo (hoy, mañana, fin de semana, próximos) y precio. |
| **Detalle de Evento** | `/evento/:id` (`EventDetailView.vue`) | Ficha inmersiva: imagen hero, fechas, mapa y dirección, enlaces externos para compra de tickets, organizador y etiquetas de accesibilidad. |
| **Publicar Evento** | `/publicar` (`PublishEventView.vue`) | Formulario comunitario por pasos (Información básica -> Fecha y lugar -> Entradas e imagen -> Revisión) que crea eventos en estado `pending_review`. |
| **Favoritos** | `/favoritos` (`FavoritesView.vue`) | Espacio personal donde el visitante gestiona los planes guardados de forma persistente. |
| **Moderación** | `/moderacion` (`ModerationView.vue`) | Panel de curaduría protegido por clave secreta (`VITE_ADMIN_KEY`) para aprobar, rechazar con motivo y publicar eventos enviados por la comunidad. |
| **Perfil** | `/perfil` (`ProfileView.vue`) | Ajustes de preferencias del visitante local (nombre visible, ciudad predeterminada, categorías de interés). |

---

## 5. Arquitectura Técnica y Stack Tecnológico

El proyecto está construido como una Single Page Application (SPA) con arquitectura desacoplada y reactiva, optimizada para desplegarse en **Firebase Hosting** e interactuar con **Cloud Firestore**.

### 5.1 Stack de Tecnologías

```
[Cliente Web (Vue 3 + Vite + Tailwind v4 + Pinia)]
                     │
                     ▼
             [Repository Layer]
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
[Cloud Firestore]       [Local Storage Cache]
(Eventos, Ciudades,     (VisitorId, Favoritos,
 Categorías, Perfiles)   Preferencias offline)
```

- **Frontend Core:**
  - **Vue 3 (`v3.5.13`):** Composition API con `<script setup lang="ts">`.
  - **Vite (`v6.2.0`):** Entorno de compilación ultrarrápido y servidor HMR.
  - **TypeScript (`v5.7.3`):** Tipado estricto en todo el modelo de datos (`tsc --noEmit`).
  - **Pinia (`v2.3.1`):** Gestión centralizada del estado de la app.
  - **Vue Router (`v4.5.0`):** Enrutamiento cliente con lazy loading de vistas y scroll suave.
  - **Tailwind CSS (`v4.3.3`):** Motor de estilos de última generación sin configuración compleja.
  - **Lucide Vue Next (`v0.475.0`):** Iconografía vectorial moderna y consistente.
  - **Motion (`v12.23.24`):** Microinteracciones fluidas en transiciones de tarjetas y modales.
- **Backend & Cloud (Firebase Spark Plan):**
  - **Firebase SDK Client (`v11.3.1`):** Conectividad directa a Cloud Firestore.
  - **Cloud Firestore:** Base de datos NoSQL documental de baja latencia.
  - **Firebase Hosting:** Distribución global de assets estáticos vía CDN.
  - **Firebase Admin SDK (`v14.5.0`):** Utilizado exclusivamente para tareas de administración, migraciones y seed de base de datos (`scripts/seed.ts`).
  - **Capacidad Futura Server-Side:** `@google/genai` y `express` ya configurados en `package.json` para la futura API de curaduría con Gemini.

---

## 6. Modelo de Datos Cloud Firestore

El modelo está concebido para lecturas públicas ultraeficientes con **desnormalización estratégica**, minimizando las lecturas cruzadas en Firestore y optimizando costos.

### 6.1 Colecciones Principales

#### 1. `cities/{cityId}`
Catálogo de ciudades donde opera la plataforma.
- `name`: string (e.g. "Corrientes")
- `province`: string ("Corrientes", "Chaco")
- `country`: string ("Argentina")
- `slug`: string ("corrientes", "resistencia", "paso-de-la-patria")
- `coordinates`: `{ lat: number, lng: number }`
- `isActive`: boolean (permite prender/apagar ciudades en tiempo de ejecución sin redesplegar código)

#### 2. `categories/{categoryId}`
Taxonomía cultural jerárquica y extensible.
- `name`: string (e.g. "Música en Vivo")
- `slug`: string ("musica-en-vivo")
- `emoji`: string ("🎵")
- `color` / `accentColor`: tokens visuales
- `displayOrder`: number
- `parentId`: string | null (soporta subcategorías futuras)

#### 3. `organizers/{organizerId}`
Perfiles de artistas, teatros, bares y colectivos culturales.
- `name`: string
- `category`: `'artist' | 'venue' | 'collective' | 'institution'`
- `cityId`: string
- `verificationStatus`: `'verified' | 'pending' | 'unverified'`
- `socialLinks`: `{ instagram, whatsapp, website }`

#### 4. `venues/{venueId}`
Espacios físicos y salas de espectáculos.
- `name`: string
- `address`: string
- `cityId`: string
- `coordinates`: `{ lat: number, lng: number }`
- `isAccessible`: boolean (accesibilidad motriz)
- `googleMapsUrl`: string

#### 5. `events/{eventId}` (Entidad Nuclear)
Almacena toda la información del evento, incorporando copias desnormalizadas de entidades relacionadas para consulta inmediata:
- `title`, `slug`, `summary`, `description`
- `categoryId`, **`categoryName`**, **`categoryEmoji`** (desnormalizados)
- `organizerId`, **`organizerName`**, `organizerType` (desnormalizados)
- `cityId`, **`cityName`** (desnormalizado)
- `venueName`, `address`, `coordinates`
- `startAt` (ISO 8601), `endAt`, `dateBadge`, `timeDisplay`
- `priceType`: `'free' | 'paid' | 'voluntary'`
- `priceDisplay`: string (e.g. "Entrada Libre", "$5.000")
- `ticketUrl`: string (enlace directo a compra de tickets)
- `imageURL`: string (alojada externamente o vía CDN)
- `publicationStatus`: `'draft' | 'pending_review' | 'published' | 'rejected' | 'cancelled'`
- `verificationStatus`: `'verified' | 'pending' | 'unverified'`
- `sourceType`: `'community' | 'official' | 'organizer' | 'external_import'`
- `accessibility`: `{ wheelchair, audioDescription, signLanguage, quietSpace }`
- `isFeatured`, `isOutdoor`, `isPetFriendly`, `isFamilyFriendly`
- `savesCount`, `attendeesCount`

#### 6. `users/{visitorId}` & Subcolección `favorites/{eventId}`
Diseño de identidad sin login tradicional:
- Cada visitante recibe un `visitorId` aleatorio y único generado con `crypto.randomUUID()` en el navegador (`localStorage`).
- **Subcolección `users/{visitorId}/favorites/{eventId}`:** Permite consultas directas $O(1)$ para saber si un evento está guardado, sin límites de tamaño de arrays ni contención de escrituras.

#### 7. `moderationQueue/{itemId}` & `eventReports/{reportId}`
- Trazabilidad de auditoría de cada aprobación o rechazo ejecutado por los curadores.
- Reportes comunitarios sobre datos desactualizados o eventos suspendidos.

---

## 7. Estrategia de Seguridad y Reglas (`firestore.rules`)

El sistema adopta un modelo estricto adaptado a la arquitectura sin autenticación pesada:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 0. Default-Deny Catch-All: Bloqueo total por defecto
    match /{document=**} {
      allow read, write: if false;
    }

    // 1. Taxonomías públicas: solo lectura desde la web
    match /cities/{cityId} { allow read: if true; }
    match /categories/{categoryId} { allow read: if true; }
    match /venues/{venueId} { allow read: if true; }
    match /organizers/{organizerId} { allow read: if true; }

    // 2. Perfil y favoritos aislados por visitorId
    match /users/{visitorId} {
      allow read, create, update, delete: if true;
      match /favorites/{eventId} {
        allow read, create, delete: if true;
      }
    }

    // 3. Cartelera y creación comunitaria controlada
    match /events/{eventId} {
      allow read: if existing().publicationStatus in ['published', 'pending_review'];
      
      // La web comunitaria SOLO puede crear en estado 'pending_review' con verificación 'pending'
      allow create: if (
        incoming().publicationStatus == 'pending_review' &&
        incoming().verificationStatus == 'pending' &&
        incoming().sourceType == 'community'
      ) || (
        incoming().publicationStatus in ['published', 'pending_review'] &&
        incoming().sourceType != 'community'
      );
      
      allow update: if true; // Aprobación/Rechazo desde panel moderador
      allow delete: if false; // Solo Admin SDK / Consola
    }
  }
}
```

---

## 8. Organización del Código Fuente

Estructura modular clara que separa vista, estado reactivo, abstracción de datos y utilidades:

```text
Y-Hoy-proyecto/
├── .agents/skills/              # Habilidades y guías de desarrollo
├── scripts/
│   └── seed.ts                  # Script de inicialización con Admin SDK
├── src/
│   ├── app/
│   │   └── router/index.ts      # Definición de rutas, lazy loading y meta-titles
│   ├── components/
│   │   ├── events/
│   │   │   └── EventCard.vue    # Tarjeta de evento de alto impacto visual
│   │   └── navigation/
│   │       ├── AppHeader.vue    # Barra de navegación flotante con selector de ciudad
│   │       └── AppFooter.vue    # Pie de página institucional y estado de conexión
│   ├── composables/
│   │   └── useEvents.ts         # Composable para lógica reactiva de eventos
│   ├── data/
│   │   └── seedData.ts          # Dataset realista de Corrientes, Chaco y Paso de la Patria
│   ├── repositories/            # Capa de abstracción de datos (Firestore + Fallback)
│   │   ├── categories.repository.ts
│   │   ├── cities.repository.ts
│   │   ├── events.repository.ts
│   │   ├── favorites.repository.ts
│   │   ├── moderation.repository.ts
│   │   ├── organizers.repository.ts
│   │   ├── users.repository.ts
│   │   └── venues.repository.ts
│   ├── services/
│   │   ├── firebase/
│   │   │   └── config.ts        # Inicialización de Firebase (Firestore) y guardas
│   │   └── visitor/
│   │       └── visitor.ts       # Generación de visitorId en localStorage y gate de curador
│   ├── stores/                  # Estado reactivo global (Pinia)
│   │   ├── cityStore.ts         # Ciudad activa y lista de regiones operativas
│   │   ├── eventsStore.ts       # Filtros, cartelera, detalle y cola de moderación
│   │   └── userStore.ts         # Favoritos, perfil de visitante y modo curador
│   ├── types/
│   │   └── index.ts             # Contratos de TypeScript de todo el dominio
│   ├── utils/
│   │   └── dateUtils.ts         # Formateo de fechas, cálculo de fin de semana e ISOs
│   ├── views/                   # Vistas principales de la aplicación
│   │   ├── HomeView.vue
│   │   ├── ExploreView.vue
│   │   ├── EventDetailView.vue
│   │   ├── PublishEventView.vue
│   │   ├── FavoritesView.vue
│   │   ├── ModerationView.vue
│   │   └── ProfileView.vue
│   ├── App.vue                  # Componente raíz con efectos de iluminación ambiental
│   ├── index.css                # Tokens de diseño y estilos Tailwind CSS v4
│   └── main.ts                  # Punto de entrada (Vue + Pinia + Router)
├── firebase.json                # Configuración de Hosting y Firestore
├── firestore.rules              # Reglas de seguridad auditadas
├── firestore.indexes.json       # Índices compuestos versionados
├── package.json                 # Dependencias y scripts de ejecución
└── vite.config.ts               # Configuración de compilación Vite
```

---

## 9. Alcance del MVP y Roadmap Tecnológico

### 9.1 Qué incluye el MVP actual (Entregado y Funcional)
- [x] Homepage de alto impacto visual con llamada a la acción y buscador rápido de fecha.
- [x] Cartelera con filtros progresivos en tiempo real (búsqueda textual, categoría, momento del tiempo, precio).
- [x] Selector territorial interactivo para alternar entre Corrientes, Resistencia y Paso de la Patria.
- [x] Ficha completa de evento con fecha, ubicación, links de compra de tickets externos y badges temáticos.
- [x] Sistema de favoritos persistente $O(1)$ sin necesidad de crear cuenta ni login con contraseñas.
- [x] Formulario guiado por pasos para publicación de eventos por parte de la comunidad.
- [x] Panel de moderación y curaduría protegido por clave secreta (`VITE_ADMIN_KEY`) para publicar o rechazar propuestas.
- [x] Script de carga inicial (`seed.ts`) con catálogo de eventos representativos de la cultura litoral.

### 9.2 Qué NO incluye el MVP (Roadmap Explícito de Fases Posteriores)
- **Autenticación Completa con Roles:** Inicio de sesión formal con Google/Email y gestión de permisos jerárquicos multi-usuario para organizaciones (`OrganizerMembership` ya modelado en código).
- **Procesamiento Transaccional de Pagos:** Cobro propio de entradas integrado (hoy se delega mediante `ticketUrl` hacia ticketeras de terceros o WhatsApp del organizador).
- **Curaduría y Extracción Automática con IA (Gemini API):** Ingesta automática mediante scraping y análisis multimodal de flyers de Instagram asistido por Google Gemini (infraestructura ya declarada en `metadata.json` y dependencias de `@google/genai`).
- **Mapa Interactivo Geolocalizado:** Exploración sobre mapa vectorial tipo *"Eventos cerca de mí a menos de 2 km"*.
- **Notificaciones Push y Newsletter:** Automatización de recordatorios de eventos favoritos vía WhatsApp o correo electrónico.

---

## 10. Guía de Ejecución Local y Despliegue

### 10.1 Variables de Entorno (`.env`)
Crear un archivo `.env` en la raíz del proyecto tomando como referencia `.env.example`:

```env
# Configuración de Cloud Firestore (Spark Plan)
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_PROJECT_ID="tu-proyecto-firebase"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"

# Clave de acceso al panel de curaduría (/moderacion)
VITE_ADMIN_KEY="clave_secreta_demo"

# Credenciales de servicio para ejecutar el script de seed
GOOGLE_APPLICATION_CREDENTIALS="./serviceAccount.json"
```

### 10.2 Comandos Disponibles

```bash
# Instalar dependencias del proyecto
npm install

# Iniciar servidor de desarrollo local (puerto 3000)
npm run dev

# Validar tipado TypeScript sin emitir archivos
npm run lint

# Compilar paquete estático de producción
npm run build

# Previsualizar el build de producción localmente
npm run preview

# Poblar la base de datos Firestore mediante Admin SDK
npm run seed
```

### 10.3 Despliegue a Producción (Firebase)

```bash
# Compilar frontend
npm run build

# Desplegar Hosting y Reglas de Firestore
npx firebase deploy --only hosting,firestore
```

---

## 11. Resumen Ejecutivo de Impacto

**¿Y hoy?** transforma la forma en que los habitantes y turistas descubren el pulso cultural del Litoral argentino. Al combinar una experiencia visual atractiva, cero fricción de entrada, una base de datos escalable en Cloud Firestore y un modelo de dos lados con monetización planificada en fases, la plataforma se posiciona no solo como una solución tecnológica para un hackathon, sino como un emprendimiento viable con alto impacto comunitario y comercial.
