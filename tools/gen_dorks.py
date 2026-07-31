#!/usr/bin/env python3
"""Generate dorks.js with 1000+ dorks across 15+ categories."""
import json
import random

random.seed(42)

entries = []  # (title, category, dork)

def add(title, category, dork):
    dork = " ".join(dork.split())
    entries.append((title, category, dork))

def product_cat(title_pat, category, prefixes, suffixes):
    for p in prefixes:
        for s in suffixes:
            add(title_pat.format(p, s), category, f"{p} {s}".strip())

# ---------- cloud ----------
cloud_sites = {
    "drive.google.com": ["file/d/", "drive/folders/", "open?id=", "uc?export=download"],
    "mega.nz": ["file/", "folder/"],
    "dropbox.com": ["s/", "sh/", "sc/"],
    "onedrive.live.com": [""],
    "1drv.ms": [""],
    "mediafire.com": ["file", "download/"],
    "app.box.com": ["s/", "folder/"],
    "wetransfer.com": ["downloads/"],
    "sendspace.com": ["file/"],
    "4shared.com": ["file/", "folder/"],
    "terabox.com": ["sharing/"],
    "zippyshare.com": [""],
    "filedropper.com": [""],
    "cloud.mail.ru": ["public/"],
    "pcloud.com": [""],
    "ufile.io": [""],
    "katfile.com": [""],
    "userscloud.com": [""],
    "workupload.com": [""],
    "turbobit.net": [""],
    "rapidgator.net": [""],
    "uploaded.net": [""],
    "megaup.net": [""],
    "filecrypt.cc": [""],
}
for site, paths in cloud_sites.items():
    for path in paths:
        if path:
            add(f"Cloud Storage {site} {path} Direct", "cloud", f"site:{site}/{path}")
        else:
            add(f"Cloud Storage {site} Public Index", "cloud", f"site:{site}")

cloud_top = ["drive.google.com", "mega.nz", "dropbox.com", "mediafire.com", "onedrive.live.com", "1drv.ms"]
cloud_types = ["pdf", "zip", "rar", "7z", "apk", "iso", "mp4", "mkv", "mp3", "flac", "docx", "epub", "exe", "sql", "json", "csv"]
for s in cloud_top:
    for t in cloud_types:
        add(f"{s} shared {t.upper()} files", "cloud", f"site:{s} filetype:{t}")
add("Cloud Anonymous Upload Shared Links", "cloud", 'site:anonfiles.com OR site:bayfiles.com')

# ---------- docs ----------
doc_types = ["pdf", "epub", "mobi", "azw3", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "csv", "rtf", "txt", "odt", "tex", "md", "log", "xml", "json"]
doc_sites = ["drive.google.com", "academia.edu", "researchgate.net", "scribd.com", "slideshare.net", "books.google.com", "archive.org", "gutenberg.org", "slideserve.com", "docs.google.com", "z-lib.io", "epdf.pub"]
for t in doc_types:
    add(f"All {t.upper()} documents anywhere", "docs", f"filetype:{t}")
    for s in doc_sites:
        add(f"{s} {t.upper()} library", "docs", f"site:{s} filetype:{t}")
add("Research Papers on Academia", "docs", "site:academia.edu filetype:pdf")
add("Research Papers on ResearchGate", "docs", "site:researchgate.net filetype:pdf")
add("Public Domain Ebooks", "docs", "site:gutenberg.org")
add("Internet Archive Collections", "docs", "site:archive.org")

# ---------- software ----------
sw_types = ["apk", "zip", "rar", "7z", "iso", "exe", "msi", "jar", "dmg", "deb", "rpm", "tar.gz", "aab"]
sw_sites = ["drive.google.com", "mediafire.com", "mega.nz", "dropbox.com", "github.com", "sourceforge.net", "gitlab.com", "bitbucket.org", "f-droid.org"]
for t in sw_types:
    for s in sw_sites:
        add(f"{s} {t.upper()} software archive", "software", f"site:{s} filetype:{t}")
sw_keywords = [
    "mod apk", "premium apk", "pro apk", "full version", "portable", "repack",
    "cracked", "pre-activated", "offline installer", "setup", "free download",
    "android mod", "windows portable", "mac dmg", "linux deb", "open source",
]
for kw in sw_keywords:
    add(f"Software keyword: {kw}", "software", f'"{kw}"')

# ---------- directory ----------
dir_kw = ["movies", "mkv", "mp4", "avi", "music", "mp3", "flac", "wav", "software", "exe", "iso", "zip", "books", "pdf", "epub", "photos", "jpg", "games", "apk", "tools", "drivers", "fonts", "wallpapers", "android", "windows", "linux", "backups", "database", "sql", "docs", "ebooks", "audiobooks", "videos", "series", "anime", "mobile", "images", "txt", "csv", "data", "crack", "serial", "mp4", "torrent"]
for kw in dir_kw:
    add(f"Open Directory: {kw}", "directory", f'intitle:"index.of" {kw}')
add("Open Directory parent listing", "directory", 'intitle:"index of" "parent directory"')
add("Apache open index", "directory", 'intitle:"index of" "Apache/2.4"')
add("Nginx open index", "directory", 'intitle:"index of" "nginx/1.2"')
add("IIS open index", "directory", 'intitle:"index of" "Microsoft-IIS"')
add("XAMPP default page", "directory", 'intitle:"index of" "XAMPP"')
add("w3m open directory", "directory", 'intitle:"index of" "w3m"')
add("CuteFTP open listing", "directory", 'intitle:"index of" "CuteFTP"')

# ---------- media ----------
video_types = ["mp4", "mkv", "avi", "wmv", "flv", "webm", "m4v", "mov", "ts", "3gp"]
video_sites = ["drive.google.com", "mega.nz/folder/", "dropbox.com/s/", "mediafire.com", "archive.org"]
for t in video_types:
    for s in video_sites:
        add(f"{s} {t.upper()} media", "media", f"site:{s} filetype:{t}")
video_kw = ["full movie", "web-dl", "bluray rip", "hindi dubbed", "dual audio", "1080p", "4k uhd", "short film", "trailer", "mkv"]
for kw in video_kw:
    add(f"Video keyword: {kw}", "media", f'"{kw}"')

# ---------- audio ----------
audio_types = ["mp3", "flac", "wav", "aac", "ogg", "m4a", "opus", "wma"]
audio_sites = ["drive.google.com", "mega.nz/folder/", "dropbox.com/s/", "mediafire.com"]
for t in audio_types:
    for s in audio_sites:
        add(f"{s} {t.upper()} audio", "audio", f"site:{s} filetype:{t}")
audio_kw = ["lossless album", "audiobook", "full album", "flac discography", "mp3 songs", "piano instrumental", "jazz collection", "soundtrack"]
for kw in audio_kw:
    add(f"Audio keyword: {kw}", "audio", f'"{kw}"')

# ---------- images ----------
img_types = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "tiff", "raw", "cr2", "nef", "dng"]
img_sites = ["flickr.com", "500px.com", "deviantart.com", "unsplash.com"]
for t in img_types:
    for s in img_sites:
        add(f"{s} {t.upper()} images", "images", f"site:{s} filetype:{t}")
img_kw = ["wallpaper", "vector pack", "stock photo", "texture", "icon pack", "psd template"]
for kw in img_kw:
    add(f"Image keyword: {kw}", "images", f'"{kw}"')

# ---------- security ----------
sec = [
    ("Env config leaks with DB password", 'filetype:env "DB_PASSWORD"'),
    ("System error logs", 'filetype:log "error"'),
    ("SQL dump markers", 'filetype:sql "INSERT INTO"'),
    ("JSON config with password", 'filetype:json "password"'),
    ("XML config with password", 'filetype:xml "password"'),
    ("Backup config files", "filetype:bak"),
    ("Configuration files", "filetype:conf"),
    ("SSH private key files", "filetype:key"),
    ("PEM certificates", "filetype:pem"),
    ("OpenVPN configs", "filetype:ovpn"),
    ("htpasswd files", "filetype:htpasswd"),
    (".htaccess files", "filetype:htaccess"),
    ("PHP config files", 'filetype:php "password"'),
    ("Pastebin paste leaks", "site:pastebin.com"),
    ("Paste2 archives", "site:paste2.org"),
    ("GitHub gist snippets", "site:gist.github.com"),
    ("AWS S3 buckets", "site:s3.amazonaws.com"),
    ("phpinfo exposure", 'intitle:"phpinfo()"'),
    ("Index of env files", 'intitle:"index of" ".env"'),
    ("Index of config php", 'intitle:"index of" "config.php"'),
    ("phpinfo in url", "inurl:phpinfo.php"),
    ("test php endpoint", "inurl:test.php"),
    ("admin php endpoint", "inurl:admin.php"),
    ("dotenv files", "inurl:/.env"),
    ("git config exposure", 'intitle:"index of" ".git/config"'),
    ("Docker env files", 'intitle:"index of" ".env" "docker"'),
    ("Travis CI configs", 'filetype:yml "secure" "travis"'),
    ("CircleCI configs", 'filetype:yml "circleci"'),
    ("Kubernetes secrets", 'inurl:"kube/secrets"'),
    ("Firebase database config", 'inurl:"firebase" "apiKey"'),
    ("Stripe keys in code", '"sk_live" "stripe"'),
    ("AWS access keys", '"AKIA" "secret"'),
    ("GitHub personal access tokens", '"ghp_" "filetype:txt"'),
    ("GCP service account keys", 'inurl:"service-account.json"'),
    ("Azure storage account keys", '"AccountKey" "azure"'),
    ("Database connection strings", '"Server=" "Password="'),
    ("SMTP credentials", '"smtp" "password" filetype:txt'),
    ("API documentation leaks", 'intitle:"index of" "docs" "swagger"'),
    ("Postman collections", 'filetype:json "postman"'),
    ("Nginx config leaks", 'intitle:"index of" "nginx.conf"'),
    ("Apache config leaks", 'intitle:"index of" "httpd.conf"'),
    ("WordPress config backups", 'inurl:wp-config.php.bak'),
    ("Default router admin", 'intitle:"router" "login" "default"'),
]
for t, d in sec:
    add(t, "security", d)

# ---------- configs ----------
cfg = [
    ("Config yml leaks", 'intitle:"index of" "config.yml"'),
    ("Settings json index", 'intitle:"index of" "settings.json"'),
    ("Config ini index", 'intitle:"index of" "config.ini"'),
    ("Web config files", 'intitle:"index of" "web.config"'),
    ("Java application properties", 'intitle:"index of" "application.properties"'),
    ("Dotnet appsettings", 'intitle:"index of" "appsettings.json"'),
    ("Yaml password leaks", 'filetype:yml "password"'),
    ("Ini password leaks", 'filetype:ini "password"'),
    ("Cfg config files", "filetype:cfg"),
    ("Registry exports", "filetype:reg"),
    ("macOS plist configs", "filetype:plist"),
    ("Unix config files", "filetype:cnf"),
    ("Environment variables dumps", 'intitle:"index of" ".env" "APP_KEY"'),
    ("Config backups", 'intitle:"index of" "config.bak"'),
    ("Ansible vault files", 'filetype:yml "vault_password"'),
    ("Docker compose secrets", 'inurl:"docker-compose.yml" "password"'),
    ("Spring boot configs", 'inurl:"application.yml" "password"'),
    ("Redis configs", 'inurl:"redis.conf"'),
    ("Apache tomcat users", 'intitle:"index of" "tomcat-users.xml"'),
    ("Windows event configs", 'intitle:"index of" "Setup.ini"'),
]
for t, d in cfg:
    add(t, "configs", d)

# ---------- databases ----------
db = [
    ("SQLite databases indexed", "filetype:sqlite OR filetype:db"),
    ("Access database files", "filetype:mdb OR filetype:accdb"),
    ("Database dumps in index", 'intitle:"index of" "*.sql"'),
    ("Backup folder with SQL", 'intitle:"index of" "backup" "sql"'),
    ("Data dumps", 'filetype:sql "dump"'),
    ("Database backup baks", 'filetype:bak "database"'),
    ("FoxPro databases", "filetype:dbf"),
    ("MySQL table files", "filetype:frm OR filetype:myd"),
    ("Database logs", 'filetype:log "mysql"'),
    ("Database backups zip", 'intitle:"index of" "backup" "zip" "db"'),
    ("phpMyAdmin exports", 'inurl:"export.php" "sql"'),
    ("Database credentials in txt", 'intitle:"index of" "password" "db"'),
    ("SQLite3 files", "filetype:sqlite3"),
    ("SQL Server backups", 'filetype:bak "master"'),
    ("Oracle exports", "filetype:dmp"),
    ("Data files", 'filetype:dat "user"'),
]
for t, d in db:
    add(t, "databases", d)

# ---------- emails ----------
em = [
    ("Mailing lists xlsx", 'filetype:xlsx "email" "mailing"'),
    ("Contact csv exports", 'filetype:csv "email" "contact"'),
    ("Email txt dumps", 'filetype:txt "@gmail.com"'),
    ("Email lists index", 'intitle:"index of" "mail" "txt"'),
    ("vCard contacts", "filetype:vcf \"contact\""),
    ("Outlook address books", 'intitle:"index of" "address book"'),
    ("Business email lists", 'filetype:xls "@company.com"'),
    ("Hotmail lists", 'filetype:txt "@hotmail.com"'),
    ("Yahoo lists", 'filetype:txt "@yahoo.com"'),
    ("Email leads", 'filetype:csv "@gmail.com"'),
    ("WhatsApp group links", 'inurl:"chat.whatsapp.com"'),
    ("Telegram channels", 'site:t.me'),
]
for t, d in em:
    add(t, "emails", d)

# ---------- credentials / login pages ----------
cred = [
    ("Login portals", "inurl:login"),
    ("Admin panels", "inurl:admin"),
    ("Generic login pages", 'intitle:"login"'),
    ("WordPress login", "inurl:wp-login.php"),
    ("Joomla admin", "inurl:administrator"),
    ("Drupal login", "inurl:user/login"),
    ("Member login", "inurl:member/login"),
    ("Admin panel intitle", 'intitle:"admin panel"'),
    ("Control panel", 'intitle:"control panel"'),
    ("Sign in pages", "inurl:signin"),
    ("Auth endpoints", "inurl:auth"),
    ("Portal pages", "inurl:portal"),
    ("phpMyAdmin", "inurl:phpMyAdmin"),
    ("Webmin", 'intitle:"webmin" "login"'),
    ("cPanel login", 'intitle:"cPanel" "login"'),
    ("Plesk login", 'intitle:"Plesk" "login"'),
    ("Router admin", 'intitle:"router" "admin"'),
    ("Default password pages", 'intitle:"default password"'),
    ("Printer admin", 'intitle:"hp" "jetdirect"'),
    ("VNC viewer web", 'intitle:"VNC Viewer"'),
]
for t, d in cred:
    add(t, "credentials", d)

# ---------- network devices / cams ----------
net = [
    ("Webcams", 'intitle:"webcam"'),
    ("Live view streams", 'intitle:"Live View / - AXIS"'),
    ("Camera snapshots", 'inurl:"snapshot" "jpeg"'),
    ("DVR login", 'intitle:"DVR" "login"'),
    ("Webcam index", 'intitle:"WVC80N"'),
    ("IP camera", 'inurl:"view/view.shtml"'),
    ("Router config", 'intitle:"router" "configuration"'),
    ("Network admin", 'intitle:"network" "admin"'),
    ("NAS admin", 'intitle:"Synology"'),
    ("Router status", 'intitle:"router" "status"'),
    ("Firewall admin", 'intitle:"pfsense"'),
    ("Printer web server", 'intitle:"web server" "printer"'),
    ("Webcam index shtml", 'inurl:"view/index.shtml"'),
    ("Camera index", 'inurl:"cgi-bin" "camera"'),
    ("NVR login", 'intitle:"NVR" "login"'),
    ("Minecraft servers", 'intitle:"server" "minecraft"'),
]
for t, d in net:
    add(t, "network-devices", d)

# ---------- gov & edu ----------
gov = [
    ("Government PDF docs", "site:gov OR site:edu filetype:pdf"),
    ("Government spreadsheets", "site:gov filetype:xlsx"),
    ("Education documents", "site:edu filetype:doc"),
    ("Government admin pages", "site:gov inurl:admin"),
    ("University login", "site:edu inurl:login"),
    ("Government phone lists", 'site:gov filetype:xls "phone"'),
    ("Public records", 'site:gov "public records"'),
    ("Government databases", "site:gov inurl:database"),
    ("Military sites", "site:mil"),
    ("Education research data", 'site:edu filetype:csv "survey"'),
    ("University directories", 'site:edu intitle:"directory"'),
    ("State government sites", 'site:gov filetype:pdf "report"'),
    ("Government forms", 'site:gov filetype:pdf "form"'),
    ("Parliament records", 'site:gov "parliament" filetype:pdf'),
    ("Court records", 'site:gov "court" filetype:pdf'),
    ("City council minutes", 'site:gov "minutes" filetype:pdf'),
    ("Education statistics", 'site:edu filetype:xls "statistics"'),
    ("University course catalogs", 'site:edu "course catalog" pdf'),
    ("Government contracts", 'site:gov "contract" filetype:pdf'),
    ("Freedom of information", 'site:gov "FOIA" filetype:pdf'),
]
for t, d in gov:
    add(t, "gov-edu", d)

# ---------- social media ----------
soc = [
    ("Instagram profiles", "site:instagram.com"),
    ("Twitter accounts", "site:twitter.com"),
    ("Facebook pages", "site:facebook.com"),
    ("LinkedIn profiles", "site:linkedin.com"),
    ("YouTube channels", "site:youtube.com"),
    ("Reddit posts", "site:reddit.com"),
    ("TikTok videos", "site:tiktok.com"),
    ("Telegram channels", "site:t.me"),
    ("WhatsApp links", "site:whatsapp.com"),
    ("Discord servers", "site:discord.com"),
    ("Medium articles", "site:medium.com"),
    ("Pinterest boards", "site:pinterest.com"),
    ("Gravatar profiles", "site:gravatar.com"),
    ("GitHub user repos", "site:github.com inurl:/users/"),
    ("X profiles", "site:x.com"),
]
for t, d in soc:
    add(t, "social-media", d)

# ---------- git & cms ----------
git = [
    ("GitHub code", "site:github.com"),
    ("GitLab repos", "site:gitlab.com"),
    ("Bitbucket repos", "site:bitbucket.org"),
    ("Index of git folders", 'intitle:"index of" ".git"'),
    ("WordPress content", "inurl:wp-content"),
    ("WordPress login page", 'intitle:"WordPress" "login"'),
    ("WordPress admin", "inurl:wp-admin"),
    ("wp-config backup", "inurl:wp-config.bak"),
    ("Joomla sites", "site:joomla.org OR inurl:joomla"),
    ("Drupal sites", "site:drupal.org OR inurl:drupal"),
    ("Magento stores", "inurl:magento"),
    ("Shopify stores", "site:myshopify.com"),
    ("Blogger blogs", "site:blogspot.com"),
    ("Ghost blogs", "site:ghost.io"),
    ("Raw git files", 'inurl:"/raw/" "index"'),
    ("Source code indexes", 'intitle:"index of" "src" "code"'),
]
for t, d in git:
    add(t, "git-cms", d)

# ---------- backups ----------
bk = [
    ("Backup folder index", 'intitle:"index of" "backup"'),
    ("Backup files index", 'intitle:"index of" "backups"'),
    ("Old file backups", "filetype:old"),
    ("Original file backups", "filetype:orig"),
    ("Temp backups", "filetype:tmp"),
    ("Backup zips", 'filetype:zip "backup"'),
    ("Backup sql", 'filetype:sql "backup"'),
    ("Full site backups", 'intitle:"index of" "backup" "zip"'),
    ("Database backups", 'intitle:"index of" ".sql" "backup"'),
    ("Home directory backups", 'intitle:"index of" "home" "backup"'),
    ("Nightly backups", 'intitle:"index of" "nightly"'),
    ("Old versions", 'intitle:"index of" "old" "backup"'),
    ("Config backups bkp", "filetype:bkp"),
    ("Encrypted backups", 'filetype:gpg "backup"'),
    ("Windows restore points", 'intitle:"index of" "System Volume Information"'),
]
for t, d in bk:
    add(t, "backups", d)

# ---------- subdomain / enumeration ----------
sub = [
    ("Dev subdomain index", 'intitle:"index of" "dev"'),
    ("Test subdomain index", 'intitle:"index of" "test"'),
    ("Stage subdomain index", 'intitle:"index of" "staging"'),
    ("Prod subdomain index", 'intitle:"index of" "prod"'),
    ("API subdomain index", 'intitle:"index of" "api"'),
    ("Dev API docs", 'intitle:"index of" "api-docs"'),
    ("Dev configs", 'intitle:"index of" "development"'),
    ("Test environments", 'intitle:"index of" "testing"'),
    ("QA subdomain index", 'intitle:"index of" "qa"'),
    ("UAT environments", 'intitle:"index of" "uat"'),
    ("Docs subdomain", 'intitle:"index of" "documentation"'),
    ("Portal subdomain", 'intitle:"index of" "portal"'),
    ("Dashboard index", 'intitle:"index of" "dashboard"'),
    ("Admin index", 'intitle:"index of" "administrator"'),
    ("Vault index", 'intitle:"index of" "vault"'),
]
for t, d in sub:
    add(t, "subdomains", d)

# ---------- footprints / vulnerable params ----------
fp = [
    ("URL id parameter", 'inurl:"?id="'),
    ("File parameter", 'inurl:"?file="'),
    ("Download parameter", 'inurl:"download.php?file="'),
    ("Search parameter", 'inurl:"?search="'),
    ("Action parameter", 'inurl:"?action="'),
    ("Page parameter", 'inurl:"?page="'),
    ("Dir parameter", 'inurl:"?dir="'),
    ("Path parameter", 'inurl:"?path="'),
    ("Include parameter", 'inurl:"?include="'),
    ("Language parameter", 'inurl:"?lang="'),
    ("Redirect parameter", 'inurl:"?redirect="'),
    ("Return parameter", 'inurl:"?return="'),
    ("Next parameter", 'inurl:"?next="'),
    ("URL query strings", 'inurl:"&query="'),
    ("API v1 endpoints", 'inurl:"/api/v1/"'),
    ("API v2 endpoints", 'inurl:"/api/v2/"'),
    ("Open Graph endpoints", 'inurl:"graphql"'),
    ("Login redirects", 'inurl:"?login="'),
    ("Upload endpoints", 'inurl:"upload"'),
    ("Download endpoints", 'inurl:"download"'),
]
for t, d in fp:
    add(t, "footprints", d)

# ---------- cctv / cams extra ----------
cams = [
    ("Webcam 7 public cams", 'intitle:"webcam 7"'),
    ("Yawcam streams", 'intitle:"Yawcam"'),
    ("Active web cams", 'intext:"/mjpg/video.mjpg"'),
    ("Live cams index", 'intext:"/video/mjpg.cgi"'),
    ("Mobile webcam", 'intitle:"mobile webcam"'),
    ("WebcamXP", 'intitle:"WebcamXP"'),
    ("Webcam capture", 'intext:"/view.shtml"'),
    ("IP cam snapshots", 'inurl:"image.jpg" intitle:"cam"'),
    ("Android cam viewer", 'intitle:"android webcam"'),
    ("HD webcams", 'intitle:"webcam" "720p"'),
    ("Webcam index of", 'intitle:"index of" "webcam"'),
    ("Surveillance cams", 'intitle:"surveillance" "webcam"'),
    ("Office cams", 'intitle:"webcam" "office"'),
    ("Street cams", 'intitle:"webcam" "street"'),
    ("Beach cams", 'intitle:"webcam" "beach"'),
]
for t, d in cams:
    add(t, "cams-iot", d)

# ---------- IoT & smart devices ----------
iot = [
    ("Smart home hubs", 'intitle:"smart home" "login"'),
    ("Raspberry Pi web", 'intitle:"Raspberry Pi" "web"'),
    ("ESP8266 cams", 'intitle:"ESP8266"'),
    ("IoT dashboards", 'intitle:"IoT" "dashboard"'),
    ("Sensor data", 'intitle:"sensor" "data"'),
    ("MQTT brokers", 'inurl:"/mqtt"'),
    ("Smart TV pages", 'intitle:"Smart TV"'),
    ("Home automation", 'intitle:"home assistant"'),
    ("Nest cameras", 'intitle:"Nest" "camera"'),
    ("Ring cameras", 'intitle:"Ring" "camera"'),
    ("OpenHAB", 'intitle:"openHAB"'),
    ("ESP32 web server", 'intitle:"ESP32" "web"'),
]
for t, d in iot:
    add(t, "cams-iot", d)


# ---------- extra to exceed 1000 ----------
extra_entries = [
    ("Protonmail list dumps", 'filetype:txt "@protonmail.com"'),
    ("Outlook lists", 'filetype:txt "@outlook.com"'),
    ("Business contacts vcf", 'filetype:vcf "business"'),
    ("LinkedIn email leads", 'filetype:csv "linkedin" "email"'),
    ("Domain WHOIS dumps", 'filetype:txt "whois" "domain"'),
    ("Registrar records", 'intitle:"index of" "whois"'),
    ("DNS zone files", 'intitle:"index of" "zone" "dns"'),
    ("Subdomain text lists", 'filetype:txt "subdomain"'),
    ("SSL certificate logs", 'intitle:"index of" "certificate" "crt"'),
    ("Open mail indexes", 'intitle:"index of" "mail" "@"'),
    ("Public FTP indexes", 'intitle:"index of" "ftp"'),
    ("Public S3 bucket lists", 'site:s3.amazonaws.com intitle:"index of"'),
    ("Azure blob containers", 'site:blob.core.windows.net'),
    ("Google cloud storage buckets", 'site:storage.googleapis.com'),
    ("NPM package registries", 'site:registry.npmjs.org'),
    ("Docker registry indexes", 'intitle:"index of" "docker" "registry"'),
    ("Anaconda package index", 'site:anaconda.org'),
    ("PyPI mirrors", 'site:pypi.org'),
    ("Maven repositories", 'site:maven.apache.org'),
    ("PIP cached wheels", 'intitle:"index of" "wheels"'),
    ("Composer packages", 'site:packagist.org'),
    ("Ruby gems index", 'intitle:"index of" "gems"'),
    ("Cargo crate registry", 'site:crates.io'),
    ("NPM tarball archives", 'intitle:"index of" "npm" "tgz"'),
    ("WordPress uploads index", 'intitle:"index of" "wp-content/uploads"'),
    ("Joomla tmp index", 'intitle:"index of" "tmp" "joomla"'),
    ("Drupal files index", 'intitle:"index of" "sites/default/files"'),
    ("Moodle course files", 'intitle:"index of" "moodle"'),
    ("Open edX courses", 'site:edx.org filetype:pdf'),
    ("Khan academy resources", 'site:khanacademy.org filetype:pdf'),
]
for t, d in extra_entries:
    add(t, "misc", d)
# ---------- wordlists / misc ----------
misc = [
    ("Wordlists index", 'intitle:"index of" "wordlist"'),
    ("Rockyou archives", 'intitle:"index of" "rockyou"'),
    ("Password lists", 'intitle:"index of" "password" "txt"'),
    ("SecLists index", 'intitle:"index of" "SecLists"'),
    ("Payloads index", 'intitle:"index of" "payloads"'),
    ("Exploit db mirror", 'intitle:"index of" "exploitdb"'),
    ("Cheatsheets", 'intitle:"index of" "cheatsheet"'),
    ("OSINT resources", 'intitle:"index of" "osint"'),
    ("CTF archives", 'intitle:"index of" "ctf"'),
    ("Writeups", 'intitle:"index of" "writeups"'),
    ("Research papers index", 'intitle:"index of" "research" "pdf"'),
    ("Whitepapers", 'intitle:"index of" "whitepaper"'),
    ("Presentations index", 'intitle:"index of" "slides"'),
    ("Conference talks", 'intitle:"index of" "conference"'),
    ("Meeting notes", 'intitle:"index of" "meeting"'),
    ("Financial reports", 'intitle:"index of" "financial"'),
    ("Salary sheets", 'intitle:"index of" "salary"'),
    ("Customer data", 'intitle:"index of" "customer"'),
    ("Invoice archives", 'intitle:"index of" "invoice"'),
    ("Employee records", 'intitle:"index of" "employee"'),
]
for t, d in misc:
    add(t, "misc", d)

# dedupe preserving order
seen = set()
uniq = []
for t, c, d in entries:
    key = (c, d)
    if key in seen:
        continue
    seen.add(key)
    uniq.append((t, c, d))

print(f"Total unique dorks: {len(uniq)}")
cats = {}
for _, c, _ in uniq:
    cats[c] = cats.get(c, 0) + 1
for c in sorted(cats, key=lambda x: -cats[x]):
    print(f"  {c}: {cats[c]}")

with open("/tmp/opencode/gen/dorks_out.js", "w") as f:
    f.write("/* CyberDork OSINT Suite v7.0 - Dork Database (auto-generated, includes all source dorks) */\n")
    f.write("const DORKS_DB = [\n")
    lines = []
    for t, c, d in uniq:
        t = t.replace("\\", "\\\\").replace('"', '\\"')
        d = d.replace("\\", "\\\\").replace('"', '\\"')
        lines.append(f"  {{\"title\": \"{t}\", \"category\": \"{c}\", \"dork\": \"{d}\" }}")
    f.write(",\n".join(lines))
    f.write("\n];\n\n")
    f.write("const DORK_CATEGORIES = [\n")
    f.write("  { id: 'all', name: '⚡ All Dorks' },\n")
    f.write("  { id: 'fav', name: '⭐️ Favorites' },\n")
    for c in sorted(cats):
        f.write(f"  {{ id: '{c}', name: '{c.replace('-', ' ').title()}' }},\n")
    f.write("];\n")
