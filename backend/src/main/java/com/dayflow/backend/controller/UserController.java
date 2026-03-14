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
                "message", "Usuário criado com sucesso!",
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail()
            ));
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