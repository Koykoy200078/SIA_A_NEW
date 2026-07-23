# SIA_A_NEW — Users CRUD API

Express 5 + MySQL REST API for managing user records.

## Requirements

- Node.js 18+
- MySQL 5.7+ or 8.x

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create the database, table, and sample data:

   ```bash
   mysql -u root -p < schema.sql
   ```

3. Check the connection settings in `index.js` match your MySQL install:

   ```js
   const db = mysql.createConnection({
     host: 'localhost',
     user: 'root',
     password: 'Carvs@10072000',
     database: 'mydb',
   });
   ```

4. Start the server:

   ```bash
   node index.js
   ```

   Expected output:

   ```
   Server is running with port:  1234
   ✅ DB is connected !
   ```

Base URL: `http://localhost:1234`

## Data model

Table: `users`

| Column       | Type         | Notes                                      |
| ------------ | ------------ | ------------------------------------------ |
| `id`         | INT          | Primary key, auto-increment                |
| `name`       | VARCHAR(100) | Required                                   |
| `email`      | VARCHAR(150) | Required, unique                           |
| `phone`      | VARCHAR(20)  | Optional                                   |
| `address`    | VARCHAR(255) | Optional                                   |
| `created_at` | TIMESTAMP    | Set automatically on insert                |
| `updated_at` | TIMESTAMP    | Set automatically on insert and any update |

`schema.sql` seeds 10 sample rows.

## Endpoints

| Method | Path               | Purpose                       |
| ------ | ------------------ | ----------------------------- |
| GET    | `/users`           | List all users                |
| GET    | `/user/:user_id`   | Get one user by id            |
| POST   | `/create-user`     | Create a user                 |
| PUT    | `/update-user/:id` | Replace all fields of a user  |
| PATCH  | `/patch-user/:id`  | Update only the fields you send |
| DELETE | `/delete-user/:id` | Delete a user                 |

---

### GET /users

List every user.

```bash
curl http://localhost:1234/users
```

Response `200`:

```json
[
  {
    "id": 1,
    "name": "Juan Dela Cruz",
    "email": "juan.delacruz@example.com",
    "phone": "09171234567",
    "address": "Brgy. Poblacion, Cebu City",
    "created_at": "2026-07-17T07:50:00.000Z",
    "updated_at": "2026-07-17T07:50:00.000Z"
  }
]
```

---

### GET /user/:user_id

Get a single user.

```bash
curl http://localhost:1234/user/1
```

Response `200`: an array containing the matching row. An unknown id returns an empty array `[]`, not a 404.

---

### POST /create-user

Create a user. All four fields go in the JSON body.

```bash
curl -X POST http://localhost:1234/create-user \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test.user@example.com",
    "phone": "09171112222",
    "address": "Lapu-Lapu City, Cebu"
  }'
```

Response `200`: the raw MySQL result object. `insertId` holds the new user's id.

```json
{
  "fieldCount": 0,
  "affectedRows": 1,
  "insertId": 11,
  "serverStatus": 2,
  "warningStatus": 0
}
```

Note: `email` is unique. Reusing an existing email crashes the server — see [Known issues](#known-issues).

---

### PUT /update-user/:id

Replace every field on a user. Send all four — any field you leave out is written as `null`.

```bash
curl -X PUT http://localhost:1234/update-user/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Dela Cruz Jr.",
    "email": "juan.jr@example.com",
    "phone": "09171234567",
    "address": "Mandaue City, Cebu"
  }'
```

Response `200`:

```json
{ "status": true, "message": "Successfully updated !" }
```

---

### PATCH /patch-user/:id

Update only the fields you include. Everything else stays as-is. This is the difference from PUT: to change just a phone number, PATCH takes one field where PUT would need all four.

```bash
curl -X PATCH http://localhost:1234/patch-user/1 \
  -H "Content-Type: application/json" \
  -d '{ "phone": "09990001111" }'
```

Response `200`:

```json
{ "status": true, "message": "Successfully patched !" }
```

Patch several fields at once:

```bash
curl -X PATCH http://localhost:1234/patch-user/1 \
  -H "Content-Type: application/json" \
  -d '{ "phone": "09990001111", "address": "Talisay City, Cebu" }'
```

Only `name`, `email`, `phone`, and `address` are accepted. Any other key in the body is ignored, which is what keeps the generated `SET` clause safe from injection.

Errors:

| Status | Body                                                       | Cause                                        |
| ------ | ---------------------------------------------------------- | -------------------------------------------- |
| `400`  | `{ "status": false, "message": "No valid fields to update !" }` | Body empty, or held no accepted field |
| `404`  | `{ "status": false, "message": "User not found !" }`       | No user with that id                         |

---

### DELETE /delete-user/:id

Delete a user permanently.

```bash
curl -X DELETE http://localhost:1234/delete-user/11
```

Response `200`:

```json
{ "status": true, "message": "Successfully deleted !" }
```

Response `404` when the id does not exist:

```json
{ "status": false, "message": "User not found !" }
```

## Quick walkthrough

Create, read, patch, then delete a record:

```bash
# 1. Create — note the insertId in the response
curl -X POST http://localhost:1234/create-user \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo","email":"demo@example.com","phone":"09170000000","address":"Cebu"}'

# 2. Read it back (use the insertId from step 1)
curl http://localhost:1234/user/11

# 3. Patch just the address
curl -X PATCH http://localhost:1234/patch-user/11 \
  -H "Content-Type: application/json" \
  -d '{"address":"Davao City"}'

# 4. Delete
curl -X DELETE http://localhost:1234/delete-user/11
```

To reset the data back to the original 10 rows, re-run `schema.sql` after dropping the table:

```bash
mysql -u root -p -e "DROP TABLE mydb.users;"
mysql -u root -p < schema.sql
```

## Known issues

These are real limitations of the current code, worth knowing before you build on it.

**The DB password is hardcoded and committed.** `index.js:17` holds the MySQL root password in plain text, and it is in git history. Move it to a `.env` file loaded with `dotenv`, add `.env` to `.gitignore`, and rotate the password.

**Most routes crash the server on a DB error.** `GET /users`, `GET /user/:id`, `POST /create-user`, and `PUT /update-user/:id` all use `if (error) throw error` inside the query callback. Because the throw happens in an async callback, Express cannot catch it — the process exits. Posting a duplicate email is enough to take the server down. PATCH and DELETE have the same `throw`, though their missing-row cases are handled.

**No input validation.** `POST` and `PUT` accept any body. Omitted fields become `null` or trigger a NOT NULL error rather than a 400.

**`GET /user/:id` returns `[]` for an unknown id** instead of a 404, unlike PATCH and DELETE which do return 404. The responses are inconsistent across the API.
