package in.jhansi.foodapi.service;

import java.security.SecureRandom;
import java.util.Date;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import in.jhansi.foodapi.entity.UserEntity;
import in.jhansi.foodapi.io.AuthRequest;
import in.jhansi.foodapi.io.AuthResponse;
import in.jhansi.foodapi.io.RegisterRequest;
import in.jhansi.foodapi.repository.UserRepository;
import in.jhansi.foodapi.security.JwtUtil;
import jakarta.annotation.PostConstruct;

@Service
public class UserServiceImp implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    private final SecureRandom secureRandom = new SecureRandom();

    @PostConstruct
    public void initDefaultAdmin() {
        if (!userRepository.existsByEmail("admin@foodies.com")) {
            UserEntity admin = UserEntity.builder()
                    .name("Platform Administrator")
                    .email("admin@foodies.com")
                    .password(passwordEncoder.encode("admin123"))
                    .phone("9999999999")
                    .role("ROLE_ADMIN")
                    .active(true)
                    .createdAt(new Date())
                    .build();
            userRepository.save(admin);
        }
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is already registered.");
        }

        // Prevent public users from escalating privileges to ROLE_ADMIN
        String assignedRole = "ROLE_CUSTOMER";
        if (request.getRole() != null && (request.getRole().equalsIgnoreCase("ROLE_RESTAURANT") || request.getRole().equalsIgnoreCase("RESTAURANT"))) {
            assignedRole = "ROLE_RESTAURANT";
        }

        UserEntity user = UserEntity.builder()
                .name(request.getName())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(assignedRole)
                .active(true)
                .createdAt(new Date())
                .build();

        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        return convertToResponse(user, token);
    }

    @Override
    public AuthResponse login(AuthRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password."));

        if (!user.isActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Your account has been deactivated or suspended. Please contact support.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        return convertToResponse(user, token);
    }

    @Override
    public AuthResponse getCurrentUserProfile() {
        UserEntity user = getCurrentUser();
        return convertToResponse(user, null);
    }

    @Override
    public UserEntity findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with email: " + email));
    }

    @Override
    public UserEntity getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated.");
        }
        String email = authentication.getName();
        return findByEmail(email);
    }

    @Override
    public void processForgotPassword(String email) {
        String normalizedEmail = email.toLowerCase().trim();
        UserEntity user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No account found registered with: " + email));

        // Generate a 6-digit OTP and unique token
        String otp = String.format("%06d", secureRandom.nextInt(1000000));
        String token = UUID.randomUUID().toString();
        // 15 minutes expiration
        Date expiry = new Date(System.currentTimeMillis() + (15 * 60 * 1000));

        user.setResetPasswordToken(token);
        user.setResetPasswordOtp(otp);
        user.setResetPasswordTokenExpiry(expiry);
        userRepository.save(user);

        // Send via SMTP email service
        emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), token, otp);
    }

    @Override
    public boolean verifyResetToken(String email, String tokenOrOtp) {
        String normalizedEmail = email.toLowerCase().trim();
        String code = tokenOrOtp != null ? tokenOrOtp.trim() : "";

        UserEntity user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No account found with this email."));

        if (user.getResetPasswordTokenExpiry() == null || user.getResetPasswordTokenExpiry().before(new Date())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password reset code has expired. Please request a new one.");
        }

        boolean matchesToken = code.equals(user.getResetPasswordToken());
        boolean matchesOtp = code.equals(user.getResetPasswordOtp());

        if (!matchesToken && !matchesOtp) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification code or link.");
        }

        return true;
    }

    @Override
    public void resetPassword(String email, String tokenOrOtp, String newPassword) {
        // Validate token/OTP first
        verifyResetToken(email, tokenOrOtp);

        String normalizedEmail = email.toLowerCase().trim();
        UserEntity user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        user.setPassword(passwordEncoder.encode(newPassword));
        // Clear reset token state
        user.setResetPasswordToken(null);
        user.setResetPasswordOtp(null);
        user.setResetPasswordTokenExpiry(null);
        userRepository.save(user);
    }

    private AuthResponse convertToResponse(UserEntity user, String token) {
        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .restaurantId(user.getRestaurantId())
                .active(user.isActive())
                .build();
    }
}
