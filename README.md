# RentWheels - Server

This repository contains the backend of RentWheels – a car rental platform built with **Node.js**, **Express.js**, and **MongoDB**. The server handles API endpoints for cars, bookings, and user management.

## Features

- REST API for Cars CRUD operations
- User bookings management
- Update car availability after booking
- Filter cars by provider or booked status
- Protected routes for private operations

## Technologies Used

- Node.js
- Express.js
- MongoDB (Atlas)
- Firebase Authentication (optional)
- Cors, dotenv, nodemon

## API Endpoints

- `GET /cars` – Fetch all cars
- `POST /cars` – Add a new car (Private)
- `PUT /cars/:id` – Update car details (Private)
- `DELETE /cars/:id` – Delete a car (Private)
- `GET /bookings` – Fetch all bookings
- `POST /bookings` – Book a car

## Setup Instructions

1. Clone the repo:

```bash
git clone https://github.com/<your-username>/server-cars.git

