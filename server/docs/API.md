# Secure LMS — API Documentation

Welcome to the Secure LMS API documentation. Our API is built on Express.js and follows RESTful principles, utilizing predictable resource-oriented URLs, standard HTTP verbs, and JSON-encoded responses.

## Interactive API Reference (Swagger UI)
For the most up-to-date, interactive documentation, including request schemas and live testing capabilities, please visit our Swagger UI portal:
* **Live API Docs:** [http://54.229.212.77/api/docs](http://54.229.212.77/api/docs) *(Requires active server deployment)*
* **Local API Docs:** `http://localhost:4000/api/docs`

---

## Authentication
Most API endpoints require authentication via JSON Web Tokens (JWT). 

1. **Access Token:** Must be included in the `Authorization` header as a Bearer token.
   ```http
   Authorization: Bearer <your_access_token>

```

2. **Refresh Token:** Automatically handled securely via `httpOnly` cookies (`refreshToken`).

---

## Core Resource Domains

The API is segmented into the following core modules. (See the live Swagger UI for full parameter and response schemas).

* **`/api/auth`** — Registration, login, token refresh, and password resets.
* **`/api/users`** — Profile management and account settings.
* **`/api/courses`** — Public course catalog, detailed course data, and search.
* **`/api/categories`** — Course categorization and filtering.
* **`/api/enrollments`** — Student course enrollments and access validation.
* **`/api/progress`** — Tracking student completion across modules and lessons.
* **`/api/payments`** — Checkout initialization and Paystack webhook processing.
* **`/api/instructor`** — Course creation, management, and instructor analytics.
* **`/api/admin`** — Global system oversight, audit logs, and user management.

---

## Standard Error Responses

The API uses conventional HTTP response codes to indicate the success or failure of an API request.

* `200 OK` - The request was successful.
* `201 Created` - The resource was successfully created.
* `400 Bad Request` - The request was unacceptable, often due to missing a required parameter or failing schema validation.
* `401 Unauthorized` - No valid API token provided or token expired.
* `403 Forbidden` - The API key doesn't have permissions to perform the request (RBAC enforcement).
* `404 Not Found` - The requested resource doesn't exist.
* `429 Too Many Requests` - Rate limit exceeded.
* `500 Internal Server Error` - Something went wrong on the server side.

 