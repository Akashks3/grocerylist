const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());
app.use(cors());

const DATA_FILE = "data.json";

// Read the JSON file
const readData = () => {
  try {
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Write to JSON file
const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// **Get all items**
app.get("/groceries", (req, res) => {
  res.json(readData());
});

// **Add an item**
app.post("/groceries", (req, res) => {
  const groceries = readData();
  const newItem = { id: uuidv4(), ...req.body, checked: false };
  groceries.push(newItem);
  writeData(groceries);
  res.json(newItem);
});

// **Update an item**
app.put("/groceries/:id", (req, res) => {
  let groceries = readData();
  groceries = groceries.map((item) =>
    item.id === req.params.id ? { ...item, ...req.body } : item
  );
  writeData(groceries);
  res.json({ message: "Item updated" });
});

// **Delete an item**
app.delete("/groceries/:id", (req, res) => {
  let groceries = readData();
  groceries = groceries.filter((item) => item.id !== req.params.id);
  writeData(groceries);
  res.json({ message: "Item deleted" });
});

// Start server
const PORT = 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
