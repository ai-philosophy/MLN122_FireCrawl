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
@Table(name = "merchant_offers", indexes = {
    @Index(name = "idx_offer_merchant_product", columnList = "merchant_name, product_id")
})
public class MerchantOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "merchant_name", nullable = false, length = 100)
    private String merchantName;

    @Column(name = "original_url", nullable = false, length = 1000)
    private String originalUrl;

    @Column(name = "merchant_product_name", nullable = false, length = 500)
    private String merchantProductName;

    @Column(name = "current_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal currentPrice;

    @Column(name = "original_price", precision = 15, scale = 2)
    private BigDecimal originalPrice;

    @Column(name = "in_stock", nullable = false)
    @Builder.Default
    private boolean inStock = true;

    @Column(name = "is_fallback", nullable = false)
    @Builder.Default
    private boolean isFallback = false;

    private Instant updatedAt;

    @OneToMany(mappedBy = "merchantOffer", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<PriceHistory> priceHistories = new java.util.ArrayList<>();

    @PrePersist
    void prePersist() {
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
