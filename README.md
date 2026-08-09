# FundsERP - Wholesale/Distribution CRM & ERP

A complete full-stack ERP and CRM solution tailored for wholesale and distribution companies. This system manages customers, products, inventory, purchase orders, sales challans, and CRM follow-ups, with role-based access control.

## 🔗 Live Demo Links

- **Frontend Application:** https://mini-erp-gilt-sigma.vercel.app/
- **Backend API:** https://mini-erp-qbz6.onrender.com

### 🔑 Test Credentials

| Role      | Email                   | Password  |
|-----------|-------------------------|-----------|
| Admin     | kk6547015@gmail.com     | 12345678  |
| Sales     | raj@gmail.com           | 12345678  |
| Warehouse | rohan@gmail.com         | 12345678  |
| Accounts  | rahul@gmail.com         | 12345678  |

*(Note: The Admin can create new users with Sales, Warehouse, and Accounts roles directly from the Users dashboard in the live app).*

---

## 🛠 Tech Stack

**Frontend:** React, Vite, TailwindCSS, Axios, Lucide Icons  
**Backend:** Node.js, Express.js, Prisma ORM, JWT Authentication, bcrypt  
**Database:** MySQL (Hosted on Aiven Cloud)  
**DevOps/Deployment:** Vercel (Frontend), Render (Backend), Docker, GitHub Actions (CI/CD)

---

## 🏛 Architecture Overview

The application follows a decoupled monolith architecture, separated into a React Single Page Application (SPA) and an Express REST API. 

1. **Authentication & Security:** Uses secure, HTTP-only cookies with JWTs for authentication. The frontend and backend communicate seamlessly via CORS configurations tailored for the specific deployment URLs.
2. **Database:** Prisma ORM is used for type-safe database interactions with a highly normalized MySQL schema.
3. **CI/CD & Containerization:** The application is fully Dockerized. A GitHub Actions pipeline is configured to automatically test builds and push Docker images to the GitHub Container Registry (GHCR) upon every push to the `main` branch.

---

## 🚀 Local Setup Instructions

### Prerequisites
- Node.js (v20+)
- Docker & Docker Compose (Optional but recommended)
- A local MySQL database (or a cloud instance)

### Option 1: Running with Docker (Recommended)
The easiest way to run the entire stack locally is using Docker Compose.

1. Clone the repository:
   ```bash
   git clone https://github.com/Kunal455/Mini_ERP.git
   cd Mini_ERP
   ```
2. Create a `.env` file in the `Backend` directory based on the provided `.env.example` (or use the one provided by the evaluator). Ensure you set `DATABASE_URL`.
3. Run Docker Compose from the root directory:
   ```bash
   docker-compose up --build
   ```
4. Access the frontend at `http://localhost:80`. The backend runs on `http://localhost:5000`.

### Option 2: Running Manually

**1. Backend Setup**
```bash
cd Backend
npm install
# Create a .env file with DATABASE_URL, JWT_SECRET, FRONTEND_URL, PORT
npx prisma generate
npx prisma db push
npm start
```

**2. Frontend Setup**
```bash
cd Frontend
npm install
# Ensure you have a .env file with VITE_API_URL pointing to the backend
npm run dev
```

---

## ☁️ Deployment Documentation

The application is deployed using modern cloud platforms:

- **Database:** Hosted on **Aiven Cloud (MySQL)**.
- **Backend:** Hosted on **Render** as a Web Service. Connected to GitHub for continuous deployment. Environment variables (`DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`) are securely injected via Render's dashboard.
- **Frontend:** Hosted on **Vercel**. Connected to GitHub for continuous deployment. The API URL is injected via the `VITE_API_URL` environment variable during the build step.
- **Docker/CI:** GitHub Actions automatically builds and publishes Docker images to GHCR.

---

## ⚠️ Known Limitations & Incomplete Parts
- **Typescript Migration:** While the assignment requested TypeScript, the current backend is built in JavaScript (Node.js/Express) to prioritize feature completeness and rapid delivery within the deadline.
- **Export to PDF:** The frontend table currently allows printing the screen, but native PDF generation (bonus point) using a library like `jspdf` is not yet fully implemented.
- **AWS S3 Images:** Product images currently rely on URLs rather than direct AWS S3 uploads (bonus point).

---

## 📝 API Documentation
A Postman collection (`FundsERP_Postman_Collection.json`) is included in the root of this repository. Import it into Postman to view and test all available endpoints, request bodies, and expected responses.
