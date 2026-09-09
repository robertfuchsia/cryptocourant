import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

/**
 * Webhook vanuit Sanity. Zet in sanity.io/manage een webhook naar
 *   https://cryptocourant.com/api/revalidate
 * met hetzelfde secret als SANITY_REVALIDATE_SECRET.
 */
export async function POST(request: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{ _type: string }>(
      request,
      process.env.SANITY_REVALIDATE_SECRET
    );

    if (!isValidSignature) {
      return new NextResponse("Ongeldige handtekening", { status: 401 });
    }
    if (!body?._type) {
      return new NextResponse("Geen documenttype in de payload", { status: 400 });
    }

    revalidateTag(body._type, "max");
    revalidateTag("sanity", "max");

    return NextResponse.json({ revalidated: true, type: body._type, now: Date.now() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Onbekende fout";
    return new NextResponse(message, { status: 500 });
  }
}
