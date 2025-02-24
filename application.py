import flask 
from flask import render_template, request, redirect, url_for


app = flask.Flask(__name__)
# a simple hello world route
@app.route('/hello')
@app.route('/hello/<name>')
def hello_world(name=None):
    return render_template('hello.html', name=name)

@app.route('/submit', methods=['POST'])
def submit():
    name = request.form['name']
    return redirect(url_for('hello_world', name=name))


if __name__ == '__main__':
    
    print("Starting Flask application...")
    print("Application is running on http://127.0.0.1:5000/hello")
    app.run(debug=True, port = 5000)