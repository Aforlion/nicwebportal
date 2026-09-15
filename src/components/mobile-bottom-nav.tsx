'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Award,
  User,
  History,
  CreditCard,
  Users,
  CheckSquare,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  role: 'student' | 'member' | 'facility';
}

export function MobileBottomNav({ role }: MobileBottomNavProps) {
  const pathname = usePathname();

  const studentItems = [
    { title: 'Home', href: '/portal/student', icon: LayoutDashboard },
    { title: 'Courses', href: '/portal/student/courses', icon: BookOpen },
    { title: 'Exams', href: '/portal/student/exams', icon: GraduationCap },
    { title: 'Certs', href: '/portal/student/certificates', icon: Award },
    { title: 'Profile', href: '/portal/student/profile', icon: User },
  ];

  const memberItems = [
    { title: 'Home', href: '/portal/member', icon: LayoutDashboard },
    { title: 'Certs', href: '/portal/member/certificates', icon: Award },
    { title: 'CPD', href: '/portal/member/cpd', icon: History },
    { title: 'Payments', href: '/portal/member/payments', icon: CreditCard },
    { title: 'Profile', href: '/portal/member/profile', icon: User },
  ];

  const facilityItems = [
    { title: 'Home', href: '/portal/facility', icon: LayoutDashboard },
    { title: 'Staff', href: '/portal/facility/staff', icon: Users },
    { title: 'Inspections', href: '/portal/facility/inspections', icon: CheckSquare },
    { title: 'Accreditation', href: '/portal/facility/accreditation', icon: ShieldCheck },
  ];

  const items =
    role === 'student'
      ? studentItems
      : role === 'member'
      ? memberItems
      : facilityItems;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 shadow-lg">
      <div className="flex justify-around items-center">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-lg transition-all',
                isActive
                  ? 'text-primary font-bold bg-primary/10 dark:bg-primary/20 scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive ? 'text-primary' : '')} />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
