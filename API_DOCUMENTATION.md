# API Documentation - Ecommerce Final

## Base URL
```
http://localhost:8080/api
```

---

## PRODUCTS ENDPOINTS

### 1. List Products with Pagination, Filters & Sorting

**Endpoint:** `GET /products`

**Description:** Retrieves a paginated list of products with optional filtering and sorting capabilities.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 10 | Number of products per page |
| `page` | integer | 1 | Page number |
| `query` | string | null | Filter by category or availability (case-insensitive) |
| `sort` | string | null | Sort by price: `asc` (ascending) or `desc` (descending) |

**Example Requests:**
```
GET /products?limit=10&page=1
GET /products?query=electronics
GET /products?sort=asc
GET /products?limit=20&page=2&query=electronics&sort=desc
```

**Response:**
```json
{
  "status": "success",
  "payload": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Laptop Gaming",
      "description": "High performance gaming laptop",
      "code": "LG-001",
      "price": 1500,
      "status": true,
      "stock": 10,
      "category": "electronics",
      "thumbnails": [],
      "createdAt": "2026-01-10T10:00:00Z",
      "updatedAt": "2026-01-10T10:00:00Z"
    }
  ],
  "totalPages": 5,
  "prevPage": null,
  "nextPage": 2,
  "page": 1,
  "hasPrevPage": false,
  "hasNextPage": true,
  "prevLink": null,
  "nextLink": "/api/products?page=2&limit=10"
}
```

**Status Codes:**
- `200 OK` - Successfully retrieved products
- `500 Internal Server Error` - Server error

---

### 2. Get Product by ID

**Endpoint:** `GET /products/:pid`

**Description:** Retrieves a specific product by its MongoDB ObjectId.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `pid` | string | MongoDB ObjectId of the product |

**Example Request:**
```
GET /products/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Laptop Gaming",
  "description": "High performance gaming laptop",
  "code": "LG-001",
  "price": 1500,
  "status": true,
  "stock": 10,
  "category": "electronics",
  "thumbnails": [],
  "createdAt": "2026-01-10T10:00:00Z",
  "updatedAt": "2026-01-10T10:00:00Z"
}
```

**Status Codes:**
- `200 OK` - Product found
- `404 Not Found` - Product not found

---

### 3. Create Product

**Endpoint:** `POST /products`

**Description:** Creates a new product in the database.

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "code": "string (required, must be unique)",
  "price": "number (required, must be > 0)",
  "status": "boolean (required)",
  "stock": "number (required, default: 0, must be >= 0)",
  "category": "string (required)",
  "thumbnails": ["array of strings (optional)"]
}
```

**Example Request:**
```json
{
  "title": "Laptop Gaming",
  "description": "High performance gaming laptop",
  "code": "LG-001",
  "price": 1500,
  "status": true,
  "stock": 10,
  "category": "electronics",
  "thumbnails": []
}
```

**Response:** Returns the created product with generated `_id` and timestamps

**Status Codes:**
- `201 Created` - Product successfully created
- `400 Bad Request` - Missing required fields or validation error
- `500 Internal Server Error` - Server error

---

### 4. Update Product

**Endpoint:** `PUT /products/:pid`

**Description:** Updates an existing product. The product ID cannot be changed.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `pid` | string | MongoDB ObjectId of the product |

**Request Body:**
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "code": "string (optional, must be unique if changed)",
  "price": "number (optional)",
  "status": "boolean (optional)",
  "stock": "number (optional)",
  "category": "string (optional)",
  "thumbnails": ["array of strings (optional)"]
}
```

**Example Request:**
```json
{
  "price": 1400,
  "stock": 8
}
```

**Response:** Returns the updated product

**Status Codes:**
- `200 OK` - Product successfully updated
- `400 Bad Request` - Validation error
- `404 Not Found` - Product not found

---

### 5. Delete Product

**Endpoint:** `DELETE /products/:pid`

**Description:** Deletes a product from the database.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `pid` | string | MongoDB ObjectId of the product |

**Example Request:**
```
DELETE /products/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "message": "Producto eliminado"
}
```

**Status Codes:**
- `200 OK` - Product successfully deleted
- `404 Not Found` - Product not found

---

## CARTS ENDPOINTS

### 6. Create Cart

**Endpoint:** `POST /carts`

**Description:** Creates a new empty shopping cart.

**Request Body:** Empty

**Example Request:**
```
POST /carts
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "products": [],
  "createdAt": "2026-01-10T10:00:00Z",
  "updatedAt": "2026-01-10T10:00:00Z"
}
```

**Status Codes:**
- `201 Created` - Cart successfully created
- `500 Internal Server Error` - Server error

---

### 7. Get Cart by ID (with Populated Products)

**Endpoint:** `GET /carts/:cid`

**Description:** Retrieves a cart with all its products fully populated (complete product details).

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `cid` | string | MongoDB ObjectId of the cart |

**Example Request:**
```
GET /carts/507f1f77bcf86cd799439012
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "products": [
    {
      "_id": "507f1f77bcf86cd799439000",
      "product": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Laptop Gaming",
        "description": "High performance gaming laptop",
        "code": "LG-001",
        "price": 1500,
        "status": true,
        "stock": 10,
        "category": "electronics",
        "thumbnails": []
      },
      "quantity": 3
    }
  ],
  "createdAt": "2026-01-10T10:00:00Z",
  "updatedAt": "2026-01-10T10:00:00Z"
}
```

**Status Codes:**
- `200 OK` - Cart found
- `404 Not Found` - Cart not found

---

### 8. Add Product to Cart

**Endpoint:** `POST /carts/:cid/products/:pid`

**Description:** Adds a product to the cart. If the product already exists, increments its quantity by 1.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `cid` | string | MongoDB ObjectId of the cart |
| `pid` | string | MongoDB ObjectId of the product |

**Request Body:** Empty

**Example Request:**
```
POST /carts/507f1f77bcf86cd799439012/products/507f1f77bcf86cd799439011
```

**Response:** Returns the updated cart with all products

**Status Codes:**
- `200 OK` - Product successfully added
- `400 Bad Request` - Invalid IDs or product not found
- `404 Not Found` - Cart not found

---

### 9. Update Product Quantity in Cart

**Endpoint:** `PUT /carts/:cid/products/:pid`

**Description:** Updates ONLY the quantity of a specific product in the cart.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `cid` | string | MongoDB ObjectId of the cart |
| `pid` | string | MongoDB ObjectId of the product |

**Request Body:**
```json
{
  "quantity": "number (required, must be > 0)"
}
```

**Example Request:**
```json
{
  "quantity": 5
}
```

**Response:** Returns the updated cart

**Status Codes:**
- `200 OK` - Quantity successfully updated
- `400 Bad Request` - Invalid quantity or IDs
- `404 Not Found` - Cart or product in cart not found

---

### 10. Delete Product from Cart

**Endpoint:** `DELETE /carts/:cid/products/:pid`

**Description:** Removes a specific product from the cart.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `cid` | string | MongoDB ObjectId of the cart |
| `pid` | string | MongoDB ObjectId of the product |

**Example Request:**
```
DELETE /carts/507f1f77bcf86cd799439012/products/507f1f77bcf86cd799439011
```

**Response:** Returns the updated cart without the deleted product

**Status Codes:**
- `200 OK` - Product successfully removed
- `400 Bad Request` - Invalid IDs
- `404 Not Found` - Cart not found

---

### 11. Update All Cart Products

**Endpoint:** `PUT /carts/:cid`

**Description:** Replaces all products in the cart with a new array of products.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `cid` | string | MongoDB ObjectId of the cart |

**Request Body:**
```json
{
  "products": [
    {
      "product": "string (MongoDB ObjectId)",
      "quantity": "number (must be > 0)"
    }
  ]
}
```

**Example Request:**
```json
{
  "products": [
    {
      "product": "507f1f77bcf86cd799439011",
      "quantity": 2
    },
    {
      "product": "507f1f77bcf86cd799439013",
      "quantity": 1
    }
  ]
}
```

**Response:** Returns the updated cart with the new products

**Status Codes:**
- `200 OK` - Cart successfully updated
- `400 Bad Request` - Invalid products array or IDs
- `404 Not Found` - Cart not found

---

### 12. Empty Cart (Delete All Products)

**Endpoint:** `DELETE /carts/:cid`

**Description:** Removes all products from the cart, leaving it empty.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `cid` | string | MongoDB ObjectId of the cart |

**Example Request:**
```
DELETE /carts/507f1f77bcf86cd799439012
```

**Response:** Returns the empty cart

**Response Example:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "products": [],
  "createdAt": "2026-01-10T10:00:00Z",
  "updatedAt": "2026-01-10T10:00:00Z"
}
```

**Status Codes:**
- `200 OK` - Cart successfully emptied
- `400 Bad Request` - Invalid cart ID
- `404 Not Found` - Cart not found

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error description message"
}
```

### Common Error Scenarios:

**Invalid MongoDB ObjectId:**
```json
{
  "error": "ID de carrito o producto inválido"
}
```

**Product not found:**
```json
{
  "error": "Producto no encontrado"
}
```

**Cart not found:**
```json
{
  "error": "Carrito no encontrado"
}
```

**Missing required field:**
```json
{
  "error": "Faltan campos requeridos"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding for production use.

---

## Authentication

Currently no authentication is implemented. Recommend implementing JWT for production.

---

## Version History

- **v1.0** (2026-01-10) - Initial release with MongoDB integration

---

## Support

For issues or questions, contact the development team.

---

**Last Updated:** 2026-01-10
**API Version:** 1.0
**Status:** Production Ready
