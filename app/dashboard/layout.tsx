import Sidebar from "./components/Sidebar";
import UserMenu from "./components/UserMenu";
import MobileRestriction from "./components/MobileRestriction";
import { Search, Clock, Leaf } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <MobileRestriction />
            <div className="hidden md:flex h-screen bg-slate-50 text-slate-900 font-sans">
                {/* Persistent Sidebar */}
                <Sidebar />

                {/* Main Content Area */}
                <main className="flex-grow flex flex-col min-w-0 overflow-hidden">
                    {/* Top Header */}
                    <header className="h-16 bg-white border-b border-border px-8 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="h-8 w-8 bg-primary/10 rounded-sm flex items-center justify-center text-primary">
                                <Leaf size={16} />
                            </div>
                            <h2 className="text-xs font-bold uppercase tracking-widest text-secondary">
                                Prispat Prime <span className="mx-2 opacity-20">|</span>
                                <span className="text-primary">System Core</span>
                            </h2>
                            <div className="bg-green-50 text-green-600 text-[9px] font-bold px-2 py-0.5 rounded-full border border-green-100 uppercase tracking-tighter">
                                Session Secure
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" size={14} />
                                <input
                                    type="text"
                                    placeholder="REGISTRY SEARCH [ALT+/]"
                                    className="bg-muted border border-border rounded-sm py-1.5 pl-9 pr-4 text-[10px] w-64 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all uppercase tracking-wider font-medium"
                                />
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right hidden md:block">
                                    <div className="text-[10px] font-black text-primary uppercase tracking-tighter">11 MAR 2026</div>
                                    <div className="text-[9px] text-secondary font-bold uppercase tracking-widest">11:58 AM GMT</div>
                                </div>

                                <UserMenu />
                            </div>
                        </div>
                    </header>

                    {/* Content Region */}
                    <div className="flex-grow overflow-y-auto p-8">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </div>

                    {/* Footer Area */}
                    <footer className="h-10 bg-white border-t border-border px-8 flex items-center justify-between text-[10px] font-bold text-secondary uppercase tracking-widest shrink-0">
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
