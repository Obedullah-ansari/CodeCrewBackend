# Use an official Node.js runtime as a base image
FROM node:16

# Set the working directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Copy app files
COPY . .

# Expose the port
EXPOSE 4000

# Start the application
CMD ["npm", "start"]

