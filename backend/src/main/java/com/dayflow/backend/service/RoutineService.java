package com.dayflow.backend.service;

import com.dayflow.backend.dto.RoutineRequest;
import com.dayflow.backend.model.Routine;
import com.dayflow.backend.model.User;
import com.dayflow.backend.repository.RoutineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoutineService {

    @Autowired
    private RoutineRepository routineRepository;

    @Autowired
    private UserService userService;

    public Routine create(RoutineRequest request, String email) {
        User user = userService.findByEmail(email);

        Routine routine = new Routine();
        routine.setTitle(request.getTitle());
        routine.setDescription(request.getDescription());
        routine.setCategory(request.getCategory());
        routine.setUser(user);

        return routineRepository.save(routine);
    }

    public List<Routine> findAll(String email) {
        User user = userService.findByEmail(email);
        return routineRepository.findByUserId(user.getId());
    }

    public Routine findById(Long id, String email) {
        User user = userService.findByEmail(email);
        return routineRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Rotina não encontrada!"));
    }

    public Routine update(Long id, RoutineRequest request, String email) {
        Routine routine = findById(id, email);
        routine.setTitle(request.getTitle());
        routine.setDescription(request.getDescription());
        routine.setCategory(request.getCategory());
        return routineRepository.save(routine);
    }

    public void delete(Long id, String email) {
        Routine routine = findById(id, email);
        routineRepository.delete(routine);
    }
}