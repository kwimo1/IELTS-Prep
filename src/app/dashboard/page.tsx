import { redirect } from "next/navigation";
import { UserDashboard } from "@/components/dashboard/user-dashboard";
import { getUserSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getUserSession();

  if (!session) {
    redirect("/");
  }

  return <UserDashboard phone={session.phone} />;
}
