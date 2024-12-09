from flask import Flask, render_template, request, redirect, session
from flask_socketio import SocketIO, send
import os

app = Flask(__name__)
app.secret_key = 'your_secret_key'
socketio = SocketIO(app)

# Folder to store profile pictures
app.config['UPLOAD_FOLDER'] = 'static/uploads/'

# Users and their profile picture URLs
users = ['Raj', 'Rohan', 'Vishal', 'Suraj', 'Rakesh', 'Anthony', 'Ayush', 'Rahul']
user_pics = {
    'Raj': 'https://i.pinimg.com/736x/fa/d5/e7/fad5e79954583ad50ccb3f16ee64f66d.jpg',
    'Rohan': 'https://wallpapers-clan.com/wp-content/uploads/2023/01/anime-aesthetic-boy-pfp-11.jpg',
    'Vishal': 'https://cdn.hero.page/pfp/b7883292-7cf6-4fea-8925-d7519636c58e-poised-profile-anime-guy-pfp-styles-4.png',
    'Suraj' : 'https://w7.pngwing.com/pngs/591/819/png-transparent-psychic-detective-yakumo-manga-anime-anime-boy-black-hair-necktie-fictional-character-thumbnail.png',
    'Rakesh': 'https://data.moonscdn.com/prompt/slices/2/watermarked/crusader-anime-profile-avatar-niji6_uXFNW.png',
    'Anthony': 'https://cdn.hero.page/pfp/e81f1f48-5dd7-4682-8798-b5d3b5cd4069-mysterious-gentleman-anime-guy-pfp-styles-1.png',
    'Ayush': 'https://pbs.twimg.com/media/FD-3nPkakAEwMEN.jpg',
    'Rahul': 'https://png.pngtree.com/thumb_back/fh260/background/20230612/pngtree-an-anime-art-of-a-boy-with-glasses-image_2936011.jpg'
}

# Store chat history for each user
chat_history = {user: [] for user in users}

@app.route('/')
def index():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    phone_number = request.form['phone']
    if phone_number:
        session['user'] = phone_number
        return redirect('/chat')
    return 'Invalid login', 400

@app.route('/chat')
def chat():
    if 'user' in session:
        return render_template('index.html', users=users, user_pics=user_pics)
    return redirect('/')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return 'No file part', 400
    file = request.files['file']
    if file.filename == '':
        return 'No selected file', 400
    if file:
        filename = file.filename
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        return 'File uploaded successfully', 200

@socketio.on('send_message')
def handle_send_message(data):
    sender = data['user']
    message = data['message']
    timestamp = data['time']

    # Check if it's linked to WhatsApp or Telegram
    if data.get('platform') == 'WhatsApp':
        send_to_whatsapp(message)  # Placeholder function
    elif data.get('platform') == 'Telegram':
        send_to_telegram(message)  # Placeholder function

    sender_pic = user_pics.get(sender, 'https://via.placeholder.com/50/0000FF/808080?text=User')
    recipient_pic = user_pics.get(data['recipient'], 'https://via.placeholder.com/50/0000FF/808080?text=User')

    msg = {
        'user': sender,
        'message': message,
        'timestamp': timestamp,
        'sender_pic': sender_pic,
        'recipient_pic': recipient_pic
    }
    send(msg, broadcast=True)

# Placeholder for sending messages via WhatsApp
def send_to_whatsapp(message):
    print(f'Sending message to WhatsApp: {message}')  # Simulated action

# Placeholder for sending messages via Telegram
def send_to_telegram(message):
    print(f'Sending message to Telegram: {message}')  # Simulated action

if __name__ == '__main__':
    socketio.run(app, debug=True)
