from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# временное хранилище в памяти (при перезапуске сбрасывается)
team_requests = []
news_requests = []

@app.route("/health")
def health():
    return jsonify({"ok": True})

@app.route("/team-request", methods=["POST"])
def team_request():
    data = request.get_json(force=True) or {}
    team_requests.append(data)
    return jsonify({"ok": True, "count": len(team_requests)})

@app.route("/news-request", methods=["POST"])
def news_request():
    data = request.get_json(force=True) or {}
    news_requests.append(data)
    return jsonify({"ok": True, "count": len(news_requests)})

@app.route("/approve-news", methods=["POST"])
def approve_news():
    data = request.get_json(force=True) or {}
    return jsonify({"ok": True, "approved": data})

@app.route("/requests")
def get_requests():
    return jsonify({"teams": team_requests, "news": news_requests})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)
