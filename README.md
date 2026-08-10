# Hotel System Management API

A backend API for managing hotel operations end to end — room availability, guest
bookings, payments, receptionist check-ins, and admin oversight. Built with Node.js,
Express, and MongoDB, with role-based access across four distinct user types: guest,
receptionist, and admin.

**Live URL:** https://hsm-api.onrender.com

---

## Table of Contents

- Overview
- Tech Stack
- Features
- Architecture
- API Endpoints
- Environment Variables
- Running Locally
- Running with Docker
- Challenges & What I Learned
- Future Improvements

---

## Overview

This project is a REST API for a hotel system — the backend that would sit behind a
hotel's booking website or internal staff dashboard. It models a real operational
workflow: a guest searches for and books a room, pays for it, a receptionist confirms
the payment and checks the guest in, and an admin manages rooms, hotels, and handles
issues escalated by staff.

The project was originally built with Prisma and PostgreSQL, then fully converted to
MongoDB with Mongoose — including redesigning how relationships between users, rooms,
bookings, and payments work, since MongoDB doesn't have foreign keys the way a
relational database does.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Runtime | Node.js | JavaScript runtime for the server |
| Framework | Express.js | Handles all HTTP routes |
| Database | MongoDB (Atlas) | Stores users, hotels, rooms, bookings, payments, and issues |
| ODM | Mongoose | Structures and validates data, and manages relationships between collections |
| Authentication | JSON Web Tokens (JWT) | Verifies who's making each request, sent via an Authorization header |
| Password security | bcrypt | Hashes passwords before storing them |
| File storage | Cloudinary | Stores room images and returns a hosted URL |
| File handling | Multer | Handles incoming file uploads before they're sent to Cloudinary |
| Containerization | Docker | Packages the app so it runs identically on any machine |
| Hosting | Render | Deploys the Docker container and gives the app a public URL |

---

## Features

**Authentication & Roles**
- Register and log in with a hashed password and a JWT issued on success
- Three roles: guest, receptionist, and admin, each with different route access
- Support for a forced password change on first login (mustChangePassword flag)

**Guest**
- Search available rooms by date range and optionally by room type
- Book a room, with automatic overlap checking so a room can't be double-booked for
  the same dates
- Pay for a booking, which updates the booking status to confirmed
- View all personal bookings, or a single booking in detail

**Receptionist**
- Confirm a booking by checking whether payment has been made
- Search for a guest by username and view their full booking history
- Check a guest in, but only once payment is confirmed
- Report an issue (e.g. a maintenance problem) to admin, optionally linked to a
  specific room

**Admin**
- Create new hotels
- Add new rooms to a hotel, with an image upload stored on Cloudinary
- Update room details (number, type, price, status)
- View every booking across the whole system
- View and resolve issues reported by receptionists
- Manually confirm a payment if needed

**Public (no login required)**
- Browse all available rooms, optionally filtered by date range or type
- View the list of hotels

---

## Architecture

The project follows a layered backend structure:

Router      -->  defines URL paths (e.g. POST /api/guest/bookings)
Controller  -->  contains the actual logic for each route
Middleware  -->  runs before a route (auth checks, role checks, file upload handling)
Model       -->  defines the shape of data stored in MongoDB (User, Hotel, Room,
                  Booking, Payment, Issue)

Since MongoDB has no foreign keys, relationships between collections are modeled using
Mongoose's ObjectId references combined with `.populate()` — for example, a Booking
stores a reference to a User and a Room, and populating those references at query time
pulls in the full guest and room details without duplicating that data across
collections.

---

## API Endpoints

Base URL: https://hsm-api.onrender.com

**Auth**

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/users/create | Register a new user |
| POST | /api/users/login | Log in and receive a JWT |
| PATCH | /api/users/mustchange-password | Force a password change on first login |

**Public** (no login required)

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/public/rooms | Browse all available rooms |
| GET | /api/public/hotels | View the list of hotels |

**Guest** (requires login)

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/guest/rooms/search | Search rooms by date range and type |
| POST | /api/guest/bookings | Book a room |
| POST | /api/guest/bookings/:bookingId/pay | Pay for a booking |
| GET | /api/guest/bookings | View all personal bookings |
| GET | /api/guest/bookings/:bookingId | View a single booking's details |

**Receptionist** (requires login + receptionist or admin role)

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/receptionist/bookings/:bookingId/confirm | Confirm payment before check-in |
| GET | /api/receptionist/guests/:username | Search a guest and their booking history |
| PATCH | /api/receptionist/bookings/:bookingId/checkin | Check a guest in |
| POST | /api/receptionist/issues | Report an issue to admin |

**Admin** (requires login + admin role)

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/admin/hotels | Create a new hotel |
| POST | /api/admin/rooms | Add a new room, with an optional image upload |
| PATCH | /api/admin/rooms/:roomId | Update a room |
| GET | /api/admin/bookings | View every booking in the system |
| GET | /api/admin/issues | View all reported issues |
| PATCH | /api/admin/issues/:issueId/resolve | Mark an issue as resolved |
| PATCH | /api/admin/payments/:paymentId/confirm | Manually confirm a payment |

---

## Environment Variables

The following variables must be set (in a local .env file for development, or in your
hosting provider's environment settings for production):

MONGODB_URI=            # your MongoDB connection string
JWT_SECRET=              # used to sign auth tokens
JWT_SECRET_KEY=          # used to sign auth tokens
CLOUDINARY_CLOUD_NAME=   # from your Cloudinary dashboard
CLOUDINARY_API_KEY=      # from your Cloudinary dashboard
CLOUDINARY_API_SECRET=   # from your Cloudinary dashboard
NODE_ENV=                 # "development" or "production"
PORT=                      # defaults to 3000 if not set

None of these values should ever be committed to version control. The .env file is
excluded via .gitignore.

---

## Running Locally

git clone [your repo link]
cd HSM_Api
npm install

Create a .env file in the project root with the variables listed above, then:

npm run dev

The server will start on http://localhost:3000 (or whichever port is set in .env).

---

## Running with Docker

docker compose up --build

This builds the app image from the included Dockerfile and starts the container. Any
time application code or dependencies change, rebuild with --build so the container
reflects the latest version rather than reusing a stale image.

---

## Challenges & What I Learned

**Migrating from a relational database to MongoDB.** The project was originally built
with Prisma and PostgreSQL, where relationships between users, rooms, bookings, and
payments were enforced directly by the database through foreign keys. Converting to
MongoDB meant redesigning those relationships as ObjectId references between
collections, and rewriting every query that previously relied on Prisma's `include` to
instead use Mongoose's `.populate()` — including cases where a related record (like a
payment) lives in its own separate collection rather than being nested or automatically
joined.

**Preventing double bookings without database-level constraints.** With no foreign key
or unique constraint to lean on, overlap checking for room availability had to be done
explicitly in application code — querying existing bookings for a room and checking
whether the requested date range intersects with any of them, before allowing a new
booking to be created.

**Careful review after reusing code across projects.** Some backend files were
initially copied over from an earlier, similarly structured project as a starting
point. This surfaced a good lesson: a file that looks complete can still reference
functions, models, or middleware exports that don't exist in the new project, producing
errors that only appear once the specific route is actually called — reinforcing the
importance of tracing every import back to its real source rather than assuming
copied code will work unmodified.

**Consistent local development across multiple concurrent projects.** Running several
Node projects locally at once surfaced port conflicts, since each defaulted to the same
port. Solved by assigning each project its own port via environment variables, and by
building the habit of rebuilding Docker images (`--build`) after any code change rather
than assuming a running container reflects the latest edits.

---

## Future Improvements

- Add automated tests (unit tests for controllers, integration tests for full booking
  flows)
- Add pagination to endpoints that return large lists, like all bookings or all rooms
- Add email notifications for booking confirmations and payment receipts
- Add an admin dashboard summary endpoint (occupancy rate, revenue, open issues)
