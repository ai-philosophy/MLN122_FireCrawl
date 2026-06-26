package com.tracker.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "price_histories", indexes = {
    @Index(name = "idx_history_offer_recorded", columnList = "merchant_offer_id, recorded_at")
})
public class PriceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "merchant_offer_id", nullable = false)
    private MerchantOffer merchantOffer;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "original_price", precision = 15, scale = 2)
    private BigDecimal originalPrice;

    @Column(name = "recorded_at", nullable = false, updatable = false)
    private Instant recordedAt;

    @Column(name = "is_fallback", nullable = false)
    @Builder.Default
    private boolean isFallback = false;

    @PrePersist
    void prePersist() {
        if (this.recordedAt == null) {
            this.recordedAt = Instant.now();
        }
    }
}
