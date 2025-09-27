import ReactDOM from "react-dom/client";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import { ThemeProvider } from "./modules/common/contexts/ThemeContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <ThemeProvider>
      <App />
      <ToastContainer
        position="top-right"
        closeOnClick={false}
        pauseOnFocusLoss
        pauseOnHover
        transition={Bounce}
        style={{
          top: '98px', // Header height (66px) + AppLayout padding (32px)
          right: '48px', // Match AppLayout horizontal padding
        }}
      />
    </ThemeProvider>
  </>
);

reportWebVitals();
