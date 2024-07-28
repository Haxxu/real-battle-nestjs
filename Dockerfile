# Use the official Node.js image with Alpine Linux
FROM node:19-alpine as development

# Set the working directory
WORKDIR D:\Programming\Projects\learning-nesttjs\real-battle-nestjs\boilerplate-nestjs

# Copy package files and install dependencies
COPY package*.json ./

RUN npm install glob rimraf

RUN npm install --only=development

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Use another Linux image for the final production stage
FROM node:19-alpine as production

# Set the environment variable
ENV NODE_ENV=production

# Set the working directory
WORKDIR D:\Programming\Projects\learning-nesttjs\real-battle-nestjs\boilerplate-nestjs

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy built application from development stage
COPY --from=development D:\Programming\Projects\learning-nesttjs\real-battle-nestjs\boilerplate-nestjs\dist D:\Programming\Projects\learning-nesttjs\real-battle-nestjs\boilerplate-nestjs\dist

# Command to run the application
CMD ["node", "dist/main"]
