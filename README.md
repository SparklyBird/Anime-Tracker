# 🎌 Anime Tracker

A personal anime list manager built with **Spring Boot** + **vanilla JS**.  
Track what you're watching, finished, dropped, or plan to watch — with posters, descriptions, genres, and MAL scores pulled automatically.

![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen?style=flat-square)
![H2](https://img.shields.io/badge/Database-H2-blue?style=flat-square)

---

## 📸 Screenshots

### **Main list view:**

<img width="600" alt="Main list view" src="https://github.com/user-attachments/assets/4dc53672-f268-4d00-b025-fbee23431159" />

### **Detail modal:**

<img width="350" alt="Detail modal" src="https://github.com/user-attachments/assets/cc4eb9de-a215-4e4d-83ef-f9161f9aa479" />

### **Edit modal with MAL search:**

<img width="450" alt="Edit modal" src="https://github.com/user-attachments/assets/2e813210-10f2-4e71-a8aa-f41ebe95de32" />

---

## ✨ Features

- **5 sections** — Watching, Will Watch, Finished, Favorite, Dropped
- **⭐ Favorite toggle** — add or remove anime from Favorites with one click in the detail modal
- **📊 Rating sync** — ratings automatically sync between main list and Favorites entry
- **🔍 Grouped search** — search results organized by section with color-coded headers
- **Auto-fill from MAL** — type a Russian title, routes through Shikimori → romaji → MyAnimeList to fetch poster, genres, synopsis, episode count and score automatically
- **🔄 AniList fallback** — if Jikan/MAL is unavailable, automatically retries the search via AniList GraphQL
- **⚡ Quick auto-fill** — one-click fill per card without opening any modal
- **Bulk import** — paste a plain text list of titles, or import an existing CSV / JSON backup
- **Export** — save your full list as CSV, JSON, or TXT at any time
- **Filters** — by genre, year range, and minimum rating
- **Duplicate protection** — prevents adding the same anime twice (with a Favorites exception)
- **Infinite scroll** — loads pages on demand, no pagination clicks
- **Persistent tab** — remembers which section you were on after refresh

---

## 🚀 Running Locally

### Prerequisites

- **Java 17+** — [Download](https://adoptium.net/)
- **Maven 3.8+** — [Download](https://maven.apache.org/download.cgi) *(or use the Maven wrapper if added)*

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/SparklyBird/Anime-Tracker.git
cd Anime-Tracker

# 2. Build
mvn clean package -DskipTests

# 3. Run
java -jar target/anime-tracker-*.jar
```

Then open **http://localhost:8080** in your browser.

The H2 database is created automatically at `./data/animedb.mv.db` on first run — this file is gitignored (it's your personal data).

---

## 🔧 Configuration

All settings are in `src/main/resources/application.properties`. The defaults work out of the box.

| Property | Default | Description |
|----------|---------|-------------|
| `server.port` | `8080` | Port the app runs on |
| `app.upload-dir` | `./uploads` | Where uploaded poster images are stored |

---

## 🌐 Localization Note

This app is tailored for personal use with a **Russian-first** approach:
- **Russian titles** are the primary display name for every anime
- **Genre tags** used in filters are in Russian (e.g. Фэнтези, Комедия, Романтика)
- **Descriptions and Japanese romaji titles** are pulled from MAL in English
- The auto-fill pipeline searches Shikimori (Russian anime database) first to get the correct title, then fetches full details from MyAnimeList — making Russian title lookup accurate even for obscure anime

If you fork this for your own use, genres and UI labels can be swapped to any language in `app.js` (the `GENRES` array and `STATUS_CFG` object).

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 17 |
| Backend | Spring Boot 3, Spring Data JPA |
| Database | H2 (file-based, embedded) |
| Frontend | Vanilla JS, HTML5, CSS3 |
| APIs | [Jikan v4](https://jikan.moe/) (MAL wrapper), [Shikimori](https://shikimori.one/api/doc), [AniList GraphQL](https://anilist.gitbook.io/anilist-apiv2-docs/) (fallback), Google Translate (free proxy) |
| Testing | JUnit 5, Mockito, MockMvc |
| Build | Maven |

---

## 📁 Project Structure

```
src/
├── main/
│   ├── java/com/animetracker/
│   │   ├── controller/       # REST endpoints (AnimeController, JikanController)
│   │   ├── service/          # Business logic
│   │   ├── repository/       # Spring Data JPA
│   │   ├── model/            # Anime entity, AnimeStatus enum
│   │   ├── dto/              # Request/Response DTOs
│   │   └── mapper/           # Entity ↔ DTO conversion
│   └── resources/
│       ├── application.properties
│       └── static/           # Frontend (index.html, app.js, style.css)
└── test/
    └── java/com/animetracker/
        ├── controller/       # MockMvc tests
        └── service/          # Mockito unit tests
```

---

## 📝 License

Personal use only — see [LICENSE](LICENSE) for details.
