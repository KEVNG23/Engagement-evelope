"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "vi" | "en";

const STORAGE_KEY = "engagement-locale";

const messages = {
  vi: {
    inviteFrom: "THIỆP MỜI TỪ",
    openLabel: "Nhấn để mở thiệp",
    openLabelEn: "Click to Open",
    skipLabel: "Bỏ qua hoạt ảnh",
    opening: "Đang mở thiệp…",
    scrollDetails: "Cuộn xuống để xem chi tiết",
    saveTheDate: "SAVE THE DATE",
    title: "LỄ ĐÍNH HÔN",
    ceremonyLine: "Cử hành lễ đính hôn lúc 09:00 sáng",
    venueLabel: "TẠI TƯ GIA",
    address: "616 Lê Đức Anh, P. Bình Hưng Hòa B, Q. Bình Tân, TP. Hồ Chí Minh",
    addressOld:
      "(Địa chỉ cũ: 616 Quốc Lộ 1A, P Bình Hưng Hoà B, Q. Bình Tân, TP HCM )",
    weekday: "Thứ Bảy",
    timeOfDay: "lúc 9 sáng",
    month: "THÁNG 1",
    lunar: "(Nhằm ngày 25 tháng 11 2026 Âm Lịch)",
    footer: "Save the date and celebrate this special moment with us",
    detailsAria: "Chi tiết lễ đính hôn",
    weddingEyebrow: "SAVE THE DATE",
    weddingTitle: "LỄ THÀNH HÔN",
    weddingLine: "Dự kiến cử hành lúc 09:00 sáng",
    weddingVenueLabel: "ĐỊA ĐIỂM",
    weddingVenue: "Sẽ được thông báo sau",
    weddingNote:
      "Đây là lời lưu ngày — thiệp mời chính thức sẽ được gửi đến Quý khách trong thời gian tới.",
    weddingWeekday: "Chủ Nhật",
    weddingTimeOfDay: "lúc 9 sáng",
    weddingMonth: "THÁNG 1",
    weddingLunar: "(Nhằm ngày 10 tháng 12 2026 Âm Lịch)",
    weddingFooter:
      "Kindly save the date — a formal wedding invitation will follow",
    weddingAria: "Lưu ngày lễ thành hôn",
    rsvpTitle: "THIỆP PHÚC ĐÁP",
    rsvpIntro1:
      "Sự hiện diện của Quý khách sẽ là niềm vinh hạnh và góp phần tạo nên những kỷ niệm đẹp trong ngày vui của chúng tôi.",
    rsvpIntro2:
      "Để chúng tôi có thể chuẩn bị chu đáo cho buổi tiệc, kính mong Quý khách vui lòng xác nhận tham dự trước ngày 30/11/2026 bằng cách điền thông tin bên dưới.",
    rsvpIntro3:
      "Xin chân thành cảm ơn và rất mong được đón tiếp Quý khách trong ngày vui của chúng tôi.",
    rsvpName: "Họ và Tên",
    rsvpGuestGroup: "Bạn thuộc nhóm khách:",
    rsvpAttend: "Bạn có thể tham dự không?",
    rsvpAllergy: "Bạn có bị dị ứng thực phẩm nào không?",
    rsvpVegetarian: "Bạn có phải người ăn chay trường không",
    rsvpOther: "Other:",
    rsvpOtherPlaceholder: "Vui lòng ghi rõ",
    rsvpAllergyPlaceholder: "Nếu có, vui lòng ghi rõ",
    rsvpSubmit: "Gửi",
    rsvpSubmitting: "Đang gửi…",
    rsvpError: "Không gửi được. Vui lòng thử lại.",
    rsvpThanks: "Cảm ơn Quý khách đã gửi phúc đáp!",
    rsvpAlready: "Quý khách đã gửi phúc đáp trên thiết bị này.",
    rsvpChecking: "Đang kiểm tra phúc đáp…",
    rsvpMissingTitle: "Không tìm thấy phúc đáp",
    rsvpMissingBody:
      "Rất tiếc, chúng tôi không tìm thấy phúc đáp gắn với link này. Có thể phúc đáp đã bị xoá nhầm hoặc link không còn hiệu lực. Quý khách vui lòng điền lại form để gửi phúc đáp mới — thiết bị này đã được mở lại để Quý khách gửi được.",
    rsvpMissingCta: "Điền lại phúc đáp",
    rsvpSaveLink:
      "Lưu link riêng bên dưới để xem lại câu trả lời bất kỳ lúc nào — không cần đăng nhập.",
    rsvpView: "Xem phúc đáp",
    rsvpCopy: "Copy link",
    rsvpCopied: "Đã copy",
    rsvpViewTitle: "Phúc đáp của Quý khách",
    rsvpViewHint:
      "Hãy lưu link này để xem lại phúc đáp của mình. Không cần đăng nhập.",
    rsvpBack: "Quay lại thiệp mời",
    rsvpLabelName: "Họ và Tên",
    rsvpLabelGroup: "Nhóm khách",
    rsvpLabelAttend: "Tham dự",
    rsvpLabelAllergy: "Dị ứng thực phẩm",
    rsvpLabelVegetarian: "Ăn chay trường",
    guestFamily: "Người nhà",
    guestBrideParents: "Bạn của ba mẹ cô dâu",
    guestGroomParents: "Bạn của ba mẹ chú rể",
    guestCouple: "Bạn của cô dâu chú rể",
    attendYes: "Có, tôi sẽ tham dự",
    attendNo: "Rất tiếc, tôi không thể tham dự",
    yes: "Có",
    no: "Không",
    langVi: "Tiếng Việt",
    langEn: "English",
  },
  en: {
    inviteFrom: "YOU'VE GOT INVITED FROM",
    openLabel: "Tap to open the invitation",
    openLabelEn: "Click to Open",
    skipLabel: "Skip animation",
    opening: "Opening invitation…",
    scrollDetails: "Scroll down for details",
    saveTheDate: "SAVE THE DATE",
    title: "ENGAGEMENT CEREMONY",
    ceremonyLine: "Engagement ceremony at 9:00 AM",
    venueLabel: "BRIDE'S RESIDENCE",
    address:
      "616 Le Duc Anh, Binh Hung Hoa B Ward, Binh Tan Dist., Ho Chi Minh City",
    addressOld:
      "(Former address: 616 Quoc Lo 1A, Binh Hung Hoa B Ward, Binh Tan Dist., HCMC)",
    weekday: "Saturday",
    timeOfDay: "at 9 AM",
    month: "JANUARY",
    lunar: "(Lunar calendar: 25 November 2026)",
    footer: "Save the date and celebrate this special moment with us",
    detailsAria: "Engagement ceremony details",
    weddingEyebrow: "SAVE THE DATE",
    weddingTitle: "WEDDING DAY",
    weddingLine: "Ceremony planned for 9:00 AM",
    weddingVenueLabel: "VENUE",
    weddingVenue: "To be announced",
    weddingNote:
      "This is a save-the-date only — a formal wedding invitation will be sent to you later.",
    weddingWeekday: "Sunday",
    weddingTimeOfDay: "at 9 AM",
    weddingMonth: "JANUARY",
    weddingLunar: "(Lunar calendar: 10 December 2026)",
    weddingFooter:
      "Kindly save the date — a formal wedding invitation will follow",
    weddingAria: "Wedding day save the date",
    rsvpTitle: "RSVP",
    rsvpIntro1:
      "Your presence would be our greatest honour and would help make this day unforgettable.",
    rsvpIntro2:
      "To help us prepare thoughtfully, please confirm your attendance before 30/11/2026 by filling in the form below.",
    rsvpIntro3:
      "Thank you sincerely — we look forward to welcoming you on our special day.",
    rsvpName: "Full name",
    rsvpGuestGroup: "You are attending as:",
    rsvpAttend: "Will you be able to attend?",
    rsvpAllergy: "Do you have any food allergies?",
    rsvpVegetarian: "Are you vegetarian?",
    rsvpOther: "Other:",
    rsvpOtherPlaceholder: "Please specify",
    rsvpAllergyPlaceholder: "If yes, please specify",
    rsvpSubmit: "Submit",
    rsvpSubmitting: "Sending…",
    rsvpError: "Could not submit. Please try again.",
    rsvpThanks: "Thank you for your RSVP!",
    rsvpAlready: "You have already submitted an RSVP on this device.",
    rsvpChecking: "Checking your RSVP…",
    rsvpMissingTitle: "We couldn't find your RSVP",
    rsvpMissingBody:
      "Sorry — this private link no longer matches a saved response. It may have been removed by mistake, or the link is no longer valid. You're welcome to fill in the form again; we've unlocked this browser so you can submit a new RSVP.",
    rsvpMissingCta: "Submit again",
    rsvpSaveLink:
      "Save the private link below to view your answers anytime — no login needed.",
    rsvpView: "View RSVP",
    rsvpCopy: "Copy link",
    rsvpCopied: "Copied",
    rsvpViewTitle: "Your RSVP",
    rsvpViewHint:
      "Please save this link to view your RSVP later. No login required.",
    rsvpBack: "Back to invitation",
    rsvpLabelName: "Full name",
    rsvpLabelGroup: "Guest group",
    rsvpLabelAttend: "Attendance",
    rsvpLabelAllergy: "Food allergies",
    rsvpLabelVegetarian: "Vegetarian",
    guestFamily: "Family",
    guestBrideParents: "Friend of the bride's parents",
    guestGroomParents: "Friend of the groom's parents",
    guestCouple: "Friend of the couple",
    attendYes: "Yes, I will attend",
    attendNo: "Sorry, I cannot attend",
    yes: "Yes",
    no: "No",
    langVi: "Tiếng Việt",
    langEn: "English",
  },
} as const;

export type MessageKey = keyof typeof messages.vi;

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("vi");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "vi") setLocaleState(saved);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key) => messages[locale][key],
    }),
    [locale, setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}

/** Map English UI choices back to Vietnamese values for Google Form / storage. */
export const rsvpValueMap = {
  guestGroups: [
    { vi: "Người nhà", key: "guestFamily" as const },
    { vi: "Bạn của ba mẹ cô dâu", key: "guestBrideParents" as const },
    { vi: "Bạn của ba mẹ chú rể", key: "guestGroomParents" as const },
    { vi: "Bạn của cô dâu chú rể", key: "guestCouple" as const },
  ],
  attend: [
    { vi: "Có, tôi sẽ tham dự", key: "attendYes" as const },
    { vi: "Rất tiếc, tôi không thể tham dự", key: "attendNo" as const },
  ],
  yesNo: [
    { vi: "Có", key: "yes" as const },
    { vi: "Không", key: "no" as const },
  ],
} as const;

export function translateStoredRsvpValue(value: string, locale: Locale) {
  if (locale === "vi") return value;
  for (const item of rsvpValueMap.guestGroups) {
    if (item.vi === value) return messages.en[item.key];
  }
  for (const item of rsvpValueMap.attend) {
    if (item.vi === value) return messages.en[item.key];
  }
  for (const item of rsvpValueMap.yesNo) {
    if (item.vi === value) return messages.en[item.key];
  }
  return value;
}
