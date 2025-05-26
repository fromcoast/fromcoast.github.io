const GITHUB_USERNAME = "fromc";
const REPO_NAME = "fromc.github.io";
const FILE_PATH = "bookmarks.json";
const GITHUB_TOKEN = "INSERISCI_IL_TUO_TOKEN"; // Inserisci qui il tuo token personale

const API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`;

let sha = ""; // per aggiornamenti GitHub

async function getBookmarks() {
  const res = await fetch(API_URL, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  });
  if (!res.ok) {
    console.error("Errore nel recupero dei dati");
    return [];
  }
  const data = await res.json();
  sha = data.sha;
  const content = atob(data.content);
  return JSON.parse(content);
}

async function saveBookmarks(bookmarks) {
  const content = btoa(JSON.stringify(bookmarks, null, 2));
  const res = await fetch(API_URL, {
    method: "PUT",
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
    body: JSON.stringify({
      message: "Aggiorna bookmarks",
      content: content,
      sha: sha,
    }),
  });
  if (!res.ok) console.error("Errore nel salvataggio");
}

function render(bookmarks) {
  const list = document.getElementById("bookmarks-list");
  list.innerHTML = "";
  bookmarks.forEach((b) => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="${b.url}" target="_blank">${b.title || b.url}</a>`;
    list.appendChild(li);
  });
}

document.getElementById("bookmark-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const url = document.getElementById("url").value.trim();
  const title = document.getElementById("title").value.trim();
  if (!url) return;

  const bookmarks = await getBookmarks();
  bookmarks.unshift({ url, title });
  await saveBookmarks(bookmarks);
  render(bookmarks);
  e.target.reset();
});

document.getElementById("csv-file").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  const lines = text.trim().split("\n").slice(1);
  const newBookmarks = lines.map(line => {
    const [url, title] = line.split(",").map(x => x.replace(/^"|"$/g, "").trim());
    return { url, title };
  });

  const bookmarks = await getBookmarks();
  const merged = [...newBookmarks, ...bookmarks];
  await saveBookmarks(merged);
  render(merged);
});

window.addEventListener("DOMContentLoaded", async () => {
  const bookmarks = await getBookmarks();
  render(bookmarks);
});