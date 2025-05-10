from dotenv import load_dotenv
load_dotenv()  # This will load the .env file automatically

from flask import Flask, render_template, request, redirect, url_for, session
from flask_limiter import Limiter

from donatie_handler import verwerk_donatie, lees_donaties

from werkzeug.utils import secure_filename
from PIL import Image
import os
import uuid
from datetime import timedelta
import logging
# Initialize flask application
app = Flask(__name__)
app.permanent_session_lifetime = timedelta(hours=1) # Add session timer

logging.basicConfig(
    level=logging.INFO,  # Of DEBUG voor meer details
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("app.log"),   # Log naar bestand
        logging.StreamHandler()           # Log ook naar console (Gunicorn of terminal)
    ]
)
# If key is not set in production, the server will refuse to start.
# This makes it safer than silently using an insecure default.
secret_key = os.getenv("SECRET_KEY")
if not secret_key:
    raise RuntimeError("SECRET_KEY environment variable is not set!")

app.secret_key = secret_key


# Create session so that we can distinguish every user from a NAT network.
# This will be especially usefull for when we want to limit the amount of uploads for every user.
def get_session_id():
    if "uuid" not in session:
        session["uuid"] = str(uuid.uuid4())
        session.permanent = True
    print("sessionID: " + session["uuid"])
    return session["uuid"]


# Initialize Flask-Limiter (rate limiter)
limiter = Limiter(
    get_session_id,  # doesnt use IP address for rate limiting -> doesnt become a problem with shared IP's, companies with NAT or UAntwerpen
    app=app,
    default_limits=["10 per minute"],  # Default limit: 10 uploads per minute
    #storage_uri="redis://localhost:6379"
)

# Configure upload folder
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["ALLOWED_EXTENSIONS"] = {"png", "jpg", "jpeg"}
app.config["MAX_CONTENT_LENGTH"] = 25*1024*1024

# Validate the actual file content using Pillow
def validate_image(file_stream):
    try:
        img = Image.open(file_stream)
        img.verify()  # Check if it's a valid image
        file_stream.seek(0)  # Reset file pointer
        return True
    except (IOError, SyntaxError):
        return False  # Not a valid image
    
    
def get_file_extension(filename):
    file_extension = filename.rsplit('.', 1)[1].lower()
    return file_extension


def allowed_file(filename, file_stream):
    # Check if the file has an extension
    if '.' not in filename:
        return False  # No extension at all
      
    if get_file_extension(filename) not in app.config["ALLOWED_EXTENSIONS"]:
        return False  # Extension is not allowed

    if not validate_image(file_stream):
        return False  # The file is not a real image

    return True


@app.errorhandler(413)
def too_large(e):
    return render_template('error.html', error_code=413, error_message="Request Entity Too Large. The file you're trying to upload exceeds the maximum size allowed.")

@app.errorhandler(429)
def too_many(e):
    return render_template('error.html', error_code=429, error_message="Too many requests. Please wait before trying again.")


@app.route("/upload", methods=["GET","POST"])
# This ensures that users cannot upload more than x# files per minute from the same session.
@limiter.limit("20 per minute") 
def upload():
    if request.method == "POST":
        if "image" not in request.files:
            return "No file part"
        
        file = request.files["image"]

        if file.filename == "":
            return "No selected file"

        if allowed_file(file.filename, file):

            # Get (optional) user name 
            user_name = request.form.get("bedrijfNaam", "Knuffelbox website")

            # Create unique filename for every upload
            filename = f"{uuid.uuid4().hex}.{get_file_extension(file.filename)}" # e.g. Random.jpg/.png

            # If the user gave a name, use that to create a folder by that name
            # If not, save it in the uploads folder
            if user_name:
                folder_name = secure_filename(user_name) 
                # Create user folder if it doesn't exist
                user_folder = os.path.join(app.config["UPLOAD_FOLDER"], folder_name)
                os.makedirs(user_folder, exist_ok=True)
                filepath = os.path.join(user_folder, filename)

            else:
                filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)

            # Now save the file 
            file.save(filepath)
            return redirect(url_for("upload"))

    return render_template("upload.html")



@app.route("/")
def home():
    logging.info("Home")
    return render_template("home.html")

@app.route("/Bedrag")
def bedrag():
    logging.info("Bedrag")
    return render_template("Bedrag.html")

@app.route("/QR_code")
def qr_code():
    logging.info("QR-code")
    return render_template("QR_code.html")

@app.route("/opslaan", methods=["POST"])
def opslaan():
    # Haal gegevens op uit het formulier
    session["bedrijf"] = request.form.get("bedrijfNaam", "Knuffelbox website")
    session["aantal_fotos"] = int(request.form.get("aantalFotos", 0))
    session["naam_op_site"] = request.form.get("naamMagOpSite") == "true"

    # Eventueel: zet de sessie permanent (blijft 1 uur geldig zoals ingesteld)
    session.permanent = True

    return redirect(url_for("bevestiging"))



@app.route("/Bevestiging")
def bevestiging():
    bedrijf = session.get("bedrijf", "Knuffelbox website")
    aantal_fotos = session.get("aantal_fotos", 0)

    logging.info(f"Bevestiging: bedrijf={bedrijf}, aantal_fotos={aantal_fotos}")
    verwerk_donatie(bedrijf, aantal_fotos)

    return render_template("Bevestiging.html", bedrijf=bedrijf, aantalFotos=aantal_fotos)

@app.route("/Bedankt")
def bevestiginganoniem():
    return render_template("Bevestiging.html")

@app.route("/Knuffelkampioenschap")
def Knuffelkampioenschap():
    donaties = lees_donaties()
    return render_template("Knuffelkampioenschap.html", donaties=donaties)

if __name__ == "__main__":
   app.run(host='0.0.0.0', port=5000, debug=False)
application = app