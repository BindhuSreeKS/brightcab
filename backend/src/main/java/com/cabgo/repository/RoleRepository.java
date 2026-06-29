package com.cabgo.repository;

import com.cabgo.model.Role;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends MongoRepository<Role, String> {

    Optional<Role> findByName(String name);

    List<Role> findByActive(boolean active);

    boolean existsByName(String name);
}
