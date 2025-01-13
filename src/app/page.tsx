"use client";
import { motion } from "framer-motion";
import Login from "@/components/login";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Login />
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
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Dashboard IT Support</h1>
          <p className="text-center text-gray-600 text-sm mb-6">Selamat datang di sistem manajemen IT Support</p>
          

          <p className="text-sm text-center text-gray-600 mt-6">
            &copy; {new Date().getFullYear()} Dashboard IT Support by Oren
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
