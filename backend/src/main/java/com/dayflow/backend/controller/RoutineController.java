package com.dayflow.backend.controller;

import com.dayflow.backend.dto.RoutineRequest;
import com.dayflow.backend.model.Routine;
import com.dayflow.backend.service.RoutineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/routines")
@CrossOrigin(origins = {"https://day-flow-eta.vercel.app", "http://localhost:5173"})
public class RoutineController {

    @Autowired
    private RoutineService routineService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody RoutineRequest request,
                                    @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Routine routine = routineService.create(request, userDetails.getUsername());
            return ResponseEntity.ok(routine);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Routine>> findAll(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(routineService.findAll(userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id,
                                      @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Routine routine = routineService.findById(id, userDetails.getUsername());
            return ResponseEntity.ok(routine);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                    @RequestBody RoutineRequest request,
                                    @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Routine routine = routineService.update(id, request, userDetails.getUsername());
            return ResponseEntity.ok(routine);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id,
                                    @AuthenticationPrincipal UserDetails userDetails) {
        try {
            routineService.delete(id, userDetails.getUsername());
            return ResponseEntity.ok("Rotina deletada com sucesso!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}