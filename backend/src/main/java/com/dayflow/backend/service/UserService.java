package com.dayflow.backend.service;

import com.dayflow.backend.config.JwtService;
import com.dayflow.backend.dto.LoginRequest;
import com.dayflow.backend.dto.LoginResponse;
import com.dayflow.backend.model.User;
import com.dayflow.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private EmailService emailService;

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

    private String generateVerificationCode() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    public User register(String name, String email, String password) {
        validateName(name);
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email já cadastrado!");
        }

        String code = generateVerificationCode();

        User user = new User();
        user.setName(name.trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmailVerified(false);
        user.setVerificationCode(code);
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        emailService.sendVerificationCode(email, name.trim(), code);

        return user;
    }

    public void verifyEmail(String email, String code) {
        User user = findByEmail(email);

        if (user.isEmailVerified()) {
            throw new RuntimeException("Email já verificado!");
        }
        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(code)) {
            throw new RuntimeException("Código inválido!");
        }
        if (user.getVerificationCodeExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Código expirado! Solicite um novo.");
        }

        user.setEmailVerified(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiresAt(null);
        userRepository.save(user);

        emailService.sendWelcome(email, user.getName());
    }

    public void resendVerificationCode(String email) {
        User user = findByEmail(email);

        if (user.isEmailVerified()) {
            throw new RuntimeException("Email já verificado!");
        }

        String code = generateVerificationCode();
        user.setVerificationCode(code);
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        emailService.sendVerificationCode(email, user.getName(), code);
    }

    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email não encontrado!"));

        String code = generateVerificationCode();
        user.setVerificationCode(code);
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        emailService.sendPasswordResetCode(email, user.getName(), code);
    }

    public void resetPassword(String email, String code, String newPassword) {
        User user = findByEmail(email);

        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(code)) {
            throw new RuntimeException("Código inválido!");
        }
        if (user.getVerificationCodeExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Código expirado! Solicite um novo.");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("A senha deve ter pelo menos 6 caracteres!");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setVerificationCode(null);
        user.setVerificationCodeExpiresAt(null);
        userRepository.save(user);

        emailService.sendPasswordChangeAlert(email, user.getName());
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email ou senha inválidos!"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Email ou senha inválidos!");
        }
        if (!user.isEmailVerified()) {
            throw new RuntimeException("EMAIL_NOT_VERIFIED");
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
        String oldName = user.getName();
        user.setName(newName.trim());
        userRepository.save(user);
        emailService.sendNameChangeAlert(email, oldName, newName.trim());
        return user;
    }

    public User updatePassword(String email, String currentPassword, String newPassword) {
        User user = findByEmail(email);
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Senha atual incorreta!");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        emailService.sendPasswordChangeAlert(email, user.getName());
        return user;
    }
}