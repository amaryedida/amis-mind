console.log("script.js loaded");

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
const auth = firebase.auth();

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const NOTE_PREVIEW_LENGTH = 150;
// Restrict to your personal email (replace with your email)
const ALLOWED_EMAIL = "amaryedida@gmail.com"; // Replace with your actual email
// Authentication UI
const authContainer = document.createElement('div');
authContainer.id = 'authContainer';
authContainer.innerHTML = `
    <div class="card">
        <h2 class="text-xl font-bold text-center mb-5 text-gray-700">Sign In</h2>
        <form id="authForm">
            <div class="form-field">
                <label for="email">Email:</label>
                <input type="email" id="email" value="${ALLOWED_EMAIL}" readonly class="border p-2 w-full rounded-md bg-gray-100">
            </div>
            <div class="form-field">
                <label for="password">Password:</label>
                <input type="password" id="password" required class="border p-2 w-full rounded-md">
            </div>
            <p id="authError" class="error"></p>
            <div class="flex justify-end gap-3 mt-4">
                <button type="submit" id="signInBtn" class="btn">Sign In</button>
            </div>
        </form>
    </div>
`;
document.body.insertBefore(authContainer, document.body.firstChild);

// Hamburger menu container
const hamburgerMenu = document.createElement('div');
hamburgerMenu.className = 'hamburger-menu';
hamburgerMenu.innerHTML = `  
  <div class="bar"></div>
  <div class="bar"></div>
  <div class="bar"></div>
`;
hamburgerMenu.style.position = 'fixed';
hamburgerMenu.style.top = '10px';
hamburgerMenu.style.right = '10px';
document.body.appendChild(hamburgerMenu);

// Sign-out option container
const signoutOption = document.createElement('div');
signoutOption.className = 'signout-option hidden';
signoutOption.style.position = 'fixed';
signoutOption.style.top = '45px'; // Adjust position below the hamburger
signoutOption.style.right = '10px';
document.body.appendChild(signoutOption);

// Sign-out button
const signOutButton = document.createElement('button');
signOutButton.id = 'signOutBtn';
signOutButton.className = 'btn btn-secondary';
signOutButton.textContent = 'Sign Out';
signoutOption.appendChild(signOutButton);

// Event listener for the hamburger menu
hamburgerMenu.addEventListener('click', () => {
  signoutOption.classList.toggle('hidden');
});

// Hide main app content initially
const appContent = document.querySelector('h1.app-heading').parentElement;
appContent.style.display = 'none';

// Authentication Logic
const authForm = document.getElementById('authForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signInBtn = document.getElementById('signInBtn');
const authError = document.getElementById('authError');

auth.onAuthStateChanged(user => {
    if (user && user.email === ALLOWED_EMAIL) {
        // User is signed in with the allowed email, show app content
        authContainer.style.display = 'none';
        appContent.style.display = 'block';
        signOutButton.style.display = 'block';
    } else {
        // No user or incorrect email, show sign-in form
        authContainer.style.display = 'block';
        appContent.style.display = 'none';
        signOutButton.style.display = 'none';
        if (user) {
            // If a different email is signed in, sign them out
            auth.signOut();
            authError.textContent = 'Access restricted to authorized email only.';
        }
    }
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    if (email !== ALLOWED_EMAIL) {
        authError.textContent = 'Access restricted to authorized email only.';
        return;
    }
    try {
        signInBtn.disabled = true;
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        authError.textContent = error.message;
    } finally {
        signInBtn.disabled = false;
    }
});

signOutButton.addEventListener('click', async () => {
    try {
        await auth.signOut();
    } catch (error) {
        authError.textContent = 'Error signing out: ' + error.message;
    }
});

 



// DOM Elements
const inputTrigger = document.getElementById('inputTrigger');
const notesIconTrigger = document.getElementById('notesIconTrigger');
const pictureIconTrigger = document.getElementById('pictureIconTrigger');
const contentFormWrapper = document.getElementById('contentFormWrapper');
const contentForm = document.getElementById('contentForm');
const picturesFormField = document.getElementById('picturesFormField');
const picturesLabel = document.getElementById('picturesLabel');
const picturesInput = document.getElementById('pictures');
const notesLabel = document.getElementById('notesLabel');
const notesTextarea = document.getElementById('notes');
const notesMicBtn = document.getElementById('notesMicBtn');
const spinner = document.getElementById('spinner');
const statusMessage = document.getElementById('statusMessage');
const submitButton = document.getElementById('submitBtn');
const cancelButton = document.getElementById('cancelButton');
const editItemIdInput = document.getElementById('editItemId');
const entryModeInput = document.getElementById('entryMode');
const existingImagesDiv = document.getElementById('existingImages');
const fileError = document.getElementById('fileError');
const notesError = document.getElementById('notesError');
const itemsList = document.getElementById('itemsList');
const searchBar = document.getElementById('searchBar');
const loadingMessage = document.getElementById('loadingMessage');
const fileHelper = document.getElementById('fileHelper');
const notesHelper = document.getElementById('notesHelper');
const viewModalOverlay = document.getElementById('viewModalOverlay');
const viewModalContent = document.getElementById('viewModalContent');
const viewModalCloseBtn = document.getElementById('viewModalCloseBtn');
const modalImageContainer = document.getElementById('modalImageContainer');
const modalNotesContent = document.getElementById('modalNotesContent');

// Event Listeners for Input Trigger
notesIconTrigger.addEventListener('click', (e) => { e.stopPropagation(); openForm('notes'); });
pictureIconTrigger.addEventListener('click', (e) => { e.stopPropagation(); openForm('picture'); });
inputTrigger.addEventListener('click', () => { if (contentFormWrapper.style.display === 'none') openForm('notes'); }); 

function openForm(mode) {
    resetForm(false);
    entryModeInput.value = mode;
    if (mode === 'notes') {
        notesLabel.textContent = 'Notes:';
        notesHelper.textContent = 'Add your thoughts or details.';
        picturesFormField.classList.add('hidden');
    } else if (mode === 'picture') {
        notesLabel.textContent = 'Notes (optional):';
        notesHelper.textContent = 'Add optional notes for the picture.';
        picturesFormField.classList.remove('hidden');
        picturesLabel.textContent = 'Pictures (Required):';
        fileHelper.textContent = 'Upload one or more images (Required).';
    } else if (mode === 'edit') {
        notesLabel.textContent = 'Notes:';
        notesHelper.textContent = 'Edit your notes.';
    }
    contentFormWrapper.style.display = 'block';
    inputTrigger.style.display = 'none';
    notesTextarea.focus();
} 

cancelButton.addEventListener('click', closeForm);

function closeForm() {
    contentFormWrapper.style.display = 'none';
    inputTrigger.style.display = 'flex';
    resetForm(false);
} 

function resetForm(focusNotes = false) {
    stopSpeechRecognition();
    contentForm.reset();
    editItemIdInput.value = '';
    entryModeInput.value = '';
    submitButton.textContent = 'Save';
    submitButton.disabled = false;
    cancelButton.disabled = false;
    spinner.style.display = 'none';
    setStatusMessage('', false);
    fileError.textContent = '';
    notesError.textContent = '';
    existingImagesDiv.innerHTML = '';
    picturesInput.value = null;
    picturesInput.disabled = false;
    picturesFormField.classList.add('hidden');
    notesLabel.textContent = 'Notes:';
    picturesLabel.textContent = 'Pictures:';
    notesHelper.textContent = 'Add your thoughts or details.';
    fileHelper.textContent = 'Upload one or more images.';
    if (focusNotes) notesTextarea.focus();
} 

function setStatusMessage(message, isSuccess) {
    statusMessage.textContent = message;
    statusMessage.classList.remove('error', 'success');
    statusMessage.classList.add(isSuccess ? 'success' : 'error');
    if (message && isSuccess) setTimeout(() => statusMessage.textContent = '', 3000);
}

// Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let notesRecognition = null;
let activeRecognition = null;
let activeMicButton = null; 

function setupSpeechRecognitionInstance(textarea, micButton) {
    try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    transcript += event.results[i][0].transcript;
                }
            }
            textarea.value += (textarea.value.length > 0 ? ' ' : '') + transcript.trim();
            console.log('Speech recognition result:', transcript);
        };
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            alert(`Speech recognition error: ${event.error}. Please try again.`);
            stopSpeechRecognition();
        };
        recognition.onstart = () => {
            console.log('Speech recognition started.');
            micButton.classList.add('pulsing');
            activeRecognition = recognition;
            activeMicButton = micButton;
        };
        recognition.onend = () => {
            console.log('Speech recognition stopped.');
            if (activeRecognition === recognition) {
                micButton.classList.remove('pulsing');
                activeRecognition = null;
                activeMicButton = null;
            }
        };
        return recognition;
    } catch (error) {
        console.error('Error initializing SpeechRecognition:', error);
        alert('Speech recognition is not supported in your browser.');
        micButton.style.display = 'none';
        textarea.placeholder = "Speech recognition is not supported in your browser.";
        return null;
    }
}

function stopSpeechRecognition() {
    if (activeRecognition) {
        activeRecognition.stop();
        console.log('Speech recognition stopped manually.');
    } else if (activeMicButton) {
        activeMicButton.classList.remove('pulsing');
    }
    activeRecognition = null;
    activeMicButton = null;
} 

if (SpeechRecognition) {
    notesRecognition = setupSpeechRecognitionInstance(notesTextarea, notesMicBtn);
    if (notesRecognition) {
        notesMicBtn.addEventListener('click', () => {
            if (activeRecognition === notesRecognition) {
                stopSpeechRecognition();
                notesMicBtn.classList.remove('pulsing');
            } else {
                stopSpeechRecognition();
                try {
                    notesRecognition.start();
                    notesMicBtn.classList.add('pulsing');
                } catch (e) {
                    console.error("Error starting speech recognition:", e);
                    alert("Could not start speech recognition. Please ensure your microphone is enabled.");
                }
            }
        });
    }
} else {
    console.warn('Speech recognition not supported in this browser.');
    notesMicBtn.style.display = 'none';
    notesTextarea.placeholder = "Speech recognition is not supported in your browser.";
}

// Data Fetching and Display
let allItems = [];
const unsubscribe = db.collection('pictures')
    .orderBy('timestamp', 'desc')
    .onSnapshot(
        (snapshot) => {
            loadingMessage.style.display = 'none';
            allItems = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : null
            }));
            console.log("Fetched items:", allItems);
            displayItems();
        },
        (error) => {
            console.error("Error fetching items from Firestore:", error);
            loadingMessage.textContent = "Failed to load items. Please try again later.";
        }
    ); 

function displayItems() {
    const searchTerm = searchBar.value.toLowerCase().trim();
    const pinnedItems = allItems.filter(item => item.pinned).sort((a, b) => b.timestamp - a.timestamp);
    const unpinnedItems = allItems.filter(item => !item.pinned).sort((a, b) => b.timestamp - a.timestamp);
    const filteredPinnedItems = pinnedItems.filter(item => {
        const notes = (item.notes || '').toLowerCase();
        const timestampString = item.timestamp ? item.timestamp.toLocaleString() : '';
        return notes.includes(searchTerm) || timestampString.includes(searchTerm);
    });
    const filteredUnpinnedItems = unpinnedItems.filter(item => {
        const notes = (item.notes || '').toLowerCase();
        const timestampString = item.timestamp ? item.timestamp.toLocaleString() : '';
        return notes.includes(searchTerm) || timestampString.includes(searchTerm);
    });
    itemsList.innerHTML = '';
    if (allItems.length === 0 && loadingMessage.style.display === 'none') {
        itemsList.innerHTML = '<p class="text-center text-gray-500">No items saved yet.</p>';
    } else if (filteredPinnedItems.length === 0 && filteredUnpinnedItems.length === 0) {
        itemsList.innerHTML = '<p class="text-center text-gray-500">No items match your search.</p>';
    }
    filteredPinnedItems.forEach(item => renderItem(item, true));
    filteredUnpinnedItems.forEach(item => renderItem(item, false));
}

function renderItem(item, isPinned) {
    const itemElement = document.createElement('div');
    itemElement.className = 'item-card';
    itemElement.setAttribute('data-id', item.id);
    let imagesHtmlPreview = '';
    if (Array.isArray(item.pictureUrls) && item.pictureUrls.length > 0) {
        imagesHtmlPreview = `<div class="item-img-container">
                                <img src="${item.pictureUrls[0]}" alt="Preview" class="item-img">
                              </div>`;
    }
    const timestampStr = item.timestamp ? item.timestamp.toLocaleString() : 'Unknown time';
    const notesPreview = item.notes ? escapeHtml(item.notes) : 'No notes';
    itemElement.innerHTML = `
        <div class="item-actions">
            <button class="pin-btn" title="${isPinned ? 'Unpin Item' : 'Pin Item'}">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${isPinned ? 'M5 15l7-7 7 7' : 'M12 19V6m0 0l-7 7m7-7l7 7'}" />
                </svg>
            </button>
            <button class="edit-btn" title="Edit Item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
            </button>
            <button class="delete-btn" title="Delete Item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
        <div class="item-content-wrapper" data-id="${item.id}">
            ${imagesHtmlPreview}
            <p class="item-notes-preview">${notesPreview}</p>
            <p class="item-timestamp">${timestampStr}</p>
        </div>
    `;
    itemsList.appendChild(itemElement);
}

// Event Delegation for Items
itemsList.addEventListener('click', (e) => {
    const pinButton = e.target.closest('.pin-btn');
    const editButton = e.target.closest('.edit-btn');
    const deleteButton = e.target.closest('.delete-btn');
    const viewTrigger = e.target.closest('.item-content-wrapper');
    if (pinButton) {
        const itemId = pinButton.closest('.item-card')?.dataset.id;
        if (itemId) handlePinClick(itemId);
    } else if (editButton) {
        console.log("Edit button clicked");
        const itemId = editButton.closest('.item-card')?.dataset.id;
        if (itemId) handleEditClick(itemId);
    } else if (deleteButton) {
        console.log("Delete button clicked");
        const itemId = deleteButton.closest('.item-card')?.dataset.id;
        if (itemId) handleDeleteClick(itemId);
    } else if (viewTrigger) {
        if (!e.target.closest('.item-actions')) {
            const itemId = viewTrigger.dataset.id;
            if (itemId) handleViewClick(itemId);
        }
    }
}); 

async function handlePinClick(itemId) {
    try {
        const item = allItems.find(item => item.id === itemId);
        if (!item) return;
        const newPinnedStatus = !item.pinned;
        await db.collection('pictures').doc(itemId).update({ pinned: newPinnedStatus });
        setStatusMessage(newPinnedStatus ? 'Item pinned!' : 'Item unpinned!', true);
    } catch (error) {
        console.error('Error updating pin status:', error);
        setStatusMessage('Failed to update pin status.', false);
    }
}

function escapeHtml(unsafe) {
    if (unsafe === undefined || unsafe === null) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
} 

searchBar.addEventListener('input', displayItems); 

function handleViewClick(itemId) {
    const itemToView = allItems.find(item => item.id === itemId);
    if (!itemToView) return;
    modalNotesContent.innerHTML = escapeHtml(itemToView.notes || "").replace(/\n/g, '<br>');
    modalImageContainer.innerHTML = '';
    if (Array.isArray(itemToView.pictureUrls) && itemToView.pictureUrls.length > 0) {
        itemToView.pictureUrls.forEach(url => {
            const img = document.createElement('img');
            img.src = url;
            img.alt = "Saved Image";
            img.className = "modal-img";
            modalImageContainer.appendChild(img);
        });
    }
    viewModalOverlay.classList.add('active');
} 

viewModalCloseBtn.addEventListener('click', closeViewModal);
viewModalOverlay.addEventListener('click', (e) => {
    if (e.target === viewModalOverlay) {
        closeViewModal();
    }
}); 

function closeViewModal() {
    viewModalOverlay.classList.remove('active');
} 

function handleEditClick(itemId) {
    const itemToEdit = allItems.find(item => item.id === itemId);
    if (!itemToEdit) return;
    resetForm(false);
    editItemIdInput.value = itemId;
    entryModeInput.value = 'edit';
    notesTextarea.value = itemToEdit.notes || '';
    if (Array.isArray(itemToEdit.pictureUrls) && itemToEdit.pictureUrls.length > 0) {
        picturesFormField.classList.remove('hidden');
        picturesLabel.textContent = 'Pictures (Optional):';
        fileHelper.textContent = 'Upload new images to replace existing ones (optional).';
        itemToEdit.pictureUrls.forEach(url => {
            const img = document.createElement('img');
            img.src = url;
            img.alt = 'Existing Image';
            img.className = 'item-img';
            existingImagesDiv.appendChild(img);
        });
        picturesInput.disabled = false;
    } else {
        picturesFormField.classList.add('hidden');
    }
    submitButton.textContent = 'Update';
    contentFormWrapper.style.display = 'block';
    inputTrigger.style.display = 'none';
    notesTextarea.focus();
} 

async function handleDeleteClick(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    showSpinner('Deleting...');
    try {
        const item = allItems.find(item => item.id === itemId);
        if (item && Array.isArray(item.pictureUrls)) {
            const deletePromises = item.pictureUrls.map(url => {
                const fileRef = storage.refFromURL(url);
                return fileRef.delete().catch(error => {
                    console.error('Error deleting file:', error);
                });
            });
            await Promise.all(deletePromises);
        }
        await db.collection('pictures').doc(itemId).delete();
        setStatusMessage('Item deleted successfully!', true);
    } catch (error) {
        console.error('Error deleting item:', error);
        setStatusMessage('Failed to delete item.', false);
    } finally {
        hideSpinner();
    }
} 

function showSpinner(message = 'Processing...') {
    spinner.style.display = 'block';
    setStatusMessage(message, false);
} 

function hideSpinner() {
    spinner.style.display = 'none';
}

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
