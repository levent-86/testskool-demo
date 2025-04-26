# Use Node.js image
FROM node:20.18.0

# Set up the working directory
WORKDIR /frontend

# Copy the project
COPY . .

# install dependencies
RUN npm install

# Run server command
CMD ["npm", "run", "dev", "--", "--host"]
