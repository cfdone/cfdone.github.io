export default function LoadingPulseOverlay() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div className='h-5 w-5 bg-accent/35 rounded-full animate-pulse flex justify-center items-center'>
        <div className='h-3 w-3 rounded-full bg-accent'></div>
      </div>
    </div>
  );
}


