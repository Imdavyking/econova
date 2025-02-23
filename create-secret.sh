#!/bin/bash

create_secrets() {
  local dir="$1"
  echo "Entering $dir/ and creating secrets..."

  cd "$dir" || { echo "Failed to enter $dir"; exit 1; }

  # Ensure secrets/ directory exists
  mkdir -p secrets  

  # Ensure secrets/ is in .gitignore
  if [ ! -f ".gitignore" ]; then
    touch ".gitignore"
  fi

  if ! grep -q "^secrets/$" ".gitignore"; then
    echo "secrets/" >> ".gitignore"
    echo "Added 'secrets/' to $dir/.gitignore"
  fi

  # Process the .env file and create secrets
  awk -F= '{print $1, $2}' .env | while read -r key value; do
    echo "$value" > "secrets/$key"

    # Check if the secret already exists
    if docker secret ls | awk '{print $2}' | grep -q "^$key$"; then
      echo "Updating secret $key..."
      echo "$value" | docker secret rm "$key" && docker secret create "$key" "secrets/$key"
    else
      docker secret create "$key" "secrets/$key" && echo "Secret $key created successfully!" || echo "Failed to create secret: $key"
    fi
  done

  # ✅ Remove secrets directory after all secrets are created
  rm -rf secrets/

  cd - > /dev/null  # Return to the previous directory
}

# Run the function for both frontend and backend
create_secrets "frontend"
create_secrets "backend"

echo "Script execution completed!"
