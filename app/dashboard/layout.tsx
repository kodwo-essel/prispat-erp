import Sidebar from "./components/Sidebar";
import UserMenu from "./components/UserMenu";
import MobileRestriction from "./components/MobileRestriction";
import Clock from "./components/Clock";
import { Search, Leaf } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <MobileRestriction />
            <div className="hidden md:flex print:block h-screen bg-slate-50 text-slate-900 font-sans">
                {/* Persistent Sidebar */}
                <Sidebar />

                {/* Main Content Area */}
                <main className="flex-grow flex flex-col min-w-0 overflow-hidden">
                    {/* Top Header */}
                    <header className="h-16 bg-white border-b border-border px-8 flex items-center justify-end shrink-0 print:hidden">


                        <div className="flex items-center gap-6">
                            <Clock />
                            <UserMenu />
                        </div>
                    </header>

                    {/* Content Region */}
                    <div className="flex-grow overflow-y-auto p-8 print:p-0 print:overflow-visible">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </div>

                    {/* Footer Area */}
                    <footer className="h-10 bg-white border-t border-border px-8 flex items-center justify-between text-[10px] font-bold text-secondary uppercase tracking-widest shrink-0 print:hidden">
                        <div>© 2026 Prispat Prime Distribution</div>
                        <div className="flex gap-6">
                            <span className="hover:text-primary cursor-help">Technical Support</span>
                            <span className="hover:text-primary cursor-help">Audit Trails</span>
                            <span className="text-primary">v1.4.2-STABLE</span>
                        </div>
                    </footer>
                </main>
            </div>
        </>
    );
}
