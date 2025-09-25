# eLibrary

Simple eLibrary for internship assignment. Stack: .NET 8 Web API + PostgreSQL + React (Vite) + Tailwind. No Docker.

## Prereqs
- .NET 8 SDK
- Node.js + npm
- PostgreSQL (localhost:5432, user `postgres`, **password `24434`**)

## Run backend
```bash
dotnet run --project elibrary-api
```
On first run it creates the DB schema and seeds an admin and a few books.

Swagger: https://localhost:5001/swagger (port may differ, check console).

Default admin: `admin / Admin@123`.

## Run frontend
```bash
cd elibrary-web
npm install
npm run dev
```
Open the shown URL (default http://localhost:5173).

## Notes
- JWT tokens expire in ~30 min.
- All endpoints except auth require login.
- Borrow reduces availability; return increases it.
- Code is kept readable with short comments and simple structure.


### Password policy
- At least 8 characters
- Must include uppercase, lowercase, digit, and special character
