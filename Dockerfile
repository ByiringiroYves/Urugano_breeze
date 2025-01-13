# Use Node.js LTS image
FROM node:22

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the application source code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
