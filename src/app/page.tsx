"use client";
import { motion } from "framer-motion";
import Login from "@/components/login";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-min px-4"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
      <Login />
        </motion.div>
          <footer>
          <p className="text-sm text-center text-gray-600 mt-6">
            &copy; {new Date().getFullYear()} Dashboard IT Support by Oren
          </p>
          </footer>
      </motion.div>
    </div>
  );
}
