# Backend

EcoNova is a decentralized charity management system that enables transparent and secure donations using blockchain technology. It allows users to contribute to verified charitable organizations across different categories, ensuring trust, security, and efficiency in the donation process.

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/Imdavyking/econova/
   ```
2. Install dependencies:
   ```
   cd econova/backend
   yarn
   ```
3. Configure X Request API credentials:

   - Obtain your X Request API credentials from the X Developer Portal.
   - Open the `.env` file and update the following values with your credentials:
     ```
        MONGO_URI=
        TWITTER_CONSUMER_KEY=
        TWITTER_CONSUMER_SECRET=
        TWITTER_ACCESS_TOKEN=
        TWITTER_ACCESS_TOKEN_SECRET=
        TWITTER_USER_ID=
        TWITTER_BEARER_TOKEN=
        REDIS_HOST=
        REDIS_PORT=
        REDIS_PASSWORD=
        NODE_ENV=
        OPENAI_API_KEY=
        JWT_SECRET=
        PORT=
        PRIVATE_KEY=
        FRONTEND_URL=
        CHAIN_ID=
        WRAPPED_SONIC_CONTRACT_ADDRESS=
        ALLORA_API_KEY=
        ALLORA_NETWORK=
        API_SCAN_VERIFIER_KEY=
     ```

4. **Start the application locally**:
   - Make sure Redis is running locally or on a remote server.
   - If you're using Redis locally, start it with the following command:
     ```bash
     redis-server
     ```
   - Then, start the application:
     ```bash
     yarn dev
     ```

## Usage

### Get single tweets

**Endpoint:** `GET /api/tweets/:id`

**Example Request:**

```bash
curl -X GET http://localhost:3100/api/tweets/1883180110297120857
```

**Example Response:**

```json
{
  "_id": "67950c24e1289710853e35af",
  "edit_history_tweet_ids": ["1883184787340349875"],
  "id": "1883184787340349875",
  "text": "In a digital realm filled with complexities, EcoNova serves as the savvy navigator guiding you through the maze of blockchain wonders with wit and wisdom. Step into the world of smart contracts and innovation, where every byte holds a story waiting to be unraveled."
}
```

### Get all tweets

**Endpoint:** `GET /api/tweets`

**Example Request:**

```bash
curl -X GET http://localhost:3100/api/tweets
```

**Example Response:**

```json
[
  {
    "_id": "67950c24e1289710853e35af",
    "edit_history_tweet_ids": ["1883184787340349875"],
    "id": "1883184787340349875",
    "text": "In a digital realm filled with complexities, EcoNova serves as the savvy navigator guiding you through the maze of blockchain wonders with wit and wisdom. Step into the world of smart contracts and innovation, where every byte holds a story waiting to be unraveled."
  },
  {
    "_id": "12345c24e1289710853e35af",
    "edit_history_tweet_ids": ["1883184787340349876"],
    "id": "1883184787340349876",
    "text": "Excited to explore new opportunities in blockchain! #innovation #smartcontracts"
  }
]
```

### Get liking users for a tweet

**Endpoint:** `GET /api/tweets/:id/liking-users`

**Example Request:**

```bash
curl -X GET http://localhost:3100/api/tweets/1883180110297120857/liking-users
```

**Example Response:**

```json
{
  "data": [
    {
      "id": "716078211797487616",
      "name": "davyĸιng",
      "username": "im_davyking"
    }
  ],
  "meta": {
    "result_count": 1,
    "next_token": "7140dibdnow9c7btw4b0pn1kiz13e29yg8uwbc15seipg"
  }
}
```

### Get retweeters for a tweet

**Endpoint:** `GET /api/tweets/:id/retweeters`

**Example Request:**

```bash
curl -X GET http://localhost:3100/api/tweets/1883180110297120857/retweeters
```

**Example Response:**

```json
{
  "data": [
    {
      "id": "716078211797487616",
      "name": "davyĸιng",
      "username": "im_davyking"
    }
  ],
  "meta": {
    "result_count": 1,
    "next_token": "7140dibdnow9c7btw4b0pn1kiz13e2bhpk9u8x8dja3ao"
  }
}
```

### Get retweeters for a tweet

**Endpoint:** `GET /api/tweets/:id/retweeters`

**Example Request:**

```bash
curl -X GET http://localhost:3100/api/tweets/1883180110297120857/retweeters
```

**Example Response:**

```json
{
  "data": [
    {
      "id": "716078211797487616",
      "name": "davyĸιng",
      "username": "im_davyking"
    }
  ],
  "meta": {
    "result_count": 1,
    "next_token": "7140dibdnow9c7btw4b0pn1kiz13e2bhpk9u8x8dja3ao"
  }
}
```

## Contributing

Contributions to the EcoNova Backend System are welcome! If you have any suggestions, bug reports, or feature requests, please create an issue in the GitHub repository. If you would like to contribute code, please fork the repository and submit a pull request.

## License

This project is licensed under the [MIT License](https://github.com/Imdavyking/econova/blob/main/LICENSE).
