#!/bin/bash

create_secrets() {
  local dir="$1"
  echo "Entering $dir/ and creating secrets..."
  
  cd "$dir" || { echo "Failed to enter $dir"; exit 1; }

  mkdir -p secrets  # Ensure the secrets directory exists

  awk -F= '{print $1, $2}' .env | while read -r key value; do
    echo "$key=$value"
    echo "$value" > "secrets/$key"
    docker secret create "$key" "secrets/$key" || echo "Failed to create secret: $key"
  done

  cd - > /dev/null  # Return to the previous directory
}

# Run the function for both frontend and backend
create_secrets "frontend"
create_secrets "backend"
