export default function ViewToggle({ viewWeekly, setViewWeekly }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-white text-lg font-product-sans font-bold">
        {viewWeekly ? 'Weekly Schedule' : "Today's Classes"}
      </h2>
      <button
        onClick={() => setViewWeekly(!viewWeekly)}
        className="bg-white/5 px-3 py-1.5 rounded-lg border border-accent/10 text-accent font-product-sans text-sm hover:bg-accent/10 transition-all duration-200"
      >
        {viewWeekly ? 'Today' : 'Weekly'}
      </button>
    </div>
  )
}
