FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

# Copy project files
COPY frontend/ .

# Expose port
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"] 