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
app.use("/images", express.static("public/images")); // Serve static images

// MongoDB connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Root
    app.get("/", (req, res) => {
      res.send("Server running on port " + port);
    });
    
async function run() {
  try {
    // await client.connect();
    console.log("MongoDB connected successfully!");

    const db = client.db("rentwheels-db");
    const carsCollection = db.collection("cars");
    const bookingsCollection = db.collection("bookings");

    

    // Get all cars
    app.get("/cars", async (req, res) => {
      try {
        const cars = await carsCollection.find().toArray();
        res.send(cars);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Failed to fetch cars" });
      }
    });

    // Get Featured Cars (latest 6)
    app.get("/cars/featured", async (req, res) => {
      try {
        const cars = await carsCollection.find().sort({ _id: -1 }).limit(30).toArray();
        res.send(cars);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Failed to fetch featured cars" });
      }
    });

    // Get Top Rated Cars (rating >= 4.5)
    app.get("/cars/top-rated", async (req, res) => {
      try {
        const cars = await carsCollection
          .find({ rating: { $gte: 4.5 } })
          .sort({ rating: -1 })
          .limit(6)
          .toArray();
        res.send(cars);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Failed to fetch top rated cars" });
      }
    });

    // Get single car by ID
    app.get("/cars/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const car = await carsCollection.findOne({ _id: new ObjectId(id) });
        if (!car) return res.status(404).send({ message: "Car not found" });
        res.send(car);
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
        const result = await carsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );
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

    // Get bookings (optional email filter)
    app.get("/bookings", async (req, res) => {
      try {
        const email = req.query.email;
        let query = {};
        if (email) query = { userEmail: email };
        const bookings = await bookingsCollection.find(query).toArray();
        res.send(bookings);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Failed to fetch bookings" });
      }
    });

    // Add a booking
    app.post("/bookings", async (req, res) => {
      try {
        const newBooking = req.body;

        // Update car status to booked
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


    // My Listings 
app.get("/my-cars/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const cars = await carsCollection.find({ providerEmail: email }).toArray();
    res.send(cars);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Faild to fetch car" });
  }
});

  } finally {
    // keep connection open for development
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
