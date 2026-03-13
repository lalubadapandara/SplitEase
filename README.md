# SplitEase — Expense Sharing App

> A full-stack MERN application for splitting shared expenses among groups — like Splitwise, built from scratch.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Installation & Setup](#installation--setup)
7. [Environment Variables](#environment-variables)
8. [Running the App](#running-the-app)
9. [Demo Mode](#demo-mode)
10. [API Reference](#api-reference)
    - [Authentication](#authentication)
    - [Users](#users)
    - [Groups](#groups)
    - [Expenses](#expenses)
    - [Settlements](#settlements)
11. [Database Schema](#database-schema)
12. [Frontend Architecture](#frontend-architecture)
    - [Pages](#pages)
    - [Components](#components)
    - [Hooks](#hooks)
    - [Utilities](#utilities)
    - [Context](#context)
13. [Splitting Logic](#splitting-logic)
14. [Debt Simplification Algorithm](#debt-simplification-algorithm)
15. [Folder Structure (Full)](#folder-structure-full)
16. [Scripts Reference](#scripts-reference)
17. [Troubleshooting](#troubleshooting)

---

## Overview

SplitEase is a web application that helps groups of people track and split shared expenses fairly. Whether you are on a trip with friends, sharing an apartment, or organizing a team lunch — SplitEase keeps track of who paid what, calculates who owes whom, and simplifies repayments to the minimum number of transactions.

**Core problem it solves:**
When multiple people share expenses, tracking debts manually becomes confusing. SplitEase automates the math, so you always know exactly where you stand — and settling up is as simple as one click.

---

## Features

| Feature | Description |
|---|---|
| User Authentication | Secure register and login with JWT tokens. Passwords are hashed using bcryptjs. |
| Groups | Create named groups with a custom emoji icon. Add members by email address. |
| Expense Tracking | Log expenses with a title, amount, category, date, and description. |
| Multiple Split Methods | Split expenses equally, by custom amounts, by percentage, or by weighted shares. |
| Balance Calculation | Automatic real-time calculation of each member's running balance in a group. |
| Debt Simplification | An algorithm minimises the number of payments needed to settle all group debts. |
| Settlement Recording | Record that a payment was made, specifying the method (Cash, UPI, Bank Transfer, Online). |
| Dashboard | At-a-glance summary of total owed, total you owe, net balance, and a spending chart. |
| Expense History | Full list of all expenses across groups, with search and category filtering. |
| Profile Management | View and update your name and phone number. |
| Demo Mode | The app works entirely in the browser without a database, using pre-loaded sample data. |

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express.js | 4.18 | HTTP server and routing |
| MongoDB | 6+ | Primary database |
| Mongoose | 7.3 | ODM for MongoDB |
| jsonwebtoken | 9.0 | Stateless authentication |
| bcryptjs | 2.4 | Password hashing (12 salt rounds) |
| dotenv | 16.0 | Environment variable loading |
| cors | 2.8 | Cross-origin resource sharing |
| nodemon | 3.0 | Dev server auto-restart |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.2 | UI library |
| React Router DOM | 6.14 | Client-side routing |
| Vite | 4.4 | Build tool and dev server |
| Axios | 1.4 | HTTP client with interceptors |
| Chart.js | 4.4 | Doughnut chart for spending breakdown |
| react-hot-toast | 2.4 | Toast notification system |
| date-fns | 2.30 | Date formatting utilities |

---

## Project Structure

```
splitease/
├── package.json                  ← Root scripts (runs both server + client)
├── README.md
│
├── server/                       ← Express.js Backend
│   ├── index.js                  ← Entry point, DB connection, middleware
│   ├── package.json
│   ├── .env.example
│   │
│   ├── middleware/
│   │   └── auth.js               ← JWT verification middleware
│   │
│   ├── models/
│   │   ├── User.js               ← User schema + password hashing hooks
│   │   ├── Group.js              ← Group schema
│   │   ├── Expense.js            ← Expense schema with participants array
│   │   └── Settlement.js         ← Settlement/payment schema
│   │
│   └── routes/
│       ├── auth.js               ← POST /register, POST /login
│       ├── users.js              ← GET/PUT /me, GET /search
│       ├── groups.js             ← Full CRUD + balance calculation
│       ├── expenses.js           ← Full CRUD + dashboard summary
│       └── settlements.js        ← GET by group, POST new settlement
│
└── client/                       ← React Frontend (Vite)
    ├── index.html
    ├── package.json
    ├── vite.config.js            ← Proxy /api → localhost:5000
    │
    └── src/
        ├── main.jsx              ← ReactDOM.createRoot, BrowserRouter
        ├── App.jsx               ← Route definitions, AuthProvider, Toaster
        │
        ├── assets/
        │   └── index.css         ← Global CSS with custom properties (design tokens)
        │
        ├── context/
        │   └── AuthContext.jsx   ← Global auth state, login/logout/register
        │
        ├── hooks/
        │   ├── useAuth.js        ← Consumes AuthContext
        │   ├── useGroups.js      ← Fetches + caches groups, demo fallback
        │   └── useExpenses.js    ← Fetches expenses by group or all, demo fallback
        │
        ├── utils/
        │   ├── api.js            ← Axios instance + all API call functions
        │   ├── constants.js      ← Category config, split methods, demo data
        │   └── helpers.js        ← formatCurrency, getInitials, simplifyDebts, etc.
        │
        ├── components/
        │   ├── layout/
        │   │   ├── AppLayout.jsx     ← Sidebar + <Outlet> wrapper
        │   │   └── Sidebar.jsx       ← Navigation links, user info, logout
        │   │
        │   ├── auth/
        │   │   ├── AuthBrand.jsx     ← Left-side branding panel (features list)
        │   │   ├── LoginForm.jsx     ← Email + password form
        │   │   └── RegisterForm.jsx  ← Name + email + password form
        │   │
        │   ├── dashboard/
        │   │   ├── StatCard.jsx      ← Single balance stat block
        │   │   └── SpendingChart.jsx ← Chart.js doughnut by category
        │   │
        │   ├── groups/
        │   │   ├── GroupCard.jsx         ← Linked card showing icon, name, member avatars
        │   │   ├── CreateGroupModal.jsx  ← Form with icon picker + member email search
        │   │   └── MemberBalanceBar.jsx  ← Row showing member name + their balance
        │   │
        │   ├── expenses/
        │   │   ├── ExpenseItem.jsx       ← Single expense row with category icon
        │   │   ├── AddExpenseModal.jsx   ← Full expense form with split method selector
        │   │   └── ExpenseFilters.jsx    ← Search input + category dropdown
        │   │
        │   ├── settlements/
        │   │   ├── SettleModal.jsx       ← Confirm + record a payment
        │   │   └── TransactionRow.jsx    ← Displays one simplified debt transaction
        │   │
        │   └── ui/
        │       ├── Modal.jsx         ← Reusable overlay modal with Escape key support
        │       ├── Avatar.jsx        ← Initials-based avatar in sm/md/lg sizes
        │       ├── EmptyState.jsx    ← Centred empty state with icon, title, action slot
        │       └── Tabs.jsx          ← Button-based tab switcher
        │
        └── pages/
            ├── LoginPage.jsx         ← Auth layout + LoginForm
            ├── RegisterPage.jsx      ← Auth layout + RegisterForm
            ├── DashboardPage.jsx     ← Stats, recent expenses, chart, active groups
            ├── GroupsPage.jsx        ← Grid of GroupCards + create button
            ├── GroupDetailPage.jsx   ← Tabs: Expenses | Balances | Settle Up
            ├── ExpensesPage.jsx      ← Filtered list of all user expenses
            └── ProfilePage.jsx       ← Edit name/phone, view stats, logout
```

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher — [Download](https://nodejs.org)
- **npm** v9 or higher (comes with Node.js)
- **MongoDB** v6 or higher — [Download](https://www.mongodb.com/try/download/community) *(or use MongoDB Atlas for a free cloud instance)*

Verify your versions:
```bash
node --version    # Should be v18+
npm --version     # Should be v9+
mongod --version  # Should be v6+
```

---

## Installation & Setup

### Step 1 — Extract the project

```bash
unzip splitease-mern.zip
cd splitwise-app
```

### Step 2 — Install all dependencies

```bash
npm run install:all
```

This installs both server and client dependencies in one command. Alternatively, install them manually:

```bash
cd server && npm install
cd ../client && npm install
```

### Step 3 — Configure the backend environment

```bash
cd server
cp .env.example .env
```

Open `.env` in your editor and set your values (see [Environment Variables](#environment-variables) below).

---

## Environment Variables

Create a file at `server/.env` based on `server/.env.example`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/splitease
JWT_SECRET=your_strong_secret_key_here
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Port the Express server listens on |
| `MONGO_URI` | Yes | `mongodb://localhost:27017/splitease` | MongoDB connection string |
| `JWT_SECRET` | Yes | `splitease_secret_key_2024` | Secret key for signing JWT tokens |

> **Important:** Never commit your `.env` file to version control. Always use a strong, randomly generated string for `JWT_SECRET` in production. If you are using MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string in the format `mongodb+srv://username:password@cluster.mongodb.net/splitease`.

---

## Running the App

### Option A — Run both servers together (recommended)

From the root of the project:

```bash
npm install       # installs concurrently (one-time only)
npm run dev       # starts server on :5000 and client on :3000
```

### Option B — Run servers separately

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# MongoDB connected
# Server running on port 5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# Local: http://localhost:3000/
```

### Open in browser

```
http://localhost:3000
```

---

## Demo Mode

SplitEase includes a built-in demo mode that works **without MongoDB or a backend running**. This is useful for exploring the UI or developing the frontend independently.

**How it activates:** When API calls fail (because the server or MongoDB is not running), the app automatically falls back to pre-loaded in-memory data.

**To use demo mode:** Open the app, enter any email address and any password on the login screen, and click Sign In.

**Pre-loaded demo data:**

| Resource | Details |
|---|---|
| Users | Rahul Sharma, Aman Gupta, Neha Singh, Priya Patel |
| Groups | Goa Trip (✈️), Flat 304 (🏠), College Friends (🎓) |
| Expenses | Hotel Booking ₹8000, Seafood Dinner ₹3200, Monthly Rent ₹30000, Electricity Bill ₹2400, Movie Tickets ₹1200 |

**Demo member emails** you can add to groups in demo mode:
- `aman@example.com`
- `neha@example.com`
- `priya@example.com`

> All changes made in demo mode exist in React state only and reset when the page is refreshed.

---

## API Reference

All protected routes require the header:
```
Authorization: Bearer <your_jwt_token>
```

The token is returned upon login or registration and expires after **7 days**.

---

### Authentication

**Base path:** `/api/auth`

#### POST `/api/auth/register`

Create a new user account.

**Request body:**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "securepassword"
}
```

**Success — 201 Created:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64abc123...",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "avatar": "",
    "phone": "",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Errors:** `400 All fields required` | `400 Email already registered` | `500 Server error`

---

#### POST `/api/auth/login`

Authenticate an existing user.

**Request body:**
```json
{
  "email": "rahul@example.com",
  "password": "securepassword"
}
```

**Success — 200 OK:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "_id": "...", "name": "Rahul Sharma", "email": "rahul@example.com" }
}
```

**Errors:** `400 Invalid credentials`

---

### Users

**Base path:** `/api/users` — All routes require authentication.

#### GET `/api/users/me`

Get the currently authenticated user's profile (password excluded).

**Success — 200 OK:** Returns the full user object.

---

#### PUT `/api/users/me`

Update the current user's profile. All fields are optional.

**Request body:**
```json
{
  "name": "Rahul Kumar",
  "phone": "+91 98765 43210",
  "avatar": "https://example.com/photo.jpg"
}
```

**Success — 200 OK:** Returns the updated user object.

---

#### GET `/api/users/search?email=`

Search for users by email (case-insensitive partial match). Returns up to 5 results, excluding the current user.

**Success — 200 OK:**
```json
[
  { "_id": "...", "name": "Aman Gupta", "email": "aman@example.com", "avatar": "" }
]
```

---

### Groups

**Base path:** `/api/groups` — All routes require authentication.

#### GET `/api/groups`

Get all groups the current user belongs to, sorted newest first.

**Success — 200 OK:**
```json
[
  {
    "_id": "64def456...",
    "name": "Goa Trip",
    "icon": "✈️",
    "creator": { "_id": "...", "name": "Rahul Sharma" },
    "members": [
      { "_id": "...", "name": "Rahul Sharma", "email": "rahul@example.com", "avatar": "" }
    ],
    "createdAt": "2024-01-15T00:00:00.000Z"
  }
]
```

---

#### POST `/api/groups`

Create a new group. The authenticated user is automatically added as a member.

**Request body:**
```json
{
  "name": "Goa Trip",
  "icon": "✈️",
  "memberEmails": ["aman@example.com", "neha@example.com"]
}
```

**Success — 201 Created:** Returns the new group with populated member objects.

---

#### GET `/api/groups/:id`

Get a single group by its ID.

**Success — 200 OK:** Full group object with populated members and creator.

**Errors:** `403 Not a member` | `404 Group not found`

---

#### POST `/api/groups/:id/members`

Add a new member to a group by their registered email address.

**Request body:**
```json
{ "email": "priya@example.com" }
```

**Success — 200 OK:** Returns the updated group with the new member added.

**Errors:** `400 Already a member` | `404 User not found`

---

#### GET `/api/groups/:id/balances`

Calculate current balances for all members of a group, accounting for all expenses and recorded settlements. Also returns a simplified list of transactions to settle all debts.

**Success — 200 OK:**
```json
{
  "balances": {
    "64abc1...": 1500.00,
    "64abc2...": -800.00,
    "64abc3...": -700.00
  },
  "transactions": [
    {
      "from": { "_id": "64abc2...", "name": "Aman Gupta" },
      "to":   { "_id": "64abc1...", "name": "Rahul Sharma" },
      "amount": 800.00
    },
    {
      "from": { "_id": "64abc3...", "name": "Neha Singh" },
      "to":   { "_id": "64abc1...", "name": "Rahul Sharma" },
      "amount": 700.00
    }
  ],
  "members": [ ... ]
}
```

A **positive balance** means the member is owed money. A **negative balance** means the member owes money.

---

#### DELETE `/api/groups/:id`

Permanently delete a group. Only the group creator can perform this action.

**Success — 200 OK:** `{ "message": "Group deleted" }`

**Errors:** `403 Only creator can delete`

---

### Expenses

**Base path:** `/api/expenses` — All routes require authentication.

#### GET `/api/expenses/group/:groupId`

Get all expenses for a specific group, sorted newest first. Each expense includes fully populated `paidBy` and `participants.user` fields.

**Success — 200 OK:** Array of expense objects.

---

#### GET `/api/expenses/my`

Get the 50 most recent expenses where the current user either paid or is listed as a participant. Includes `group.name` and `group.icon` on each expense.

**Success — 200 OK:** Array of expense objects with group info.

---

#### GET `/api/expenses/dashboard/summary`

Aggregate total amounts owed to and by the current user, across all groups, after accounting for settlements.

**Success — 200 OK:**
```json
{
  "totalOwed": 4800.00,
  "totalOwe":  1650.00,
  "netBalance": 3150.00
}
```

---

#### POST `/api/expenses`

Add a new expense to a group.

**Request body:**
```json
{
  "title": "Seafood Dinner",
  "amount": 3200,
  "paidBy": "64abc1...",
  "groupId": "64def456...",
  "participants": [
    { "user": "64abc1..." },
    { "user": "64abc2..." },
    { "user": "64abc3..." },
    { "user": "64abc4..." }
  ],
  "splitMethod": "equal",
  "category": "food",
  "description": "Dinner at Fisherman's Wharf",
  "date": "2024-01-16"
}
```

For `splitMethod: "equal"`, the backend divides the total automatically. For `unequal`, `percentage`, and `shares` methods, include a `shareAmount` field on each participant object.

**Success — 201 Created:** Returns the new expense with all referenced fields populated.

**Errors:** `404 Group not found`

---

#### DELETE `/api/expenses/:id`

Delete an expense. Only the user who paid for it (`paidBy`) can delete it.

**Success — 200 OK:** `{ "message": "Expense deleted" }`

**Errors:** `403 Only the payer can delete this expense` | `404 Expense not found`

---

### Settlements

**Base path:** `/api/settlements` — All routes require authentication.

#### GET `/api/settlements/group/:groupId`

Get all recorded settlements for a group, sorted newest first.

**Success — 200 OK:**
```json
[
  {
    "_id": "64jkl...",
    "payer":    { "_id": "...", "name": "Aman Gupta" },
    "receiver": { "_id": "...", "name": "Rahul Sharma" },
    "amount": 800,
    "group": "64def456...",
    "method": "upi",
    "note": "Google Pay txn #1234",
    "date": "2024-02-01T09:00:00.000Z"
  }
]
```

---

#### POST `/api/settlements`

Record a new payment. The authenticated user is always the payer.

**Request body:**
```json
{
  "receiverId": "64abc1...",
  "amount": 800,
  "groupId": "64def456...",
  "method": "upi",
  "note": "Google Pay"
}
```

**Supported methods:** `cash` | `upi` | `bank_transfer` | `online`

**Success — 201 Created:** Returns the new settlement with payer and receiver populated.

---

## Database Schema

### User

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | MongoDB primary key |
| `name` | String | yes | Trimmed whitespace |
| `email` | String | yes | Unique, lowercased |
| `password` | String | yes | Min 6 chars. Hashed with bcrypt (12 rounds) before save via Mongoose pre-save hook |
| `avatar` | String | no | URL to profile image. Defaults to `""` |
| `phone` | String | no | Defaults to `""` |
| `createdAt` | Date | auto | Set to `Date.now` |

The model's `toJSON` method automatically deletes the `password` field from all API responses.

---

### Group

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | |
| `name` | String | yes | Trimmed |
| `icon` | String | no | Emoji character. Defaults to `🏠` |
| `creator` | ObjectId | yes | Ref → User |
| `members` | [ObjectId] | yes | Array of refs → User |
| `createdAt` | Date | auto | |

---

### Expense

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | |
| `title` | String | yes | Trimmed |
| `amount` | Number | yes | Min: 0 |
| `paidBy` | ObjectId | yes | Ref → User |
| `group` | ObjectId | yes | Ref → Group |
| `participants` | Array | yes | Sub-documents (see below) |
| `splitMethod` | String | no | `equal` / `unequal` / `percentage` / `shares` |
| `category` | String | no | `food` / `travel` / `rent` / `shopping` / `utilities` / `entertainment` / `other` |
| `description` | String | no | Defaults to `""` |
| `date` | Date | no | Defaults to `Date.now` |
| `createdAt` | Date | auto | |

**Participant sub-document:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `user` | ObjectId | yes | Ref → User |
| `shareAmount` | Number | yes | The exact amount this participant owes |

---

### Settlement

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | |
| `payer` | ObjectId | yes | Ref → User (the person paying) |
| `receiver` | ObjectId | yes | Ref → User (the person receiving money) |
| `amount` | Number | yes | Min: 0 |
| `group` | ObjectId | yes | Ref → Group |
| `method` | String | no | `cash` / `upi` / `bank_transfer` / `online` |
| `note` | String | no | Defaults to `""` |
| `date` | Date | auto | |

---

## Frontend Architecture

### Pages

| Page | Route | Description |
|---|---|---|
| `LoginPage` | `/login` | Two-column auth layout: branding left, login form right |
| `RegisterPage` | `/register` | Two-column auth layout: branding left, register form right |
| `DashboardPage` | `/dashboard` | Balance stats, recent expenses list, category spending chart, active group links |
| `GroupsPage` | `/groups` | Responsive grid of all the user's groups with a create button |
| `GroupDetailPage` | `/groups/:id` | Three-tab view: Expenses, Balances, Settle Up |
| `ExpensesPage` | `/expenses` | All expenses across all groups with live search and category filter |
| `ProfilePage` | `/profile` | Edit personal info, view usage stats, sign out |

Route protection uses two wrapper components in `App.jsx`:
- `PrivateRoute` — Redirects unauthenticated users to `/login`
- `PublicRoute` — Redirects already-authenticated users to `/dashboard`

---

### Components

#### Layout

**`AppLayout`** — Wraps all authenticated pages. Renders the fixed sidebar alongside a `<main>` element containing `<Outlet />` for the active page content.

**`Sidebar`** — Fixed left-side navigation. Uses `NavLink` for active link highlighting. Shows user avatar initials, name, and email at the bottom. Includes a sign-out button.

---

#### Auth

**`AuthBrand`** — The decorative left panel shown on login and register pages. Displays the SplitEase logo, tagline, and a list of key features with emoji icons. Hidden on mobile.

**`LoginForm`** — A controlled React form with email and password fields. On submit, calls `useAuth().login()`. On success, navigates to `/dashboard`.

**`RegisterForm`** — A controlled form with name, email, and password. Validates that all fields are present and the password is at least 6 characters. Calls `useAuth().register()` on submit.

---

#### Dashboard

**`StatCard`** — Displays a single financial metric: a label, a large formatted amount, and an optional subtitle. Accepts a `variant` prop (`owed`, `owe`, `net`) which controls the background glow and amount colour (green, red, purple respectively).

**`SpendingChart`** — A doughnut chart built with Chart.js. Accepts a `data` prop as an array of `{ label, value }` objects. The component creates and destroys the Chart.js instance in `useEffect` to prevent canvas memory leaks on re-renders.

---

#### Groups

**`GroupCard`** — A full clickable card wrapped in React Router's `<Link>`. Shows the group's emoji icon, name, member count, and a row of up to 4 overlapping initial-avatars (with a "+N" overflow indicator).

**`CreateGroupModal`** — A modal form containing: a text input for group name, a grid of 12 emoji options for the group icon, a member-by-email input field (with `Enter` key support), and a chip-list showing all added members. Each chip has an × remove button except for the current user (who cannot remove themselves).

**`MemberBalanceBar`** — A single row in the group balance list. Shows the member's avatar, full name, and their net balance. The balance is coloured green if positive (owed money), red if negative (owes money), or grey if zero (settled).

---

#### Expenses

**`ExpenseItem`** — A horizontal expense row. Shows: a coloured category icon box, the expense title and meta line (group name, payer, participant count, relative time), and on the right, the total amount plus the current user's individual share coloured green ("you paid") or red ("you owe ₹X").

**`AddExpenseModal`** — The main expense creation form. Contains fields for title, amount, category, paid-by (dropdown of group members), date, and description. Features a four-option split method selector. The participant list below it adapts its right-side controls based on the selected method: shows the computed equal share (read-only), a custom amount input, a percentage input, or a share-count input.

**`ExpenseFilters`** — A search input with a magnifying glass icon and a category select dropdown. Both are controlled and update their parent's filter state live.

---

#### Settlements

**`SettleModal`** — Shows the payer name, receiver name, and amount prominently, followed by a payment method selector (four options in a grid) and a text note field. On confirm, calls `settlementsAPI.create()` or updates demo state.

**`TransactionRow`** — Displays one simplified debt: "PersonA → PersonB ₹amount". If the current user is either the payer or receiver in this transaction, a green "Settle" button appears. Clicking it opens `SettleModal`.

---

#### UI Primitives

**`Modal`** — Reusable overlay component. Renders a dark backdrop with blur. Closes on pressing the Escape key or clicking outside the modal box. Accepts `title`, `children`, `footer` (for action buttons), and `maxWidth` props.

**`Avatar`** — Renders a square with rounded corners and a gradient background, containing the person's initials (up to 2 characters). Accepts a `size` prop: `sm` (28px), `md` (36px, default), or `lg` (56px).

**`EmptyState`** — A vertically centred empty state block with a large emoji icon, a bold title, an optional subtitle, and an optional `action` slot for a button. Used on every list page when there is no data.

**`Tabs`** — Renders a row of `<button>` elements styled as a pill tab switcher. The active tab has a raised card appearance. Accepts a `tabs` array of `{ id, label }` and an `onChange` callback.

---

### Hooks

| Hook | File | What it provides |
|---|---|---|
| `useAuth` | `hooks/useAuth.js` | `{ user, loading, login, register, logout, updateUser }` — a thin wrapper around `AuthContext` |
| `useGroups` | `hooks/useGroups.js` | `{ groups, loading, error, refetch, addGroup, removeGroup }` — fetches groups on mount, falls back to demo data |
| `useExpenses` | `hooks/useExpenses.js` | `{ expenses, loading, error, refetch, addExpense, removeExpense }` — accepts an optional `groupId` to scope the query |

Both `useGroups` and `useExpenses` check `localStorage.getItem('demo_mode')` before making any API call. If demo mode is active, they return the static demo arrays from `constants.js` with a simulated loading state.

---

### Utilities

#### `utils/api.js`

A configured Axios instance exported alongside named API function groups:

- **Request interceptor** — Reads `localStorage.getItem('token')` and attaches it as `Authorization: Bearer <token>` on every outgoing request.
- **Response interceptor** — On a `401 Unauthorized` response, clears `localStorage` and redirects the browser to `/login`.

Exported API groups:

| Name | Methods |
|---|---|
| `authAPI` | `register(data)`, `login(data)` |
| `usersAPI` | `getMe()`, `updateMe(data)`, `search(email)` |
| `groupsAPI` | `getAll()`, `getById(id)`, `create(data)`, `addMember(id, email)`, `getBalances(id)`, `delete(id)` |
| `expensesAPI` | `getByGroup(groupId)`, `getMy()`, `getDashboardSummary()`, `create(data)`, `delete(id)` |
| `settlementsAPI` | `getByGroup(groupId)`, `create(data)` |

---

#### `utils/helpers.js`

| Function | Signature | Description |
|---|---|---|
| `formatCurrency` | `(n) → string` | Formats as Indian Rupee with locale separators, e.g. `₹1,23,456` |
| `getInitials` | `(name) → string` | Returns up to 2 uppercase initials, e.g. `"Rahul Sharma"` → `"RS"` |
| `timeAgo` | `(date) → string` | Returns `"Today"`, `"Yesterday"`, `"3 days ago"`, or a formatted date string |
| `calculateBalances` | `(members, expenses, settlements) → Object` | Builds a `{ userId: netBalance }` map from scratch across all expenses and settlements |
| `simplifyDebts` | `(members, balances) → Array` | Runs the greedy two-pointer algorithm and returns the minimum transaction list |
| `computeEqualShares` | `(amount, count) → number` | Divides `amount / count`, rounded to 2 decimal places |
| `validateExpense` | `({ title, amount, participants }) → string or null` | Returns an error message string, or `null` if valid |

---

#### `utils/constants.js`

| Export | Type | Description |
|---|---|---|
| `CATEGORY_CONFIG` | Object | Maps category keys to `{ icon, label, className }` for rendering category badges and filter options |
| `SPLIT_METHODS` | Array | `[{ id, icon, label }]` for the four split method selector buttons |
| `PAYMENT_METHODS` | Array | `[{ id, icon, label }]` for the four payment method buttons in SettleModal |
| `GROUP_ICONS` | Array | 12 emoji strings for the group icon picker in CreateGroupModal |
| `DEMO_MEMBERS` | Array | 4 pre-built user objects used in demo mode |
| `DEMO_GROUPS` | Array | 3 pre-built group objects referencing DEMO_MEMBERS |
| `DEMO_EXPENSES` | Array | 5 pre-built expense objects across the 3 demo groups |

---

### Context

#### `context/AuthContext.jsx`

Provides global authentication state to the entire React tree via `React.createContext`. Data is persisted in `localStorage` under three keys:

| Key | Value |
|---|---|
| `token` | JWT string returned by the API |
| `user` | JSON-stringified user object |
| `demo_mode` | String `"true"` when the API is unreachable |

| Method | Description |
|---|---|
| `login(email, password)` | Calls `POST /api/auth/login`. On API failure, automatically falls back to creating a demo user session. |
| `register(name, email, password)` | Calls `POST /api/auth/register`. On API failure, creates a demo user. |
| `logout()` | Calls `localStorage.clear()` and sets `user` state to `null`. |
| `updateUser(updatedUser)` | Updates both React state and `localStorage` with new user data. Used by ProfilePage after a successful profile update. |

---

## Splitting Logic

When adding an expense, the `AddExpenseModal` computes a `shareAmount` for each participant based on the chosen method:

**Equal Split** — The total is divided evenly across all selected participants.
```
₹2000 ÷ 4 people = ₹500 each
```

**Unequal Split** — Each participant's amount is entered manually by the user. The amounts should sum to the total, though the app does not enforce this constraint.
```
Rahul: ₹600  Aman: ₹400  Neha: ₹500  Priya: ₹500  →  Total: ₹2000
```

**Percentage Split** — Each participant is assigned a percentage. Their share is `amount × (percentage / 100)`.
```
Rahul: 40% = ₹800  Aman: 30% = ₹600  Neha: 20% = ₹400  Priya: 10% = ₹200
```

**Shares Split** — Each participant is given a number of "shares". Their amount is proportional to their share count relative to the total shares.
```
Rahul: 2 shares  Aman: 1  Neha: 1  Priya: 1  →  5 shares total
Rahul: 2/5 × ₹2000 = ₹800    Others: 1/5 × ₹2000 = ₹400 each
```

---

## Debt Simplification Algorithm

The `simplifyDebts` function in `utils/helpers.js` reduces a group's debts to the minimum number of transactions needed to settle everything.

**Step 1 — Calculate net balances.** The `calculateBalances` helper sums every expense and settlement in the group. For each expense, the payer gains the share amounts of all other participants, and each other participant's balance decreases by their share. Settlements then adjust these balances.

**Step 2 — Separate creditors and debtors.** Members with a positive balance are creditors (they are owed money). Members with a negative balance are debtors (they owe money).

**Step 3 — Greedy two-pointer match.** We iterate over both lists simultaneously, creating one transaction per pair until both lists are exhausted.

```
Example with 4 members — net balances after expenses:

  Rahul:  +₹2000  (creditor)
  Aman:   -₹800   (debtor)
  Neha:   -₹700   (debtor)
  Priya:  -₹500   (debtor)

Algorithm output (3 transactions instead of potentially 6):

  Aman  → Rahul  ₹800
  Neha  → Rahul  ₹700
  Priya → Rahul  ₹500
```

In a group of N members, the naive approach can require up to N×(N-1)/2 payments. The simplified approach requires at most N-1.

---

## Folder Structure (Full)

```
splitwise-app/
├── package.json
├── README.md
├── server/
│   ├── .env.example
│   ├── index.js
│   ├── package.json
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Expense.js
│   │   ├── Group.js
│   │   ├── Settlement.js
│   │   └── User.js
│   └── routes/
│       ├── auth.js
│       ├── expenses.js
│       ├── groups.js
│       ├── settlements.js
│       └── users.js
└── client/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── assets/
        │   └── index.css
        ├── components/
        │   ├── auth/
        │   │   ├── AuthBrand.jsx
        │   │   ├── LoginForm.jsx
        │   │   └── RegisterForm.jsx
        │   ├── dashboard/
        │   │   ├── SpendingChart.jsx
        │   │   └── StatCard.jsx
        │   ├── expenses/
        │   │   ├── AddExpenseModal.jsx
        │   │   ├── ExpenseFilters.jsx
        │   │   └── ExpenseItem.jsx
        │   ├── groups/
        │   │   ├── CreateGroupModal.jsx
        │   │   ├── GroupCard.jsx
        │   │   └── MemberBalanceBar.jsx
        │   ├── layout/
        │   │   ├── AppLayout.jsx
        │   │   └── Sidebar.jsx
        │   ├── settlements/
        │   │   ├── SettleModal.jsx
        │   │   └── TransactionRow.jsx
        │   └── ui/
        │       ├── Avatar.jsx
        │       ├── EmptyState.jsx
        │       ├── Modal.jsx
        │       └── Tabs.jsx
        ├── context/
        │   └── AuthContext.jsx
        ├── hooks/
        │   ├── useAuth.js
        │   ├── useExpenses.js
        │   └── useGroups.js
        ├── pages/
        │   ├── DashboardPage.jsx
        │   ├── ExpensesPage.jsx
        │   ├── GroupDetailPage.jsx
        │   ├── GroupsPage.jsx
        │   ├── LoginPage.jsx
        │   ├── ProfilePage.jsx
        │   └── RegisterPage.jsx
        └── utils/
            ├── api.js
            ├── constants.js
            └── helpers.js
```

---

## Scripts Reference

### Root `package.json`

| Script | Description |
|---|---|
| `npm run install:all` | Installs dependencies for both server and client |
| `npm run dev` | Starts both dev servers concurrently (requires `concurrently`) |
| `npm run server` | Starts only the backend dev server |
| `npm run client` | Starts only the frontend dev server |

### `server/package.json`

| Script | Description |
|---|---|
| `npm run dev` | Starts backend with nodemon (auto-restarts on file changes) |
| `npm start` | Starts backend with plain node (for production) |

### `client/package.json`

| Script | Description |
|---|---|
| `npm run dev` | Starts Vite dev server on port 3000 with HMR |
| `npm run build` | Compiles an optimised production bundle to `dist/` |
| `npm run preview` | Serves the production build locally for testing |

---

## Troubleshooting

**MongoDB connection fails on startup**

The Express server still starts, but all database routes will fail. The frontend will fall back to demo mode. To fix: ensure MongoDB is running locally (`brew services start mongodb-community` on macOS, `sudo systemctl start mongod` on Linux) and verify the `MONGO_URI` value in `server/.env`.

**`npm run install:all` fails**

Run installs manually inside each directory:
```bash
cd server && npm install
cd ../client && npm install
```
Also verify you are running Node.js v18 or higher with `node --version`.

**Port 5000 or 3000 is already in use**

For the backend: change `PORT` in `server/.env`. For the frontend: pass `--port` to Vite in `client/package.json` (`"dev": "vite --port 3001"`). If you change the backend port, also update the proxy target in `client/vite.config.js`.

**Page shows a blank screen or 404 on direct URL access**

This is a normal behaviour of client-side routing in development. Always start from `http://localhost:3000` and navigate from there. In production, configure your web server (Nginx, Apache) to serve `index.html` for all routes.

**JWT token is rejected (401 errors)**

Tokens expire after 7 days. Sign out and log back in to receive a fresh token. If you change the `JWT_SECRET` value in `.env`, all existing tokens are immediately invalidated and all users must log in again.

**Changes in demo mode disappear on page refresh**

This is by design. Demo mode stores everything in React memory. To persist data across sessions, start a MongoDB instance and connect via `MONGO_URI` in your `.env` file.
