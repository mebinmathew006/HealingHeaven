
FROM node:20-alpine

WORKDIR /app

# Copy package.json and yarn.lock (if available)
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Install Tailwind CSS and its dependencies
# RUN yarn add -D tailwindcss postcss autoprefixer

# Initialize Tailwind if it hasn't been already
# RUN if [ ! -f tailwind.config.js ]; then npx tailwindcss init -p; fi

# Expose the port your app runs on
EXPOSE 5173

# Start the app with hot reloading enabled
CMD ["yarn", "dev", "--host", "0.0.0.0"]