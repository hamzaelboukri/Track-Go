# KoliGo

## Contributors
1. Abdelhakim Baalla  
2. Hamza Elboukri (Scrum Master)  
3. Ayoub Labit  
4. Hamza Jaafar  

## Table of Contents
1. [🚀 Project Overview](#project-overview)  
2. [✨ Key Features](#key-features)  
3. [🛠️ Technical Stack](#technical-stack)  
4. [📂 Repository Structure](#repository-structure)  
5. [⚙️ Installation & Setup](#installation--setup)  
6. [▶️ Running the Application](#running-the-application)  
7. [🔧 Development Workflow](#development-workflow)  
8. [🔁 CI / CD (GitHub Actions)](#cicd-github-actions)  
9. [🐳 Docker & Mock API](#docker--mock-api)  
10. [🧪 Testing Strategy](#testing-strategy)  
11. [🤝 Contributing](#contributing)  
12. [📄 License](#license)  

---  

### 1️⃣ Project Overview <a id="project-overview"></a>

**KoliGo** is a **React Native** mobile solution for express‑delivery companies that need a robust “last‑mile” management tool.  
It provides delivery agents with:

* Secure authentication and session handling.  
* Real‑time tour overview (list + map).  
* High‑precision barcode scanning (1D / 2D) with adaptive lighting.  
* Geotagged delivery proof (GPS + photo).  
* Incident reporting (photo, comment, status).  

The app is built for **production‑grade reliability**, with a focus on performance, maintainable architecture, and a tactical UI that mimics an operational control‑center.  

---  

### 2️⃣ Key Features <a id="key-features"></a>

| Feature | Description |
|---|---|
| **Auth & Session** | Secure login, JWT handling, persisted session. |
| **Tour Dashboard** | FlatList‑optimized mission list, interactive map view. |
| **Smart Scan** | Expo‑camera‑based barcode scanner, low‑light compensation, validation of parcel IDs. |
| **Geo‑Certified Proof** | Automatic GPS capture on delivery confirmation, stored with photo evidence. |
| **Incident Logging** | Multi‑step form, photo capture, comment field, automatic geotagging. |
| **Dark‑Mode** | System‑aware theming with NativeWind. |
| **Performance** | JSI‑based optimizations, memoization, `getItemLayout` for FlatList. |
| **Extensible Architecture** | File‑based navigation (Expo Router), context‑based global state, TypeScript‑strict data models. |
| **CI / CD** | Linting, type‑checking, optional build pipeline. |
| **Dockerised Mock API** | JSON‑Server with realistic parcel data. |

---  

### 3️⃣ Technical Stack <a id="technical-stack"></a>

| Layer | Technology |
|---|---|
| **Framework** | Expo SDK 54 (React Native 0.76+) |
| **Language** | TypeScript (strict mode) |
| **Navigation** | Expo Router (file‑based) |
| **State Management** | React Context + useReducer (persistent providers) |
| **Animations** | React Native Reanimated (physics‑based) |
| **Styling** | NativeWind (Tailwind‑CSS) or StyleSheet |
| **Camera / Scan** | expo‑camera + custom HUD overlay |
| **Geolocation** | expo‑location (background tracking) |
| **Maps** | react‑native‑maps |
| **Network** | Axios wrapper in `services/` |
| **Persistence** | AsyncStorage (fallback) / expo‑sqlite |
| **Testing** | Jest + React Native Testing Library |
| **CI** | GitHub Actions (ESLint, Prettier, TypeScript) |
| **Docker** | JSON‑Server for mock API (`docker-compose.yml`) |

---  

### 4️⃣ Repository Structure <a id="repository-structure"></a>

```
/app
 ├─ (tabs)            # Main navigation: Home, Map, Scan, Profile
 ├─ parcel            # Feature modules: Delivery, Incident
 ├─ onboarding.tsx    # First‑run onboarding flow
/assets                # Images, icons, fonts
/components            # Atomic UI components (Button, Card, etc.)
/constants             # Theme, colors, typography tokens
/contexts              # Auth, Tour, Telemetry providers
/hooks                 # Reusable custom hooks
/services              # API client (axios) and helper utilities
/types                 # TypeScript interfaces & enums
```

---  

### 5️⃣ Installation & Setup <a id="installation--setup"></a>

```bash
# 1️⃣ Clone the repository
git clone https://github.com/Abdelhakim-Baalla/KoliGo.git
cd KoliGo

# 2️⃣ Install Node dependencies
npm install

# 3️⃣ Install Expo CLI globally (if not already)
npm i -g expo

# 4️⃣ Install Docker (required for mock API)
#    Follow the official Docker Desktop installation guide for Windows.
```

> **Note** – The project uses **npm workspaces**; all packages are installed with the single `npm install` command.

---  

### 6️⃣ Running the Application <a id="running-the-application"></a>

#### ▶️ Start the mock API (Docker)

```bash
docker-compose up -d   # launches json-server on http://localhost:3000
```

#### ▶️ Launch the Expo development server

```bash
npm run dev            # or: expo start
```

- Scan the QR code with **Expo Go** on a physical device or run an Android/iOS simulator.  
- The app will automatically fetch parcel data from the mock API.

---  

### 7️⃣ Development Workflow <a id="development-workflow"></a>

| Step | Command | Description |
|---|---|---|
| **Start mock API** | `docker-compose up -d` | Runs JSON‑Server with seeded data. |
| **Run lint & type‑check** | `npm run lint && npm run ts` | Enforces code quality. |
| **Watch for changes** | `npm run dev` | Starts Expo with hot‑reloading. |
| **Generate new screen** | `npx expo-router generate <path>` | Creates file‑based route. |
| **Add new TypeScript type** | Edit `/types/*.ts` | Keep data contracts centralized. |

**Best Practices**

* Keep components **single‑responsibility**.  
* Re‑use UI via the `components/` folder.  
* Use `useReducer` for complex state (e.g., tour status).  
* Write unit tests for every new hook/service.

---  

### 8️⃣ CI / CD (GitHub Actions) <a id="cicd-github-actions"></a>

`.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
    branches: [ main ]

jobs:
  lint-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node
        uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run ts   # tsc --noEmit
```

*Optional* – Add a **build** job that runs `eas build --profile production` when a tag is pushed.

---  

### 9️⃣ Docker & Mock API <a id="docker--mock-api"></a>

**Dockerfile** (only for the mock API)

```Dockerfile
# Dockerfile - mock-api
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY db.json .
RUN npm install -g json-server

EXPOSE 3000
CMD ["json-server", "--watch", "db.json", "--port", "3000", "--host", "0.0.0.0"]
```

**docker‑compose.yml**

```yaml
version: "3.9"
services:
  mock-api:
    build: .
    container_name: koligo-mock-api
    ports:
      - "3000:3000"
    restart: unless-stopped
```

Running `docker-compose up -d` brings up the API at `http://localhost:3000/parcels`.

---  

### 🔟 Testing Strategy <a id="testing-strategy"></a>

| Layer | Tool |
|---|---|
| **Unit** | Jest (`npm test`) – covers hooks, services, reducers. |
| **Component** | React Native Testing Library – renders components with mock navigation/context. |
| **E2E** | Expo + Detox (optional) – simulate full user flow on simulators. |

Add a **test** script in `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

---  

### 🤝 Contributing <a id="contributing"></a>

1. Fork the repository.  
2. Create a feature branch (`git checkout -b feat/<description>`).  
3. Follow the **coding standards** (`npm run lint`).  
4. Write tests for new logic.  
5. Submit a Pull Request; CI will run automatically.  

> **Please** keep the folder structure and naming conventions as described in the *Repository Structure* section.

---  

### 📄 License <a id="license"></a>

This project is licensed under the **MIT License** – see `LICENSE` for details.