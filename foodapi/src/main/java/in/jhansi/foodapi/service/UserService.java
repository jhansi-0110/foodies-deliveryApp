package in.jhansi.foodapi.service;

import in.jhansi.foodapi.entity.UserEntity;
import in.jhansi.foodapi.io.AuthRequest;
import in.jhansi.foodapi.io.AuthResponse;
import in.jhansi.foodapi.io.RegisterRequest;

public interface UserService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(AuthRequest request);
    AuthResponse getCurrentUserProfile();
    UserEntity findByEmail(String email);
    UserEntity getCurrentUser();

    void processForgotPassword(String email);
    boolean verifyResetToken(String email, String tokenOrOtp);
    void resetPassword(String email, String tokenOrOtp, String newPassword);
}
