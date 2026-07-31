#!/usr/bin/env python3
"""
CyberDork OSINT Suite v7.0 - app.py
Lightweight Flask backend with:
  * CORS headers for all routes
  * /api/health       - health check
  * /api/dorks        - serve dork database as JSON
  * /api/extensions   - serve extension database as JSON
  * /api/cors         - generic CORS proxy endpoint
  * Integration hooks for Shodan / VirusTotal API keys (env based)

Deploy on Render / Railway / localhost with:
    pip install flask requests flask-cors
    python app.py

For pure static hosting (GitHub Pages / Vercel / Netlify) this file is
optional; the SPA works fully client-side without a backend.
"""

import os
import json
import re
import urllib.parse

from flask import Flask, jsonify, request
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from the SPA

# --------------------------------------------------------------------------
# Optional API integration hooks (read from environment variables)
# --------------------------------------------------------------------------
SHODAN_API_KEY = os.environ.get("SHODAN_API_KEY", "")
VIRUSTOTAL_API_KEY = os.environ.get("VIRUSTOTAL_API_KEY", "")

SHODAN_HOST_SEARCH = "https://api.shodan.io/shodan/host/search?key={key}&query={query}"
VT_IP_REPORT = "https://www.virustotal.com/api/v3/ip_addresses/{ip}"


def load_asset(filename):
    """Best-effort loader for the static JS databases when present."""
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), filename)
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    if filename == "dorks.js":
        match = re.search(r"const DORKS_DB = (\[.*?\]);", content, re.DOTALL)
    elif filename == "extensions.js":
        match = re.search(r"const EXTENSION_CATEGORIES = (\{.*?\});", content, re.DOTALL)
    else:
        return None
    if not match:
        return None
    raw = match.group(1)
    # Convert unquoted JS object keys ({ title: "...") into quoted JSON keys
    raw = re.sub(r'(^|[\{,]\s*)([A-Za-z_]\w*)(\s*:)', r'\1"\2"\3', raw)
    try:
        return json.loads(raw)
    except Exception:
        return None


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "CyberDork OSINT Suite v7.0",
        "shodan_configured": bool(SHODAN_API_KEY),
        "virustotal_configured": bool(VIRUSTOTAL_API_KEY),
    })


@app.route("/api/dorks", methods=["GET"])
def dorks():
    data = load_asset("dorks.js")
    if data is None:
        return jsonify({"count": 0, "dorks": []})
    return jsonify({"count": len(data), "dorks": data})


@app.route("/api/extensions", methods=["GET"])
def extensions():
    data = load_asset("extensions.js")
    if data is None:
        return jsonify({"categories": {}})
    return jsonify({"categories": data})


@app.route("/api/cors", methods=["GET"])
def cors_proxy():
    """Minimal CORS proxy. Usage: /api/cors?url=<encoded url>"""
    url = request.args.get("url")
    if not url:
        return jsonify({"error": "Missing ?url= parameter"}), 400
    try:
        resp = requests.get(url, timeout=10, headers={"User-Agent": "CyberDork-OSINT/7.0"})
        content_type = resp.headers.get("content-type", "text/plain")
        return resp.text, resp.status_code, {"Content-Type": content_type}
    except Exception as exc:
        return jsonify({"error": str(exc)}), 502


@app.route("/api/shodan", methods=["GET"])
def shodan_search():
    if not SHODAN_API_KEY:
        return jsonify({"error": "SHODAN_API_KEY not configured"}), 501
    query = request.args.get("q", "")
    if not query:
        return jsonify({"error": "Missing ?q= parameter"}), 400
    url = SHODAN_HOST_SEARCH.format(key=SHODAN_API_KEY, query=urllib.parse.quote(query))
    try:
        resp = requests.get(url, timeout=10)
        return jsonify(resp.json())
    except Exception as exc:
        return jsonify({"error": str(exc)}), 502


@app.route("/api/virustotal", methods=["GET"])
def virustotal_lookup():
    if not VIRUSTOTAL_API_KEY:
        return jsonify({"error": "VIRUSTOTAL_API_KEY not configured"}), 501
    ip = request.args.get("ip", "")
    if not ip:
        return jsonify({"error": "Missing ?ip= parameter"}), 400
    url = VT_IP_REPORT.format(ip=urllib.parse.quote(ip))
    try:
        resp = requests.get(url, timeout=10, headers={"x-apikey": VIRUSTOTAL_API_KEY})
        return jsonify(resp.json())
    except Exception as exc:
        return jsonify({"error": str(exc)}), 502


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("DEBUG", "") == "1")
