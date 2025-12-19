# Library Management System – UAS Kelompok 9

This repository contains a complete library management application
consisting of a **React (Vite)** frontend and two backend
implementations:

* **Pyramid + SQLAlchemy (default)** – This backend lives in the
  `backend/` directory and is designed to comply with the UAS
  specification (Python Pyramid, SQLAlchemy ORM with PostgreSQL and
  Alembic migrations).  It reads the database URL from a
  `DATABASE_URL` environment variable (as provided by Railway) or
  from the `sqlalchemy.url` setting in `development.ini`.  There is no
  longer a fallback to SQLite – if no database URL is configured the
  application will fail to start.  Use this backend for your final
  submission and when deploying to Railway with a PostgreSQL
  database.

* **FastAPI (optional)** – For environments where Pyramid and its
  dependencies are unavailable (such as this sandbox), an alternate
  backend lives in the `backend_fastapi/` directory.  It uses Python’s
  built‑in `sqlite3` and exposes endpoints with the same shapes as
  the Pyramid version.  This implementation is provided solely for
  development and testing in constrained environments.  **Do not
  submit the FastAPI backend as your UAS solution** since it does not
  satisfy the requirement to use Pyramid/SQLAlchemy/PostgreSQL.

## Project Structure

```
uas‑paw‑kelompok‑9‑main/
├── backend/           ← Pyramid/SQLAlchemy backend (for UAS submission)
├── backend_fastapi/   ← optional FastAPI fallback backend
├── frontend/          ← React + Vite frontend
└── README.md          ← this file
```

### Backend – Pyramid/SQLAlchemy

The primary backend lives in the `backend/` directory.  It is a
Pyramid WSGI application that uses SQLAlchemy ORM to manage a
PostgreSQL database.  Passwords are hashed using bcrypt and JSON Web
Tokens (JWT) are used for session management.  Three core models
(`User`, `Book` and `Borrowing`) define the database schema, and
Alembic is used to handle migrations under `backend/alembic/`.

  The application requires either a `DATABASE_URL` environment variable
  or a valid `sqlalchemy.url` entry in `development.ini` pointing to
  your PostgreSQL database.  There is **no** SQLite fallback.  If
  neither is provided, the backend will raise an error on startup.  A
  convenience script `seed_data.py` is included to populate the
  database with initial users and books; it also honours
  `DATABASE_URL`.

#### Running the Pyramid backend

1. **Install dependencies** – On your development machine or CI
   environment run:

   ```bash
   pip install -r backend/requirements.txt
   ```

   These dependencies include Pyramid, SQLAlchemy, psycopg2‑binary,
   Alembic, bcrypt, PyJWT, python‑dotenv and Waitress.  You do not
   need to install FastAPI or Uvicorn for the Pyramid backend.

2. **Configure the database** – Set the `DATABASE_URL` environment
   variable to your Railway PostgreSQL connection string.  For
   example:

   ```bash
   export DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>
   ```

   Alternatively edit `backend/development.ini` and update the
   `sqlalchemy.url` value.  Do **not** commit secrets to version
   control.

3. **Run database migrations** – Initialise the database schema using
   Alembic:

   ```bash
   cd backend
   alembic upgrade head
   ```

   This command applies all migrations found in `backend/alembic/versions/`.

4. **Seed the database** (optional) – To insert sample users and books
   run:

   ```bash
   python backend/seed_data.py
   ```

5. **Start the server** – Use the included `run.py` script to run the
   application with Waitress:

   ```bash
   cd backend
   python run.py
   ```

   By default the application listens on `http://localhost:6543`.  You
   can override the port by setting the `PORT` environment variable.

#### Backend endpoints

The Pyramid backend exposes a RESTful API under the `/api` prefix.
Examples include:

- `POST /api/auth/register` – create a new user
- `POST /api/auth/login` – authenticate a user
- `GET /api/books` – list all books
- `POST /api/books/create` – add a new book (librarian only)
- `PUT /api/books/{id}/update` – update a book
- `DELETE /api/books/{id}/delete` – delete a book (when no active borrowings)
- `GET /api/borrowings` – list borrowings (with optional status filter)
- `POST /api/borrowings/borrow` – borrow a book
- `POST /api/borrowings/{id}/return` – return a book
- `POST /api/borrowings/{id}/approve` – approve a pending borrow (librarian)
- `POST /api/borrowings/{id}/deny` – deny a borrow and return the book

Each endpoint returns a JSON object with a `success` flag, an
optional `message`, and a `data` property containing the result.  The
frontend has been coded to accept this structure and remains
unchanged.

### Optional Backend – FastAPI/SQLite

For the sake of completeness and offline development in this
restricted environment, we include an alternate backend under
`backend_fastapi/`.  It is **not** compliant with the UAS
specification but provides the same endpoints using FastAPI and
SQLite.  If you cannot install Pyramid/SQLAlchemy on your local
machine, you can experiment with this backend.  To run it:

```bash
cd backend
PORT=6543 python -c "import uvicorn; from backend_fastapi.main import app; uvicorn.run(app, host='0.0.0.0', port=6543)"
```

The API path remains `/api` so the frontend works unchanged.  Do
not deploy this backend for your final UAS submission.

### Frontend (React + Vite)

The frontend is a React application bootstrapped with Vite.  It uses
Axios to communicate with the API and provides pages for login,
registration, browsing books, managing inventory (for librarians) and
viewing borrowing transactions.  During development the Vite server
proxies all requests starting with `/api` to `localhost:6543` so
there are no CORS issues.

#### Running the frontend

Because this environment cannot reach the public npm registry, the
frontend dependencies cannot be installed here.  On your own machine
with Node.js installed you can run the following commands from the
`frontend` directory:

```bash
cd uas‑paw‑kelompok‑9‑main/frontend
npm install              # install dependencies
npm run dev              # start Vite dev server on http://localhost:5173
```

The `vite.config.js` file proxies `/api` requests to
`http://localhost:6543`, which should match the default port of the
FastAPI backend.  When you are ready to deploy the frontend, run

```bash
npm run build
```

The compiled static assets will be written to `frontend/dist`.  You
can then configure your web server (or use FastAPI’s `StaticFiles`)
to serve those files.  For example, you could add the following to
`backend_fastapi/main.py` if you wish to serve the built frontend
directly from FastAPI:

```python
from fastapi.staticfiles import StaticFiles
app.mount("/", StaticFiles(directory="../frontend/dist", html=True), name="static")
```

### Testing

The FastAPI backend has been tested using FastAPI’s `TestClient` to
ensure registration, login, book management and borrowing flows all
work correctly.  An example test script can be found in the root
directory under `test_integration.py` (not included by default).  You
can run it with:

```bash
python test_integration.py
```

This script exercises registration, authentication, listing books,
creating a book, borrowing and returning a book.

---

If you encounter issues or have suggestions for improvement, feel free
to open an issue or contribute to the project.  We hope this
refactored implementation makes it easier to deploy and maintain your
library management system.