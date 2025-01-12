// FILEPATH: e:/work-report/dev/reportapp/src/components/login.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import supabase from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const idleTimeout = 30 * 60 * 1000; // 30 minutes
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [idle,setIdle] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const lastActivity = localStorage.getItem("lastActivity");
      if (lastActivity) {
        const idleTime = now - parseInt(lastActivity);
        if (idleTime > idleTimeout) {
          setIdle(true);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (idle) {
      supabase.auth.signOut();
      setSession(null);
      router.push("/login");
    }
  }, [idle]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null); // Reset error message
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setSession(data.session);
      localStorage.setItem("lastActivity", new Date().getTime.toString());
      router.push("/dashboard");
    } catch (error: any) {
      setErrorMessage("Invalid email or password. Please try again.");
      console.error("Error logging in:", error.message);
    }
  };

  const handleActivity = () => {
    localStorage.setItem("lastActivity", new Date().getTime.toString());
  };

  return (
    <div className="flex items-center justify-center max-h-screen">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm p-8 bg-white rounded-lg shadow-md"
      >
        <h1 className="mb-6 text-3xl font-bold text-center text-gray-800">Welcome Back</h1>
        {errorMessage && (
          <Alert className="mb-4" variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <div className="mb-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
            onFocus={handleActivity}
            onBlur={handleActivity}
          />
        </div>
        <div className="mb-6">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
            onFocus={handleActivity}
            onBlur={handleActivity}
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          Login
        </Button>
        <p className="mt-4 text-sm text-center text-gray-600">
          Don't have an account?{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}
