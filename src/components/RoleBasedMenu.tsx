import Link from "next/link";

interface MenuConfig {
    path: string;
    label: string;
    allowedRoles: string[];
  }
  
  const menuItems: MenuConfig[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      allowedRoles: ['super_admin', 'admin', 'staff', 'user'],
    },
    {
      path: '/user-management',
      label: 'Manajemen Pengguna',
      allowedRoles: ['super_admin'],
    },
    {
      path: '/reports',
      label: 'Laporan',
      allowedRoles: ['super_admin', 'admin'],
    },
    // Tambahkan menu lainnya sesuai kebutuhan
  ];
  
  const RoleBasedMenu = ({ userRole }: { userRole: string }) => {
    const filteredMenu = menuItems.filter((item) =>
      item.allowedRoles.includes(userRole)
    );
  
    return (
      <nav>
        <ul>
          {filteredMenu.map((item) => (
            <li key={item.path}>
              <Link href={item.path}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    );
  };
  
  export default RoleBasedMenu;