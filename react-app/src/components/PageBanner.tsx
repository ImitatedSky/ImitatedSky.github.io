import CoverImage from "./CoverImage";

interface Props {
  title: string;
  subtitle?: string;
  bg?: string;
}

export default function PageBanner({ title, subtitle, bg = "/img/index_img.jpg" }: Props) {
  return (
    <CoverImage src={bg} overlay="bg-black/50" className="w-full h-48 md:h-64">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl md:text-4xl font-bold drop-shadow-lg">{title}</h1>
        {subtitle && <p className="text-white/70 text-sm drop-shadow">{subtitle}</p>}
      </div>
    </CoverImage>
  );
}
