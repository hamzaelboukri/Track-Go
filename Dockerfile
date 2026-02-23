# Dockerfile for Track&Go Expo app
FROM node:20-alpine

# Install expo-cli globally
RUN npm install -g expo-cli

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Expose Expo default port
EXPOSE 8081

# Start Expo
CMD ["expo", "start", "--tunnel", "--non-interactive"]
