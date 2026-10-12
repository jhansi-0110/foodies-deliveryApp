package in.jhansi.foodapi.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import in.jhansi.foodapi.io.AuthRequest;
import in.jhansi.foodapi.io.AuthResponse;
import in.jhansi.foodapi.io.ForgotPasswordRequest;
import in.jhansi.foodapi.io.RegisterRequest;
import in.jhansi.foodapi.io.ResetPasswordRequest;
import in.jhansi.foodapi.io.VerifyResetOtpRequest;
import in.jhansi.foodapi.service.UserService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return userService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest request) {
        return userService.login(request);
    }

    @GetMapping("/me")
    public AuthResponse getMe() {
        return userService.getCurrentUserProfile();
    }

    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        userService.processForgotPassword(request.getEmail());
        return Map.of(
            "message", "Password reset code and instructions have been dispatched to your email address.",
            "email", request.getEmail()
        );
    }

    @PostMapping("/verify-reset-token")
    public Map<String, Object> verifyResetToken(@Valid @RequestBody VerifyResetOtpRequest request) {
        boolean valid = userService.verifyResetToken(request.getEmail(), request.getTokenOrOtp());
        return Map.of(
            "valid", valid,
            "message", "Verification code is valid."
        );
    }

    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request.getEmail(), request.getTokenOrOtp(), request.getNewPassword());
        return Map.of(
            "message", "Your password has been reset successfully. Please log in with your new password."
        );
    }
}
