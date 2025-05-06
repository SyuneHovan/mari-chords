export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const GITHUB_REPO = "SyuneHovan/mari-chords";
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const BRANCH = "main";
    const { song } = req.body;

    console.log("API handler invoked with body:", req.body);
    console.log("GITHUB_TOKEN present:", !!GITHUB_TOKEN);

    // Validate inputs
    if (!GITHUB_TOKEN) {
        console.error("GITHUB_TOKEN is missing");
        return res.status(500).json({ error: "Server configuration error" });
    }
    if (!song || !song.name || !song.author) {
        console.error("Invalid song data:", song);
        return res.status(400).json({ error: "Song data is incomplete" });
    }

    // try ${process.env.NEXT_PUBLIC_BASE_URL} instead of "https://api.github.com/repos/${GITHUB_REPO}/contents/public/"
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/public/data/songs.json?cachebust=${Date.now()}&ref=${BRANCH}`;

    try {
        // Fetch current file
        const fileRes = await fetch(url, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });

        console.log("GitHub API response status:", fileRes.status);
        console.log("GitHub API response headers:", Object.fromEntries(fileRes.headers));

        let songs = [];
        let sha = null;

        if (fileRes.status === 404) {
            console.log("songs.json not found; creating new file");
        } else if (!fileRes.ok) {
            const errorData = await fileRes.json();
            console.error("GitHub fetch error details:", errorData);
            throw new Error(`Failed to fetch file from GitHub: ${fileRes.statusText}`);
        } else {
            const fileData = await fileRes.json();
            console.log("File data from GitHub:", fileData);

            if (!fileData.sha) {
                throw new Error("No sha found in GitHub response");
            }
            if (!fileData.content) {
                throw new Error("No content found in GitHub response");
            }

            // Decode content
            const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
            console.log("Current songs.json content:", currentContent);
            try {
                songs = JSON.parse(currentContent);
                if (!Array.isArray(songs)) {
                    throw new Error("songs.json is not an array");
                }
            } catch (e) {
                console.error("Error parsing songs.json:", e.message);
                throw new Error("Invalid songs.json format");
            }
            sha = fileData.sha;
        }

        // Find and update existing song or append if not found
        const songIndex = songs.findIndex(
            (s) => s.name === song.name && s.author === song.author
        );
        if (songIndex !== -1) {
            songs[songIndex] = { ...songs[songIndex], ...song };
            console.log("Updated existing song at index:", songIndex);
        } else {
            songs.push(song);
            console.log("No matching song found; added new song");
        }
        console.log("Updated songs array:", songs);

        // Prepare updated content
        const updatedContent = JSON.stringify(songs, null, 2);
        const commitData = {
            message: `Update song: ${song.name}`,
            content: Buffer.from(updatedContent).toString("base64"),
            branch: BRANCH
        };
        if (sha) {
            commitData.sha = sha;
        }

        console.log("Commit data:", commitData);

        // Commit to GitHub
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(commitData)
        });

        console.log("GitHub commit response status:", response.status);
        const commitResponse = await response.json();
        console.log("GitHub commit response:", commitResponse);

        if (!response.ok) {
            console.error("GitHub commit error details:", commitResponse);
            throw new Error(`GitHub commit failed: ${response.statusText}`);
        }

        // Verify commit SHA
        console.log("Committed SHA:", commitResponse.commit.sha);

        return res.status(200).json({ message: "Song updated successfully!" });
    } catch (error) {
        console.error("Error during GitHub API request:", error.message);
        return res.status(500).json({ error: "An error occurred while updating the song" });
    }
}