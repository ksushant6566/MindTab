# Reading Lists API Documentation

This document describes how to interact with the Reading Lists API from external applications.

## Cross-Origin Resource Sharing (CORS)

This API endpoint supports CORS, which means it can be called from web applications on different domains. The API allows:

-   Requests from any origin (`Access-Control-Allow-Origin: *`)
-   POST and OPTIONS methods
-   Headers: Content-Type, Authorization, and x-api-key

## Authentication

The API supports two authentication methods:

### 1. Session Authentication (For Web App Users)

If you're calling the API from the web application, your session cookie will automatically authenticate you.

### 2. API Key Authentication (For External Integrations)

For external applications, use an API key:

1. Set the `READING_LIST_API_KEY` environment variable on your server.
2. Include this key in the `x-api-key` header of your requests.

Example:

```bash
curl -X POST https://yourdomain.com/api/reading-lists/sync \
  -H "x-api-key: your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

## Endpoints

### Sync Reading List

Synchronize reading list items from an external source.

**URL**: `/api/reading-lists/sync`

**Method**: `POST`

**Auth required**: Yes (Session or API Key)

**Content-Type**: `application/json`

**Request Body**:

```json
{
  "userId": "string",
  "items": [
    {
      "title": "string",
      "url": "string",
      "source": "string",
      "description": "string (optional)",
      "tags": ["string"] (optional),
      "dateAdded": "ISO date string (optional)"
    }
  ]
}
```

**Example Request with API Key**:

```bash
curl -X POST https://yourdomain.com/api/reading-lists/sync \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key_here" \
  -d '{
    "userId": "user123",
    "items": [
      {
        "title": "The Future of Web Development",
        "url": "https://example.com/articles/future-web-dev",
        "source": "Example Blog",
        "description": "An article about emerging trends in web development",
        "tags": ["web", "development", "tech"],
        "dateAdded": "2023-07-15T14:30:00Z"
      }
    ]
  }'
```

**Successful Response**:

```json
{
    "success": true,
    "message": "Successfully received reading list sync request for user user123 with 1 items",
    "itemCount": 1
}
```

**Error Responses**:

-   `401 Unauthorized`: If authentication fails
-   `400 Bad Request`: If the request body is invalid
-   `500 Internal Server Error`: If an unexpected error occurs

## Notes

-   The `url` field must be a valid URL format
-   The `dateAdded` field should be in ISO 8601 format (e.g., "2023-07-15T14:30:00Z")
-   The API currently only logs the received data and does not store it in the database
-   When using API key authentication, you must provide the user ID in the request body
