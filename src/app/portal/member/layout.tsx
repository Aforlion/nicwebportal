import { PortalSidebar } from "@/components/portal-sidebar";
import { getUserProfile, getMembership } from "@/lib/auth";
import { AutoLogout } from "@/components/auto-logout";
import Image from "next/image";

export default async function MemberLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const profile = await getUserProfile();
    const membership = profile ? await getMembership(profile.id) : null;

    const displayName = profile?.full_name ?? 'Member';
    const memberNo = membership?.member_number ?? '';

    const initials = displayName
        .split(' ')
        .filter((n: string) => n)
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <div className="flex min-h-screen bg-muted/20">
            <AutoLogout timeoutMinutes={30} />
            <PortalSidebar role="member" />
            <div className="flex-grow pl-64">
                {/* Portal Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-8">
                    <div className="flex-grow">
                        <h2 className="text-lg font-semibold text-secondary">NIC Portal</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-medium text-secondary">{displayName}</p>
                            <p className="text-xs text-muted-foreground">{memberNo ? `Membership No: ${memberNo}` : (profile?.email ?? '')}</p>
                        </div>
                        <div className="h-10 w-10 shrink-0 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold overflow-hidden border">
                            {profile?.avatar_url ? (
                                <Image 
                                    src={profile.avatar_url} 
                                    alt={displayName} 
                                    width={40} 
                                    height={40} 
                                    className="h-full w-full object-cover" 
                                />
                            ) : (
                                initials || 'M'
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
