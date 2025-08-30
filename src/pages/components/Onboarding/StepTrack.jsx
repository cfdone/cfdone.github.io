export default function StepTrack({ currentStep, totalSteps }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, idx) => (
        <div
          key={idx}
          className={`h-2 w-2 rounded-full transition-all duration-200 ${
            currentStep === idx + 1
              ? "bg-accent scale-110 shadow"
              : "bg-white/10"
          }`}
        />
      ))}
    </div>
  );
}
