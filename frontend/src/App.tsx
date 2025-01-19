import React from "react";
import Map from "./components/Map";

const App: React.FC = () => {
  return (
    <div className="size-full">
      <h1>Jeepney route navigation </h1>
      <Map />
    </div>
  );
};

export default App;
