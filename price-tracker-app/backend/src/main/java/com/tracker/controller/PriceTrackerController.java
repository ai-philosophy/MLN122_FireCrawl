package com.tracker.controller;

import com.tracker.entity.MerchantOffer;
import com.tracker.entity.PriceHistory;
import com.tracker.entity.Product;
import com.tracker.repository.MerchantOfferRepository;
import com.tracker.repository.PriceHistoryRepository;
import com.tracker.repository.ProductRepository;
import com.tracker.service.PriceTrackerService;
import com.tracker.service.PriceTrackerService.OfferIngestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tracker")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PriceTrackerController {

    private final PriceTrackerService priceTrackerService;
    private final ProductRepository productRepository;
    private final MerchantOfferRepository merchantOfferRepository;
    private final PriceHistoryRepository priceHistoryRepository;

    @PostMapping("/offers/ingest")
    public ResponseEntity<?> ingestOffer(@RequestBody OfferIngestDTO dto) {
        MerchantOffer offer = priceTrackerService.ingestOffer(dto);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Cập nhật ưu đãi thành công",
                "offerId", offer.getId(),
                "productId", offer.getProduct().getId()
        ));
    }

    @PostMapping("/offers/ingest-raw")
    public ResponseEntity<?> ingestRawOffer(@RequestBody PriceTrackerService.RawOfferIngestDTO dto) {
        try {
            MerchantOffer offer = priceTrackerService.ingestRawOffer(dto);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Trích xuất và cập nhật ưu đãi thành công",
                    "offerId", offer.getId(),
                    "productId", offer.getProduct().getId()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Lỗi xử lý hệ thống: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/products/search")
    public ResponseEntity<List<Map<String, Object>>> searchProducts(@RequestParam String query) {
        List<Product> products = productRepository.findByNameContainingIgnoreCase(query);
        List<Map<String, Object>> response = products.stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId());
            map.put("name", p.getName());
            map.put("brand", p.getBrand());
            map.put("category", p.getCategory());
            map.put("imageUrl", p.getImageUrl());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<?> getProductDetails(@PathVariable Long id) {
        return productRepository.findById(id).map(product -> {
            List<MerchantOffer> offers = merchantOfferRepository.findByProductId(product.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", product.getId());
            response.put("name", product.getName());
            response.put("brand", product.getBrand());
            response.put("category", product.getCategory());
            response.put("imageUrl", product.getImageUrl());
            
            List<Map<String, Object>> offersList = offers.stream().map(o -> {
                Map<String, Object> oMap = new HashMap<>();
                oMap.put("merchantName", o.getMerchantName());
                oMap.put("merchantProductName", o.getMerchantProductName());
                oMap.put("currentPrice", o.getCurrentPrice());
                oMap.put("originalPrice", o.getOriginalPrice());
                oMap.put("url", o.getOriginalUrl());
                oMap.put("inStock", o.isInStock());
                oMap.put("isFallback", o.isFallback());
                return oMap;
            }).collect(Collectors.toList());
            
            response.put("offers", offersList);
            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/products/{id}/price-history")
    public ResponseEntity<?> getPriceHistory(@PathVariable Long id) {
        List<MerchantOffer> offers = merchantOfferRepository.findByProductId(id);
        Map<String, List<Map<String, Object>>> historyData = new HashMap<>();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")
                .withZone(ZoneId.systemDefault());

        for (MerchantOffer offer : offers) {
            List<PriceHistory> histories = priceHistoryRepository
                    .findByMerchantOfferIdOrderByRecordedAtAsc(offer.getId());

            List<Map<String, Object>> points = histories.stream().map(h -> {
                Map<String, Object> pt = new HashMap<>();
                pt.put("price", h.getPrice());
                pt.put("originalPrice", h.getOriginalPrice());
                pt.put("date", formatter.format(h.getRecordedAt()));
                return pt;
            }).collect(Collectors.toList());

            historyData.put(offer.getMerchantName(), points);
        }

        return ResponseEntity.ok(historyData);
    }

    @DeleteMapping("/offers")
    public ResponseEntity<?> deleteOffer(@RequestParam String merchantName, @RequestParam String targetProductName) {
        try {
            priceTrackerService.deleteExistingOffer(merchantName, targetProductName);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Đã xóa ưu đãi lỗi (404) thành công"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Lỗi khi xóa ưu đãi: " + e.getMessage()
            ));
        }
    }
}
