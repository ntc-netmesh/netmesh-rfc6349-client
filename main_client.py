from webui import WebUI
from flask import Flask, render_template

app = Flask(__name__,
  template_folder='web/templates',
  static_folder='web/static')
  
ui = WebUI(app, debug=True)

@app.route('/')
def index():
  return render_template('home.html')

if __name__ == "__main__":
  ui.run()
  # app.run(debug = True)