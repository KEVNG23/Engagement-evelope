import { RsvpMissingClient, RsvpViewClient } from "@/components/RsvpViewClient";
import { getRsvp } from "@/lib/rsvp-store";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function RsvpViewPage({ params }: PageProps) {
  const { token } = await params;
  const rsvp = await getRsvp(token);

  if (!rsvp) {
    return <RsvpMissingClient token={token} />;
  }

  return <RsvpViewClient rsvp={rsvp} />;
}
