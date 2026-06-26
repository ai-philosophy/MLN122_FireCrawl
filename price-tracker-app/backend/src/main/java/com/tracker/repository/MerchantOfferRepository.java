package com.tracker.repository;

import com.tracker.entity.MerchantOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MerchantOfferRepository extends JpaRepository<MerchantOffer, Long> {
    Optional<MerchantOffer> findByMerchantNameAndProductId(String merchantName, Long productId);
    List<MerchantOffer> findByProductId(Long productId);
}
