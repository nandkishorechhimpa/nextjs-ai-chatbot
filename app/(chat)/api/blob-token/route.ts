// app/api/blob-token/route.ts
import { NextResponse } from "next/server";

export async function GET() {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json({ error: "Token not configured" }, { status: 500 });
    }
    return NextResponse.json({ token: process.env.BLOB_READ_WRITE_TOKEN });
}
