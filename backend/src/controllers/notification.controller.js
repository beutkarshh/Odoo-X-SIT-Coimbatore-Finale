const notificationService = require('../services/notification.service');

/**
 * GET /api/notifications
 */
async function list(req, res, next) {
	try {
		const userId = req.user.id;
		const data = await notificationService.listNotifications(userId, req.query);
		return res.status(200).json({ success: true, data });
	} catch (error) {
		next(error);
	}
}

/**
 * GET /api/notifications/unread-count
 */
async function unreadCount(req, res, next) {
	try {
		const userId = req.user.id;
		const count = await notificationService.getUnreadCount(userId);
		return res.status(200).json({ success: true, data: { count } });
	} catch (error) {
		next(error);
	}
}

/**
 * POST /api/notifications/:id/read
 */
async function markRead(req, res, next) {
	try {
		const userId = req.user.id;
		const updated = await notificationService.markRead(userId, req.params.id);
		return res.status(200).json({ success: true, data: updated });
	} catch (error) {
		next(error);
	}
}

/**
 * POST /api/notifications/read-all
 */
async function markAllRead(req, res, next) {
	try {
		const userId = req.user.id;
		await notificationService.markAllRead(userId);
		return res.status(200).json({ success: true, data: { ok: true } });
	} catch (error) {
		next(error);
	}
}

module.exports = {
	list,
	unreadCount,
	markRead,
	markAllRead,
};
