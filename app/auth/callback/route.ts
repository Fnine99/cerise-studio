import { NextResponse, type NextRequest } from "next/server";
import { homeFor, roleFrom } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";

// Supabase sends users here after Google sign-in or email confirmation.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const flowId = searchParams.get("sb_flow_id");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(
      code,
      flowId ? { flowId } : undefined,
    );
    if (!error) {
      const home = homeFor(roleFrom(data.user.app_metadata));
      return NextResponse.redirect(`${origin}${home}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
