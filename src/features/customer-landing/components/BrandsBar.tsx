const BRANDS = Array.from({ length: 10 }, () => "BRANDS");

export default function BrandsBar() {
  return (
    <section className="relative left-1/2 -mx-[50vw] mt-16 h-[84px] w-screen bg-[#3C060D]">
      <div className="mx-auto flex h-full max-w-[1320px] items-center justify-between px-8 overflow-x-auto">
        {BRANDS.map((brand, i) => (
          <span
            key={i}
            className="font-figtree text-[15px] font-bold uppercase tracking-wide text-white shrink-0"
          >
            {brand}
          </span>
        ))}
      </div>
    </section>
  );
}
