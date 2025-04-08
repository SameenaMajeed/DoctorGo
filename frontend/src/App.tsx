import { FC } from "react";
import { BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { routes } from "./Routes/Routes";


const App: FC = () => {
  return (
    <div>
      <Router>
        <Routes>
          {routes}
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default App;