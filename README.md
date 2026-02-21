# Product Ratings & Review Analytics Dashboard

A full-stack dashboard for product performance, customer feedback, category ratings, and review analytics. Upload CSV/Excel data, view charts, and filter by category and rating.

## Prerequisites

- **Node.js** (v16 or later)
- **PostgreSQL** (local or hosted, e.g. [Neon](https://neon.tech))

## Setup

### 1. Backend

1. Go to the backend folder and install dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file in the `backend` folder with your database and server settings:

   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=assessment_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_SSL=false
   ```

   For a hosted DB (e.g. Neon), use that host, database, user, password, and set `DB_SSL=true` if required.

3. Start the backend (it will create the `sales` table on first run):

   ```bash
   npm start
   ```

   You should see something like:

   ```
   Connected to PostgreSQL (localhost/assessment_db)
   Server running on port 5000
   ```

### 2. Frontend

1. Install dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. (Optional) To point the app at a specific API URL, create a `.env` file in the `frontend` folder:

   ```env
   VITE_API_URL=http://localhost:5000
   ```

   If you leave this unset, the dev server will proxy `/api` to `http://localhost:5000`.

3. Start the frontend:

   ```bash
   npm run dev
   ```

   The app will be at **http://localhost:3000**.

## How to Run

1. Start the **backend** (from `backend`):

   ```bash
   npm start
   ```

2. Start the **frontend** (from `frontend`):

   ```bash
   npm run dev
   ```

3. Open **http://localhost:3000** in your browser.

4. Use **Upload Data** to import a CSV or Excel file (e.g. product name, category, rating, review count, discount). The **Dashboard** tab shows charts; the **Sales** tab shows filters and trends.

## Project Structure

- **backend/** – Node.js + Express API, PostgreSQL, upload and analytics routes
- **frontend/** – React + Vite, MUI, Redux Toolkit, Recharts
- **backend/sample_data.csv** – Example CSV for testing import

## API Overview

| Endpoint                       | Description                                                                                                                      |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/upload`             | Upload CSV/Excel and import into `sales`                                                                                         |
| `GET /api/sales/summary`       | Total revenue, quantity, and sales (optional `startDate`, `endDate`)                                                             |
| `GET /api/sales/filter`        | Filter sales by product, category, region, dates                                                                                 |
| `GET /api/sales/trends`        | Revenue/quantity trends (`groupBy`: daily, weekly, monthly)                                                                      |
| `GET /api/analytics/dashboard` | Products per category, top reviewed, discount distribution, category ratings (optional `category`, `productSearch`, `minRating`) |
