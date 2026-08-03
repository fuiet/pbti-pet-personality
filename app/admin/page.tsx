import { getAdminDashboardData, requireAdminUser } from "@/lib/admin";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default async function AdminPage() {
  const adminUser = await requireAdminUser();
  const data = await getAdminDashboardData();

  return <AdminDashboardClient data={data} adminEmail={adminUser.email} />;
}
