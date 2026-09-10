/* ==========================================================================
   Global Variables & State Management
   ========================================================================== */
let cropper = null;

/* ==========================================================================
   Initialization on DOM Ready
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Navigation Toggle Setup
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // 2. Load Saved Profile Photo from Local Storage
  const savedImage = localStorage.getItem('owner_hero_image');
  const heroAvatar = document.getElementById('hero-avatar');
  if (savedImage && heroAvatar) {
    heroAvatar.src = savedImage;
  }

  // 3. Load Saved Hero Text Content
  const savedName = localStorage.getItem('owner_hero_name');
  const savedTitle = localStorage.getItem('owner_hero_title');
  const savedBio = localStorage.getItem('owner_hero_bio');

  if (savedName) document.getElementById('hero-name').innerText = savedName;
  if (savedTitle) document.getElementById('hero-title').innerText = savedTitle;
  if (savedBio) document.getElementById('hero-bio').innerText = savedBio;

  // 4. Admin Authentication Check via URL Parameter (?admin=true)
  const urlParams = new URLSearchParams(window.location.search);
  const isAdminParam = urlParams.get('admin') === 'true';
  const isSessionAdmin = sessionStorage.getItem('isAdmin') === 'true';

  if (isAdminParam || isSessionAdmin) {
    sessionStorage.setItem('isAdmin', 'true');

    // Show Image Edit Button
    const adminImgBtn = document.getElementById('admin-edit-btn');
    if (adminImgBtn) adminImgBtn.style.display = 'block';

    // Show Text Edit Controls
    const textTools = document.getElementById('admin-text-controls');
    if (textTools) textTools.style.display = 'flex';
  }

  // 5. File Input Event Listener for Photo Uploads
  const imageInput = document.getElementById('image-upload-input');
  if (imageInput) {
    imageInput.addEventListener('change', handleImageUpload);
  }
});

/* ==========================================================================
   Image Editor & Cropper Functions
   ========================================================================== */

function openImageModal() {
  const modal = document.getElementById('cropper-modal');
  const cropPreview = document.getElementById('crop-preview');
  const currentAvatarSrc = document.getElementById('hero-avatar').src;

  if (!modal || !cropPreview) return;

  cropPreview.src = currentAvatarSrc;
  modal.style.display = 'flex';

  if (cropper) cropper.destroy();

  cropper = new Cropper(cropPreview, {
    aspectRatio: 1,
    viewMode: 1,
    dragMode: 'move',
    autoCropArea: 0.9,
    restore: false,
    guides: false,
    center: true,
    highlight: false,
    cropBoxMovable: true,
    cropBoxResizable: true,
    toggleDragModeOnDblclick: false,
  });
}

function handleImageUpload(event) {
  const files = event.target.files;
  if (files && files.length > 0) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (cropper) {
        cropper.replace(e.target.result);
      }
    };
    reader.readAsDataURL(files[0]);
  }
}

function saveCroppedImage() {
  if (!cropper) return;

  const canvas = cropper.getCroppedCanvas({
    width: 400,
    height: 400,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
  });

  const base64Image = canvas.toDataURL('image/jpeg', 0.9);

  const heroAvatar = document.getElementById('hero-avatar');
  if (heroAvatar) heroAvatar.src = base64Image;

  localStorage.setItem('owner_hero_image', base64Image);
  closeImageModal();
}

function closeImageModal() {
  const modal = document.getElementById('cropper-modal');
  if (modal) modal.style.display = 'none';

  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
}

/* ==========================================================================
   Inline Text Editing Functions
   ========================================================================== */

function toggleTextEditing() {
  const nameEl = document.getElementById('hero-name');
  const titleEl = document.getElementById('hero-title');
  const bioEl = document.getElementById('hero-bio');

  const editBtn = document.getElementById('edit-text-btn');
  const saveBtn = document.getElementById('save-text-btn');

  const isEditing = nameEl.isContentEditable;

  if (!isEditing) {
    nameEl.contentEditable = "true";
    titleEl.contentEditable = "true";
    bioEl.contentEditable = "true";

    nameEl.focus();
    editBtn.style.display = "none";
    saveBtn.style.display = "inline-block";
  }
}

function saveTextContent() {
  const nameEl = document.getElementById('hero-name');
  const titleEl = document.getElementById('hero-title');
  const bioEl = document.getElementById('hero-bio');

  const editBtn = document.getElementById('edit-text-btn');
  const saveBtn = document.getElementById('save-text-btn');

  nameEl.contentEditable = "false";
  titleEl.contentEditable = "false";
  bioEl.contentEditable = "false";

  localStorage.setItem('owner_hero_name', nameEl.innerText.trim());
  localStorage.setItem('owner_hero_title', titleEl.innerText.trim());
  localStorage.setItem('owner_hero_bio', bioEl.innerText.trim());

  editBtn.style.display = "inline-block";
  saveBtn.style.display = "none";

  alert('Hero content saved successfully!');
}
