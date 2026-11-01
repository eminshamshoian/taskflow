import { useEffect, useState } from "react";
import { getHealth } from "./services/api";

export default function App() {
  const [status, setStatus] = useState("Checking API...");

  useEffect(() => {
    let active = true;

    async function checkHealth() {
      try {
        const data = await getHealth();

        if (active) {
          setStatus(`API status: ${data.message}`);
        }
      } catch (error) {
        if (active) {
          setStatus(
            error instanceof Error ? error.message : "Cannot reach API",
          );
        }
      }
    }

    void checkHealth();

    return () => {
      active = false;
    };
  }, []);

  return <h1>{status}</h1>;
}
