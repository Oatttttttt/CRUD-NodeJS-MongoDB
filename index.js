const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI;
const client = new MongoClient(mongoURI);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CRUD-NodeJS-MongoDB");
});

app.get("/users", async (req, res) => {
  await client.connect();
  const users = await client
    .db("UserDB")
    .collection("users")
    .find({})
    .toArray();
  await client.close();
  res.status(200).send(users);
});

app.get("/users/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await client.connect();
  const user = await client
    .db("UserDB")
    .collection("users")
    .findOne({ id: id });
  await client.close();
  res.status(200).send({
    status: "ok",
    user: user,
  });
});

app.post("/users/create", async (req, res) => {
  const user = req.body;

  try {
    await client.connect();
    await client
      .db("UserDB")
      .collection("users")
      .insertOne({
        id: parseInt(user.id),
        firstname: user.firstname,
        lastname: user.lastname,
      });

    await client.close();

    res.status(200).send({
      status: "ok",
      message: "User with ID = " + user.id + " is created",
      user: user,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

app.put("/users/update", async (req, res) => {
  const user = req.body;
  const id = parseInt(user.id);
  await client.connect();
  await client
    .db("UserDB")
    .collection("users")
    .updateOne(
      { id: id },
      {
        $set: {
          id: parseInt(user.id),
          firstname: user.firstname,
          lastname: user.lastname,
        },
      }
    );
  await client.close();
  res.status(200).send({
    status: "ok",
    message: "User with ID = " + id + " is updated",
    user: user,
  });
});

app.delete("/users/delete", async (req, res) => {
  const id = parseInt(req.body.id);
  await client.connect();
  await client.db("UserDB").collection("users").deleteOne({ id: id });
  await client.close();
  res.status(200).send({
    status: "ok",
    message: "User with ID = " + id + " is deleted",
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
