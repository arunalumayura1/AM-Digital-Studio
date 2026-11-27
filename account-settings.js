
import { supabase, requireUser, getProfile } from './supabase-client.js';

const notice = document.getElementById('accountNotice');

function showNotice(message, type = 'info') {
    notice.textContent = message;
    notice.className = `notice ${type}`;
    notice.hidden = false;
}

const user = await requireUser();
let currentProfile = null;
// ========================================
// PROFILE PHOTO UPLOAD SYSTEM
// ========================================

const profilePhotoInput =
    document.getElementById('profilePhotoInput');

const uploadProfilePhoto =
    document.getElementById('uploadProfilePhoto');

const removeProfilePhoto =
    document.getElementById('removeProfilePhoto');

const profilePreview =
    document.getElementById('profilePreview');

const profilePhotoName =
    document.getElementById('profilePhotoName');

const profileInitial =
    document.getElementById('profileInitial');

const MAX_PHOTO_SIZE = 2 * 1024 * 1024;

let selectedPhoto = null;

function getAvatarStoragePath(url) {
    if (!url) return null;

    try {
        const parsed = new URL(url);
        const marker = '/storage/v1/object/public/profile-photos/';
        const index = parsed.pathname.indexOf(marker);

        if (index === -1) return null;

        return decodeURIComponent(
            parsed.pathname.substring(index + marker.length)
        );
    } catch {
        return null;
    }
}

function showProfilePhoto(url) {
    profilePreview.innerHTML = '';

    if (url) {
        const image = document.createElement('img');
        image.src = url;
        image.alt = 'Profile picture';
        profilePreview.appendChild(image);

        profilePhotoName.textContent = 'Profile photo uploaded';
        removeProfilePhoto.hidden = false;
    } else {
        profileInitial.textContent =
            (currentProfile?.full_name || user?.email || 'A')
                .trim()
                .charAt(0)
                .toUpperCase() || 'A';

        profilePreview.appendChild(profileInitial);

        profilePhotoName.textContent = 'No profile photo uploaded';
        removeProfilePhoto.hidden = true;
    }
}

// Load existing profile photo
if (user && currentProfile) {
    showProfilePhoto(currentProfile.avatar_url);
}

// Open file picker
uploadProfilePhoto.addEventListener('click', () => {
    if (!user) return;
    profilePhotoInput.click();
});

// Preview selected image
profilePhotoInput.addEventListener('change', (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
        showNotice('Please select a JPG, PNG or WEBP image.', 'error');
        profilePhotoInput.value = '';
        return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
        showNotice('Image size must be less than 2 MB.', 'error');
        profilePhotoInput.value = '';
        return;
    }

    selectedPhoto = file;

    const previewUrl = URL.createObjectURL(file);

    profilePreview.innerHTML = '';

    const image = document.createElement('img');
    image.src = previewUrl;
    image.alt = 'Selected profile photo';

    profilePreview.appendChild(image);
    profilePhotoName.textContent = file.name;

    uploadProfilePhoto.textContent = 'Save Profile Photo';
});

// Upload or save selected photo
uploadProfilePhoto.addEventListener('click', async () => {
    if (!user || !selectedPhoto) return;

    const button = uploadProfilePhoto;
    button.disabled = true;
    button.textContent = 'Uploading...';

    try {
        const extension = selectedPhoto.type === 'image/png'
            ? 'png'
            : selectedPhoto.type === 'image/webp'
                ? 'webp'
                : 'jpg';

        const filePath =
            `${user.id}/avatar-${Date.now()}.${extension}`;

        const oldPath = getAvatarStoragePath(
            currentProfile?.avatar_url
        );

        const { error: uploadError } = await supabase.storage
            .from('profile-photos')
            .upload(filePath, selectedPhoto, {
                cacheControl: '3600',
                contentType: selectedPhoto.type,
                upsert: false
            });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(filePath);

        const avatarUrl = publicData.publicUrl;

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: avatarUrl })
            .eq('id', user.id);

        if (updateError) {
            await supabase.storage
                .from('profile-photos')
                .remove([filePath]);

            throw updateError;
        }

        // Remove previous photo after the new one is saved.
        if (oldPath && oldPath !== filePath) {
            const { error: removeOldError } = await supabase.storage
                .from('profile-photos')
                .remove([oldPath]);

            if (removeOldError) {
                console.warn('Old profile photo cleanup failed:', removeOldError);
            }
        }

        currentProfile.avatar_url = avatarUrl;

        showProfilePhoto(avatarUrl);

        selectedPhoto = null;
        profilePhotoInput.value = '';
        button.textContent = 'Upload Photo';

        showNotice('Profile photo updated successfully!', 'success');

    } catch (error) {
        showNotice(error.message, 'error');
        button.textContent = selectedPhoto
            ? 'Save Profile Photo'
            : 'Upload Photo';

    } finally {
        button.disabled = false;
    }
});

// Remove profile photo
removeProfilePhoto.addEventListener('click', async () => {
    if (!user || !currentProfile?.avatar_url) return;

    const button = removeProfilePhoto;
    button.disabled = true;
    button.textContent = 'Removing...';

    try {
        const oldPath = getAvatarStoragePath(
            currentProfile.avatar_url
        );

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: null })
            .eq('id', user.id);

        if (updateError) throw updateError;

        currentProfile.avatar_url = null;

        showProfilePhoto(null);

        if (oldPath) {
            const { error: removeError } = await supabase.storage
                .from('profile-photos')
                .remove([oldPath]);

            if (removeError) {
                console.warn('Profile photo cleanup failed:', removeError);
            }
        }

        showNotice('Profile photo removed successfully.', 'success');

    } catch (error) {
        showNotice(error.message, 'error');

    } finally {
        button.disabled = false;
        button.textContent = 'Remove Photo';
    }
});

if (user) {
    try {
        currentProfile = await getProfile(user.id);
        document.getElementById('profileFullName').value =
    currentProfile.full_name || '';

        document.getElementById('welcomeText').textContent =
            `Signed in as ${currentProfile.full_name || user.email}`;

        // Only customer accounts may request deletion.
        const deleteButton = document.getElementById('deleteAccountButton');

        if (currentProfile.role === 'customer') {
            deleteButton.disabled = false;
        } else {
            deleteButton.disabled = true;
        }

    } catch (error) {
        showNotice(error.message, 'error');
    }
}


// ========================================
// CHANGE PASSWORD
// ========================================

document.getElementById('changePasswordForm')
    .addEventListener('submit', async (event) => {

        event.preventDefault();

        if (!user) return;

        const currentPassword =
            document.getElementById('currentPassword').value;

        const newPassword =
            document.getElementById('newPassword').value;

        const confirmPassword =
            document.getElementById('confirmPassword').value;

        if (newPassword.length < 8) {
            showNotice('New password must contain at least 8 characters.', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showNotice('New passwords do not match.', 'error');
            return;
        }

        if (currentPassword === newPassword) {
            showNotice('Choose a different password.', 'error');
            return;
        }

        const button = event.submitter;
        button.disabled = true;
        button.textContent = 'Updating...';

        try {
            const { error: signInError } =
                await supabase.auth.signInWithPassword({
                    email: user.email,
                    password: currentPassword
                });

            if (signInError) throw signInError;

            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            document.getElementById('changePasswordForm').reset();

            showNotice('Your password has been updated successfully!', 'success');

        } catch (error) {
            showNotice(error.message, 'error');

        } finally {
            button.disabled = false;
            button.textContent = 'Update Password';
        }
    });


// ========================================
// PASSWORD RESET EMAIL
// ========================================

document.getElementById('sendResetEmail')
    .addEventListener('click', async (event) => {

        if (!user?.email) {
            showNotice('Your account email could not be found.', 'error');
            return;
        }

        const button = event.currentTarget;
        button.disabled = true;
        button.textContent = 'Sending...';

        try {
            const redirectUrl =
                new URL('reset-password.html', window.location.href).href;

            const { error } = await supabase.auth.resetPasswordForEmail(
                user.email,
                { redirectTo: redirectUrl }
            );

            if (error) throw error;

            showNotice(
                `Password reset email sent to ${user.email}. Please check your inbox.`,
                'success'
            );

        } catch (error) {
            showNotice(error.message, 'error');

        } finally {
            button.disabled = false;
            button.textContent = 'Send Reset Email';
        }
    });


// ========================================
// PREMIUM BLUE GLASS CONFIRMATION MODAL
// ========================================

function confirmDeleteAccount() {
    return new Promise((resolve) => {
        const modal = document.createElement('div');

        modal.className = 'am-delete-overlay';

        modal.innerHTML = `
            <div class="am-delete-modal" role="dialog"
                 aria-modal="true"
                 aria-labelledby="amDeleteTitle">

                <div class="am-delete-icon">!</div>

                <span class="am-delete-eyebrow">
                    AM DIGITAL STUDIO
                </span>

                <h2 id="amDeleteTitle">Delete Account?</h2>

                <p>
                    Are you sure you want to permanently delete
                    your AM Digital Studio account?
                </p>

                <div class="am-delete-info">
                    <span>ⓘ</span>
                    Your order history will be retained securely
                    for administrative reference.
                </div>

                <div class="am-delete-actions">
                    <button type="button"
                            class="am-delete-cancel">
                        Cancel
                    </button>

                    <button type="button"
                            class="am-delete-confirm">
                        Yes, Delete
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const finish = (confirmed) => {
            modal.classList.remove('show');

            setTimeout(() => modal.remove(), 180);

            document.removeEventListener('keydown', handleKeydown);
            resolve(confirmed);
        };

        const handleKeydown = (event) => {
            if (event.key === 'Escape') {
                finish(false);
            }
        };

        modal.querySelector('.am-delete-cancel')
            .addEventListener('click', () => finish(false));

        modal.querySelector('.am-delete-confirm')
            .addEventListener('click', () => finish(true));

        modal.addEventListener('click', (event) => {
            if (event.target === modal) finish(false);
        });

        document.addEventListener('keydown', handleKeydown);

        requestAnimationFrame(() => {
            modal.classList.add('show');
            modal.querySelector('.am-delete-cancel').focus();
        });
    });
}

// ========================================
// ACCOUNT DELETION
// ========================================

document.getElementById('deleteAccountButton')
    .addEventListener('click', async (event) => {

        if (!user || currentProfile?.role !== 'customer') {
            showNotice('Only customer accounts can be deleted.', 'error');
            return;
        }

        const passwordInput =
            document.getElementById('deleteAccountPassword');

        const password = passwordInput.value;

        if (!password) {
            showNotice('Please enter your current password.', 'error');
            passwordInput.focus();
            return;
        }
const confirmed = await confirmDeleteAccount();

if (!confirmed) return;

        const button = event.currentTarget;
        button.disabled = true;
        button.textContent = 'Deleting Account...';

        try {
            const { data: sessionData, error: sessionError } =
                await supabase.auth.getSession();

            if (sessionError) throw sessionError;

            if (!sessionData.session) {
                throw new Error('Your login session has expired. Please sign in again.');
            }

            const { data, error } =
                await supabase.functions.invoke(
                    'delete-customer-account',
                    {
                        body: { password }
                    }
                );

            if (error) {
                let message = error.message;

                if (error.context) {
                    try {
                        const result = await error.context.json();
                        if (result.error) message = result.error;
                    } catch (_) {}
                }

                throw new Error(message);
            }

            if (!data?.success) {
                throw new Error(data?.error || 'Account deletion failed.');
            }

            passwordInput.value = '';

            showNotice(
                'Your account has been deleted successfully. Redirecting...',
                'success'
            );

            // Clear the deleted account's local session.
            await supabase.auth.signOut();

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2500);

        } catch (error) {
            showNotice(error.message, 'error');

            button.disabled = false;
            button.textContent = 'Delete My Account';
        }
    });

// ========================================
// UPDATE PROFILE NAME
// ========================================

document.getElementById('updateProfileForm')
    .addEventListener('submit', async (event) => {

        event.preventDefault();

        if (!user || !currentProfile) return;

        const nameInput = document.getElementById('profileFullName');
        const button = document.getElementById('updateProfileButton');

        const fullName = nameInput.value.trim();

        if (fullName.length < 2) {
            showNotice('Name must contain at least 2 characters.', 'error');
            return;
        }

        if (fullName.length > 80) {
            showNotice('Name must not exceed 80 characters.', 'error');
            return;
        }

        button.disabled = true;
        button.textContent = 'Saving...';

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: fullName })
                .eq('id', user.id);

            if (error) throw error;

            currentProfile.full_name = fullName;

            document.getElementById('welcomeText').textContent =
                `Signed in as ${fullName}`;

            showNotice(
                'Your profile name has been updated successfully!',
                'success'
            );

        } catch (error) {
            showNotice(error.message, 'error');

        } finally {
            button.disabled = false;
            button.textContent = 'Save Name';
        }
    });


// ========================================
// LOGOUT
// ========================================

document.getElementById('logoutButton')
    .addEventListener('click', async () => {

        const { error } = await supabase.auth.signOut();

        if (error) {
            showNotice(error.message, 'error');
            return;
        }

        window.location.href = 'login.html';
    });

