package in.jhansi.foodapi.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:fooddeliveryappservice@gmail.com}")
    private String senderEmail;

    /**
     * Sends a password reset email containing a 6-digit OTP and direct reset link.
     */
    public boolean sendPasswordResetEmail(String recipientEmail, String userName, String resetToken, String otp) {
        String subject = "Foodies - Password Reset Code: " + otp;
        String resetLink = "http://localhost:5173/reset-password?email=" + recipientEmail + "&token=" + resetToken;

        String htmlContent = "<!DOCTYPE html>" +
                "<html>" +
                "<body style=\"font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;\">" +
                "  <div style=\"max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);\">" +
                "    <div style=\"margin-bottom: 24px;\">" +
                "      <span style=\"font-size: 20px; font-weight: 700; color: #0f172a;\">Foodies</span>" +
                "    </div>" +
                "    <h2 style=\"font-size: 20px; font-weight: 600; color: #0f172a; margin-top: 0; margin-bottom: 8px;\">Reset Your Password</h2>" +
                "    <p style=\"font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px;\">" +
                "      Hello " + (userName != null ? userName : "there") + ",<br/>" +
                "      We received a request to reset your password. Use the verification code below to set a new password." +
                "    </p>" +
                "    <div style=\"background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; text-align: center; margin-bottom: 24px;\">" +
                "      <div style=\"font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 6px;\">Verification Code (OTP)</div>" +
                "      <div style=\"font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0f172a;\">" + otp + "</div>" +
                "      <div style=\"font-size: 12px; color: #94a3b8; margin-top: 6px;\">Valid for 15 minutes</div>" +
                "    </div>" +
                "    <div style=\"text-align: center; margin-bottom: 24px;\">" +
                "      <a href=\"" + resetLink + "\" style=\"display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 500;\">Click Here to Reset Password</a>" +
                "    </div>" +
                "    <p style=\"font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 0;\">" +
                "      If you did not request this password reset, please ignore this email or contact support. Your password will remain unchanged." +
                "    </p>" +
                "  </div>" +
                "</body>" +
                "</html>";

        // Print to application console immediately for dev convenience
        System.out.println("\n=======================================================");
        System.out.println(">>> [SMTP EMAIL DISPATCH] TO: " + recipientEmail);
        System.out.println(">>> SUBJECT: " + subject);
        System.out.println(">>> 6-DIGIT OTP: " + otp);
        System.out.println(">>> RESET LINK: " + resetLink);
        System.out.println("=======================================================\n");

        if (mailSender != null) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(senderEmail);
                helper.setTo(recipientEmail);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);
                mailSender.send(message);
                log.info("Password reset email successfully sent via SMTP to: {}", recipientEmail);
                return true;
            } catch (Exception ex) {
                log.warn("SMTP delivery attempt to {} encountered an issue: {}. (OTP is logged above for local dev)", recipientEmail, ex.getMessage());
                return false;
            }
        } else {
            log.info("JavaMailSender not initialized; OTP printed to console for development.");
            return true;
        }
    }

    public void sendRestaurantApprovalEmail(String recipientEmail, String ownerName, String restaurantName) {
        String subject = "Congratulations! Your Restaurant '" + restaurantName + "' is Approved on Foodies";
        String emailBody = 
                "\n=======================================================================\n" +
                "EMAIL NOTIFICATION SENT TO: " + recipientEmail + "\n" +
                "SUBJECT: " + subject + "\n" +
                "-----------------------------------------------------------------------\n" +
                "Dear " + (ownerName != null ? ownerName : "Partner") + ",\n\n" +
                "We are thrilled to inform you that your restaurant '" + restaurantName + "'\n" +
                "has been verified and APPROVED by the Foodies Platform Administrator!\n\n" +
                "What's next?\n" +
                "1. You can now add dishes to your restaurant menu.\n" +
                "2. Your restaurant is now visible to customers in your area.\n" +
                "3. Manage live orders in real-time through the Partner Portal.\n\n" +
                "Portal URL: http://localhost:3000\n\n" +
                "Happy cooking!\n" +
                "Foodies Support Team\n" +
                "=======================================================================\n";

        log.info(emailBody);
        System.out.println(emailBody);

        if (mailSender != null) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(senderEmail);
                helper.setTo(recipientEmail);
                helper.setSubject(subject);
                helper.setText(emailBody, false);
                mailSender.send(message);
            } catch (Exception ignored) {
                // Non-blocking
            }
        }
    }

    public void sendNewReviewNotificationEmail(String recipientEmail, String restaurantName, String foodName, int rating, String comment, String reviewerName) {
        String subject = "New " + rating + "★ Review on " + foodName + " - " + restaurantName;
        String emailBody = 
                "\n=======================================================================\n" +
                "EMAIL NOTIFICATION SENT TO: " + recipientEmail + "\n" +
                "SUBJECT: " + subject + "\n" +
                "-----------------------------------------------------------------------\n" +
                "Hello,\n\n" +
                "A customer (" + reviewerName + ") just posted a " + rating + "★ review for '" + foodName + "'!\n\n" +
                "Customer Feedback:\n" +
                "\"" + comment + "\"\n\n" +
                "You can inspect this and reply to customer feedback in the Partner Portal.\n" +
                "=======================================================================\n";

        log.info(emailBody);
        System.out.println(emailBody);

        if (mailSender != null) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(senderEmail);
                helper.setTo(recipientEmail);
                helper.setSubject(subject);
                helper.setText(emailBody, false);
                mailSender.send(message);
            } catch (Exception ignored) {
                // Non-blocking
            }
        }
    }
}
