import "./App.css";
import React from "react";
import { useNavigate } from "react-router-dom";

const App = (): React.ReactElement => {
  const navigate = useNavigate();

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="heading">Welcome to Group Chat</h1>
        <button className="user-button" onClick={() => navigate("/chat")}> 
          Enroll
        </button>
      </header>
    </div>
    
  );
};

export default App;
