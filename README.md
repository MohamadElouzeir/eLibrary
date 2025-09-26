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

Swagger: https://localhost:5001/swagger 

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


### Password policy
- At least 8 characters
- Must include uppercase, lowercase, digit, and special character
