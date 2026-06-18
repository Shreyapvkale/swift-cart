const nodemailer = require('nodemailer');

let transporter = null;
const isMock = !process.env.EMAIL_USER || process.env.EMAIL_USER === 'mock_user';

if (!isMock) {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      port: parseInt(process.env.EMAIL_PORT || '2525'),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    console.log('Nodemailer SMTP transport setup successfully.');
  } catch (err) {
    console.error('Nodemailer setup failed. Reverting to console simulator:', err.message);
  }
} else {
  console.log('Nodemailer configured in Sandbox Simulation Mode.');
}

async function sendOrderConfirmation(email, order) {
  const mailOptions = {
    from: '"SwiftCart Delivery" <orders@swiftcart.com>',
    to: email,
    subject: `Order Confirmed! - #${order.id.substring(0, 8)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #0A9E5C; border-bottom: 2px solid #0A9E5C; padding-bottom: 10px;">Order Placed Successfully!</h2>
        <p>Dear Customer,</p>
        <p>Thank you for shopping on <strong>SwiftCart</strong>. Your order is confirmed and will be processed shortly.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f9fafb;">
            <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">Order ID</th>
            <td style="padding: 10px; border: 1px solid #e5e7eb;">${order.id}</td>
          </tr>
          <tr>
            <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">Payment Total</th>
            <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; color: #0A9E5C;">${order.currency} ${order.total.toFixed(2)}</td>
          </tr>
          <tr style="background-color: #f9fafb;">
            <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">Payment Status</th>
            <td style="padding: 10px; border: 1px solid #e5e7eb; color: #0A9E5C; font-weight: bold;">${order.paymentStatus}</td>
          </tr>
        </table>
        
        <p>You can track your package directly inside the active dashboard.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="font-size: 12px; color: #6b7280; text-align: center;">SwiftCart Global Quick-Commerce Superapp</p>
      </div>
    `
  };

  if (isMock || !transporter) {
    console.log(`[SIMULATION EMAIL] Order confirmation sent to: ${email}`);
    console.log(`[SIMULATION EMAIL] Content:\n`, mailOptions.html.replace(/<[^>]*>/g, ' ').substring(0, 400) + '...');
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email successfully dispatched to ${email}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`Email dispatch failure to ${email}:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendOrderConfirmation
};
