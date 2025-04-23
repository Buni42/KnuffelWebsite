from flask import Flask, render_template, request, redirect, url_for, session

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from PIL import Image
import os
import uuid

#initialize flask application
app = Flask(__name__)
app.secret_key = "secret_key" # -> how to make this actually secret?

# Create session so that we can distinguish every user from a NAT network.
# This will be especially usefull for when we want to limit the amount of uploads for every user.
def get_session_id():
    if "uuid" not in session:
        session["uuid"] = str(uuid.uuid4())
    print("sessionID: " + session["uuid"])
    return session["uuid"]

# The problem with session based limiting is that the user can bypass the cookies by deleting them or using incognito mode.
# We can use reCAPTCHA against bots and/or server side tracking against user abuse


# Initialize Flask-Limiter (rate limiter)
limiter = Limiter(
    get_session_id,  # doesnt use IP address for rate limiting -> doesnt become a problem with shared IP's, companies with NAT or UAntwerpen
    app=app,
    default_limits=["10 per minute"]  # Default limit: 10 uploads per minute
)

# Configure upload folder
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["ALLOWED_EXTENSIONS"] = {"png", "jpg", "jpeg"}


def validate_image(file_stream):
    try:
        img = Image.open(file_stream)
        img.verify()  # Check if it's a valid image
        file_stream.seek(0)  # Reset file pointer
        return True
    except (IOError, SyntaxError):
        return False  # Not a valid image


def allowed_file(filename, file_stream):
    # Check if the file has an extension
    if '.' not in filename:
        return False  # No extension at all

    ext = filename.rsplit('.', 1)[1].lower()
    if ext not in app.config["ALLOWED_EXTENSIONS"]:
        return False  # Extension is not allowed

    # Validate the actual file content using Pillow
    if not validate_image(file_stream):
        return False  # The file is not a real image

    return True

@app.errorhandler(413)
def too_large(e):
    return "File is too large", 413

@app.errorhandler(429)
def too_large(e):
    return "Too many uploads", 429


@app.route("/upload", methods=["GET","POST"])
# This ensures that users cannot upload more than x# files per minute from the same IP.
@limiter.limit("20 per minute") 
def upload():
    if request.method == "POST":
        if "image" not in request.files:
            return "No file part"
        
        file = request.files["image"]

        if file.filename == "":
            return "No selected file"

        if allowed_file(file.filename, file):
            filepath = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
            file.save(filepath)
            return redirect(url_for("upload"))

    return render_template("upload.html")


@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/")
def home():
    return render_template("home.html")

if __name__ == "__main__":
   app.run(host='0.0.0.0', port=5000, debug=True)

