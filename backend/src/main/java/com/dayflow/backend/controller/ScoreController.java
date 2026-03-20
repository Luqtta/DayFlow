package com.dayflow.backend.controller;

import com.dayflow.backend.dto.DailyProgress;
import com.dayflow.backend.service.ScoreService;
import com.dayflow.backend.service.UserService;
import com.dayflow.backend.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/score")
@CrossOrigin(origins = {"https://day-flow-eta.vercel.app", "http://localhost:5173"})
public class ScoreController {

    @Autowired
    private ScoreService scoreService;

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<?> getMyScore(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userService.findByEmail(userDetails.getUsername());
            Map<String, Object> score = scoreService.calculateScore(user.getId());
            return ResponseEntity.ok(score);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<Map<String, Object>>> getRanking() {
        return ResponseEntity.ok(scoreService.getRanking());
    }

    @GetMapping("/history")
    public ResponseEntity<List<DailyProgress>> getHistory(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername());
        return ResponseEntity.ok(scoreService.getHistory(user.getId()));
    }
}
