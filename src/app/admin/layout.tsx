import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";
import { AutoLogout } from "@/components/auto-logout";

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen bg-slate-50/50 text-foreground">
            <AutoLogout timeoutMinutes={15} />
            <AdminSidebar />
            <div className="flex-1 md:pl-64 flex flex-col min-h-screen min-w-0 max-w-full overflow-x-hidden transition-all duration-300">
                <AdminHeader />
                <main className="flex-1 p-4 md:p-8 min-w-0 max-w-full overflow-x-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="w-full max-w-7xl mx-auto space-y-8 min-w-0">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
