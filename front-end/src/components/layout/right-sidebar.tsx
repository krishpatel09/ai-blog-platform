export default function RightSidebar() {
  // Static data for Staff Picks
  const staffPicks = [
    {
      author: "Jane Doe",
      title: "The Future of React Server Components",
    },
    {
      author: "Tech Insider",
      title: "Why Rust is gaining momentum in 2026",
    },
    {
      author: "Design Matters",
      title: "Minimalism in Modern Web Interfaces",
    },
  ];

  return (
    <div className="flex flex-col gap-8 w-80">
      {/* Staff Picks Section */}
      <section>
        <h3 className="font-bold mb-4 text-base">Staff Picks</h3>
        <div className="flex flex-col gap-4">
          {staffPicks.map((pick, index) => (
            <div key={index} className="group cursor-pointer">
              <p className="text-xs font-semibold text-gray-700 mb-1">
                {pick.author}
              </p>
              <h4 className="text-sm font-bold leading-tight group-hover:underline">
                {pick.title}
              </h4>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended Topics Section */}
      <section>
        <h3 className="font-bold mb-4 text-base">Recommended topics</h3>
        <div className="flex flex-wrap gap-2">
          {["Tech", "Programming", "Life", "Startup", "AI", "Design"].map(
            (tag) => (
              <span
                key={tag}
                className="bg-gray-100 px-3 py-2 rounded-full text-xs font-medium cursor-pointer hover:bg-gray-200 transition-colors"
              >
                {tag}
              </span>
            ),
          )}
        </div>
      </section>
    </div>
  );
}
