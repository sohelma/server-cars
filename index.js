// index.js
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/images", express.static("public/images"));// Serve static images from public/images

// MongoDB connection
const uri = process.env.MONGODB_URI; // .env ফাইলে রাখবে
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("MongoDB connected successfully!");

    const db = client.db("rentwheels-db");
    const carsCollection = db.collection("cars");
    const bookingsCollection = db.collection("bookings");

    // Root route
    app.get("/", (req, res) => {
      res.send("Server running on port " + port);
    });

    // Get all cars
    app.get("/cars", async (req, res) => {
      try {
        const result = await carsCollection.find().toArray();
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Failed to fetch cars" });
      }
    });

    // Get single car by ID
    app.get("/cars/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await carsCollection.findOne({ _id: new ObjectId(id) });
        if (!result) return res.status(404).send({ message: "Car not found" });
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Invalid ID or server error" });
      }
    });

    // Add a new car
    app.post("/cars", async (req, res) => {
      try {
        const newCar = req.body;
        const result = await carsCollection.insertOne(newCar);
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Failed to add car" });
      }
    });

    // Update a car
    app.put("/cars/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedData = req.body;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = { $set: updatedData };
        const result = await carsCollection.updateOne(filter, updateDoc);
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Failed to update car" });
      }
    });

    // Delete a car
    app.delete("/cars/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await carsCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Failed to delete car" });
      }
    });

    // Get all bookings (optional email filter)
    app.get("/bookings", async (req, res) => {
      try {
        const email = req.query.email;
        let query = {};
        if (email) query = { userEmail: email };
        const result = await bookingsCollection.find(query).toArray();
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Failed to fetch bookings" });
      }
    });

    // Add a booking
    app.post("/bookings", async (req, res) => {
      try {
        const newBooking = req.body;

        // Optional: update car status to "booked"
        const carId = newBooking.carId;
        await carsCollection.updateOne(
          { _id: new ObjectId(carId) },
          { $set: { status: "booked" } }
        );

        const result = await bookingsCollection.insertOne(newBooking);
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Failed to create booking" });
      }
    });

  } finally {
    // keep connection open for development
  }
}

run().catch(console.dir);

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
