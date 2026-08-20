"use client";

import { invitation } from "@/lib/invitation-data";
import { RevealSection } from "./RevealSection";

/**
 * Cream stationery card on the same burgundy page background as the envelope —
 * no embedded burgundy from a Canva screenshot (that caused the top/bottom mismatch).
 */
export function InvitationDetails() {
  return (
    <div className="relative w-full bg-[#3d1418] pb-[max(7rem,calc(env(safe-area-inset-bottom)+5rem))] pt-4">
      <section
        id="invitation-details"
        className="scroll-mt-6 mx-auto w-full max-w-lg px-4 sm:max-w-xl sm:px-6"
        aria-label="Chi tiết lễ đính hôn"
      >
        <RevealSection>
          <article className="border border-[#fff8ef]/90 bg-[#f2eee9] px-5 py-9 text-center text-[#6b4a32] shadow-none sm:px-10 sm:py-12">
            <p className="font-serif text-[14px] leading-relaxed tracking-wide sm:text-base">
              {invitation.ceremonyLine}
            </p>

            <h2 className="mt-5 font-serif text-[1.85rem] font-semibold tracking-[0.1em] text-[#4a1b24] sm:text-4xl">
              {invitation.venueLabel}
            </h2>

            <p className="mx-auto mt-4 max-w-md font-serif text-[14px] leading-relaxed sm:text-base">
              {invitation.address}
            </p>
            <p className="mx-auto mt-2 max-w-md font-serif text-[12px] leading-relaxed text-[#6b4a32]/85 sm:text-sm">
              {invitation.addressOld}
            </p>

            <p
              aria-hidden
              className="mt-6 font-serif text-3xl text-[#a88a64] sm:text-4xl"
            >
              {invitation.doubleHappiness}
            </p>

            <div className="mx-auto mt-5 max-w-sm border-y border-[#a88a64]/55 py-5">
              <p className="font-serif text-[13px] tracking-[0.3em] text-[#6b4a32] sm:text-sm sm:tracking-[0.35em]">
                {invitation.month}
              </p>
              <p className="mt-3 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 font-serif text-[#4a1b24]">
                <span className="text-base tracking-wide sm:text-lg">
                  {invitation.weekday}
                </span>
                <span className="text-5xl font-semibold leading-none sm:text-6xl">
                  {invitation.day}
                </span>
                <span className="text-base tracking-wide sm:text-lg">
                  {invitation.timeOfDay}
                </span>
              </p>
              <p className="mt-3 font-serif text-base tracking-[0.2em]">
                {invitation.year}
              </p>
            </div>

            <p className="mt-4 font-serif text-[12px] text-[#6b4a32]/85 sm:text-sm">
              {invitation.lunar}
            </p>

            <p className="mt-8 font-serif text-[12px] italic leading-relaxed text-[#6b4a32]/90 sm:text-sm">
              {invitation.footer}
            </p>
            <p aria-hidden className="mt-3 text-sm text-[#3d1418]">
              ♥
            </p>
          </article>
        </RevealSection>
      </section>

      <RevealSection className="mx-auto mt-8 w-full max-w-lg px-4 sm:mt-10 sm:max-w-xl sm:px-6">
        <div className="border border-[#fff8ef]/90 bg-[#f2eee9] px-5 py-9 sm:px-8 sm:py-10">
          <h3 className="text-center font-serif text-base tracking-[0.3em] text-[#a88a64]">
            RSVP
          </h3>
          
          <div className="mx-auto mt-6 max-w-md space-y-4 text-left">
            <p className="font-serif text-sm leading-relaxed text-[#4a1b24]">
              Sự hiện diện của Quý khách sẽ là niềm vinh hạnh và góp phần tạo nên những kỷ niệm đẹp trong ngày cưới của chúng tôi.
            </p>
            
            <p className="font-serif text-sm leading-relaxed text-[#4a1b24]">
              Để chúng tôi có thể chuẩn bị chu đáo cho buổi tiệc, kính mong Quý khách vui lòng xác nhận tham dự trước ngày 30/12/2026 bằng cách điền thông tin bên dưới.
            </p>
            
            <p className="font-serif text-sm leading-relaxed text-[#4a1b24]">
              Xin chân thành cảm ơn và rất mong được đón tiếp Quý khách trong ngày vui của chúng tôi.
            </p>
          </div>

          <form className="mx-auto mt-8 max-w-md space-y-6">
            {/* Họ và Tên */}
            <div className="text-left">
              <label htmlFor="fullName" className="block font-serif text-sm font-medium text-[#4a1b24]">
                Họ và Tên <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                required
                className="mt-2 w-full border border-[#a88a64]/40 bg-white px-4 py-2.5 font-serif text-sm text-[#4a1b24] focus:border-[#a88a64] focus:outline-none focus:ring-1 focus:ring-[#a88a64]"
              />
            </div>

            {/* Bạn thuộc nhóm khách */}
            <div className="text-left">
              <label htmlFor="guestGroup" className="block font-serif text-sm font-medium text-[#4a1b24]">
                Bạn thuộc nhóm khách: <span className="text-red-600">*</span>
              </label>
              <select
                id="guestGroup"
                name="guestGroup"
                required
                className="mt-2 w-full border border-[#a88a64]/40 bg-white px-4 py-2.5 font-serif text-sm text-[#4a1b24] focus:border-[#a88a64] focus:outline-none focus:ring-1 focus:ring-[#a88a64]"
              >
                <option value="">Chọn nhóm khách</option>
                <option value="nguoi-nha">Người nhà</option>
                <option value="ban-bo-me-co-dau">Bạn của ba mẹ cô dâu</option>
                <option value="ban-bo-me-chu-re">Bạn của ba mẹ chú rể</option>
                <option value="ban-co-dau-chu-re">Bạn của cô dâu chú rể</option>
                <option value="khac">Khác</option>
              </select>
            </div>

            {/* Bạn có thể tham dự không */}
            <div className="text-left">
              <label className="block font-serif text-sm font-medium text-[#4a1b24]">
                Bạn có thể tham dự không? <span className="text-red-600">*</span>
              </label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="attendance"
                    value="yes"
                    required
                    className="h-4 w-4 border-[#a88a64]/40 text-[#3d1418] focus:ring-[#a88a64]"
                  />
                  <span className="ml-2 font-serif text-sm text-[#4a1b24]">Có, tôi sẽ tham dự</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="attendance"
                    value="no"
                    required
                    className="h-4 w-4 border-[#a88a64]/40 text-[#3d1418] focus:ring-[#a88a64]"
                  />
                  <span className="ml-2 font-serif text-sm text-[#4a1b24]">Rất tiếc, tôi không thể tham dự</span>
                </label>
              </div>
            </div>

            {/* Bạn có bị dị ứng thực phẩm nào không */}
            <div className="text-left">
              <label htmlFor="allergies" className="block font-serif text-sm font-medium text-[#4a1b24]">
                Bạn có bị dị ứng thực phẩm nào không? <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="allergies"
                name="allergies"
                required
                placeholder="Không có hoặc nhập loại thực phẩm"
                className="mt-2 w-full border border-[#a88a64]/40 bg-white px-4 py-2.5 font-serif text-sm text-[#4a1b24] placeholder:text-[#6b4a32]/50 focus:border-[#a88a64] focus:outline-none focus:ring-1 focus:ring-[#a88a64]"
              />
            </div>

            {/* Bạn có phải người ăn chay trường không */}
            <div className="text-left">
              <label className="block font-serif text-sm font-medium text-[#4a1b24]">
                Bạn có phải người ăn chay trường không <span className="text-red-600">*</span>
              </label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="vegetarian"
                    value="yes"
                    required
                    className="h-4 w-4 border-[#a88a64]/40 text-[#3d1418] focus:ring-[#a88a64]"
                  />
                  <span className="ml-2 font-serif text-sm text-[#4a1b24]">Có</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="vegetarian"
                    value="no"
                    required
                    className="h-4 w-4 border-[#a88a64]/40 text-[#3d1418] focus:ring-[#a88a64]"
                  />
                  <span className="ml-2 font-serif text-sm text-[#4a1b24]">Không</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full border border-[#a88a64]/55 bg-[#3d1418] px-8 py-3 font-serif text-base tracking-[0.2em] text-[#f3e8d5] transition hover:bg-[#4a1b24] active:bg-[#4a1b24]"
              >
                GỬI
              </button>
            </div>
          </form>
        </div>
      </RevealSection>
    </div>
  );
}
