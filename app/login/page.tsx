import Link from "next/link";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted p-6">
            <div className="w-full max-w-md bg-white rounded-sm border border-border shadow-md overflow-hidden">
                {/* Top Header Information */}
                <div className="bg-primary px-8 py-6 text-white text-center">
                    <div className="mb-2 text-2xl font-bold tracking-tight">SECURE ACCESS PORTAL</div>
                    <div className="text-[10px] uppercase tracking-[0.2em] opacity-80">Agrochem Central Unified Platform</div>
                </div>

                {/* Login Form */}
                <div className="px-8 py-10">
                    <form className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="id" className="text-xs font-bold uppercase tracking-wider text-secondary">
                                Employee Identification Number
                            </label>
                            <input
                                id="id"
                                type="text"
                                placeholder="AC-000-0000"
                                className="input-field text-sm"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="pass" className="text-xs font-bold uppercase tracking-wider text-secondary">
                                    Security Password
                                </label>
                                <Link href="#" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wide">
                                    Reset Credentials
                                </Link>
                            </div>
                            <input
                                id="pass"
                                type="password"
                                placeholder="••••••••"
                                className="input-field text-sm"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="remember" className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                            <label htmlFor="remember" className="text-xs text-secondary">
                                Authorize device for 24-hour session
                            </label>
                        </div>

                        <Link href="/dashboard" className="btn-primary mt-2 text-center">
                            Authenticate & Enter
                        </Link>
                    </form>

                    <div className="mt-10 border-t border-border pt-6 text-center">
                        <p className="text-[11px] text-secondary leading-relaxed">
                            Authorized personnel only. All access and operations are logged and monitored under national supply chain security protocols.
                        </p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="bg-muted px-8 py-3 text-center border-t border-border">
                    <Link href="/" className="text-[10px] font-bold text-secondary hover:text-primary uppercase tracking-wider transition-colors">
                        ← Return to Public Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
