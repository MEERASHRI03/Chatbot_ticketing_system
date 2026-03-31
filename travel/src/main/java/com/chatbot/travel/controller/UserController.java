package com.chatbot.travel.controller;

import com.chatbot.travel.model.User;
import com.chatbot.travel.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Public registration
    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@Valid @RequestBody User user) {
        return new ResponseEntity<>(userService.registerUser(user), HttpStatus.CREATED);
    }

    // ✅ ONLY SUPER ADMIN
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','REGIONAL_ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // ✅ USER + ADMIN
    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('USER','SUPER_ADMIN','REGIONAL_ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    // ✅ ONLY SUPER ADMIN
    @PutMapping("/{userId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable Long userId,
                                           @Valid @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUser(userId, user));
    }

    // ✅ ONLY SUPER ADMIN
    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok("User deleted successfully");
    }
}
