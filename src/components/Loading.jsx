export default function LoadingPulseOverlay({ message = null }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50">
      <div className="h-5 w-5 bg-accent/35 rounded-full animate-pulse flex justify-center items-center mb-4">
        <div className="h-3 w-3 rounded-full bg-accent"></div>
      </div>
      {message && (
        <p className="text-white/70 text-sm text-center px-4 max-w-xs">
          {message}
        </p>
      )}
    </div>
  )
}
