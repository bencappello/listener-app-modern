FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copy project files
COPY frontend/ .

# Expose port
EXPOSE 3000

# Command to run the application in development mode
CMD ["npm", "run", "dev"] 