import Link from "next/link";
import { notFound } from "next/navigation";
import { displayFont } from "@/lib/fonts";
import { guestGroupLabel } from "@/lib/rsvp";
import { getRsvp } from "@/lib/rsvp-store";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function RsvpViewPage({ params }: PageProps) {
  const { token } = await params;
  const rsvp = await getRsvp(token);
  if (!rsvp) notFound();

  const rows = [
    { label: "Họ và Tên", value: rsvp.name },
    { label: "Nhóm khách", value: guestGroupLabel(rsvp) },
    { label: "Tham dự", value: rsvp.attend },
    { label: "Dị ứng thực phẩm", value: rsvp.allergy },
    { label: "Ăn chay trường", value: rsvp.vegetarian },
  ];

  return (
    <main className="min-h-[100dvh] bg-[#3d1418] px-4 py-12 text-[#f7ecd9] sm:px-6">
      <div className="mx-auto w-full max-w-[620px]">
        <p
          className={`${displayFont.className} text-center text-[clamp(1.6rem,6vw,2.4rem)] tracking-[0.14em]`}
        >
          THIỆP PHÚC ĐÁP
        </p>
        <p className="mt-3 text-center font-serif text-[#e0c9a8]">
          Phúc đáp của Quý khách
        </p>

        <div className="mt-10 space-y-5 border border-[#7d4652] bg-[#5a2730]/45 px-5 py-8 sm:px-8">
          {rows.map((row) => (
            <div key={row.label}>
              <p className="text-[0.75rem] tracking-[0.12em] text-[#d4b89a]">
                {row.label}
              </p>
              <p className="mt-1 font-serif text-[1.05rem] text-[#f7ecd9]">
                {row.value}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center font-serif text-sm leading-relaxed text-[#d4b89a]">
          Hãy lưu link này để xem lại phúc đáp của mình. Không cần đăng nhập.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href="/#rsvp"
            className="border border-[#e0c9a8]/50 px-5 py-3 font-serif text-sm tracking-[0.14em] text-[#e0c9a8] transition-colors hover:border-[#e0c9a8] hover:text-[#f7ecd9]"
          >
            Quay lại thiệp mời
          </Link>
        </div>
      </div>
    </main>
  );
}
