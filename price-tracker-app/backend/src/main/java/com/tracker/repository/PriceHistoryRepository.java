package com.tracker.repository;

import com.tracker.entity.PriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Long> {
    List<PriceHistory> findByMerchantOfferIdOrderByRecordedAtAsc(Long merchantOfferId);
}
