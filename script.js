const socket = io();
let currentUser = null;
let lastSender = null;
let userProfilePic = 'https://via.placeholder.com/50'; // Default profile picture

function goBack() {
    hideAllSections();
    document.getElementById('user-list').style.display = 'flex';
    document.getElementById('chat-section').style.display = 'none';
}

function hideAllSections() {
    document.querySelectorAll('.container > div').forEach(section => section.style.display = 'none');
}

function openChat(user) {
    currentUser = user;
    lastSender = null;
    document.getElementById('chat-section').style.display = 'flex';
    document.getElementById('chat-header').innerText = `Chat with ${user}`;
    document.getElementById('chat-profile-pic').src = userProfilePic;

    // Clear previous messages in this chat window
    document.getElementById('chat-window').innerHTML = '';
}

function toggleSettingsMenu() {
    const menu = document.getElementById('settings-menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function showProfileSettings() {
    document.getElementById('profile-modal').style.display = 'flex';
    document.getElementById('profile-pic-preview').src = userProfilePic; // Display current profile pic
}

function closeProfileSettings() {
    document.getElementById('profile-modal').style.display = 'none';
}

function showGroupSettings() {
    document.getElementById('group-modal').style.display = 'flex';
}

function closeGroupSettings() {
    document.getElementById('group-modal').style.display = 'none';
}

function showLinkAppsSettings() {
    document.getElementById('link-apps-modal').style.display = 'flex';
}

function closeLinkAppsSettings() {
    document.getElementById('link-apps-modal').style.display = 'none';
}

function linkApp(appName) {
    alert(`${appName} linked successfully! Now you can send and receive messages from ${appName} within this web app.`);
    closeLinkAppsSettings();
}

function createGroup() {
    const groupName = document.getElementById('group-name').value;
    const participants = Array.from(document.getElementById('group-participants').selectedOptions)
        .map(option => option.value);
    
    if (groupName && participants.length > 0) {
        // Simulate the creation of the group
        const groupList = document.getElementById('groups');
        const groupElement = document.createElement('li');
        groupElement.classList.add('group');
        groupElement.innerHTML = `${groupName} <span class="delete-btn" onclick="deleteGroup(this)">❌</span>`;
        groupElement.dataset.participants = JSON.stringify(participants);
        groupList.appendChild(groupElement);
        closeGroupSettings();
    }
}

function deleteGroup(deleteBtn) {
    const groupElement = deleteBtn.parentElement;
    groupElement.remove();
}

function searchUser() {
    const query = document.querySelector('.search-bar input').value.toLowerCase();
    const usersList = document.querySelectorAll('.contact');
    usersList.forEach(user => {
        const userName = user.querySelector('.contact-name').textContent.toLowerCase();
        if (userName.includes(query)) {
            user.style.display = 'flex';
        } else {
            user.style.display = 'none';
        }
    });
}

// Modify sendMessage function to include platform
function sendMessage(event) {
    event.preventDefault();
    const messageInput = document.getElementById('message-input');
    const platformSelect = document.getElementById('platform-select').value;
    const message = messageInput.value.trim();
    if (message && platformSelect !== 'default') {
        appendMessage(message, 'You');
        socket.emit('send_message', { message, user: currentUser, platform: platformSelect });
    }
    messageInput.value = '';
}

function appendMessage(message, sender) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message');
    messageContainer.classList.add(sender === 'You' ? 'sent' : 'received');
    messageContainer.innerHTML = 
        `<span class="sender">${sender}:</span><span class="message-text">${message}</span>`;
    document.getElementById('chat-window').appendChild(messageContainer);
}

// Simulate receiving a message
socket.on('receive_message', (data) => {
    if (data.user === currentUser) {
        appendMessage(data.message, data.user);
    }
});

// Profile picture upload
function uploadProfilePic(event) {
    event.preventDefault();

    const fileInput = document.querySelector('input[name="file"]');
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onloadend = function () {
        userProfilePic = reader.result; // Update the profile picture
        document.getElementById('chat-profile-pic').src = userProfilePic; // Update in chat
        document.getElementById('profile-pic-preview').src = userProfilePic; // Preview in modal
        closeProfileSettings();
    };

    if (file) {
        reader.readAsDataURL(file);
    }
}
