import { AdminPanel } from "@/components/admin/admin-panel";
import { getAdminSession } from "@/lib/auth";
import { fetchAdminUserLists } from "@/lib/admin-users";
import { getPublicAppStatus } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSession();
  const appStatus = getPublicAppStatus();
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
          adminUsesDefaultCredentials={appStatus.adminUsesDefaultCredentials}
          defaultAdminEmail={appStatus.defaultAdminEmail}
          defaultAdminPassword={appStatus.defaultAdminPassword}
          setupMessage={
            appStatus.missingSupabaseEnvVars.length > 0
              ? `إعداد Supabase غير مكتمل على هذا النشر: ${appStatus.missingSupabaseEnvVars.join(", ")}`
              : undefined
          }
        />
      </div>
    </main>
  );
}
