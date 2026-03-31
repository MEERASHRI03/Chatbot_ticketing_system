package com.chatbot.travel.repository;

import com.chatbot.travel.model.User;
import com.chatbot.travel.model.enums.Region;
import com.chatbot.travel.model.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRoleAndRegion(Role role, Region region);
}
