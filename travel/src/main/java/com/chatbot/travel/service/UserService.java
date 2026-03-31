package com.chatbot.travel.service;

import com.chatbot.travel.model.User;
import com.chatbot.travel.model.enums.Role;
import com.chatbot.travel.repository.BookingRepository;
import com.chatbot.travel.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       BookingRepository bookingRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private User getCurrentUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ================= REGISTER =================
    public User registerUser(User user) {

    if (userRepository.existsByEmail(user.getEmail())) {
        throw new RuntimeException("Email already exists");
    }

    // ===== ROLE - REGION VALIDATION =====
    if (user.getRole() == Role.REGIONAL_ADMIN && user.getRegion() == null) {
        throw new RuntimeException("Regional Admin must have a region assigned");
    }

    if (user.getRole() == Role.USER && user.getRegion() != null) {
        throw new RuntimeException("Normal user should not have region assigned");
    }

    if (user.getRole() == Role.SUPER_ADMIN) {
        user.setRegion(null);
    }

    // Encode password
    user.setPassword(passwordEncoder.encode(user.getPassword()));

    return userRepository.save(user);
    }

    // ================= GET ALL =================
    public List<User> getAllUsers() {
        User currentUser = getCurrentUser();

        if (currentUser.getRole() == Role.REGIONAL_ADMIN) {
            Map<Long, User> regionUsers = new LinkedHashMap<>();

            bookingRepository.findDistinctUsersByPlaceRegion(currentUser.getRegion())
                    .forEach(user -> regionUsers.put(user.getUserId(), user));

            userRepository.findByRoleAndRegion(Role.REGIONAL_ADMIN, currentUser.getRegion())
                    .forEach(user -> regionUsers.put(user.getUserId(), user));

            regionUsers.put(currentUser.getUserId(), currentUser);

            return List.copyOf(regionUsers.values());
        }

        return userRepository.findAll();
    }

    // ================= GET BY ID =================
    public User getUserById(Long userId) {

        if (userId == null)
            throw new IllegalArgumentException("User ID cannot be null");

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        User currentUser = getCurrentUser();
        if (currentUser.getRole() == Role.REGIONAL_ADMIN) {
            boolean regionalAdminInSameRegion =
                    user.getRole() == Role.REGIONAL_ADMIN &&
                    currentUser.getRegion() != null &&
                    currentUser.getRegion().equals(user.getRegion());

            boolean userBookedInRegion = bookingRepository
                    .findDistinctUsersByPlaceRegion(currentUser.getRegion())
                    .stream()
                    .anyMatch(regionUser -> regionUser.getUserId().equals(user.getUserId()));

            if (!regionalAdminInSameRegion && !userBookedInRegion && !currentUser.getUserId().equals(user.getUserId())) {
                throw new RuntimeException("You cannot access user outside your region");
            }
        }

        return user;
    }

    // ================= GET BY EMAIL =================
    public User getUserByEmail(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with email: " + email));
    }

    // ================= UPDATE =================
    public User updateUser(Long userId, User updatedUser) {

        User user = getUserById(userId);

        if (updatedUser.getName() != null)
            user.setName(updatedUser.getName());

        if (updatedUser.getPhone() != null)
            user.setPhone(updatedUser.getPhone());

        if (updatedUser.getEmail() != null &&
                !updatedUser.getEmail().equals(user.getEmail())) {

            if (userRepository.existsByEmail(updatedUser.getEmail())) {
                throw new RuntimeException("Email already exists");
            }

            user.setEmail(updatedUser.getEmail());
        }

        if (updatedUser.getPassword() != null &&
                !updatedUser.getPassword().isBlank()) {

            user.setPassword(
                    passwordEncoder.encode(updatedUser.getPassword())
            );
        }

        if (updatedUser.getRole() != null)
            user.setRole(updatedUser.getRole());

        return userRepository.save(user);
    }

    // ================= DELETE =================
    public void deleteUser(Long userId) {

        if (userId == null)
            throw new IllegalArgumentException("User ID cannot be null");

        if (!userRepository.existsById(userId))
            throw new RuntimeException("User not found");

        userRepository.deleteById(userId);
    }
}
