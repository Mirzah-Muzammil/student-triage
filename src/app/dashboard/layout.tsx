import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex bg-white w-full h-full">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 h-full bg-[#f8fafd]">
          <main className="flex-1 p-4 sm:p-6 md:p-8 pt-16 md:pt-8 space-y-6 overflow-y-auto h-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
