/* Arsheen Beauty Care security hardening
 * - Removes the legacy client-side passcode path from the storefront UI.
 * - Routes admin access through the dedicated Firebase-authenticated portal.
 * - Requires the authorized Firebase account before honoring ?admin=1.
 * - Sanitizes untrusted order fields before inserting them into admin HTML.
 * - Hides the legacy Dashboard Passcode setting so it cannot be mistaken for auth.
 */
(function(){
  'use strict';

  const ADMIN_EMAIL = 'arsheenbeautycare@gmail.com';
  const ADMIN_PATH = '/arsheenbeautycare/admin/';

  function goToAdminPortal(){
    window.location.assign(new URL(ADMIN_PATH, window.location.origin).href);
  }

  // The storefront must never authenticate admins with a client-side passcode.
  window.openAdminLogin = goToAdminPortal;
  window.tryAdminLogin = goToAdminPortal;
  window.savePasscode = function(){
    if(typeof window.showToast === 'function'){
      window.showToast('Use the Admin portal to change or reset your password.');
    }
  };

  function hideLegacyPasscodeSetting(){
    const input = document.getElementById('setPasscode');
    if(!input) return;

    let node = input;
    for(let i=0; i<7 && node; i++, node=node.parentElement){
      const text = (node.textContent || '').trim().toLowerCase();
      if(text.includes('dashboard passcode') || text.includes('change owner passcode')){
        node.style.display = 'none';
        return;
      }
    }
    input.style.display = 'none';
  }

  function escapeHtml(value){
    return String(value == null ? '' : value)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/\"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }

  // Orders are created by unauthenticated customers, so every order field is untrusted.
  // Escape all dynamic values before placing them into innerHTML.
  window.renderAdminOrderLog = function(log, isLive){
    log = Array.isArray(log) ? log : [];
    const wrap = document.getElementById('adminOrderLog');
    if(!wrap) return;

    if(log.length === 0){
      wrap.innerHTML = `<p class="empty-note">No orders yet${isLive === false ? ' on this device' : ''}.</p>`;
      return;
    }

    const statusOptions = (Array.isArray(window.STATUS_STEPS) ? [...window.STATUS_STEPS, 'Cancelled'] : ['Order Received','Confirmed','Packed','Shipped','Delivered','Cancelled']);

    wrap.innerHTML = log.map(function(o){
      o = o || {};
      const id = escapeHtml(o.id);
      const name = escapeHtml(o.name);
      const phone = escapeHtml(o.phone);
      const address = escapeHtml(o.address);
      const note = escapeHtml(o.note);
      const deliveryType = escapeHtml(o.deliveryType);
      const payMethod = escapeHtml(o.payMethod || 'Cash on Delivery');
      const summary = escapeHtml(o.summary).replace(/\n/g,'<br>');
      const date = escapeHtml(o.date);
      const status = String(o.status || 'Order Received');
      const isCancelled = status === 'Cancelled';
      const phoneDigits = String(o.phone || '').replace(/\D/g,'').slice(-10);
      const customerName = String(o.name || 'there');
      const message = `Hi ${customerName}, this is Arsheen Beauty Care. Your order (ID: ${String(o.id || '')}) has been cancelled. If you have any questions or this was a mistake, please reply here and we'll help right away.`;
      const waHref = `https://wa.me/91${phoneDigits}?text=${encodeURIComponent(message)}`;
      const subtotal = o.subtotal !== undefined ? `<br>Subtotal: ₹${escapeHtml(o.subtotal)} · Shipping: ${Number(o.shipping) === 0 ? 'FREE' : '₹'+escapeHtml(o.shipping)} · Platform Fee: ₹${escapeHtml(o.platformFee)}${Number(o.codFee) > 0 ? ' · COD Fee: ₹'+escapeHtml(o.codFee) : ''}` : '';
      const options = statusOptions.map(function(s){
        const selected = status === s ? ' selected' : '';
        return `<option value="${escapeHtml(s)}"${selected}>${escapeHtml(s)}</option>`;
      }).join('');

      return `<div class="order-log" style="${isCancelled ? 'border:1.5px solid #A23B3B;background:#FBEAEA;' : ''}">
        ${isCancelled ? `<div style="color:#A23B3B;font-weight:700;margin-bottom:6px;">❌ ORDER CANCELLED${o.cancelledBy === 'customer' ? ' by customer' : ''}</div>` : ''}
        ${isCancelled ? `<a class="secondary-btn" style="display:inline-block;text-decoration:none;border-color:#25D366;color:#128C4A;margin-bottom:8px;" target="_blank" rel="noopener noreferrer" href="${waHref}">Notify Customer via WhatsApp</a>` : ''}
        ${id ? `<strong>Order ID: ${id}</strong><br>` : ''}
        <strong>${name}</strong> — ${phone}<br>
        ${address}<br>
        ${note ? `Note: ${note}<br>` : ''}
        ${deliveryType ? `Delivery: ${deliveryType}<br>` : ''}
        Payment: ${payMethod}<br>
        ${summary}<br>
        ${subtotal}
        <br><strong>Total: ₹${escapeHtml(o.total)}</strong><br>
        <span style="color:var(--ink-soft);">${date}</span>
        ${id ? `<br><label style="font-size:11.5px;color:var(--ink-soft);">Status:
          <select class="order-status-select" data-order-id="${id}" data-phone="${escapeHtml(o.phone)}" data-name="${escapeHtml(o.name)}">
            ${options}
          </select></label>` : ''}
      </div>`;
    }).join('');

    wrap.querySelectorAll('.order-status-select').forEach(function(select){
      select.addEventListener('change', function(){
        if(typeof window.updateOrderStatus === 'function'){
          window.updateOrderStatus(
            select.dataset.orderId,
            select.value,
            select.dataset.phone,
            select.dataset.name
          );
        }
      });
    });
  };

  function guardAdminQuery(){
    const params = new URLSearchParams(window.location.search);
    if(params.get('admin') !== '1') return;

    // Never grant dashboard access merely because the URL contains ?admin=1.
    if(!window.firebase || typeof window.firebase.auth !== 'function'){
      window.location.replace(new URL(ADMIN_PATH, window.location.origin).href);
      return;
    }

    window.firebase.auth().onAuthStateChanged(function(user){
      if(!user || String(user.email || '').toLowerCase() !== ADMIN_EMAIL){
        window.location.replace(new URL(ADMIN_PATH, window.location.origin).href);
        return;
      }
      if(typeof window.openAdminDashboard === 'function'){
        window.openAdminDashboard();
      }
    });
  }

  function init(){
    hideLegacyPasscodeSetting();
    guardAdminQuery();
    setTimeout(hideLegacyPasscodeSetting, 250);
    setTimeout(hideLegacyPasscodeSetting, 1000);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, {once:true});
  }else{
    init();
  }
})();
