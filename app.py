from flask import Flask, render_template
import requests

app = Flask(__name__)

API_URL = "https://zenquotes.io/api/random"

@app.route("/")
def home():
    try:
        response = requests.get(API_URL, timeout=5)
        data = response.json()

        quote = data[0]["q"]
        author = data[0]["a"]

        return render_template("index.html", quote=quote, author=author)

    except Exception:
        return render_template("index.html", quote="Could not load quote.", author="API Error")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
