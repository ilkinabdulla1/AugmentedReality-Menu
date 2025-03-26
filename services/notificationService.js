const Notification = require('../model/notification'); // Adjust the path as needed

/**
 * Adds a notification to the database.
 * @param {Object} params - The notification parameters.
 * @param {string} params.message - The notification message.
 * @param {string} params.type - The notification type (e.g., info, success, warning, error).
 * @param {ObjectId} [params.relatedEntity] - The ID of the related entity (optional).
 * @param {string} [params.entityType] - The type of the related entity (e.g., Restaurant, Menu, etc.) (optional).
 * @param {string} [params.priority] - The priority of the notification (e.g., low, medium, high).
 */
async function addNotification({ message, type = 'info', relatedEntity = null, entityType = null, priority = 'low' }) {
  try {
    const notification = new Notification({
      message,
      type,
      relatedEntity,
      entityType,
      priority,
    });
    await notification.save();
    console.log(`Notification added: ${message}`);
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

module.exports = {
  addNotification,
};
