import VideoGenerator from './components/VideoGenerator';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-orange-500/30 selection:text-orange-200">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-800/20 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10">
        <VideoGenerator />
      </main>

      <footer className="relative z-10 py-12 border-t border-zinc-900 text-center">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-black rounded-sm rotate-45" />
            </div>
            <span className="font-medium tracking-tight">Gemini Video Studio</span>
          </div>
          <p className="text-zinc-600 text-sm font-light">
            © 2026 Gemini Video Studio. All rights reserved.
          </p>
          <div className="flex gap-6 text-zinc-500 text-sm font-light">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
