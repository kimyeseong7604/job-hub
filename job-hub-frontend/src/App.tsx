import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("loading...");

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/health")
      .then((res) => {
        setMessage(res.data.message);
      })
      .catch((err) => {
        console.error(err);
        setMessage("error");
      });
  }, []);

  return (
    <div style={{ padding: "40px", fontSize: "20px" }}>
      <h1>Frontend ↔ Backend Test</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;
