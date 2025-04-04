import React, { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

const API_URL = "https://grocerybackend-twyp.onrender.com/groceries";

const App = () => {
  const [groceries, setGroceries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [newItem, setNewItem] = useState({
    name: "",
    measurementsArea: "",
    qty: "",
    image: "",
  });

  useEffect(() => {
    axios
      .get(API_URL)
      .then((res) => setGroceries(res.data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleCheckboxChange = async (id) => {
    setGroceries((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );

    const updatedItem = groceries.find((item) => item.id === id);
    if (updatedItem) {
      await axios.put(`${API_URL}/${id}`, {
        ...updatedItem,
        checked: !updatedItem.checked,
      });
    }
  };

  const handleEditChange = (id, field, value) => {
    setGroceries((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );

    setTimeout(() => {
      const updatedItem = groceries.find((item) => item.id === id);
      if (updatedItem) {
        axios
          .put(`${API_URL}/${id}`, { ...updatedItem, [field]: value })
          .catch((error) => console.error("Error updating item:", error));
      }
    }, 1000);
  };

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = async () => {
    if (Object.values(newItem).some((val) => val === "")) {
      alert("Please fill out all fields.");
      return;
    }

    const newGroceryItem = { id: uuidv4(), ...newItem, checked: false };
    await axios.post(API_URL, newGroceryItem);
    setGroceries((prev) => [...prev, newGroceryItem]);
    setNewItem({ name: "", measurementsArea: "", qty: "", image: "" });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setGroceries((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const filteredGroceries = groceries.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const checkedGroceries = groceries.filter((item) => item.checked);

  const previewCheckedData = () => {
    if (checkedGroceries.length === 0) {
      alert("No items selected!");
      return;
    }

    const tableContent = `
      <html>
      <head>
        <title>Items</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid black; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          img { width: 50px; height: auto; }
          button { margin-top: 20px; padding: 10px; font-size: 16px; }
        </style>
      </head>
      <body>
        <h2>Buyer Name: ${buyerName}</h2> 
        <table>
          <thead>
            <tr><th>S.No</th><th>Name</th><th>Measurements</th><th>Quantity</th></tr>
          </thead>
          <tbody>
            ${checkedGroceries
              .map(
                (item, index) =>
                  `<tr>
                    <td>${index + 1}</td>
                    <td>${item.name.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
                    <td>${item.measurementsArea}</td>
                    <td>${item.qty}</td>
                  </tr>`
              )
              .join("")}
          </tbody>
        </table>
        <button onclick="downloadData()">Download</button>
        <script>
          function downloadData() {
            const content = document.documentElement.outerHTML;
            const blob = new Blob([content], { type: "text/html" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "list.html";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        </script>
      </body>
      </html>
    `;

    const previewWindow = window.open("", "_blank");
    previewWindow.document.write(tableContent);
    previewWindow.document.close();
  };

  return (
    <div className="container">
      <input
        type="text"
        placeholder="Buyer Name"
        value={buyerName}
        onChange={(e) => setBuyerName(e.target.value)}
      />

      <h1 className="title">Grocery List</h1>

      <input
        type="text"
        placeholder="Search items..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <h2>Grocery Items</h2>
      <table border="1">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Select</th>
            <th>Image</th>
            <th>Name</th>
            <th>Measurements</th>
            <th>Quantity</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredGroceries.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>
                <input
                  type="checkbox"
                  checked={item.checked || false}
                  onChange={() => handleCheckboxChange(item.id)}
                />
              </td>
              <td>
                {item.image ? (
                  <img src={item.image} alt={item.name} width="50" />
                ) : (
                  "No Image"
                )}
              </td>
              <td>{item.name}</td>
              <td>
                {item.checked ? (
                  <input
                    type="text"
                    value={item.measurementsArea}
                    onChange={(e) =>
                      handleEditChange(item.id, "measurementsArea", e.target.value)
                    }
                  />
                ) : (
                  item.measurementsArea
                )}
              </td>
              <td>
                {item.checked ? (
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) => handleEditChange(item.id, "qty", e.target.value)}
                  />
                ) : (
                  item.qty
                )}
              </td>
              <td>
                <button onClick={() => handleDelete(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Add Item</h2>
      <input
        type="text"
        name="name"
        placeholder="Item Name"
        value={newItem.name}
        onChange={handleNewItemChange}
      />
      <input
        type="text"
        name="measurementsArea"
        placeholder="Measurements"
        value={newItem.measurementsArea}
        onChange={handleNewItemChange}
      />
      <input
        type="text"
        name="qty"
        placeholder="Quantity"
        value={newItem.qty}
        onChange={handleNewItemChange}
      />
      <input
        type="text"
        name="image"
        placeholder="Image URL"
        value={newItem.image}
        onChange={handleNewItemChange}
      />
      <button onClick={handleAddItem}>Add Item</button>

      {checkedGroceries.length > 0 && (
        <div className="selected-items">
          <h2>Selected  Items</h2>
          <table border="1">
            <thead>
              <tr>
                <th>Checked S.No</th>
                <th>Image</th>
                <th>Name</th>
                <th>Measurements</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {checkedGroceries.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>
                    {item.image ? (
                      <img src={item.image} alt={item.name} width="50" />
                    ) : (
                      "No Image"
                    )}
                  </td>
                  <td>{item.name}</td>
                  <td>{item.measurementsArea}</td>
                  <td>{item.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={previewCheckedData}
        disabled={checkedGroceries.length === 0}
      >
        Preview & Download
      </button>
    </div>
  );
};

export default App;
