const { db } = require('../db');

/**
 * Compute days remaining relative to today (ignoring time components).
 * Returns integer:
 *  > 2: valid, not in immediate reminder window
 *  = 2: 2 days remaining (triggers Reminder 1)
 *  = 1: 1 day remaining (expires tomorrow, triggers Reminder 2)
 *  = 0: expires today
 *  < 0: expired
 */
function getDaysRemaining(targetDateStr) {
  if (!targetDateStr) return null;
  const now = new Date();
  // Normalize both dates to YYYY-MM-DD UTC or local date strings
  const todayYear = now.getFullYear();
  const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
  const todayDay = String(now.getDate()).padStart(2, '0');
  const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;

  const targetDate = new Date(`${targetDateStr}T00:00:00`);
  const todayDate = new Date(`${todayStr}T00:00:00`);

  const diffMs = targetDate.getTime() - todayDate.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Get status badge details based on days remaining
 */
function getDocumentStatus(targetDateStr) {
  const days = getDaysRemaining(targetDateStr);
  if (days === null) {
    return { status: 'UNKNOWN', label: 'No Date', badgeClass: 'badge-gray', color: '#6b7280', days: null };
  }

  if (days < 0) {
    return {
      status: 'EXPIRED',
      label: 'Expired',
      badgeClass: 'badge-expired',
      color: '#ef4444',
      icon: '🔴',
      days,
      description: `Expired ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`
    };
  } else if (days === 0) {
    return {
      status: 'EXPIRES_TODAY',
      label: 'Expires Today',
      badgeClass: 'badge-urgent',
      color: '#f97316',
      icon: '🚨',
      days,
      description: 'Expires today'
    };
  } else if (days === 1) {
    return {
      status: 'EXPIRES_TOMORROW',
      label: 'Expires Tomorrow',
      badgeClass: 'badge-urgent',
      color: '#f97316',
      icon: '🚨',
      days,
      description: '1 day remaining'
    };
  } else if (days === 2) {
    return {
      status: 'EXPIRES_2_DAYS',
      label: 'Expires in 2 Days',
      badgeClass: 'badge-warning',
      color: '#eab308',
      icon: '⚠️',
      days,
      description: '2 days remaining'
    };
  } else {
    return {
      status: 'VALID',
      label: 'Valid',
      badgeClass: 'badge-valid',
      color: '#22c55e',
      icon: '🟢',
      days,
      description: `${days} days remaining`
    };
  }
}

/**
 * Check all documents and driver licenses in database and generate
 * strictly only 2-day, 1-day, and expired notifications without duplicates.
 */
function runReminderChecks(userId = null) {
  const userFilter = userId ? `WHERE v.user_id = ?` : '';
  const params = userId ? [userId] : [];

  // 1. Process vehicle documents
  const docs = db.prepare(`
    SELECT d.id as doc_id, d.document_type, d.document_number, d.expiry_date,
           v.id as vehicle_id, v.vehicle_number, v.user_id
    FROM documents d
    JOIN vehicles v ON d.vehicle_id = v.id
    ${userFilter}
  `).all(...params);

  const nowStr = new Date().toISOString().split('T')[0];

  for (const doc of docs) {
    const days = getDaysRemaining(doc.expiry_date);
    if (days === null) continue;

    // Reminder 1: Exactly 2 days before expiry
    if (days === 2) {
      const existing = db.prepare(`
        SELECT id FROM notifications 
        WHERE user_id = ? AND vehicle_id = ? AND document_id = ? AND notification_type = 'two_days'
      `).get(doc.user_id, doc.vehicle_id, doc.doc_id);

      if (!existing) {
        db.prepare(`
          INSERT INTO notifications (user_id, vehicle_id, document_id, notification_type, title, message, scheduled_date)
          VALUES (?, ?, ?, 'two_days', ?, ?, ?)
        `).run(
          doc.user_id,
          doc.vehicle_id,
          doc.doc_id,
          `🔔 Reminder: ${doc.document_type} expires in 2 days`,
          `🔔 Reminder: ${doc.document_type} for ${doc.vehicle_number} expires in 2 days (on ${doc.expiry_date}).`,
          nowStr
        );
      }
    }

    // Reminder 2: Exactly 1 day before expiry
    if (days === 1) {
      const existing = db.prepare(`
        SELECT id FROM notifications 
        WHERE user_id = ? AND vehicle_id = ? AND document_id = ? AND notification_type = 'one_day'
      `).get(doc.user_id, doc.vehicle_id, doc.doc_id);

      if (!existing) {
        db.prepare(`
          INSERT INTO notifications (user_id, vehicle_id, document_id, notification_type, title, message, scheduled_date)
          VALUES (?, ?, ?, 'one_day', ?, ?, ?)
        `).run(
          doc.user_id,
          doc.vehicle_id,
          doc.doc_id,
          `🚨 Urgent: ${doc.document_type} expires tomorrow`,
          `🚨 Urgent Reminder: ${doc.document_type} for ${doc.vehicle_number} expires tomorrow (on ${doc.expiry_date}).`,
          nowStr
        );
      }
    }

    // Expired notification
    if (days < 0) {
      const existing = db.prepare(`
        SELECT id FROM notifications 
        WHERE user_id = ? AND vehicle_id = ? AND document_id = ? AND notification_type = 'expired'
      `).get(doc.user_id, doc.vehicle_id, doc.doc_id);

      if (!existing) {
        db.prepare(`
          INSERT INTO notifications (user_id, vehicle_id, document_id, notification_type, title, message, scheduled_date)
          VALUES (?, ?, ?, 'expired', ?, ?, ?)
        `).run(
          doc.user_id,
          doc.vehicle_id,
          doc.doc_id,
          `🔴 Expired: ${doc.document_type}`,
          `🔴 ${doc.document_type} for ${doc.vehicle_number} expired on ${doc.expiry_date}. Please renew immediately.`,
          nowStr
        );
      }
    }
  }

  // 2. Process Driver Driving Licences
  const driverFilter = userId ? `WHERE dr.user_id = ?` : '';
  const drivers = db.prepare(`
    SELECT dr.id as driver_id, dr.name, dr.phone, dr.licence_number, dr.licence_expiry, dr.user_id,
           v.vehicle_number, v.id as vehicle_id
    FROM drivers dr
    LEFT JOIN vehicles v ON dr.assigned_vehicle_id = v.id
    ${driverFilter}
  `).all(...params);

  for (const driver of drivers) {
    if (!driver.licence_expiry) continue;
    const days = getDaysRemaining(driver.licence_expiry);
    const truckLabel = driver.vehicle_number ? ` (Assigned to ${driver.vehicle_number})` : '';

    if (days === 2) {
      const existing = db.prepare(`
        SELECT id FROM notifications 
        WHERE user_id = ? AND driver_id = ? AND notification_type = 'two_days'
      `).get(driver.user_id, driver.driver_id);

      if (!existing) {
        db.prepare(`
          INSERT INTO notifications (user_id, vehicle_id, driver_id, notification_type, title, message, scheduled_date)
          VALUES (?, ?, ?, 'two_days', ?, ?, ?)
        `).run(
          driver.user_id,
          driver.vehicle_id || null,
          driver.driver_id,
          `🔔 Reminder: Driver Licence expires in 2 days`,
          `🔔 Reminder: Driving licence for ${driver.name}${truckLabel} expires in 2 days (on ${driver.licence_expiry}).`,
          nowStr
        );
      }
    }

    if (days === 1) {
      const existing = db.prepare(`
        SELECT id FROM notifications 
        WHERE user_id = ? AND driver_id = ? AND notification_type = 'one_day'
      `).get(driver.user_id, driver.driver_id);

      if (!existing) {
        db.prepare(`
          INSERT INTO notifications (user_id, vehicle_id, driver_id, notification_type, title, message, scheduled_date)
          VALUES (?, ?, ?, 'one_day', ?, ?, ?)
        `).run(
          driver.user_id,
          driver.vehicle_id || null,
          driver.driver_id,
          `🚨 Urgent: Driver Licence expires tomorrow`,
          `🚨 Urgent Reminder: Driving licence for ${driver.name}${truckLabel} expires tomorrow (on ${driver.licence_expiry}).`,
          nowStr
        );
      }
    }

    if (days < 0) {
      const existing = db.prepare(`
        SELECT id FROM notifications 
        WHERE user_id = ? AND driver_id = ? AND notification_type = 'expired'
      `).get(driver.user_id, driver.driver_id);

      if (!existing) {
        db.prepare(`
          INSERT INTO notifications (user_id, vehicle_id, driver_id, notification_type, title, message, scheduled_date)
          VALUES (?, ?, ?, 'expired', ?, ?, ?)
        `).run(
          driver.user_id,
          driver.vehicle_id || null,
          driver.driver_id,
          `🔴 Expired: Driver Licence`,
          `🔴 Driving licence for ${driver.name}${truckLabel} expired on ${driver.licence_expiry}.`,
          nowStr
        );
      }
    }
  }
}

module.exports = {
  getDaysRemaining,
  getDocumentStatus,
  runReminderChecks
};
