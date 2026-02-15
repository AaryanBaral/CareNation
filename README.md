# CareNation - Binary Marketing Commerce Platform

CareNation is a comprehensive **Binary Marketing Commerce Website** that integrates traditional e-commerce with a powerful Multi-Level Marketing (MLM) engine. It is designed to empower users to earn commissions through a binary tree structure, where each distributor can recruit two direct referrals, expanding their network and earning potential through product purchases and team sales.

## 🚀 Project Overview

The system consists of a unified **.NET 8 Backend** serving three distinct **React Frontend Applications**:

1.  **CareNation-Client**: The customer-facing e-commerce store where users browse products, add to cart, and place orders.
2.  **CareNation-Distributor**: A dedicated portal for distributors to manage their binary tree, view commissions, track wallet balances, and request withdrawals.
3.  **CareNation-Admin**: A powerful dashboard for administrators to manage users, products, orders, payouts, reports, and system settings.

## 💡 Core Features & Business Logic

### 1. Binary Marketing System
The core of CareNation is its **Binary Tree Structure**.
-   **Structure**: Each user can have a maximum of **2 direct children** (Left and Right legs). Further referrals "spill over" to the next available position in the tree, helping downlines grow.
-   **Placement Logic**: The system automatically validates placement to ensure new members are added correctly under their sponsors.

### 2. Income & Commission Logic
The platform implements a sophisticated commission engine calculated on the backend:

-   **Binary Commission (Matching Bonus)**:
    -   Triggered when there is matching sales volume on both Left and Right legs.
    -   **Rule**: A minimum of **5,000 PV** (Point Value) on both sides matches to generate **600 Currency** in commission.
    -   **Daily Caps**: Maximum daily earnings are capped based on the user's Rank (e.g., Beginner: 12,000, Nation: 60,000).

-   **Direct Sponsor Bonus**:
    -   The referrer earns a **flat 10%** of the sale amount for every direct purchase made by their referrals.

-   **Repurchase Income**:
    -   When existing users make repeat purchases, commissions are distributed **11 levels up** the hierarchy.
    -   **Distribution**: 10% (Level 1), 8% (Level 2), 6% (Level 3), down to 1% (Levels 8-11).

### 3. Rank & Rewards System
Users advance through ranks based on their personal purchase volume and team performance.
-   **Ranks**: Beginner, Area, Zonal, Regional, Nation (based on personal purchase).
-   **Leadership Ranks**: Executive to Global Director (based on matched team sales volume).

### 4. Fund Distribution (The 58% Rule)
On repurchase sales, **58% of the PV** is allocated to special funds and company shares:
-   **Company Share**: 8%
-   **Royalty Fund**: 20% (Shared among Silver+ ranks)
-   **Travel Fund**: 10% (Shared among Gold+ ranks)
-   **Car Fund**: 10% (Shared among Star+ ranks)
-   **House Fund**: 10% (Shared among Star+ ranks)

---

## 🛠 Tech Stack

### Backend
-   **Framework**: .NET 8 (ASP.NET Core Web API)
-   **Database**: MySQL 8.0 (Managed via Entity Framework Core)
-   **Authentication**: JWT (JSON Web Tokens) with Role-Based Authorization
-   **Payment Gateway**: Khalti Integration
-   **Documentation**: Swagger UI

### Frontend
-   **Framework**: React.js (Vite)
-   **Styling**: Tailwind CSS, Radix UI
-   **State/Data Fetching**: TanStack Query (React Query), Axios
-   **Routing**: React Router DOM

---

## 📂 Project Structure

This is a monorepo containing all components of the system:

```text
CareNation/
├── CareNation-Backend/        # .NET 8 Web API (Core Logic, DB, Auth)
├── CareNation-Client/         # Customer Shopping Store (React + Vite)
├── CareNation-Distributor/    # Distributor Portal (Tree, Wallet, Reports)
├── CareNation-Admin/          # Admin Dashboard (Management & Logistics)
└── README.md                  # Project Documentation
```

---

## ⚙️ Setup & Installation

Follow these steps to run the project locally.

### Prerequisites
-   Node.js `18+` (v20 Recommended)
-   .NET SDK `8.0`
-   MySQL Server `8.0`

### 1. Backend Setup (`CareNation-Backend`)
The backend is the heart of the system. Configure it first.

1.  Navigate to the directory:
    ```bash
    cd CareNation-Backend
    ```
2.  Update `appsettings.json` with your MySQL connection string and credentials.
3.  Run database migrations (if needed) or simply start the server to seed/create DB:
    ```bash
    dotnet restore
    dotnet run
    ```
    *The server will start at `http://localhost:5127`.*

### 2. Client App Setup (`CareNation-Client`)
The public-facing shopping store.

1.  Open a new terminal:
    ```bash
    cd CareNation-Client
    npm install
    npm run dev
    ```

### 3. Distributor App Setup (`CareNation-Distributor`)
The portal for networkers.

1.  Open a new terminal:
    ```bash
    cd CareNation-Distributor
    npm install
    npm run dev
    ```

### 4. Admin App Setup (`CareNation-Admin`)
The control panel.

1.  Open a new terminal:
    ```bash
    cd CareNation-Admin
    npm install
    npm run dev
    ```

> **Note**: Vite will automatically assign ports (usually 5173, 5174, 5175). Ensure the backend CORS configuration in `Program.cs` or `appsettings.json` matches these ports.

---

## 🔑 Key API Endpoints (Backend)

The backend exposes a comprehensive REST API. Full documentation is available via Swagger at `http://localhost:5127/swagger` when running in development mode.

-   **Auth**: `/api/Auth/login`, `/api/Auth/register`
-   **Distributor**: `/api/Distributor/tree`, `/api/Distributor/downline`
-   **Commerce**: `/api/Product`, `/api/Order`, `/api/Cart`
-   **Financials**: `/api/CommissionPayout`, `/api/WithdrawalRequest`

---

## 🛡 Security Note
Sensitive configuration (JWT Keys, Payment Secrets, DB Passwords) should be stored in **Environment Variables** or `.NET User Secrets` in a production environment, rather than hardcoded in `appsettings.json`.
