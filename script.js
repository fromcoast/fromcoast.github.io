// script.js

function loadBookmarks() {
  const data = JSON.parse(localStorage.getItem("bookmarks") || "[]");
  renderBookmarks(data);
}

function renderBookmarks(bookmarks) {
  const list = document.getElementById("bookmarkList");
  list.innerHTML = "";
  bookmarks.forEach(({ title, url, tags }) => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="${url}" target="_blank">${title}</a><br><small>${tags}</small>`;
    list.appendChild(li);
  });
}

function addBookmark(e) {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const url = document.getElementById("url").value.trim();
  const tags = document.getElementById("tags").value.trim();

  const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
  bookmarks.unshift({ title, url, tags });
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  document.getElementById("bookmarkForm").reset();
  renderBookmarks(bookmarks);
}

function importCSV(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const lines = e.target.result.split("\n").slice(1);
    const bookmarks = lines.map(line => {
      const [title, url, time, tags] = line.split(",").map(x => x?.replace(/^\"|\"$/g, "").trim());
      return { title, url, tags };
    }).filter(b => b.title && b.url);
    const existing = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    localStorage.setItem("bookmarks", JSON.stringify([...bookmarks, ...existing]));
    renderBookmarks([...bookmarks, ...existing]);
  };
  reader.readAsText(file);
}

document.getElementById("bookmarkForm").addEventListener("submit", addBookmark);
document.getElementById("csvFile").addEventListener("change", e => importCSV(e.target.files[0]));

loadBookmarks();
