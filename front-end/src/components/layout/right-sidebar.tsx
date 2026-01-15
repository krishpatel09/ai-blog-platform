export default function RightSidebar() {
  return (
    <div className="flex flex-col gap-5">
      <section>
        <h3 className="font-bold mb-4">Staff Picks</h3>
        <div className="flex flex-col gap- text-sm font-medium">
          <p className="hover:underline cursor-pointer">
            AI ભવિષ્ય બદલી નાખશે? - નિષ્ણાંતોનો મત
          </p>
          <p className="hover:underline cursor-pointer">
            Next.js 15 માં શું નવું છે?
          </p>
        </div>
      </section>

      <section>
        <h3 className="font-bold mb-4">Recommended topics</h3>
        <div className="flex flex-wrap gap-2">
          {["Tech", "Programming", "Life", "Startup"].map((tag) => (
            <span
              key={tag}
              className="bg-gray-100 px-3 py-1 rounded-full text-xs cursor-pointer hover:bg-gray-200"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
