document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded");
    const emojiTriggerButton = document.getElementById('emoji-trigger');
    const textarea = document.getElementById('ad-text');

    if (!emojiTriggerButton || !textarea) {
        console.error("Emoji button or text area not found!");
        return;
    }

    console.log("Initializing Picmo emoji picker...");
    const picker = new Picmo.PopupPicker({
        triggerElement: emojiTriggerButton,
        position: 'bottom-start',
        autoHide: true
    });

    picker.addEventListener('emoji:select', (event) => {
        console.log("Emoji selected:", event.emoji);
        textarea.value += event.emoji;
    });

    emojiTriggerButton.addEventListener('click', () => {
        console.log("Emoji button clicked");
        picker.toggle();
    });
});
