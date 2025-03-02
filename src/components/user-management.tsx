import { useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import router from "next/router";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "./ui/table";
import { Select } from "@radix-ui/react-select";
import { SelectItem } from "./ui/select";

const UserManagement = () => {
  const { profile } = useUserProfile();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (profile?.role !== "super_admin") {
      router.push("/dashboard");
      return;
    }

    fetchUsers();
  }, [profile]);

  const fetchUsers = async () => {
    const { data }: any = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    setUsers(data);
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from("user_profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (!error) {
      fetchUsers();
    }
  };

  return (
    <div>
      <h1>Manajemen Pengguna</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user: any) => (
            <TableRow key={user.id}>
              <TableCell>{user.full_name}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Select
                  defaultValue={user.role}
                  value={user.role}
                  onValueChange={(e: any) =>
                    updateUserRole(user.id, e.target.value)
                  }
                >
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserManagement;
