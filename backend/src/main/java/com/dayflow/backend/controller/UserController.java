package com.dayflow.backend.controller;

import com.dayflow.backend.dto.LoginRequest;
import com.dayflow.backend.dto.LoginResponse;
import com.dayflow.backend.model.User;
import com.dayflow.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        try {
            User user = userService.register(
                body.get("name"),
                body.get("email"),
                body.get("password")
            );
            return ResponseEntity.ok(Map.of(
                "message", "Conta criada! Verifique seu email.",
                "email", user.getEmail(),
                "name", user.getName()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, String> body) {
        try {
            userService.verifyEmail(body.get("email"), body.get("code"));
            return ResponseEntity.ok(Map.of("message", "Email verificado com sucesso!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/resend-code")
    public ResponseEntity<?> resendCode(@RequestBody Map<String, String> body) {
        try {
            userService.resendVerificationCode(body.get("email"));
            return ResponseEntity.ok(Map.of("message", "Novo código enviado!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        try {
            userService.forgotPassword(body.get("email"));
            return ResponseEntity.ok(Map.of("message", "Código enviado para seu email!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        try {
            userService.resetPassword(
                body.get("email"),
                body.get("code"),
                body.get("newPassword")
            );
            return ResponseEntity.ok(Map.of("message", "Senha redefinida com sucesso!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = userService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userService.getProfile(userDetails.getUsername());
            return ResponseEntity.ok(Map.of(
                "name", user.getName(),
                "email", user.getEmail(),
                "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : ""
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/avatar")
    public ResponseEntity<?> updateAvatar(@RequestBody Map<String, String> body,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userService.updateAvatar(userDetails.getUsername(), body.get("avatarUrl"));
            return ResponseEntity.ok(Map.of(
                "message", "Avatar atualizado!",
                "avatarUrl", user.getAvatarUrl()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/name")
    public ResponseEntity<?> updateName(@RequestBody Map<String, String> body,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userService.updateName(userDetails.getUsername(), body.get("name"));
            return ResponseEntity.ok(Map.of("message", "Nome atualizado!", "name", user.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/password")
    public ResponseEntity<?> updatePassword(@RequestBody Map<String, String> body,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        try {
            userService.updatePassword(
                userDetails.getUsername(),
                body.get("currentPassword"),
                body.get("newPassword")
            );
            return ResponseEntity.ok(Map.of("message", "Senha atualizada!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}