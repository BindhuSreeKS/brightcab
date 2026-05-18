package com.cabgo.repository;

import com.cabgo.enums.AdminRole;
import com.cabgo.enums.AdminStatus;
import com.cabgo.model.Admin;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends MongoRepository<Admin, String> {

    Optional<Admin> findByEmail(String email);

    boolean existsByEmail(String email);

    Page<Admin> findByRole(AdminRole role, Pageable pageable);

    Page<Admin> findByStatus(AdminStatus status, Pageable pageable);

    @Query("{ $or: [ { name: { $regex: ?0, $options: 'i' } }, { email: { $regex: ?0, $options: 'i' } } ] }")
    Page<Admin> searchAdmins(String keyword, Pageable pageable);
}
