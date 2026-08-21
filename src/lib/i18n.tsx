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
    lunar: "(Nhằm 25.11.2026 Âm Lịch)",
    footer: "Save the date and celebrate this special moment with us",
    detailsAria: "Chi tiết lễ đính hôn",
    weddingEyebrow: "SAVE THE DATE",
    weddingTitle: "LỄ THÀNH HÔN",
    weddingLine: "",
    weddingVenueLabel: "THỜI GIAN VÀ ĐỊA ĐIỂM",
    weddingVenue: "Sẽ được thông báo sau",
    weddingNote:
      "Đây là lời lưu ngày — thiệp mời chính thức sẽ được gửi đến Quý khách trong thời gian tới.",
    weddingWeekday: "Chủ Nhật",
    weddingTimeOfDay: "",
    weddingMonth: "THÁNG 1",
    weddingLunar: "(Nhằm 10.12.2026 Âm Lịch)",
    weddingFooter:
      "Kindly save the date — a formal wedding invitation will follow",
    weddingAria: "Lưu ngày lễ thành hôn",
    hostTitle: "Báo cáo chủ nhà",
    hostSubtitle: "Chỉ dành cho Annie & Dũng — không chia sẻ link /host",
    hostPassword: "Mật khẩu",
    hostLogin: "Đăng nhập",
    hostLogout: "Đăng xuất",
    hostLoggingIn: "Đang đăng nhập…",
    hostBadPassword: "Mật khẩu không đúng.",
    hostNotConfigured:
      "Chưa đặt HOST_PASSWORD trên server. Thêm biến môi trường HOST_PASSWORD trên Railway rồi redeploy.",
    hostInviteLink: "Link thiệp mời gửi khách",
    hostCopyLink: "Copy link",
    hostCopied: "Đã copy",
    hostReport: "Tổng quan phúc đáp",
    hostResponses: "Chi tiết từng khách",
    hostEmpty: "Chưa có phúc đáp nào qua website.",
    hostRefresh: "Làm mới",
    hostCount: "Tổng phản hồi",
    hostAttending: "Sẽ tham dự",
    hostDeclining: "Không tham dự",
    hostVegetarianYes: "Ăn chay",
    hostVegetarianNo: "Không chay",
    hostByGroup: "Theo nhóm khách",
    hostAllergyList: "Ghi chú dị ứng",
    hostNoAllergyNotes: "Không có ghi chú dị ứng đặc biệt.",
    hostAttendingList: "Danh sách tham dự",
    hostDecliningList: "Danh sách vắng mặt",
    hostColName: "Họ và tên",
    hostColGroup: "Nhóm khách",
    hostColAttend: "Tham dự",
    hostColAllergy: "Dị ứng",
    hostColVegetarian: "Chay",
    hostColWhen: "Thời gian",
    hostColEmail: "Email",
    hostColLink: "Link riêng",
    hostOpen: "Mở",
    hostNote:
      "Báo cáo lấy từ website. Sau mỗi lần deploy, dữ liệu tạm có thể mất — khôi phục bằng Import CSV từ Google Form, hoặc gắn Volume Railway tại /data.",
    hostLive: "Đang theo dõi trực tiếp",
    hostCsv: "Tải CSV",
    hostPrint: "In / lưu PDF",
    hostDelete: "Xóa",
    hostDeleteConfirm: "Xóa phúc đáp này khỏi báo cáo website?",
    hostDeleting: "Đang xóa…",
    hostSyncGoogle: "Đồng bộ Google",
    hostSyncing: "Đang đồng bộ…",
    hostSyncOk: "Đã đồng bộ / khôi phục từ Google.",
    hostSyncNeedSheet:
      "Chưa có Sheet URL — dán CSV bên dưới (Form → Responses → Sheet → File → Download → CSV), hoặc đặt GOOGLE_SHEET_CSV_URL trên Railway.",
    hostSyncFail: "Đồng bộ thất bại. Kiểm tra CSV / Sheet URL.",
    hostColActions: "Thao tác",
    hostEmailEdit: "Sửa",
    hostEmailSave: "Lưu",
    hostEmailCancel: "Hủy",
    hostEmailPlaceholder: "Thêm email...",
    hostEmailExport: "Xuất danh sách email",
    hostShowMore: "Xem thêm",
    hostShowLess: "Thu gọn",
    hostShowingOf: "Hiển thị {shown}/{total}",
    hostMailTitle: "Gửi email hàng loạt",
    hostMailHint:
      "Lọc theo tham dự và nhóm khách, rồi gửi email tới mọi người trong bộ lọc có địa chỉ email. Dùng {{name}} để chèn tên khách.",
    hostMailAttendance: "Tham dự",
    hostMailAttendanceAll: "Tất cả",
    hostMailAttendanceYes: "Sẽ tham dự",
    hostMailAttendanceNo: "Không tham dự",
    hostMailCategory: "Nhóm khách",
    hostMailCategoryAll: "Tất cả nhóm",
    hostMailSubject: "Tiêu đề",
    hostMailBody: "Nội dung",
    hostMailSubjectPlaceholder: "Thông báo từ Annie & Dũng",
    hostMailBodyPlaceholder: "Xin chào {{name}},\n\n…",
    hostMailRecipients: "Sẽ gửi tới {n} khách",
    hostMailSkippedNoEmail: "(bỏ qua {n} không có email)",
    hostMailNoRecipients: "Không có khách nào khớp bộ lọc và có email.",
    hostMailPreview: "Xem danh sách người nhận",
    hostMailHidePreview: "Ẩn danh sách",
    hostMailSend: "Gửi email",
    hostMailSending: "Đang gửi…",
    hostMailConfirm: "Gửi email tới {n} khách với bộ lọc hiện tại?",
    hostMailOk: "Đã gửi {sent}. Bỏ qua (không email): {skipped}. Lỗi: {failed}.",
    hostMailNeedResend:
      "Chưa cấu hình Resend. Thêm RESEND_API_KEY và RESEND_FROM trên Railway rồi redeploy.",
    hostMailFail: "Gửi email thất bại. Thử lại hoặc kiểm tra cấu hình Resend.",
    hostMailZero: "Không có người nhận để gửi.",
    hostEphemeralWarn:
      "Cảnh báo: lưu trữ hiện tại sẽ mất khi Railway redeploy. Thêm Volume mount tại /data (hoặc RSVP_DATA_DIR), và/hoặc Import CSV từ Google Form để khôi phục.",
    hostImportTitle: "Khôi phục từ Google Form (CSV)",
    hostImportHint:
      "Mở Google Form → Responses → liên kết Spreadsheet → File → Download → Comma Separated Values (.csv). Dán toàn bộ nội dung CSV vào đây rồi bấm Khôi phục.",
    hostImportPlaceholder: "Dán nội dung CSV tại đây…",
    hostImportBtn: "Khôi phục từ CSV",
    hostImporting: "Đang khôi phục…",
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
    rsvpEmail: "Địa chỉ Email",
    rsvpEmailPlaceholder: "your.email@example.com",
    rsvpEmailHelp: "Email giúp chúng tôi liên lạc với Quý khách dễ dàng hơn trong tương lai.",
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
    lunar: "(Lunar calendar: 25.11.2026)",
    footer: "Save the date and celebrate this special moment with us",
    detailsAria: "Engagement ceremony details",
    weddingEyebrow: "SAVE THE DATE",
    weddingTitle: "WEDDING DAY",
    weddingLine: "",
    weddingVenueLabel: "TIME AND LOCATION",
    weddingVenue: "To be announced",
    weddingNote:
      "This is a save-the-date only — a formal wedding invitation will be sent to you later.",
    weddingWeekday: "Sunday",
    weddingTimeOfDay: "",
    weddingMonth: "JANUARY",
    weddingLunar: "(Lunar calendar: 10.12.2026)",
    weddingFooter:
      "Kindly save the date — a formal wedding invitation will follow",
    weddingAria: "Wedding day save the date",
    hostTitle: "Host report",
    hostSubtitle: "For Annie & Dũng only — do not share /host",
    hostPassword: "Password",
    hostLogin: "Sign in",
    hostLogout: "Sign out",
    hostLoggingIn: "Signing in…",
    hostBadPassword: "Incorrect password.",
    hostNotConfigured:
      "HOST_PASSWORD is not set. Add a HOST_PASSWORD environment variable on Railway, then redeploy.",
    hostInviteLink: "Invitation link for guests",
    hostCopyLink: "Copy link",
    hostCopied: "Copied",
    hostReport: "RSVP overview",
    hostResponses: "Guest details",
    hostEmpty: "No RSVPs submitted through the website yet.",
    hostRefresh: "Refresh",
    hostCount: "Total responses",
    hostAttending: "Attending",
    hostDeclining: "Not attending",
    hostVegetarianYes: "Vegetarian",
    hostVegetarianNo: "Not vegetarian",
    hostByGroup: "By guest group",
    hostAllergyList: "Allergy notes",
    hostNoAllergyNotes: "No special allergy notes.",
    hostAttendingList: "Attending list",
    hostDecliningList: "Not attending list",
    hostColName: "Name",
    hostColGroup: "Guest group",
    hostColAttend: "Attendance",
    hostColAllergy: "Allergies",
    hostColVegetarian: "Vegetarian",
    hostColWhen: "Submitted",
    hostColEmail: "Email",
    hostColLink: "Private link",
    hostOpen: "Open",
    hostNote:
      "Report uses the website store. Redeploys can wipe temporary storage — restore via CSV import from Google Form, or mount a Railway Volume at /data.",
    hostLive: "Live updates on",
    hostCsv: "Download CSV",
    hostPrint: "Print / save PDF",
    hostDelete: "Delete",
    hostDeleteConfirm: "Remove this RSVP from the website report?",
    hostDeleting: "Deleting…",
    hostSyncGoogle: "Sync Google",
    hostSyncing: "Syncing…",
    hostSyncOk: "Synced / restored from Google.",
    hostSyncNeedSheet:
      "No Sheet URL — paste CSV below (Form → Responses → Sheet → File → Download → CSV), or set GOOGLE_SHEET_CSV_URL on Railway.",
    hostSyncFail: "Sync failed. Check the CSV / Sheet URL.",
    hostColActions: "Actions",
    hostEmailEdit: "Edit",
    hostEmailSave: "Save",
    hostEmailCancel: "Cancel",
    hostEmailPlaceholder: "Add email...",
    hostEmailExport: "Export email list",
    hostShowMore: "Show more",
    hostShowLess: "Show less",
    hostShowingOf: "Showing {shown}/{total}",
    hostMailTitle: "Bulk email",
    hostMailHint:
      "Filter by attendance and guest group, then email everyone in that filter who has an address. Use {{name}} to insert the guest’s name.",
    hostMailAttendance: "Attendance",
    hostMailAttendanceAll: "Everyone",
    hostMailAttendanceYes: "Attending",
    hostMailAttendanceNo: "Not attending",
    hostMailCategory: "Guest group",
    hostMailCategoryAll: "All groups",
    hostMailSubject: "Subject",
    hostMailBody: "Message",
    hostMailSubjectPlaceholder: "A note from Annie & Dũng",
    hostMailBodyPlaceholder: "Dear {{name}},\n\n…",
    hostMailRecipients: "Will send to {n} guests",
    hostMailSkippedNoEmail: "(skipping {n} without email)",
    hostMailNoRecipients: "No guests match this filter and have an email.",
    hostMailPreview: "Show recipient list",
    hostMailHidePreview: "Hide list",
    hostMailSend: "Send email",
    hostMailSending: "Sending…",
    hostMailConfirm: "Send email to {n} guests with the current filters?",
    hostMailOk: "Sent {sent}. Skipped (no email): {skipped}. Failed: {failed}.",
    hostMailNeedResend:
      "Resend is not configured. Add RESEND_API_KEY and RESEND_FROM on Railway, then redeploy.",
    hostMailFail: "Could not send. Try again or check Resend configuration.",
    hostMailZero: "No recipients to send to.",
    hostEphemeralWarn:
      "Warning: storage is wiped on Railway redeploy. Add a Volume mounted at /data (or RSVP_DATA_DIR), and/or restore with CSV from Google Form.",
    hostImportTitle: "Restore from Google Form (CSV)",
    hostImportHint:
      "Open Google Form → Responses → linked Spreadsheet → File → Download → Comma Separated Values (.csv). Paste the full CSV here, then Restore.",
    hostImportPlaceholder: "Paste CSV contents here…",
    hostImportBtn: "Restore from CSV",
    hostImporting: "Restoring…",
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
    rsvpEmail: "Email Address",
    rsvpEmailPlaceholder: "your.email@example.com",
    rsvpEmailHelp: "Your email helps us reach you more easily in the future.",
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
