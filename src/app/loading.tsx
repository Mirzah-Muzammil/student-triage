export default function Loading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50/50">
      <div className="relative flex flex-col items-center max-w-sm px-6 text-center space-y-6">
        {/* Animated Glow Backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-tr from-indigo-500/10 to-blue-500/10 blur-3xl rounded-full" />

        {/* Loader Icon / Symbol */}
        <div className="relative flex items-center justify-center">
          {/* Pulsing ring outer */}
          <div className="absolute w-16 h-16 rounded-full border-4 border-indigo-100/50 animate-ping duration-1000" />
          {/* Rotating gradient track spinner */}
          <div className="relative w-14 h-14 rounded-full border-4 border-slate-100 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 border-r-indigo-400 border-b-transparent border-l-transparent animate-spin duration-700" />
            {/* Inner logo/pulsing circle */}
            <div className="h-6 w-6 rounded-lg bg-indigo-50 flex items-center justify-center shadow-xs">
              <svg
                className="h-3.5 w-3.5 text-indigo-600 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 21l-.813-5.096L3 15l5.187-.813L9 9l.813 5.187L15 15l-5.187.813z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-1.5 z-10">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight animate-pulse">
            Loading Support Portal...
          </h3>
          <p className="text-xs text-slate-400 font-medium leading-normal max-w-xs">
            Preparing secure student intake form and AI assistant gateway.
          </p>
        </div>
      </div>
    </div>
  );
}
