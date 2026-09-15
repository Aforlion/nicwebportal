import { PortalSidebar, MobilePortalDrawer } from "@/components/portal-sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
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
            <div className="flex-grow pl-0 md:pl-64 min-w-0 transition-all">
                {/* Portal Header */}
                <header className="sticky top-0 z-30 flex h-14 md:h-16 items-center border-b bg-background/95 backdrop-blur-md px-4 md:px-8">
                    <div className="flex items-center gap-3 flex-grow">
                        <MobilePortalDrawer role="student" />
                        <h2 className="text-base md:text-lg font-semibold text-secondary truncate">NIC Portal</h2>
                    </div>
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-secondary">{displayName}</p>
                            <p className="text-xs text-muted-foreground">{profile?.email ?? ''}</p>
                        </div>
                        <div className="h-9 w-9 md:h-10 md:w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border">
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
                <main className="p-4 sm:p-6 md:p-8 pb-20 md:pb-8 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>
            <MobileBottomNav role="student" />
        </div>
    );
}
