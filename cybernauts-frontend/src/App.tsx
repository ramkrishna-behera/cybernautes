import Sidebar from "./components/Sidebar/Sidebar";
import { Toaster } from "react-hot-toast";
import { GraphProvider } from "./context/GraphContext";
import { UserProvider } from "./context/UserContext";
import { AppStateProvider } from "./context/AppStateContext";
import Main from "./components/Main/Main";

/**
 * Root application component.
 * Wraps the app with User and Graph context providers.
 */
export default function App() {
  return (
    <AppStateProvider>
          <UserProvider>
      <GraphProvider>
        <div
          style={{
            display: "flex",
            height: "100vh",
            overflow: "hidden",
            backgroundColor: "#0f172a",
            color: "#fff",
          }}
        >
          {/* Sidebar for hobbies and user management */}
          <Sidebar />

          {/* Main Graph area */}
          <main style={{ flexGrow: 1, padding: 12 }}>
            <Main />
          </main>

          {/* Toast notifications */}
          <Toaster position="top-right" reverseOrder={false} />
        </div>
      </GraphProvider>
    </UserProvider>
    </AppStateProvider>
  );
}
