import { RouterProvider } from "react-router-dom"
import "@/assets/main.css";
import router from "@/router";

function App() {
  return (
    <main className="container">
      <RouterProvider router={router} />
    </main>
  );
}

export default App;
