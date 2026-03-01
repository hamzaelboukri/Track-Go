# Onboarding Guide for Track&Go Project

Welcome to the Track&Go project! This guide will help you get started quickly and efficiently, whether you are a developer, tester, or project manager.

## 1. Project Overview
Track&Go is a mobile solution for express transport companies, focusing on last-mile delivery management. The app enables delivery personnel to manage their rounds, provide indisputable proof of delivery (geolocation, scan, photos), and handle real-world conditions (scan errors, incidents).

## 2. Prerequisites
- Node.js (LTS version recommended)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio/Emulator or Expo Go (for mobile testing)
- Docker & Docker Compose (for mock API server)
- Git

## 3. Project Setup
1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd KoliGO
   ```
2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```
3. **Start the mock API server:**
   ```sh
   docker-compose up -d
   ```
   The mock API is powered by JSON-Server and runs in a Docker container.
4. **Start the Expo app:**
   ```sh
   npm start
   # or
   expo start
   ```
5. **Open the app:**
   - Scan the QR code with Expo Go (Android/iOS) or run on an emulator.

## 4. Project Structure
- `app/` - Main application code (navigation, screens)
- `components/` - Reusable UI components
- `constants/` - Colors, labels, and other constants
- `contexts/` - React Contexts for global state
- `hooks/` - Custom React hooks
- `lib/` - Utility libraries (e.g., query client)
- `server/` - Mock API server and data
- `services/` - API calls and data fetching logic
- `shared/` - Shared TypeScript types and schemas

## 5. Development Workflow
- **Branching:**
  - Use feature branches (e.g., `feature/scan-validation`)
  - Main branches: `main`, `develop`
- **Commits:**
  - Write clear, descriptive commit messages
- **Pull Requests:**
  - All code must go through PR review
  - CI/CD checks (lint, type-check, build) must pass

## 6. Running Tests
- (Add instructions here if tests are available)

## 7. Linting & Type Checking
- Lint your code before pushing:
  ```sh
  npm run lint
  ```
- Type-check your code:
  ```sh
  npm run type-check
  ```

## 8. Docker
- The project includes a `Dockerfile` and `docker-compose.yml` for the mock API server.
- To stop the server:
  ```sh
  docker-compose down
  ```

## 9. CI/CD
- GitHub Actions are set up to run linting, type-checking, and (optionally) build on every PR.

## 10. Useful Commands
- `npm start` - Start the Expo app
- `docker-compose up -d` - Start the mock API server
- `npm run lint` - Run linter
- `npm run type-check` - Run TypeScript type checks

## 11. Troubleshooting
- If you encounter issues with dependencies, try deleting `node_modules` and reinstalling.
- For Docker issues, ensure Docker Desktop is running.
- For mobile device issues, ensure your device is on the same network as your computer.

## 12. Resources
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

## 13. Contact
For any questions or help, contact the project maintainer or open an issue on GitHub.

---

Happy coding and welcome to Track&Go!
