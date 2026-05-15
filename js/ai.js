async function sendChat() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;

    addChatMessage('user', msg);
    input.value = '';

    try {
        const response = await fetch('http://192.168.0.1:8080/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg })
        });
        const data = await response.json();
        addChatMessage('ai', data.reply || "I'm not sure how to help with that.");
    } catch (e) {
        addChatMessage('ai', "Error connecting to AI service.");
    }
}

function addChatMessage(sender, text) {
    const chatMessages = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = `chat-msg ${sender}`;
    div.innerText = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
