awk -F= '{print $2}' .env | while read -r line; do
  key=$(echo "$line" | cut -d '=' -f 1)
  value=$(echo "$line" | cut -d '=' -f 2-)
  echo -n "$value" > "secrets/$key"
  docker secret create "$key" "secrets/$key"
done
