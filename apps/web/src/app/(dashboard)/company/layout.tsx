import CompanyGuard from '@/components/auth/CompanyGuard';

export default function CompanyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <CompanyGuard>{children}</CompanyGuard>;
}
