import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get("username");

    if (!username) {
        return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    try {
        // Switch to Picuki (Public Instagram Viewer) to avoid Instagram's login wall/blocking
        const response = await fetch(`https://www.picuki.com/profile/${username}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const html = await response.text();

        // Regex Extraction
        // 1. Avatar (looks for class="profile-avatar-image")
        const avatarMatch = html.match(/class="profile-avatar-image"[^>]*src="([^"]+)"/);
        const avatar = avatarMatch ? avatarMatch[1] : "";

        // 2. Name (looks for class="profile-name-bottom")
        const nameMatch = html.match(/class="profile-name-bottom">([^<]+)</);
        const fullName = nameMatch ? nameMatch[1].trim() : username;

        // 3. Bio (looks for class="profile-description")
        const bioMatch = html.match(/class="profile-description">([\s\S]*?)<\/div>/);
        let bio = bioMatch ? bioMatch[1].trim() : "";

        // Cleanup Bio HTML entities and BR tags
        bio = bio
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'");

        if (!avatar) {
            return NextResponse.json({ error: "Profile data could not be parsed" }, { status: 404 });
        }

        return NextResponse.json({
            fullName: fullName,
            username: username,
            avatar: avatar,
            bio: bio
        });

    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}
