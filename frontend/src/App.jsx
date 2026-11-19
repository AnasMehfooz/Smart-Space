import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Dev mode: the backend from scripts\dev_backend.ps1 (port 8765, token "dev").
// In the packaged app the port and token will come from Tauri's get_backend_info().
const BACKEND = import.meta.env.VITE_DEV_BACKEND || "http://127.0.0.1:8765";

// Setup check page: proves Tailwind, shadcn, the Tauri bridge and the backend connection all work.
function App() {
  const [backend, setBackend] = useState("");
  const [tauri, setTauri] = useState("");

  async function checkBackend() {
    setBackend("Checking…");
    try {
      const res = await fetch(`${BACKEND}/api/v1/health`);
      const h = await res.json();
      setBackend(h.ready ? `Connected: status ${h.status}, LLM ${h.llm_state}` : "Backend is starting, try again");
    } catch {
      setBackend(`Not reachable at ${BACKEND}. Is scripts\\dev_backend.ps1 running?`);
    }
  }

  async function checkTauri() {
    try {
      setTauri(await invoke("greet", { name: "Smart Space" }));
    } catch {
      setTauri("Not inside the Tauri window (open it with npm run tauri dev)");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Smart Space</CardTitle>
          <CardDescription>Tauri v2 + React + Tailwind CSS v4 + shadcn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <span className="font-medium">Backend:</span>{" "}
            <span className="text-muted-foreground">{backend || "not checked yet"}</span>
          </p>
          <p>
            <span className="font-medium">Tauri bridge:</span>{" "}
            <span className="text-muted-foreground">{tauri || "not checked yet"}</span>
          </p>
        </CardContent>
        <CardFooter className="gap-2">
          <Button onClick={checkBackend}>Check backend</Button>
          <Button variant="outline" onClick={checkTauri}>
            Check Tauri
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}

export default App;
