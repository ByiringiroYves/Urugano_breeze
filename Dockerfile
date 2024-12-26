# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire application source code to the working directory
COPY . .

# Expose the application port (adjust if your app uses a different port)
EXPOSE 5000

# Define the command to start the application
CMD ["npm", "start"]
