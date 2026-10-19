package com.amrutha.security;

import com.amrutha.common.ApiResponse;
import com.amrutha.security.dto.AdminProfileDto;
import com.amrutha.security.dto.LoginRequestDto;
import com.amrutha.security.dto.LoginResponseDto;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * Authentication Controller for administrator login and session profile.
 * Base Path: /api/auth
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(AdminUserRepository adminUserRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenProvider jwtTokenProvider) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    /**
     * POST /api/auth/login
     * Authenticates an admin user with username and password.
     * Never logs sensitive passwords or exposes password hashes.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDto>> login(@Valid @RequestBody LoginRequestDto request) {
        Optional<AdminUser> userOpt = adminUserRepository.findByUsername(request.getUsername().trim());

        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            log.warn("Failed admin login attempt for username: {}", request.getUsername().trim());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid username or password."));
        }

        AdminUser user = userOpt.get();
        if (!user.isEnabled()) {
            log.warn("Login rejected for disabled admin account: {}", user.getUsername());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("This administrator account has been disabled."));
        }

        String token = jwtTokenProvider.generateToken(user);
        log.info("Admin user successfully authenticated: {}", user.getUsername());

        LoginResponseDto responseDto = new LoginResponseDto(
                token,
                user.getUsername(),
                user.getFullName(),
                user.getRole().name()
        );

        return ResponseEntity.ok(ApiResponse.ok("Login successful", responseDto));
    }

    /**
     * GET /api/auth/me
     * Returns the currently authenticated administrator's profile.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AdminProfileDto>> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthenticated session"));
        }

        String username = authentication.getName();
        AdminUser user = adminUserRepository.findByUsername(username)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("User profile not found"));
        }

        AdminProfileDto profile = new AdminProfileDto(
                user.getUsername(),
                user.getFullName(),
                user.getRole().name()
        );

        return ResponseEntity.ok(ApiResponse.ok("Profile retrieved successfully", profile));
    }
}
