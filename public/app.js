const DATA_URL = "https://dn721605.ca.archive.org/0/items/ps4-fpkg-collection-english-fpkgi/GAMES.json";

let allGames = {};
let filteredGames = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 30;

async function loadGames() {
  try {
    const response = await fetch(DATA_URL);
    const json = await response.json();
    allGames = Object.entries(json.DATA);
    filteredGames = [...allGames]; // default
    renderPage();
    renderPagination();
  } catch (error) {
    document.getElementById("games").innerHTML =
      "<p style='color: red; text-align:center;'>Failed to load game list.</p>";
  }
}

function formatSize(bytes) {
  if (!bytes || bytes === 0) return "Unknown";
  const gb = bytes / (1024 ** 3);
  if (gb >= 1) return gb.toFixed(2) + " GB";
  return (bytes / (1024 ** 2)).toFixed(2) + " MB";
}

function renderPage() {
  const container = document.getElementById("games");
  container.innerHTML = "";

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;

  filteredGames.slice(start, end).forEach(([url, game]) => {
    const localCover = `cover/${game.title_id}.png`;
    const remoteCover = game.cover_url;
    const displaySize = formatSize(game.size);

    const card = `
      <div class="card">
        <img src="${localCover}" onerror="this.onerror=null; this.src='${remoteCover}';" />
        <div class="info">
          <h3 style="font-size:17px;">${game.name}</h3>
          <p>${game.region} | FW: ${game.min_fw} | v${game.version}</p>
          <p style="font-size:12px;">${game.title_id}</p>
          <p style="font-size:13px; opacity:0.8;">${displaySize}</p>
        </div>
        <a class="btn" href="${url}" target="_blank">Download</a>
      </div>
    `;

    container.innerHTML += card;
  });
}

function renderPagination() {
  const totalPages = Math.ceil(filteredGames.length / ITEMS_PER_PAGE);
  const container = document.getElementById("pagination");

  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <button class="page-btn" ${currentPage === 1 ? "disabled" : ""} onclick="changePage(-1)">⬅ Prev</button>
    <span>Page ${currentPage} / ${totalPages}</span>
    <button class="page-btn" ${currentPage === totalPages ? "disabled" : ""} onclick="changePage(1)">Next ➡</button>
  `;
}

function changePage(step) {
  const totalPages = Math.ceil(filteredGames.length / ITEMS_PER_PAGE);
  currentPage += step;
  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;

  renderPage();
  renderPagination();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.getElementById("search").addEventListener("input", (event) => {
  const term = event.target.value.toLowerCase();
  filteredGames = allGames.filter(([_, g]) =>
    g.name.toLowerCase().includes(term) ||
    g.region.toLowerCase().includes(term) ||
    g.title_id.toLowerCase().includes(term)
  );
  currentPage = 1;
  renderPage();
  renderPagination();
});

loadGames();
