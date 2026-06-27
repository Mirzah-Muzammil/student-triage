"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout, getAdminUser } from "@/features/auth/actions";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState("Admin");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    getAdminUser().then((name) => {
      if (name) {
        setAdminUser(name.charAt(0).toUpperCase() + name.slice(1));
      }
    });
  }, []);

  async function handleLogout() {
    setShowLogoutConfirm(false);
    await logout();
    router.push("/login");
    router.refresh();
  }

  const avatarLetter = adminUser.charAt(0).toUpperCase();

  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
    },
    {
      name: "Escalations",
      href: "/dashboard/escalations",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      name: "Junk/Spam",
      href: "/dashboard/spam",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.246.467c.33.123.708.072 1.01-.11a6.83 6.83 0 01.25-.152c.3-.18.52-.47.57-.81l.22-1.28z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Floating Hamburger Toggle (Mobile/Tablet only) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Navigation"
        className="fixed top-4.5 left-4 z-40 md:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-600 shadow-xs hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center h-9 w-9"
      >
        <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Backdrop overlay for mobile menu drawer */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-30 md:hidden animate-in fade-in duration-200"
        />
      )}

      <aside
        className={`fixed md:relative inset-y-0 left-0 z-40 w-64 border-r border-slate-200/80 bg-white flex flex-col justify-between h-full shrink-0 transform transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="px-6 py-6 block select-none">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight text-slate-800 block">
              Dashboard
            </Link>
          </div>

          {/* Navigation items */}
          <nav className="mt-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`relative flex items-center gap-3 px-6 py-3.5 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#f0f4f8] text-blue-600 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-blue-600"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Profile bottom block */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar Icon */}
            <div className="h-9 w-9 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shrink-0 border border-indigo-100 select-none">
              {avatarLetter}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate leading-none">
                {adminUser}
              </p>
              <p className="text-[10px] font-semibold text-slate-400 mt-1.5 truncate leading-none">
                System Administrator
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            title="Sign Out"
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-100/50 transition-all cursor-pointer shrink-0"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
          </button>
        </div>
      </aside>

      {/* Custom Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="bg-white border border-slate-100 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold mx-auto border border-rose-100">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                  />
                </svg>
              </div>
              <h3 className="text-base font-extrabold text-slate-800">
                Confirm Sign Out
              </h3>
              <p className="text-xs text-slate-400 font-medium leading-normal max-w-[240px] mx-auto">
                Are you sure you want to end your active session and sign out?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 h-10 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 h-10 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer border border-rose-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

