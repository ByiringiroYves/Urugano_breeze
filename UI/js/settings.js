document.getElementById('update-profile-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();

    // Handle file upload
    const profilePicture = document.getElementById('profile-picture').files[0];
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if (profilePicture) formData.append('profilePicture', profilePicture);

    try {
        const response = await fetch('/api/admin/profile', {
            method: 'PUT',
            body: formData,
        });

        if (response.ok) {
            alert('Profile updated successfully!');
        } else {
            const error = await response.json();
            alert(error.message || 'Error updating profile.');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
    }
});

document.getElementById('change-password-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const currentPassword = document.getElementById('current-password').value.trim();
    const newPassword = document.getElementById('new-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();

    if (newPassword !== confirmPassword) {
        alert('New passwords do not match.');
        return;
    }

    try {
        const response = await fetch('/api/admin/change-password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword }),
        });

        if (response.ok) {
            alert('Password changed successfully!');
        } else {
            const error = await response.json();
            alert(error.message || 'Error changing password.');
        }
    } catch (error) {
        console.error('Error changing password:', error);
    }
});

document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/admin/logout', { method: 'POST' });
        if (response.ok) {
            window.location.href = 'admin.html';
        } else {
            alert('Error logging out.');
        }
    } catch (error) {
        console.error('Error logging out:', error);
    }
});
