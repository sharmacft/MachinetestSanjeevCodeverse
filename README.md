# Multi-Tenant User Management System

Node.js + Express + MongoDB backend for a multi-tenant user management system where:

- One `superadmin` can create multiple masters
- Every `master` gets an isolated tenant database
- Public signup/login users stay in the shared application database
- Master-created users stay only inside that master's database
- Common CRUD APIs work only inside the correct user context

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- bcrypt password hashing

## Project Structure

```text
controllers/
middlewares/
models/
routers/
utils/
app.js
README.md
```

## Database Design

### Shared Database: `machinTestCodeverse`

Collections:

- `admins`
  - `name`
  - `email`
  - `password`
- `masters`
  - `name`
  - `email`
  - `password`
  - `dbName`
- `publicusers`
  - `name`
  - `email`
  - `password`
  - `role=public_user`
- `publicdatas`
  - `title`
  - `value`
  - `ownerId`

### Tenant Database: one DB per master

Example:

- `tenant_acme`
- `tenant_store_one`

Collections inside each tenant DB:

- `tenantusers`
  - `name`
  - `email`
  - `password`
  - `role=master_user`
  - `masterId`
- `tenantdatas`
  - `title`
  - `value`
  - `ownerId`
  - `masterId`

## Authentication Flows

### Superadmin

- `POST /superadmin/login`
- `POST /superadmin/master`
- `GET /superadmin/masters`

Default seeded superadmin:

- `email`: `superadmin@example.com`
- `password`: `admin123`

You can override these using environment variables.

### Master

- `POST /master/login`
- `POST /master/user`
- `GET /master/users`

### Public User

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/profile`

### Master User

- `POST /master/user/login`
- `GET /master/user/profile`

Note:

`POST /master/user/login` expects `masterId` in the request body so the app can resolve the correct tenant database.

## Common CRUD APIs

Authenticated public users and master users can use:

- `POST /data`
- `GET /data`
- `GET /data/:id`
- `PUT /data/:id`
- `DELETE /data/:id`

Tenant rules:

- Public users read/write only their own records in the shared database
- Master users read/write only their own records inside their tenant database
- Cross-tenant access is blocked by token context and database resolution

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and update values if needed.

### 3. Start MongoDB

Make sure MongoDB is running locally on:

```text
mongodb://127.0.0.1:27017
```

Or change `MONGO_URI` in `.env`.

### 4. Run the project

```bash
npm start
```

Server runs on:

```text
http://localhost:3000
```

## Example Request Bodies

### Superadmin login

```json
{
  "email": "superadmin@example.com",
  "password": "admin123"
}
```

### Create master

```json
{
  "name": "Master One",
  "email": "master1@example.com",
  "password": "master123"
}
```

### Public signup

```json
{
  "name": "Public User",
  "email": "public@example.com",
  "password": "public123"
}
```

### Master user login

```json
{
  "masterId": "PUT_MASTER_ID_HERE",
  "email": "tenantuser@example.com",
  "password": "tenant123"
}
```

### Create data

```json
{
  "title": "Sample Record",
  "value": {
    "description": "Tenant-safe payload"
  }
}
```

## Validation and Error Handling

Implemented:

- required field checks
- email format validation
- password minimum length validation
- role-based access control
- tenant-specific database resolution
- consistent JSON error responses

## Redis Note

The screenshot mentions Redis caching for menu listing, but the provided API scope does not include any menu module or menu listing endpoint. Because of that, Redis caching has not been added in this version.

If you want, the next step can be:

- add a `/menu` module
- cache `GET /menu` using Redis
- document Redis setup in the README

## Evaluation Checklist Mapping

- Architecture & Database Design: shared DB + isolated tenant DBs
- Authentication & Access Control: JWT + role checks
- Tenant-Specific APIs & CRUD: implemented
- Code Quality: modular routes/controllers/models/utils structure
