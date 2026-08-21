import { guestGroupLabel, type RsvpRecord } from "./rsvp";

export type EmailAttendanceFilter = "all" | "attending" | "declining";

export type EmailableGuest = {
  token: string;
  name: string;
  email: string;
  guestGroup: string;
  attend: string;
};

export function isAttendingValue(attend: string) {
  const value = attend.trim().toLowerCase();
  return (
    value.includes("sẽ tham dự") ||
    value.includes("will attend") ||
    value.startsWith("có,")
  );
}

export function filterEmailRecipients(
  records: RsvpRecord[],
  opts: {
    attendance: EmailAttendanceFilter;
    guestGroup: string; // "all" or exact label
  },
): { withEmail: EmailableGuest[]; skippedNoEmail: number } {
  const attendance = opts.attendance;
  const category = opts.guestGroup.trim() || "all";

  let skippedNoEmail = 0;
  const withEmail: EmailableGuest[] = [];

  for (const record of records) {
    const group = guestGroupLabel(record);
    const attending = isAttendingValue(record.attend);

    if (attendance === "attending" && !attending) continue;
    if (attendance === "declining" && attending) continue;
    if (category !== "all" && group !== category) continue;

    const email = record.email?.trim() ?? "";
    if (!email) {
      skippedNoEmail += 1;
      continue;
    }

    withEmail.push({
      token: record.token,
      name: record.name,
      email,
      guestGroup: group,
      attend: record.attend,
    });
  }

  withEmail.sort((a, b) => a.name.localeCompare(b.name, "vi"));
  return { withEmail, skippedNoEmail };
}
