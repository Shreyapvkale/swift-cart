const { Server } = require('socket.io');

let io = null;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*', // Allow all origins for dev simplicity
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connection registered: ${socket.id}`);

    // Join room for specific order tracking
    socket.on('join_order_track', (orderId) => {
      socket.join(`order:${orderId}`);
      console.log(`Socket ${socket.id} joined tracking room: order:${orderId}`);
    });

    // Handle agent location update
    socket.on('update_agent_location', (data) => {
      const { orderId, lat, lng, status } = data;
      console.log(`Location update for order ${orderId}:`, { lat, lng, status });
      
      // Broadcast to anyone in that order's room
      io.to(`order:${orderId}`).emit('agent_location_updated', {
        orderId,
        lat,
        lng,
        status,
        timestamp: new Date()
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  return io;
}

function notifyOrderUpdate(orderId, status, note = '') {
  if (io) {
    io.to(`order:${orderId}`).emit('order_status_updated', {
      orderId,
      status,
      note,
      timestamp: new Date()
    });
    console.log(`Socket update broadcast for order ${orderId}: ${status}`);
  }
}

module.exports = {
  initSocket,
  getIO,
  notifyOrderUpdate
};
