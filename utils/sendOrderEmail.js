const transporter = require("../config/mailer");

const sendOrderEmail = async (order) => {
  try {
    const itemsHTML = order.items.map(item => `
      <tr>
        <td style="padding:10px; border-bottom:1px solid #f0f0f0;">
          <div style="display:flex; align-items:center; gap:12px;">
            <img src="${item.image}" 
              style="width:60px; height:60px; object-fit:cover; border-radius:8px;" />
            <span style="font-size:14px; color:#111;">${item.name}</span>
          </div>
        </td>
        <td style="padding:10px; border-bottom:1px solid #f0f0f0; 
          text-align:center; font-size:14px; color:#555;">
          ${item.quantity}
        </td>
        <td style="padding:10px; border-bottom:1px solid #f0f0f0; 
          text-align:right; font-size:14px; color:#111;">
          ₹${(item.price * item.quantity).toLocaleString("en-IN")}
        </td>
      </tr>
    `).join("");

    const mailOptions = {
      from:    `"Veloaura Studio" <${process.env.MAIL_USER}>`,
      to:      order.address.email,
      subject: `✅ Order Confirmed — #${order._id.toString().slice(-6).toUpperCase()}`,

      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0; padding:0; background:#f9f8f6; font-family:'Georgia', serif;">

          <div style="max-width:600px; margin:40px auto; background:#fff; 
            border-radius:16px; overflow:hidden; box-shadow:0 2px 20px rgba(0,0,0,0.06);">

            <!-- Header -->
            <div style="background:#000; padding:32px; text-align:center;">
              <h1 style="color:#fff; margin:0; font-size:22px; 
                letter-spacing:4px; font-weight:400;">
                VELOAURA STUDIO
              </h1>
            </div>

            <!-- Green tick + Title -->
           <table cellpadding="0" cellspacing="0" 
  style="margin:0 auto 16px;">
  <tr>
    <td style="width:64px; height:64px; background:#22c55e;
      border-radius:32px; text-align:center; vertical-align:middle;">
      <span style="color:#ffffff; font-size:32px; font-weight:bold;
        line-height:64px; display:block;">
        ✓
      </span>
    </td>
  </tr>
</table>
              <h2 style="margin:0 0 8px; font-size:24px; color:#111; font-weight:600;">
                Order Confirmed!
              </h2>
              <p style="margin:0; color:#888; font-size:14px;">
                Thank you, ${order.address.name.split(" ")[0]}! 
                Your order has been placed successfully.
              </p>
            </div>

            <!-- Order ID + Payment ID -->
            <div style="margin:0 32px; background:#f9f8f6; 
              border-radius:12px; padding:20px;">
              <div style="display:flex; justify-content:space-between; 
                margin-bottom:10px;">
                <span style="font-size:12px; color:#888; 
                  text-transform:uppercase; letter-spacing:1px;">
                  Order ID -
                </span>
                <span style="font-size:12px; color:#111; font-family:monospace;">
                  #${order._id.toString().slice(-6).toUpperCase()}
                </span>
              </div>
              <div style="display:flex; justify-content:space-between;
                margin-bottom:10px;">
                <span style="font-size:12px; color:#888; 
                  text-transform:uppercase; letter-spacing:1px;">
                  Payment ID -
                </span>
                <span style="font-size:12px; color:#111; font-family:monospace;">
                  ${order.paymentId}
                </span>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span style="font-size:12px; color:#888; 
                  text-transform:uppercase; letter-spacing:1px;">
                  Date -
                </span>
                <span style="font-size:12px; color:#111;">
                  ${new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day:   "numeric",
                    month: "long",
                    year:  "numeric",
                  })}
                </span>
              </div>
            </div>

            <!-- Items Table -->
            <div style="padding:24px 32px;">
              <h3 style="font-size:12px; text-transform:uppercase; 
                letter-spacing:2px; color:#888; margin:0 0 16px;">
                Items Ordered
              </h3>
              <table style="width:100%; border-collapse:collapse;">
                <thead>
                  <tr>
                    <th style="text-align:left; font-size:11px; 
                      color:#aaa; padding:0 10px 10px 10px; 
                      font-weight:400; text-transform:uppercase;">
                      Product
                    </th>
                    <th style="text-align:center; font-size:11px; 
                      color:#aaa; padding:0 10px 10px; 
                      font-weight:400; text-transform:uppercase;">
                      Qty
                    </th>
                    <th style="text-align:right; font-size:11px; 
                      color:#aaa; padding:0 10px 10px; 
                      font-weight:400; text-transform:uppercase;">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>
            </div>

            <!-- Total -->
            <div style="margin:0 32px; border-top:2px solid #f0f0f0; 
              padding:16px 0;">
              <div style="display:flex; justify-content:space-between; 
                align-items:center;">
                <span style="font-size:16px; font-weight:600; color:#111;">
                  Total Paid
                </span>
                <span style="font-size:20px; font-weight:700; color:#111;">
                  ₹${order.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <!-- Delivery Address -->
            <div style="margin:24px 32px; background:#f9f8f6; 
              border-radius:12px; padding:20px;">
              <h3 style="font-size:12px; text-transform:uppercase; 
                letter-spacing:2px; color:#888; margin:0 0 12px;">
                Delivery Address
              </h3>
              <p style="margin:0; font-size:14px; color:#111; line-height:1.8;">
                ${order.address.name}<br/>
                ${order.address.street}<br/>
                ${order.address.city}, ${order.address.state} — ${order.address.pincode}<br/>
                📞 ${order.address.phone}
              </p>
            </div>

            <!-- Footer -->
            <div style="background:#000; padding:24px 32px; 
              text-align:center; margin-top:32px;">
              <p style="color:#888; font-size:12px; margin:0 0 8px;">
                Your order will be shipped within 3–5 business days.
              </p>
              <p style="color:#555; font-size:11px; margin:0; 
                letter-spacing:2px; text-transform:uppercase;">
                Veloaura Studio · support@veloaura.com
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order email sent to ${order.address.email}`);

  } catch (err) {
    // Email fail hone pe order cancel mat karo — sirf log karo
    console.error("❌ Email send failed:", err.message);
  }
};

module.exports = sendOrderEmail;