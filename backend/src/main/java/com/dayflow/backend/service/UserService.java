package com.dayflow.backend.service;

import com.dayflow.backend.config.JwtService;
import com.dayflow.backend.dto.LoginRequest;
import com.dayflow.backend.dto.LoginResponse;
import com.dayflow.backend.model.User;
import com.dayflow.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private static final List<String> BAD_WORDS = List.of(
        "puta", "merda", "corno", "viado", "buceta", "caralho",
        "fodase", "foda", "otario", "idiota", "imbecil", "retardado",
        "vagabunda", "piranha", "safada", "pica"
    );

    private boolean containsBadWord(String text) {
        String lower = text.toLowerCase().replaceAll("\\s", "");
        return BAD_WORDS.stream().anyMatch(lower::contains);
    }

    private void validateName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("Nome é obrigatório!");
        }
        if (name.trim().length() < 2) {
            throw new RuntimeException("O nome deve ter pelo menos 2 caracteres!");
        }
        if (name.trim().length() > 16) {
            throw new RuntimeException("O nome deve ter no máximo 16 caracteres!");
        }
        if (containsBadWord(name)) {
            throw new RuntimeException("Nome inválido! Use um nome apropriado.");
        }
    }

    public User register(String name, String email, String password) {
        validateName(name);
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email já cadastrado!");
        }
        User user = new User();
        user.setName(name.trim());
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
        validateName(newName);
        User user = findByEmail(email);
        user.setName(newName.trim());
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