const nodemailer = require('nodemailer');

const path = require('path');
// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // Use App Password for better security
  }
});

// Function to send feedback notification
exports.sendFeedbackNotification = async (feedback) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Feedback Received - ${feedback.type}`,
      html: `
        <h2>New Feedback Received</h2>
        <p><strong>Type:</strong>Feedback Form</p>
        <p><strong>Name:</strong> ${feedback.name}</p>
        <p><strong>Email:</strong> ${feedback.email}</p>
        <p><strong>Message:</strong> ${feedback.message}</p>
        <p><strong>Date:</strong> ${new Date(feedback.createdAt).toLocaleString()}</p>
        <br>
        <p>For more details, please check your app dashboard.</p>
        <div style="text-align: center; margin-top: 20px; padding: 20px; border-top: 1px solid #eee;">
          <img src="cid:logo" alt="Crystaloak Construction" style="max-width: 200px; height: auto;">
          <h2>Crystaloak Construction</h2>
          <p>+44 1895854444</p>
          <p>crystaloakwork@outlook.com</p>
          <p>661 UXBRIDGE ROAD PINNER HA5 3LW</p>
        </div>
      `,
      attachments: [{
        filename: 'logo.png',
        path: path.join(__dirname, '../assets/logo.png'),
        cid: 'logo'
      }]
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending feedback email:', error);
  }
};

// Function to send inquiry notification
exports.sendInquiryNotification = async (inquiry) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Inquiry Received`,
      html: `
        <h2>New Inquiry Received</h2>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
          <h3>Contact Information</h3>
          <p><strong>Name:</strong> ${inquiry.name}</p>
          <p><strong>Email:</strong> ${inquiry.email}</p>
          <p><strong>Phone:</strong> ${inquiry.phone}</p>
          <p><strong>Postcode:</strong> ${inquiry.postcode || 'Not provided'}</p>
          <p><strong>Address:</strong> ${inquiry.address || 'Not provided'}</p>
        </div>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 20px;">
          <h3>Project Details</h3>
          <p><strong>Approximate Budget:</strong> ${inquiry.approximateBudget || 'Not provided'}</p>
          <p><strong>Planning Permission:</strong> ${inquiry.planningPermission ? 'Yes' : 'No'}</p>
          <p><strong>Preferred Contact:</strong> ${inquiry.visitOrCall || 'Not specified'}</p>
          <p><strong>Plan to Start:</strong> ${inquiry.planToStart || 'Not specified'}</p>
        </div>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 20px;">
          <h3>Additional Information</h3>
          <p><strong>Message:</strong> ${inquiry.message || 'No message provided'}</p>
          <p><strong>Preferred Date:</strong> ${inquiry.date || 'Not specified'}</p>
          <p><strong>Preferred Time:</strong> ${inquiry.time || 'Not specified'}</p>
        </div>

        <p style="margin-top: 20px;">For more details, please check your app dashboard.</p>

        <div style="text-align: center; margin-top: 20px; padding: 20px; border-top: 1px solid #eee;">
          <img src="cid:logo" alt="Crystaloak Construction" style="max-width: 200px; height: auto;">
          <h2>Crystaloak Construction</h2>
          <p>+44 1895854444</p>
          <p>crystaloakwork@outlook.com</p>
          <p>661 UXBRIDGE ROAD PINNER HA5 3LW</p>
        </div>
      `,
      attachments: [{
        filename: 'logo.png',
        path: path.join(__dirname, '../assets/logo.png'),
        cid: 'logo'
      }]
    };

    const res = await transporter.sendMail(mailOptions);
    console.log(res);
  } catch (error) {
    console.error('Error sending inquiry email:', error);
  }
};

// Function to send estimation notification
exports.sendEstimationNotification = async (estimation) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Estimation Request Received',
      html: `
        <h2>New Estimation Request</h2>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
          <h3>Contact Information</h3>
          <p><strong>Name:</strong> ${estimation.name}</p>
          <p><strong>Email:</strong> ${estimation.email}</p>
          <p><strong>Phone:</strong> ${estimation.phone}</p>
          <p><strong>Address:</strong> ${estimation.address || 'Not provided'}</p>
        </div>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 20px;">
          <h3>Estimation Details</h3>
          ${estimation.estimations.map((est, index) => `
            <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
              <h4>Project ${index + 1}: ${est.name}</h4>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Rate Type</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Amount</th>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">High Rate</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">£${est.rates.high}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">Mid Rate</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">£${est.rates.mid}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">Low Rate</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">£${est.rates.low}</td>
                </tr>
              </table>
              <p style="margin-top: 10px;"><strong>Selected Rate:</strong> ${est.selectedRate}</p>
              <p><strong>VAT Included:</strong> ${est.vat ? 'Yes' : 'No'}</p>
              
              <h4 style="margin-top: 15px;">Dimensions</h4>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Length (m)</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Width (m)</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Quantity</th>
                </tr>
                ${est.rows.map(row => `
                  <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">${row.length}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${row.width}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${row.quantity}</td>
                  </tr>
                `).join('')}
              </table>
            </div>
          `).join('')}
        </div>

        <p style="margin-top: 20px;">For more details, please check your app dashboard.</p>

        <div style="text-align: center; margin-top: 20px; padding: 20px; border-top: 1px solid #eee;">
          <img src="cid:logo" alt="Crystaloak Construction" style="max-width: 200px; height: auto;">
          <h2>Crystaloak Construction</h2>
          <p>+44 1895854444</p>
          <p>crystaloakwork@outlook.com</p>
          <p>661 UXBRIDGE ROAD PINNER HA5 3LW</p>
        </div>
      `,
      attachments: [{
        filename: 'logo.png',
        path: path.join(__dirname, '../assets/logo.png'),
        cid: 'logo'
      }]
    };
    const res = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending estimation notification:', error);
  }
};

// Send welcome email to new user
exports.sendWelcomeEmail = async (user, defaultPassword) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Welcome to Crystal Oak - Your Account Details',
      html: `
        <h2>Welcome to Crystal Oak!</h2>
        <p>Dear ${user.name},</p>
        <p>Your account has been successfully created. Here are your login details:</p>
        <p><strong>Employee Code:</strong> ${user.employeeCode}</p>
        <p><strong>Password:</strong> ${defaultPassword}</p>
        <p>Please use these credentials to log in to your account.</p>
        <p>For security reasons, we recommend changing your password after your first login.</p>
        <br>
        <p>Best regards,<br>Crystal Oak Team</p>
        <div style="text-align: center; margin-top: 20px; padding: 20px; border-top: 1px solid #eee;">
          <img src="cid:logo" alt="Crystaloak Construction" style="max-width: 200px; height: auto;">
          <h2>Crystaloak Construction</h2>
          <p>+44 1895854444</p>
          <p>crystaloakwork@outlook.com</p>
          <p>661 UXBRIDGE ROAD PINNER HA5 3LW</p>
        </div>
      `,
      attachments: [{
        filename: 'logo.png',
        path: path.join(__dirname, '../assets/logo.png'),
        cid: 'logo'
      }]
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

// Send admin notification about new user
exports.sendAdminNewUserNotification = async (user, adminEmail) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: 'New User Registration - Crystal Oak',
      html: `
        <h2>New User Registration</h2>
        <p>A new user has been registered on Crystal Oak:</p>
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Employee Code:</strong> ${user.employeeCode}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Department:</strong> ${user.department}</p>
        <p><strong>Designation:</strong> ${user.designation}</p>
        <p><strong>Registration Date:</strong> ${new Date().toLocaleString()}</p>
        <br>
        <p>You can view and manage this user's details in the admin dashboard.</p>
        <div style="text-align: center; margin-top: 20px; padding: 20px; border-top: 1px solid #eee;">
          <img src="cid:logo" alt="Crystaloak Construction" style="max-width: 200px; height: auto;">
          <h2>Crystaloak Construction</h2>
          <p>+44 1895854444</p>
          <p>crystaloakwork@outlook.com</p>
          <p>661 UXBRIDGE ROAD PINNER HA5 3LW</p>
        </div>
      `,
      attachments: [{
        filename: 'logo.png',
        path: path.join(__dirname, '../assets/logo.png'),
        cid: 'logo'
      }]
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
}; 