import nodemailer from "nodemailer";


// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.COMPANY_EMAIL,                 // CHANGED
      pass: process.env.COMPANY_EMAIL_APP_PASSWORD,    // CHANGED
    },
  });
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
  try {
    // Check if email credentials are configured
    if (!process.env.COMPANY_EMAIL || !process.env.COMPANY_EMAIL_APP_PASSWORD) { 
      return { success: false, message: "Email service not configured" };
    } 

    const transporter = createTransporter();

    const mailOptions = {
      from: `"Shop4Ever" <${process.env.COMPANY_EMAIL}>`,   // CHANGED
      to: email,
      subject: "Password Reset OTP - Shop4Ever",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF8C00 0%, #8A2BE2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Shop4Ever</h1>
          </div>
          <div style="padding: 30px; background: #f5f5f5;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p style="color: #666; font-size: 16px;">
              You have requested to reset your password. Use the following OTP to verify your identity:
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="color: #FF8C00; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h1>
            </div>
            <p style="color: #666; font-size: 14px;">
              This OTP will expire in 10 minutes. If you didn't request this, please ignore this email.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              This is an automated message, please do not reply.
            </p>
          </div>
        </div>
      `,
      text: `
        Password Reset Request - Shop4Ever
        
        OTP: ${otp}
        
        Valid for 10 minutes.
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error("❌ Error sending email:", error);
    return { success: false, message: error.message };
  }
};

// Send Order Confirmation Email
export const sendOrderConfirmationEmail = async (email, orderData) => {
  try {
    // Check if email credentials are configured
    if (!process.env.COMPANY_EMAIL || !process.env.COMPANY_EMAIL_APP_PASSWORD) {
      console.warn("⚠️ Email credentials not configured. Order confirmation email not sent.");
      return { success: false, message: "Email service not configured" };
    }

    const transporter = createTransporter();

    // Format delivery address
    const deliveryAddress = `
      ${orderData.delivery.receiver_name}<br>
      ${orderData.delivery.house_no}, ${orderData.delivery.street}<br>
      ${orderData.delivery.building ? orderData.delivery.building + '<br>' : ''}
      ${orderData.delivery.city}, ${orderData.delivery.state} ${orderData.delivery.pincode}<br>
      Phone: ${orderData.delivery.phone}
      ${orderData.delivery.delivery_instructions ? '<br><br><strong>Delivery Instructions:</strong> ' + orderData.delivery.delivery_instructions : ''}
    `;

    // Format order items
    const itemsHtml = orderData.items.map(item => `
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 12px;">
          <img src="${item.image || '/placeholder.png'}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
        </td>
        <td style="padding: 12px; font-weight: 500;">${item.name}</td>
        <td style="padding: 12px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right;">₹${Number(item.price).toFixed(2)}</td>
        <td style="padding: 12px; text-align: right; font-weight: 600;">₹${(Number(item.price) * Number(item.quantity)).toFixed(2)}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: `"Shop4Ever" <${process.env.COMPANY_EMAIL}>`,
      to: email,
      subject: `Order Confirmation - Order #${orderData.order_id}`,
      html: `
        <div style="font-family: Arial, sans-serif; margin: 0 auto; background: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #FF8C00 0%, #8A2BE2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Shop4Ever</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Order Confirmation</p>
          </div>

          <!-- Order Details -->
          <div style="padding: 30px; background: #f5f5f5;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0;">Thank you for your order!</h2>
              <p style="color: #666; margin-bottom: 20px;">
                Your order has been placed successfully. We'll send you another email when your order ships.
              </p>
              
              <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 5px 0;"><strong>Order ID:</strong> #${orderData.order_id}</p>
                <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(orderData.order_date || Date.now()).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #FF8C00; font-weight: 600;">${orderData.status}</span></p>
              </div>
            </div>

            <!-- Order Items -->
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #FF8C00; padding-bottom: 10px;">Order Items</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <thead>
                  <tr style="background: #f9f9f9; border-bottom: 2px solid #e0e0e0;">
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #666;">Image</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #666;">Product</th>
                    <th style="padding: 12px; text-align: center; font-weight: 600; color: #666;">Quantity</th>
                    <th style="padding: 12px; text-align: right; font-weight: 600; color: #666;">Price</th>
                    <th style="padding: 12px; text-align: right; font-weight: 600; color: #666;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <!-- Delivery Address -->
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #FF8C00; padding-bottom: 10px;">Delivery Address</h3>
              <div style="color: #666; line-height: 1.8; margin-top: 15px;">
                ${deliveryAddress}
              </div>
            </div>

            <!-- Total Amount -->
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-top: 2px solid #e0e0e0;">
                <span style="font-size: 18px; font-weight: 600; color: #333;">Total Amount:</span>
                <span style="font-size: 24px; font-weight: 700; color: #FF8C00;">₹${Number(orderData.total_amount).toFixed(2)}</span>
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="color: #999; font-size: 12px; margin: 5px 0;">
                If you have any questions, please contact our support team.
              </p>
              <p style="color: #999; font-size: 12px; margin: 5px 0;">
                This is an automated message, please do not reply.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
        Order Confirmation - Shop4Ever
        
        Thank you for your order!
        
        Order ID: #${orderData.order_id}
        Order Date: ${new Date(orderData.order_date || Date.now()).toLocaleString('en-IN')}
        Status: ${orderData.status}
        
        Order Items:
        ${orderData.items.map(item => `- ${item.name} x${item.quantity} = ₹${(Number(item.price) * Number(item.quantity)).toFixed(2)}`).join('\n')}
        
        Delivery Address:
        ${orderData.delivery.receiver_name}
        ${orderData.delivery.house_no}, ${orderData.delivery.street}
        ${orderData.delivery.building ? orderData.delivery.building + '\n' : ''}
        ${orderData.delivery.city}, ${orderData.delivery.state} ${orderData.delivery.pincode}
        Phone: ${orderData.delivery.phone}
        
        Total Amount: ₹${Number(orderData.total_amount).toFixed(2)}
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Order confirmation email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending order confirmation email:", error);
    return { success: false, message: error.message };
  }
};
export const sendOutForDeliveryEmail = async (email, orderData) => {
  try {
    if (!process.env.COMPANY_EMAIL || !process.env.COMPANY_EMAIL_APP_PASSWORD) {
      console.warn("⚠️ Email credentials not configured. Email not sent.");
      return { success: false };
    }

    const transporter = createTransporter();

    const deliveryAddress = `
      ${orderData.delivery.receiver_name}<br>
      ${orderData.delivery.house_no}, ${orderData.delivery.street}<br>
      ${orderData.delivery.building ? orderData.delivery.building + '<br>' : ''}
      ${orderData.delivery.city}, ${orderData.delivery.state} ${orderData.delivery.pincode}<br>
      Phone: ${orderData.delivery.phone}
      ${orderData.delivery.delivery_instructions ? '<br><br><strong>Delivery Instructions:</strong> ' + orderData.delivery.delivery_instructions : ''}
    `;

    const itemsHtml = orderData.items.map(item => `
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 12px;">
          <img src="${item.image || '/placeholder.png'}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
        </td>
        <td style="padding: 12px; font-weight: 500;">${item.name}</td>
        <td style="padding: 12px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right;">₹${Number(item.price).toFixed(2)}</td>
        <td style="padding: 12px; text-align: right; font-weight: 600;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: `"Shop4Ever" <${process.env.COMPANY_EMAIL}>`,
      to: email,
      subject: `Out for Delivery - Order #${orderData.order_id}`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #ffffff;">
          
          <div style="background: linear-gradient(135deg, #FF8C00 0%, #8A2BE2 100%);
            padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Shop4Ever</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">Your Order Is Out For Delivery</p>
          </div>

          <div style="padding: 30px; background: #f5f5f5;">

            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin-top: 0; color: #333;">Good news! 🎉</h2>
              <p style="color: #666;">
                Your package is on the way and will be delivered shortly. Please keep your phone available.
              </p>

              <div style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
                <p><strong>Order ID:</strong> #${orderData.order_id}</p>
                <p><strong>Status:</strong> <span style="color: #FF8C00; font-weight: 600;">Out for Delivery</span></p>
              </div>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="border-bottom: 2px solid #FF8C00; padding-bottom: 10px;">Order Items</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h3 style="border-bottom: 2px solid #FF8C00; padding-bottom: 10px;">Delivery Address</h3>
              <p style="line-height: 1.8; color: #666;">${deliveryAddress}</p>
            </div>

            <div style="margin-top: 20px; text-align: center; border-top: 1px solid #ddd; padding-top: 20px;">
              <p style="color: #999; font-size: 12px;">This is an automated update. Please do not reply.</p>
            </div>

          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return { success: true };

  } catch (error) {
    console.error("❌ Out for delivery email error:", error);
    return { success: false, message: error.message };
  }
};
export const sendOrderDeliveredEmail = async (email, orderData) => {
  try {
    if (!process.env.COMPANY_EMAIL) return { success: false };

    const transporter = createTransporter();

    const deliveryAddress = `
      ${orderData.delivery.receiver_name}<br>
      ${orderData.delivery.house_no}, ${orderData.delivery.street}<br>
      ${orderData.delivery.building ? orderData.delivery.building + '<br>' : ''}
      ${orderData.delivery.city}, ${orderData.delivery.state} ${orderData.delivery.pincode}<br>
      Phone: ${orderData.delivery.phone}
    `;

    const itemsHtml = orderData.items.map(item => `
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 12px;">
          <img src="${item.image}" style="width:60px;height:60px;border-radius:8px;">
        </td>
        <td style="padding: 12px;">${item.name}</td>
        <td style="padding: 12px; text-align:center;">${item.quantity}</td>
        <td style="padding: 12px; text-align:right;">₹${item.price}</td>
        <td style="padding: 12px; text-align:right;">₹${item.price * item.quantity}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: `"Shop4Ever" <${process.env.COMPANY_EMAIL}>`,
      to: email,
      subject: `Order Delivered - Order #${orderData.order_id}`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #ffffff;">

          <div style="background: linear-gradient(135deg, #FF8C00 0%, #8A2BE2 100%);
            padding: 30px; text-align: center;">
            <h1 style="color: white; font-size: 28px;">Shop4Ever</h1>
            <p style="color: rgba(255,255,255,0.9);">Order Delivered</p>
          </div>

          <div style="padding: 30px; background: #f5f5f5;">
            <div style="background:white;padding:20px;border-radius:8px;margin-bottom:20px;">
              <h2 style="margin-top: 0; color: #333;">Thank you for shopping with us! ❤️</h2>
              <p style="color:#666;">Your order has been successfully delivered. We hope you enjoy your purchase!</p>

              <div style="background:#f9f9f9;padding:15px;border-radius:8px;">
                <p><strong>Order ID:</strong> #${orderData.order_id}</p>
                <p><strong>Status:</strong> <span style="color:green;font-weight:600;">Delivered</span></p>
              </div>
            </div>

            <div style="background:white;padding:20px;border-radius:8px;margin-bottom:20px;">
              <h3 style="border-bottom:2px solid #FF8C00;padding-bottom:10px;">Items</h3>
              <table style="width:100%;border-collapse:collapse;margin-top:15px;">
                ${itemsHtml}
              </table>
            </div>

            <div style="background:white;padding:20px;border-radius:8px;">
              <h3 style="border-bottom:2px solid #FF8C00;padding-bottom:10px;">Delivery Address</h3>
              <p style="line-height:1.8;color:#666;">${deliveryAddress}</p>
            </div>

            <div style="margin-top:20px;text-align:center;padding-top:20px;border-top:1px solid #ccc;">
              <p style="font-size:12px;color:#999;">Thank you for choosing Shop4Ever 💛</p>
            </div>

          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };

  } catch (error) {
    return { success: false, message: error.message };
  }
};
export const sendOrderCancellationEmail = async (email, orderData) => {
  try {
    if (!process.env.COMPANY_EMAIL) return { success: false };

    const transporter = createTransporter();

    const mailOptions = {
      from: `"Shop4Ever" <${process.env.COMPANY_EMAIL}>`,
      to: email,
      subject: `Order Cancelled - Order #${orderData.order_id}`,
      html: `
        <div style="font-family: Arial, sans-serif; background:#ffffff;">

          <div style="background: linear-gradient(135deg, #FF8C00 0%, #8A2BE2 100%);
            padding:30px;text-align:center;">
            <h1 style="color:white;font-size:28px;">Shop4Ever</h1>
            <p style="color:rgba(255,255,255,0.9);">Order Cancelled</p>
          </div>

          <div style="padding:30px;background:#f5f5f5;">
            <div style="background:white;padding:20px;border-radius:8px;margin-bottom:20px;">
              <h2 style="margin-top:0;color:#333;">Your order has been cancelled</h2>
              <p style="color:#666;">We're sorry to see you cancel your order. If this was a mistake, feel free to reorder anytime.</p>

              <div style="background:#f9f9f9;padding:15px;border-radius:8px;">
                <p><strong>Order ID:</strong> #${orderData.order_id}</p>
                <p><strong>Status:</strong> <span style="color:red;font-weight:600;">Cancelled</span></p>
              </div>
            </div>

            <div style="margin-top:20px;text-align:center;padding-top:20px;border-top:1px solid #ccc;">
              <p style="font-size:12px;color:#999;">If you need help, our support team is here for you.</p>
            </div>

          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };

  } catch (error) {
    return { success: false, message: error.message };
  }
};


// Test email configuration
export const testEmailConfig = async () => {
  try {
    if (!process.env.COMPANY_EMAIL || !process.env.COMPANY_EMAIL_APP_PASSWORD) {
      return { success: false, message: "Email credentials not configured" };
    }

    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ Email server is ready to send messages");

    return { success: true };
  } catch (error) {
    console.error("❌ Email configuration error:", error);
    return { success: false, message: error.message };
  }
};

