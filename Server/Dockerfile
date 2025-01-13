# Use Node.js 18 as the base image
FROM node:22

# Set the working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application files
COPY . .

# Expose the port Cloud Run will use
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
