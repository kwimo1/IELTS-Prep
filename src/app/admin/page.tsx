import { AdminPanel } from "@/components/admin/admin-panel";
import { getAdminSession } from "@/lib/auth";
import { fetchAdminUserLists } from "@/lib/admin-users";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSession();
  const initialData = session
    ? await fetchAdminUserLists().catch(() => ({
        pendingUsers: [],
        activeUsers: [],
      }))
    : {
        pendingUsers: [],
        activeUsers: [],
      };

  return (
    <main className="pb-14 pt-6 sm:pb-20 sm:pt-10">
      <div className="shell">
        <AdminPanel
          initialSessionActive={Boolean(session)}
          initialPendingUsers={initialData.pendingUsers}
          initialActiveUsers={initialData.activeUsers}
        />
      </div>
    </main>
  );
}
