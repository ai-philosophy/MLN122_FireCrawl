package com.tracker.repository;

import com.tracker.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByBrandAndCategory(String brand, String category);
    List<Product> findByNameContainingIgnoreCase(String name);
    Optional<Product> findByName(String name);
}
