mkdir -p secrets  # Ensure the secrets directory exists

awk -F= '{print $1, $2}' .env | while read -r key value; do
  echo "$key=$value"
  echo "$value" > "secrets/$key"
  docker secret create "$key" "secrets/$key"
done
