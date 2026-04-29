import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark p-6">
      <section className="flex flex-col gap-6 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 overflow-hidden relative group max-w-2xl w-full text-center">
        <div className="flex justify-between items-center relative z-10 w-full mb-4">
          <h3 className="font-bold text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-[0.2em] mx-auto">
            Routing Exception
          </h3>
        </div>
        
        <div className="relative py-12 flex flex-col items-center justify-center">
          <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
            <div className="w-72 h-72 bg-primary blur-[120px] rounded-full"></div>
          </div>
          
          <div className="relative mb-6">
            <span className="text-[140px] font-black text-slate-100 dark:text-slate-800/40 leading-none select-none font-display">
              404
            </span>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/40 dark:bg-background-dark/60 backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl">
              <span className="material-symbols-outlined text-primary text-5xl">route</span>
            </div>
          </div>
          
          <h4 className="text-3xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white font-display">
            Procedure Not Found
          </h4>
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 text-lg">
            This resource may have been deprecated or moved.
          </p>
          
          <Link 
            href="/dashboard" 
            className="text-primary font-bold hover:text-primary/80 transition-colors flex items-center gap-2 text-sm border-b-2 border-primary/20 hover:border-primary/50 pb-1"
          >
            Return to Global Control Plane
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
