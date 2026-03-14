package com.dayflow.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    private void sendEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, "DayFlow");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("Email enviado para: " + to);
        } catch (Exception e) {
            System.err.println("Erro ao enviar email: " + e.getMessage());
        }
    }

    public void sendVerificationCode(String to, String name, String code) {
        String html = "<div style='font-family:sans-serif;max-width:480px;margin:0 auto;background:#0f0a1e;padding:40px;border-radius:16px'>" +
            "<h1 style='color:#a855f7;font-size:28px;margin-bottom:8px'>DayFlow</h1>" +
            "<p style='color:#e2d9f3;font-size:16px'>Olá, <b>" + name + "</b>! 👋</p>" +
            "<p style='color:#c4b5fd;font-size:15px'>Use o código abaixo para verificar sua conta:</p>" +
            "<div style='background:#1a1030;border:2px solid #7c3aed;border-radius:12px;padding:24px;text-align:center;margin:24px 0'>" +
            "<span style='color:#ffffff;font-size:40px;font-weight:bold;letter-spacing:12px'>" + code + "</span>" +
            "</div>" +
            "<p style='color:#6b7280;font-size:13px'>Este código expira em <b>15 minutos</b>.</p>" +
            "<p style='color:#6b7280;font-size:13px'>Se você não criou uma conta no DayFlow, ignore este email.</p>" +
            "</div>";

        sendEmail(to, "Verifique sua conta DayFlow 🌊", html);
    }

    public void sendWelcome(String to, String name) {
        String html = "<div style='font-family:sans-serif;max-width:480px;margin:0 auto;background:#0f0a1e;padding:40px;border-radius:16px'>" +
            "<h1 style='color:#a855f7;font-size:28px;margin-bottom:8px'>DayFlow 🌊</h1>" +
            "<p style='color:#e2d9f3;font-size:16px'>Bem-vindo(a), <b>" + name + "</b>! 🎉</p>" +
            "<p style='color:#c4b5fd;font-size:15px'>Sua conta foi verificada com sucesso. Agora você pode organizar sua rotina e evoluir todos os dias!</p>" +
            "<div style='background:#1a1030;border-radius:12px;padding:20px;margin:24px 0'>" +
            "<p style='color:#a855f7;font-size:14px;margin:0'>🏆 Complete tarefas diárias para subir no ranking</p>" +
            "<p style='color:#a855f7;font-size:14px;margin:8px 0'>🔥 Mantenha seu streak para ganhar mais pontos</p>" +
            "<p style='color:#a855f7;font-size:14px;margin:0'>⭐ Alcance o Grade S com 90+ pontos</p>" +
            "</div>" +
            "<p style='color:#6b7280;font-size:13px'>Bora começar? Acesse <a href='https://day-flow-eta.vercel.app' style='color:#7c3aed'>day-flow-eta.vercel.app</a></p>" +
            "</div>";

        sendEmail(to, "Bem-vindo ao DayFlow! 🌊", html);
    }

    public void sendPasswordChangeAlert(String to, String name) {
        String html = "<div style='font-family:sans-serif;max-width:480px;margin:0 auto;background:#0f0a1e;padding:40px;border-radius:16px'>" +
            "<h1 style='color:#a855f7;font-size:28px;margin-bottom:8px'>DayFlow</h1>" +
            "<p style='color:#e2d9f3;font-size:16px'>Olá, <b>" + name + "</b>!</p>" +
            "<p style='color:#c4b5fd;font-size:15px'>Sua <b>senha</b> foi alterada com sucesso.</p>" +
            "<div style='background:#1a1030;border:1px solid #dc2626;border-radius:12px;padding:16px;margin:24px 0'>" +
            "<p style='color:#fca5a5;font-size:14px;margin:0'>⚠️ Se você não fez essa alteração, entre em contato imediatamente.</p>" +
            "</div>" +
            "<p style='color:#6b7280;font-size:13px'>DayFlow — Organize sua rotina, evolua todos os dias.</p>" +
            "</div>";

        sendEmail(to, "Sua senha foi alterada — DayFlow", html);
    }

    public void sendNameChangeAlert(String to, String oldName, String newName) {
        String html = "<div style='font-family:sans-serif;max-width:480px;margin:0 auto;background:#0f0a1e;padding:40px;border-radius:16px'>" +
            "<h1 style='color:#a855f7;font-size:28px;margin-bottom:8px'>DayFlow</h1>" +
            "<p style='color:#e2d9f3;font-size:16px'>Olá!</p>" +
            "<p style='color:#c4b5fd;font-size:15px'>O nome da sua conta foi alterado:</p>" +
            "<div style='background:#1a1030;border-radius:12px;padding:16px;margin:24px 0'>" +
            "<p style='color:#6b7280;font-size:14px;margin:0'>De: <span style='color:#e2d9f3'>" + oldName + "</span></p>" +
            "<p style='color:#6b7280;font-size:14px;margin:8px 0 0'>Para: <span style='color:#a855f7;font-weight:bold'>" + newName + "</span></p>" +
            "</div>" +
            "<p style='color:#6b7280;font-size:13px'>Se você não fez essa alteração, entre em contato imediatamente.</p>" +
            "</div>";

        sendEmail(to, "Seu nome foi alterado — DayFlow", html);
    }
}