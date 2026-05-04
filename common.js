// common.js (ECOHOME) - bản cải tiến (Hỗ trợ gọi hàm Global & Login Google)
(function(window, document) {
  'use strict';
  const ECOHOME = window.ECOHOME = window.ECOHOME || {};
  ECOHOME._log = (...args) => { if (console) console.log('[ECOHOME]', ...args); };

  const firebaseConfig = {
    apiKey: "AIzaSyCxS6oT6h9XTc-rB3X1gSnlfvNfshy7Mxs",
    authDomain: "rao-vat-ecohome-3d11d.firebaseapp.com",
    projectId: "rao-vat-ecohome-3d11d",
    storageBucket: "rao-vat-ecohome-3d11d.appspot.com",
    messagingSenderId: "610650533071",
    appId: "1:610650533071:web:522508a572b17da9ad9bba"
  };

  // Safe init firebase (namespaced v8 style)
  ECOHOME._firebaseLoaded = false;
  try {
    if (typeof firebase === 'undefined') {
      ECOHOME._log('Firebase SDK chưa load. Hãy include SDK trước common.js.');
    } else {
      if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      ECOHOME.firebase = firebase;
      ECOHOME.db = firebase.firestore ? firebase.firestore() : null;
      ECOHOME.auth = firebase.auth ? firebase.auth() : null;
      ECOHOME.storage = firebase.storage ? firebase.storage() : null;
      ECOHOME._firebaseLoaded = true;
      ECOHOME._log('Firebase init ok.');
    }
  } catch (e) {
    ECOHOME._log('Lỗi khi init Firebase:', e);
  }

  // --- Logic Đăng nhập Google (Dành cho Admin) ---
  ECOHOME.loginGoogleAdmin = function() {
    if (!ECOHOME._firebaseLoaded || !ECOHOME.auth) {
      alert('Hệ thống xác thực chưa sẵn sàng.');
      return;
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    ECOHOME.auth.signInWithPopup(provider)
      .then((result) => {
        const user = result.user;
        ECOHOME._log('Đăng nhập thành công:', user.email);
        if (user.email === 'phamvanconcn@gmail.com') {
          alert('Chào mừng Admin!');
          if (typeof ECOHOME.switchTab === 'function') ECOHOME.switchTab('admin');
        } else {
          alert('Tài khoản này không phải Admin. Vui lòng liên hệ hỗ trợ.');
        }
      })
      .catch((error) => {
        console.error('Lỗi login Google:', error);
        alert('Lỗi đăng nhập: ' + error.message);
      });
  };

  ECOHOME.filterCat = function(category) {
    ECOHOME._log('filterCat', category);
    if (typeof ECOHOME.loadPosts === 'function') {
      try { ECOHOME.loadPosts('raovat', category); } catch (err) { console.warn(err); }
    } else {
      setTimeout(() => { if (typeof ECOHOME.loadPosts === 'function') ECOHOME.loadPosts('raovat', category); }, 500);
    }
  };

  ECOHOME.switchTab = function(tabId) {
    ECOHOME._log('switchTab', tabId);
    const sections = ['feed-section', 'raovat-section', 'news-section', 'admin-section', 'post-section'];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
    const target = document.getElementById(tabId + '-section') || document.getElementById(tabId);
    if (target) target.classList.remove('hidden');
  };

  ECOHOME.goStep = function(step) {
    ECOHOME._log('goStep', step);
    document.querySelectorAll('.form-step').forEach(el => el.classList.toggle('active', el.dataset.step == step));
    // Simple DOM fallback if .form-step not used
    document.querySelectorAll('[id^="step"]').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById('step' + step);
    if (target) target.classList.remove('hidden');
  };

  ECOHOME.selectType = function(type) {
    ECOHOME._log('selectType', type);
    document.querySelectorAll('.post-type-btn, .type-btn').forEach(btn => {
      btn.classList.remove('selected', 'active');
      if (btn.dataset.type === String(type) || btn.innerText.trim() === type) {
          btn.classList.add('selected', 'active');
      }
    });
  };

  window.ECOHOME = ECOHOME;

  // On auth change
  if (ECOHOME._firebaseLoaded && ECOHOME.auth) {
    ECOHOME.auth.onAuthStateChanged(user => {
      if (user) {
        ECOHOME._log('User hiện tại:', user.email);
        if (user.email === 'phamvanconcn@gmail.com') {
          document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
        }
      } else {
        document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    ECOHOME._log('DOM ready.');
  });

  // ======= MAPPING GLOBAL (Dành cho inline onclick trong HTML) =======

  window.loginGoogleAdmin = window.loginGoogleAdmin || function() {
    return ECOHOME.loginGoogleAdmin();
  };

  window.verifyAdminPassword = window.verifyAdminPassword || function() {
    const passwordInput = document.getElementById('admin-password-input');
    const provided = passwordInput ? passwordInput.value : '';
    const expected = (typeof ADMIN_PASSWORD !== 'undefined') ? ADMIN_PASSWORD : '';

    if (provided === expected && expected !== '') {
      alert('Xác thực pass thành công!');
      if (typeof closeModal === 'function') closeModal('admin-login-overlay');
      if (typeof switchTab === 'function') switchTab('admin');
    } else {
      alert('Mật khẩu sai hoặc chưa cấu hình.');
    }
  };

  window.goStep = window.goStep || function(n) { return ECOHOME.goStep(n); };

  window.selectType = window.selectType || function(el, type) { 
    if (typeof el === 'string' && !type) { type = el; el = null; }
    if (el) {
        document.querySelectorAll('.type-btn, .cat-chip').forEach(b => b.classList.remove('selected'));
        el.classList.add('selected');
    }
    return ECOHOME.selectType(type); 
  };

  window.filterCat = window.filterCat || function(evt, cat) {
    if (typeof evt === 'string' && !cat) { cat = evt; evt = null; }
    return ECOHOME.filterCat(cat);
  };

  window.switchTab = window.switchTab || function(id) { return ECOHOME.switchTab(id); };

})(window, document);
