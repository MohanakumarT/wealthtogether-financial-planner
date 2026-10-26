import "server-only";

type NotificationEmail = {
  to: string;
  replyTo: string;
  subject: string;
  text: string;
};

export async function sendNotificationEmail({
  to,
  replyTo,
  subject,
  text,
}: NotificationEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: replyTo,
        subject,
        text,
      }),
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) {
      console.error("Notification email was not accepted.", response.status);
    }
  } catch {
    console.error("Notification email could not be sent.");
  }
}
