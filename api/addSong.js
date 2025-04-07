export default async function handler(req, res) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const owner = 'SyuneHovan'; // Your GitHub username
  const repo = 'mari-chords';  // Your GitHub repository name

  const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/src/data/songs.json`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json'
    }
  });

  const data = await resp.json();

  return res.status(200).json({
    ok: resp.ok,
    status: resp.status,
    fileSha: data.sha,
    preview: Buffer.from(data.content || '', 'base64').toString().slice(0, 100)
  });
}
