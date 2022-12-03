# Define the image to build from; the latest LTS versiomn 16 of node
FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependancies
#   NOTE: A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json

# Ensure NPM CErtificates are reconized via the provided PEM file (if any)
#COPY cert.pem ./
#RUN npm config set cafile ./cert.pem

# Install NPM packages
RUN npm Install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

# Bind to $port
EXPOSE $port

# Run the app
# i.e. `node _index.js` => []
CMD [ "node", "_index.js" ]

# Confirm Docker image was created:
# docker images

# docker network create api
# docker ps
# docker network inspect api
# docker logs <ContainerID>
# docker exec -it <ContainerID> /bin/bash
# docker exec -it <ContainerID> curl -X GET http://localhost:3000/
