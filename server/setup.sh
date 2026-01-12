#!/bin/bash
# save as: setup.sh in chugli-backend folder

echo "🚀 Setting up Chugli Backend..."

# Create directory structure
mkdir -p src/{config,models,controllers,routes,middlewares,services,socket,utils,validators,schedulers}

# Check if all required files exist
required_files=(
  "src/config/db.config.js"
  "src/config/env.config.js"
  "src/config/cors.config.js"
  "src/models/user.model.js"
  "src/models/room.model.js"
  "src/controllers/auth.controller.js"
  "src/controllers/room.controller.js"
  "src/routes/auth.routes.js"
  "src/routes/room.routes.js"
  "src/routes/index.js"
  "src/middlewares/auth.middleware.js"
  "src/middlewares/error.middleware.js"
  "src/middlewares/validate.middleware.js"
  "src/middlewares/rateLimiter.middleware.js"
  "src/services/email.service.js"
  "src/services/token.service.js"
  "src/services/otp.service.js"
  "src/socket/socket.config.js"
  "src/socket/socket.auth.js"
  "src/socket/room.socket.js"
  "src/utils/ApiError.js"
  "src/utils/ApiResponse.js"
  "src/utils/asyncHandler.js"
  "src/utils/constants.js"
  "src/validators/auth.validator.js"
  "src/validators/room.validator.js"
  "src/schedulers/ghost.scheduler.js"
  "src/app.js"
  "src/server.js"
)

echo "Checking files..."
missing=0
for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Missing: $file"
    missing=$((missing + 1))
  fi
done

if [ $missing -eq 0 ]; then
  echo "✅ All files present!"
else
  echo "⚠️  $missing files missing. Create them first!"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "✅ Setup complete!"