import { PortalSidebar } from "@/components/portal-sidebar";
import { getUserProfile } from "@/lib/auth";
import { AutoLogout } from "@/components/auto-logout";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function StudentLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const profile = await getUserProfile();
    
    if (profile?.role === 'facility_admin') {
        redirect('/portal/facility');
    }
    const displayName = profile?.full_name ?? 'Student';
    const initials = displayName
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <div className="flex min-h-screen bg-muted/20">
            <AutoLogout timeoutMinutes={60} />
            <PortalSidebar role="student" />
            <div className="flex-grow pl-64">
                {/* Portal Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-8">
                    <div className="flex-grow">
                        <h2 className="text-lg font-semibold text-secondary">NIC Portal</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-medium text-secondary">{displayName}</p>
                            <p className="text-xs text-muted-foreground">{profile?.email ?? ''}</p>
                        </div>
                        <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border">
                            {profile?.avatar_url ? (
                                <Image 
                                    src={profile.avatar_url} 
                                    alt={displayName} 
                                    width={40} 
                                    height={40} 
                                    className="h-full w-full object-cover" 
                                />
                            ) : (
                                initials
                            )}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
