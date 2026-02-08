const { prisma } = require('../config/db');

async function listNotifications(userId, query = {}) {
	const unreadOnly = query.unreadOnly === 'true' || query.unreadOnly === true;
	const take = Math.min(50, Math.max(1, Number(query.limit || 10)));
	const skip = Math.max(0, Number(query.offset || 0));

	return prisma.notification.findMany({
		where: {
			userId,
			...(unreadOnly ? { isRead: false } : {}),
		},
		orderBy: { createdAt: 'desc' },
		take,
		skip,
	});
}

async function getUnreadCount(userId) {
	return prisma.notification.count({
		where: { userId, isRead: false },
	});
}

async function markRead(userId, notificationId) {
	const id = Number(notificationId);
	if (!Number.isInteger(id)) {
		const err = new Error('Invalid notification id');
		err.statusCode = 400;
		throw err;
	}

	const notification = await prisma.notification.findFirst({
		where: { id, userId },
	});

	if (!notification) {
		const err = new Error('Notification not found');
		err.statusCode = 404;
		throw err;
	}

	if (notification.isRead) return notification;

	return prisma.notification.update({
		where: { id },
		data: { isRead: true, readAt: new Date() },
	});
}

async function markAllRead(userId) {
	await prisma.notification.updateMany({
		where: { userId, isRead: false },
		data: { isRead: true, readAt: new Date() },
	});
	return { success: true };
}

module.exports = {
	listNotifications,
	getUnreadCount,
	markRead,
	markAllRead,
};
