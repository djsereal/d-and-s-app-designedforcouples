# Use the official Node.js 20 image
FROM node:20

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY backend/package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Run database migrations (replace with your migration command if different)
RUN npm run migrate

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"]