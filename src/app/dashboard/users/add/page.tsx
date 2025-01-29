"use client";
import UserForm from "@/components/UserForm";
import { useRouter } from "next/navigation";

export default function AddUserPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/users");
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Tambah User</h1>
      <UserForm onSuccessAction={handleSuccess} />
    </div>
  );
}
