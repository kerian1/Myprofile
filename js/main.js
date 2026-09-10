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

  // 2. Load Saved Profile Photo from Local Storage (Public & Owner View)
  const savedImage = localStorage.getItem('owner_hero_image');
  const heroAvatar = document.getElementById('hero-avatar');
  if (savedImage && heroAvatar) {
    heroAvatar.src = savedImage;
  }

  // 3. Admin Authentication Check via URL Parameter (?admin=true)
  const urlParams = new URLSearchParams(window.location.search);
  const isAdminParam = urlParams.get('admin') === 'true';
  const isSessionAdmin = sessionStorage.getItem('isAdmin') === 'true';

  if (isAdminParam || isSessionAdmin) {
    sessionStorage.setItem('isAdmin', 'true');
    const adminBtn = document.getElementById('admin-edit-btn');
    if (adminBtn) {
      adminBtn.style.display = 'block'; // Make Edit button visible only to Admin/Owner
    }
  }

  // 4. File Input Event Listener for Modal Uploads
  const imageInput = document.getElementById('image-upload-input');
  if (imageInput) {
    imageInput.addEventListener('change', handleImageUpload);
  }
});

/* ==========================================================================
   Image Editor & Modal Functions
   ========================================================================== */

/**
 * Opens the Cropper modal and initializes the LinkedIn-style image adjuster
 */
function openImageModal() {
  const modal = document.getElementById('cropper-modal');
  const cropPreview = document.getElementById('crop-preview');
  const currentAvatarSrc = document.getElementById('hero-avatar').src;

  if (!modal || !cropPreview) return;

  cropPreview.src = currentAvatarSrc;
  modal.style.display = 'flex';

  // Destroy previous cropper instance if running
  if (cropper) {
    cropper.destroy();
  }

  // Initialize Cropper.js with 1:1 ratio for circular profile pictures
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

/**
 * Handles uploading a new image from local device storage
 */
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

/**
 * Exports cropped canvas, updates live view, and persists changes
 */
function saveCroppedImage() {
  if (!cropper) return;

  // Export cropped image as Base64 JPEG canvas
  const canvas = cropper.getCroppedCanvas({
    width: 400,
    height: 400,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
  });

  const base64Image = canvas.toDataURL('image/jpeg', 0.9);

  // 1. Update live hero avatar image instantly
  const heroAvatar = document.getElementById('hero-avatar');
  if (heroAvatar) {
    heroAvatar.src = base64Image;
  }

  // 2. Persist image to browser memory for returning visitors
  localStorage.setItem('owner_hero_image', base64Image);

  // 3. Close Modal Cleanly
  closeImageModal();
}

/**
 * Closes modal and destroys cropper instance
 */
function closeImageModal() {
  const modal = document.getElementById('cropper-modal');
  if (modal) {
    modal.style.display = 'none';
  }

  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
}
