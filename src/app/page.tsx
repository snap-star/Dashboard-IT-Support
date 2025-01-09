import Login from "@/components/login";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="py-4 shadow-sm bg-white">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard IT Support</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Login />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 bg-gray-100 shadow-inner">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Dashboard IT Support by Oren. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
