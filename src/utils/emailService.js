const nodemailer = require('nodemailer');

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
      to: process.env.ADMIN_EMAIL, // Admin email to receive notifications
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
      `
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
      to: process.env.ADMIN_EMAIL, // Admin email to receive notifications
      subject: `New Inquiry Received `,
      html: `
        <h2>New Inquiry Received</h2>
        <p><strong>Type:</strong> Enquiry Form</p>
        <p><strong>Name:</strong> ${inquiry.name}</p>
        <p><strong>Email:</strong> ${inquiry.email}</p>
        <p><strong>Phone:</strong> ${inquiry.phone}</p>
        <p><strong>Message:</strong> ${inquiry.message}</p>
        <p><strong>Date:</strong> ${new Date(inquiry.createdAt).toLocaleString()}</p>
        <br>
        <p>For more details, please check your app dashboard.</p>
      `
    };

    const res= await transporter.sendMail(mailOptions);
    console.log(res);
  } catch (error) {
    console.error('Error sending inquiry email:', error);
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
      `
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
      to: adminEmail,
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
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
}; 