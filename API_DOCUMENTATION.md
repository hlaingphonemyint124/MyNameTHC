# REST API Documentation

This document describes the REST API endpoints available for the My Name THC web application.

## Base URL

All API endpoints are available at:
```
https://xjrfxjrqgdysnrbuyldt.supabase.co/functions/v1
```

## Authentication

Admin endpoints require authentication via the `Authorization` header:
```
Authorization: Bearer <your-supabase-jwt-token>
```

---

## Products API

### GET /products-api/products

Retrieve all products with optional filtering.

**Query Parameters:**
- `category` (optional): Filter by product category (Sativa, Indica, Hybrid)
- `is_new` (optional): Filter by new products (true/false)
- `is_popular` (optional): Filter by popular products (true/false)

**Example Request:**
```bash
curl https://xjrfxjrqgdysnrbuyldt.supabase.co/functions/v1/products-api/products?category=Sativa&is_popular=true
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "category": "Sativa",
      "description": "Product description",
      "thc": 20.5,
      "cbd": 1.2,
      "effects": ["energizing", "uplifting"],
      "aroma": ["citrus", "pine"],
      "flavor": ["sweet", "earthy"],
      "image_url": "https://...",
      "is_new": true,
      "is_popular": true,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

---

### GET /products-api/products/:id

Retrieve a single product by ID.

**Example Request:**
```bash
curl https://xjrfxjrqgdysnrbuyldt.supabase.co/functions/v1/products-api/products/uuid-here
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Product Name",
    ...
  }
}
```

---

### POST /products-api/products

Create a new product. **Requires admin authentication.**

**Request Body:**
```json
{
  "name": "New Product",
  "category": "Hybrid",
  "description": "A balanced hybrid strain",
  "thc": 18.5,
  "cbd": 2.0,
  "effects": ["relaxing", "creative"],
  "aroma": ["floral", "sweet"],
  "flavor": ["berry", "vanilla"],
  "image_url": "https://...",
  "is_new": true,
  "is_popular": false
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    ...
  }
}
```

---

### PUT /products-api/products/:id

Update an existing product. **Requires admin authentication.**

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "thc": 22.0,
  "is_popular": true
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    ...
  }
}
```

---

### DELETE /products-api/products/:id

Delete a product. **Requires admin authentication.**

**Example Request:**
```bash
curl -X DELETE \
  -H "Authorization: Bearer <token>" \
  https://xjrfxjrqgdysnrbuyldt.supabase.co/functions/v1/products-api/products/uuid-here
```

**Response:**
```json
{
  "message": "Product deleted successfully"
}
```

---

## Slideshows API

### GET /slideshows-api/slideshows

Retrieve all active slideshows ordered by display order.

**Example Request:**
```bash
curl https://xjrfxjrqgdysnrbuyldt.supabase.co/functions/v1/slideshows-api/slideshows
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Slideshow Title",
      "description": "Description text",
      "image_url": "https://...",
      "link_url": "https://...",
      "display_order": 1,
      "is_active": true,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

---

## Usage Examples

### JavaScript/TypeScript

```typescript
// Fetch all products
const response = await fetch('https://xjrfxjrqgdysnrbuyldt.supabase.co/functions/v1/products-api/products');
const { data, count } = await response.json();

// Filter products by category
const sativaProducts = await fetch(
  'https://xjrfxjrqgdysnrbuyldt.supabase.co/functions/v1/products-api/products?category=Sativa'
);

// Get slideshows
const slideshows = await fetch('https://xjrfxjrqgdysnrbuyldt.supabase.co/functions/v1/slideshows-api/slideshows');
```

### cURL

```bash
# Get all products
curl https://xjrfxjrqgdysnrbuyldt.supabase.co/functions/v1/products-api/products

# Get product by ID
curl https://xjrfxjrqgdysnrbuyldt.supabase.co/functions/v1/products-api/products/uuid-here

# Get slideshows
curl https://xjrfxjrqgdysnrbuyldt.supabase.co/functions/v1/slideshows-api/slideshows
```

---

## Rate Limiting

Currently, there are no rate limits on the public endpoints. However, excessive usage may be restricted in the future.

## Support

For API support or questions, contact: thcmyname@gmail.com
