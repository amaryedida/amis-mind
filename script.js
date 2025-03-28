// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBq3ND6irGFsZYgl95Atf5gm62sFcW-R_Y",
    authDomain: "amis-s-mind.firebaseapp.com",
    databaseURL: "https://amis-s-mind-default-rtdb.firebaseio.com",
    projectId: "amis-s-mind",
    storageBucket: "amis-s-mind.firebasestorage.app",
    messagingSenderId: "759504870947",
    appId: "1:759504870947:web:4036e4989edd10a7dcdb96",
    measurementId: "G-EZFTKMB4Z6"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
} catch (e) {
    console.error("Firebase initialization error:", e);
}
const db = firebase.firestore();
const storage = firebase.storage(); 
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const NOTE_PREVIEW_LENGTH = 150;

// Form Submission
contentForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    stopSpeechRecognition();
    const editingItemId = editItemIdInput.value;
    const isEditing = !!editingItemId;
    const notes = notesTextarea.value.trim();
    const files = picturesInput.files;
    fileError.textContent = '';
    notesError.textContent = '';
    setStatusMessage('', false);
    let isValid = true;
    let pictureUrls = [];
    let hasFilesToUpload = files.length > 0;

    if (!notes) {
        notesError.textContent = 'Please enter some notes.';
        isValid = false;
    }

    if (!isEditing && hasFilesToUpload) {
        for (let file of files) {
            if (!file.type.startsWith('image/')) {
                fileError.textContent = 'Please upload image files only.';
                isValid = false;
                break;
            }
            if (file.size > MAX_FILE_SIZE_BYTES) {
                fileError.textContent = `Each file must be less than ${MAX_FILE_SIZE_MB} MB.`;
                isValid = false;
                break;
            }
        }
    } else if (isEditing) {
        const currentItem = allItems.find(item => item.id === editingItemId);
        pictureUrls = currentItem?.pictureUrls || [];
        hasFilesToUpload = false;
    }

    if (!isValid) return;

    showSpinner(isEditing ? 'Updating...' : 'Saving...');
    submitButton.disabled = true;
    cancelButton.disabled = true;

    try {
        if (!isEditing && hasFilesToUpload) {
            setStatusMessage('Uploading pictures...', false);
            const uploadPromises = Array.from(files).map(file => {
                const filePath = `pictures/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
                const storageRef = storage.ref(filePath);
                const uploadTask = storageRef.put(file);
                return new Promise((resolve, reject) => {
                    uploadTask.on(
                        'state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setStatusMessage(`Uploading ${file.name}: ${Math.round(progress)}%`, false);
                        },
                        reject,
                        async () => {
                            try {
                                resolve(await uploadTask.snapshot.ref.getDownloadURL());
                            } catch (urlError) {
                                reject(urlError);
                            }
                        }
                    );
                });
            });
            pictureUrls = await Promise.all(uploadPromises);
        }

        setStatusMessage(isEditing ? 'Updating data...' : 'Saving data...', false);
        if (isEditing) {
            await db.collection('pictures').doc(editingItemId).update({ notes: notes });
            setStatusMessage('Updated successfully!', true);
        } else {
            await db.collection('pictures').add({
                notes: notes,
                pictureUrls: pictureUrls,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                pinned: false
            });
            setStatusMessage("Saved in Ami's Mind", true);
        }
        setTimeout(closeForm, 1500);
    } catch (error) {
        console.error('Error saving/updating item:', error);
        setStatusMessage(`Failed to ${isEditing ? 'update' : 'save'} item.`, false);
        submitButton.disabled = false;
        cancelButton.disabled = false;
    } finally {
        hideSpinner();
        if (!statusMessage.classList.contains('success')) {
            submitButton.disabled = false;
            cancelButton.disabled = false;
        }
    }
});
