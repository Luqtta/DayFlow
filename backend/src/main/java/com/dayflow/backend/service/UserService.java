package com.dayflow.backend.service;

import com.dayflow.backend.config.JwtService;
import com.dayflow.backend.dto.LoginRequest;
import com.dayflow.backend.dto.LoginResponse;
import com.dayflow.backend.model.User;
import com.dayflow.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    public User register(String name, String email, String password) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email já cadastrado!");
        }
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        return userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email ou senha inválidos!"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Email ou senha inválidos!");
        }
        String token = jwtService.generateToken(user.getEmail());
        return new LoginResponse(token, user.getName(), user.getEmail());
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado!"));
    }

    public User updateAvatar(String email, String avatarUrl) {
        User user = findByEmail(email);
        user.setAvatarUrl(avatarUrl);
        return userRepository.save(user);
    }

    public User getProfile(String email) {
        return findByEmail(email);
    }

    public User updateName(String email, String newName) {
        User user = findByEmail(email);
        user.setName(newName);
        return userRepository.save(user);
    }

    public User updatePassword(String email, String currentPassword, String newPassword) {
        User user = findByEmail(email);
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Senha atual incorreta!");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }
}