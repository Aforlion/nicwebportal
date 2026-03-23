"use client"

import { PortalSidebar } from "@/components/portal-sidebar";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { AutoLogout } from "@/components/auto-logout";
import NextImage from "next/image";

export default function FacilityLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [user, setUser] = useState<any>(null);
    const [facility, setFacility] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                // Fetch facility linked to this owner
                const { data } = await supabase
                    .from('facilities')
                    .select('*')
                    .eq('owner_id', user.id)
                    .single();
                setFacility(data);
            }
        };
        getUser();
    }, []);

    return (
        <div className="flex min-h-screen bg-muted/20">
            <AutoLogout timeoutMinutes={30} />
            <PortalSidebar role="facility" />
            <div className="flex-grow pl-64">
                {/* Portal Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-8">
                    <div className="flex-grow">
                        <h2 className="text-lg font-semibold text-secondary">NIC Portal</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-medium text-secondary">{user?.user_metadata?.full_name || 'Facility Owner'}</p>
                            <p className="text-xs text-muted-foreground">{facility?.name || 'Loading Facility...'}</p>
                        </div>
                        <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden border">
                             {user?.user_metadata?.avatar_url ? (
                                <NextImage 
                                    src={user.user_metadata.avatar_url} 
                                    alt={user?.user_metadata?.full_name || 'F'} 
                                    width={40} 
                                    height={40} 
                                    className="h-full w-full object-cover" 
                                />
                            ) : (
                                user?.user_metadata?.full_name?.[0] || 'F'
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
