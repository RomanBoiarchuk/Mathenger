package com.example.mathengerapi.repositories;

import com.example.mathengerapi.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByEmailIgnoreCaseAndActive(String email, boolean active);

    Optional<User> findByPasswordRecoveryCodeAndActive(String recoveryCode, boolean active);
}
