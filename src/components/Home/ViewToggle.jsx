export default function ViewToggle({ viewWeekly, setViewWeekly, onResetDay }) {
  const handleViewToggle = () => {
    setViewWeekly(!viewWeekly);
    // Reset selected day when switching to weekly view
    if (!viewWeekly && onResetDay) {
      onResetDay();
    }
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-white text-lg  font-semibold">
        {viewWeekly ? 'Weekly Schedule' : "Day Schedule"}
      </h2>
      <button
        onClick={handleViewToggle}
        className="bg-white/5 px-3 py-1.5 rounded-lg border border-accent/10 text-accent  text-sm hover:bg-accent/10 transition-all duration-200"
      >
        {viewWeekly ? 'Day' : 'Weekly'}
      </button>
    </div>
  )
}
