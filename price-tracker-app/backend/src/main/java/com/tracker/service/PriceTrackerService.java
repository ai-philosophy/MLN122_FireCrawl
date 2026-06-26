package com.tracker.service;

import com.tracker.entity.MerchantOffer;
import com.tracker.entity.PriceHistory;
import com.tracker.entity.Product;
import com.tracker.repository.MerchantOfferRepository;
import com.tracker.repository.PriceHistoryRepository;
import com.tracker.repository.ProductRepository;
import com.tracker.service.GithubModelsService.CandidateProduct;
import com.tracker.service.GithubModelsService.MatchResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PriceTrackerService {

    private final ProductRepository productRepository;
    private final MerchantOfferRepository merchantOfferRepository;
    private final PriceHistoryRepository priceHistoryRepository;
    private final GithubModelsService githubModelsService;

    @lombok.Data
    public static class OfferIngestDTO {
        private String merchantName;
        private String originalUrl;
        private String merchantProductName;
        private BigDecimal currentPrice;
        private BigDecimal originalPrice;
        private String imageUrl;
        private boolean inStock;
        private String brand;
        private String category;
        private boolean isFallback;
        private String targetProductName;
    }

    @lombok.Data
    public static class RawOfferIngestDTO {
        private String merchantName;
        private String originalUrl;
        private String rawMarkdown;
        private String brand;
        private String category;
        private String targetProductName;
    }

    private static class FallbackProductInfo {
        String name;
        String brand;
        String category;
        BigDecimal basePrice;
        String imageUrl;

        public FallbackProductInfo(String name, String brand, String category, String basePrice, String imageUrl) {
            this.name = name;
            this.brand = brand;
            this.category = category;
            this.basePrice = new BigDecimal(basePrice);
            this.imageUrl = imageUrl;
        }
    }

    private static final java.util.Map<String, FallbackProductInfo> FALLBACK_DICT = new java.util.HashMap<>();
    static {
        // --- ĐIỆN THOẠI (25) ---
        FALLBACK_DICT.put("iPhone 16 Pro Max 256GB", new FallbackProductInfo("iPhone 16 Pro Max 256GB", "Apple", "Điện thoại", "34990000", "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/329149/iphone-16-pro-max-110924-060846.jpg"));
        FALLBACK_DICT.put("iPhone 16 Pro 256GB", new FallbackProductInfo("iPhone 16 Pro 256GB", "Apple", "Điện thoại", "31990000", "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/329143/iphone-16-pro-110924-060845.jpg"));
        FALLBACK_DICT.put("iPhone 16 Plus 128GB", new FallbackProductInfo("iPhone 16 Plus 128GB", "Apple", "Điện thoại", "25990000", "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/329148/iphone-16-plus-110924-060845.jpg"));
        FALLBACK_DICT.put("iPhone 16 128GB", new FallbackProductInfo("iPhone 16 128GB", "Apple", "Điện thoại", "22990000", "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/329142/iphone-16-110924-060845.jpg"));
        FALLBACK_DICT.put("iPhone 15 Pro Max 256GB", new FallbackProductInfo("iPhone 15 Pro Max 256GB", "Apple", "Điện thoại", "29990000", "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/305658/iphone-15-pro-max-110923-110245.jpg"));
        FALLBACK_DICT.put("iPhone 15 Pro 128GB", new FallbackProductInfo("iPhone 15 Pro 128GB", "Apple", "Điện thoại", "24990000", "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/303891/iphone-15-pro-110923-110244.jpg"));
        FALLBACK_DICT.put("iPhone 15 128GB", new FallbackProductInfo("iPhone 15 128GB", "Apple", "Điện thoại", "19990000", "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/281570/iphone-15-110923-110243.jpg"));
        FALLBACK_DICT.put("Samsung Galaxy S24 Ultra 256GB", new FallbackProductInfo("Samsung Galaxy S24 Ultra 256GB", "Samsung", "Điện thoại", "29990000", "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/307174/samsung-galaxy-s24-ultra-110924-060845.jpg"));
        FALLBACK_DICT.put("Samsung Galaxy S24 Plus 256GB", new FallbackProductInfo("Samsung Galaxy S24 Plus 256GB", "Samsung", "Điện thoại", "22990000", "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/319665/samsung-galaxy-s24-plus-110924-060845.jpg"));
        FALLBACK_DICT.put("Samsung Galaxy S24 256GB", new FallbackProductInfo("Samsung Galaxy S24 256GB", "Samsung", "Điện thoại", "19990000", "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/319660/samsung-galaxy-s24-110924-060845.jpg"));
        FALLBACK_DICT.put("Samsung Galaxy S23 Ultra 256GB", new FallbackProductInfo("Samsung Galaxy S23 Ultra 256GB", "Samsung", "Điện thoại", "21990000", "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/249948/samsung-galaxy-s23-ultra-110923-110242.jpg"));
        FALLBACK_DICT.put("Samsung Galaxy Z Fold6 256GB", new FallbackProductInfo("Samsung Galaxy Z Fold6 256GB", "Samsung", "Điện thoại", "43990000", "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/322251/samsung-galaxy-z-fold6-110924-060845.jpg"));
        FALLBACK_DICT.put("Samsung Galaxy Z Flip6 256GB", new FallbackProductInfo("Samsung Galaxy Z Flip6 256GB", "Samsung", "Điện thoại", "28990000", "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/322250/samsung-galaxy-z-flip6-110924-060845.jpg"));
        FALLBACK_DICT.put("Xiaomi 14 Ultra 512GB", new FallbackProductInfo("Xiaomi 14 Ultra 512GB", "Xiaomi", "Điện thoại", "29990000", "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/322096/xiaomi-14-ultra-110924-060845.jpg"));
        FALLBACK_DICT.put("Xiaomi 14 256GB", new FallbackProductInfo("Xiaomi 14 256GB", "Xiaomi", "Điện thoại", "19990000", "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/311651/xiaomi-14-110924-060845.jpg"));
        FALLBACK_DICT.put("Xiaomi Redmi Note 13 Pro 256GB", new FallbackProductInfo("Xiaomi Redmi Note 13 Pro 256GB", "Xiaomi", "Điện thoại", "6990000", "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/319630/xiaomi-redmi-note-13-pro-110924-060845.jpg"));
        FALLBACK_DICT.put("Oppo Find X7 Ultra 256GB", new FallbackProductInfo("Oppo Find X7 Ultra 256GB", "Oppo", "Điện thoại", "24990000", "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/303893/oppo-find-n3-110924-060845.jpg"));
        FALLBACK_DICT.put("Oppo Reno12 Pro 512GB", new FallbackProductInfo("Oppo Reno12 Pro 512GB", "Oppo", "Điện thoại", "16990000", "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/323380/oppo-reno12-pro-110924-060845.jpg"));
        FALLBACK_DICT.put("Realme GT6 256GB", new FallbackProductInfo("Realme GT6 256GB", "Realme", "Điện thoại", "12990000", "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/325785/realme-gt-6-110924-060845.jpg"));
        FALLBACK_DICT.put("Vivo V30 Pro 512GB", new FallbackProductInfo("Vivo V30 Pro 512GB", "Vivo", "Điện thoại", "21990000", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500"));
        FALLBACK_DICT.put("Asus ROG Phone 8 Pro 512GB", new FallbackProductInfo("Asus ROG Phone 8 Pro 512GB", "Asus", "Điện thoại", "27990000", "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/317540/asus-rog-phone-8-110924-060845.jpg"));
        FALLBACK_DICT.put("OnePlus 12 256GB", new FallbackProductInfo("OnePlus 12 256GB", "OnePlus", "Điện thoại", "18990000", "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/317539/oneplus-12-110924-060845.jpg"));
        FALLBACK_DICT.put("iPhone 14 Pro Max 128GB", new FallbackProductInfo("iPhone 14 Pro Max 128GB", "Apple", "Điện thoại", "24990000", "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/289700/iphone-14-pro-max-110923-110240.jpg"));
        FALLBACK_DICT.put("Samsung Galaxy A55 128GB", new FallbackProductInfo("Samsung Galaxy A55 128GB", "Samsung", "Điện thoại", "9990000", "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/322248/samsung-galaxy-a55-110924-060845.jpg"));
        FALLBACK_DICT.put("Xiaomi Redmi 13C 128GB", new FallbackProductInfo("Xiaomi Redmi 13C 128GB", "Xiaomi", "Điện thoại", "3090000", "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/315152/xiaomi-redmi-13c-110924-060845.jpg"));

        // --- CHUỘT (25) ---
        FALLBACK_DICT.put("Logitech G102 Lightsync RGB", new FallbackProductInfo("Logitech G102 Lightsync RGB", "Logitech", "Chuột", "590000", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500"));
        FALLBACK_DICT.put("Logitech G304 Lightspeed Wireless", new FallbackProductInfo("Logitech G304 Lightspeed Wireless", "Logitech", "Chuột", "990000", "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=500"));
        FALLBACK_DICT.put("Logitech G502 Hero High Performance", new FallbackProductInfo("Logitech G502 Hero High Performance", "Logitech", "Chuột", "1290000", "https://images.unsplash.com/photo-1625600243103-1dc6824c6c8a?w=500"));
        FALLBACK_DICT.put("Logitech G502 X Plus Wireless", new FallbackProductInfo("Logitech G502 X Plus Wireless", "Logitech", "Chuột", "3590000", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500"));
        FALLBACK_DICT.put("Logitech G Pro X Superlight 2", new FallbackProductInfo("Logitech G Pro X Superlight 2", "Logitech", "Chuột", "3890000", "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=500"));
        FALLBACK_DICT.put("Logitech MX Master 3S Wireless", new FallbackProductInfo("Logitech MX Master 3S Wireless", "Logitech", "Chuột", "2490000", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500"));
        FALLBACK_DICT.put("Razer DeathAdder V3 Pro Wireless", new FallbackProductInfo("Razer DeathAdder V3 Pro Wireless", "Razer", "Chuột", "3490000", "https://images.unsplash.com/photo-1625600243103-1dc6824c6c8a?w=500"));
        FALLBACK_DICT.put("Razer Basilisk V3 Pro Wireless", new FallbackProductInfo("Razer Basilisk V3 Pro Wireless", "Razer", "Chuột", "3990000", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500"));
        FALLBACK_DICT.put("Razer Viper V3 HyperSpeed Wireless", new FallbackProductInfo("Razer Viper V3 HyperSpeed Wireless", "Razer", "Chuột", "1790000", "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=500"));
        FALLBACK_DICT.put("Razer Orochi V2 Mobile Wireless", new FallbackProductInfo("Razer Orochi V2 Mobile Wireless", "Razer", "Chuột", "1490000", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500"));
        FALLBACK_DICT.put("Razer Cobra Pro Wireless", new FallbackProductInfo("Razer Cobra Pro Wireless", "Razer", "Chuột", "2990000", "https://images.unsplash.com/photo-1625600243103-1dc6824c6c8a?w=500"));
        FALLBACK_DICT.put("Corsair Harpoon RGB Pro Wired", new FallbackProductInfo("Corsair Harpoon RGB Pro Wired", "Corsair", "Chuột", "450000", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500"));
        FALLBACK_DICT.put("Corsair Dark Core RGB Pro Wireless", new FallbackProductInfo("Corsair Dark Core RGB Pro Wireless", "Corsair", "Chuột", "2190000", "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=500"));
        FALLBACK_DICT.put("Corsair M65 RGB Ultra Elite", new FallbackProductInfo("Corsair M65 RGB Ultra Elite", "Corsair", "Chuột", "1890000", "https://images.unsplash.com/photo-1625600243103-1dc6824c6c8a?w=500"));
        FALLBACK_DICT.put("SteelSeries Rival 3 Wireless", new FallbackProductInfo("SteelSeries Rival 3 Wireless", "SteelSeries", "Chuột", "1190000", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500"));
        FALLBACK_DICT.put("SteelSeries Aerox 3 Wireless", new FallbackProductInfo("SteelSeries Aerox 3 Wireless", "SteelSeries", "Chuột", "2490000", "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=500"));
        FALLBACK_DICT.put("SteelSeries Prime Wireless Gaming", new FallbackProductInfo("SteelSeries Prime Wireless Gaming", "SteelSeries", "Chuột", "2990000", "https://images.unsplash.com/photo-1625600243103-1dc6824c6c8a?w=500"));
        FALLBACK_DICT.put("Asus ROG Harpe Ace Aim Lab", new FallbackProductInfo("Asus ROG Harpe Ace Aim Lab", "Asus", "Chuột", "3290000", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500"));
        FALLBACK_DICT.put("Asus TUF Gaming M3 Gen II", new FallbackProductInfo("Asus TUF Gaming M3 Gen II", "Asus", "Chuột", "490000", "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=500"));
        FALLBACK_DICT.put("Dareu EM901X RGB Wireless", new FallbackProductInfo("Dareu EM901X RGB Wireless", "Dareu", "Chuột", "550000", "https://images.unsplash.com/photo-1625600243103-1dc6824c6c8a?w=500"));
        FALLBACK_DICT.put("Dareu A950 Alcantara Tri-mode", new FallbackProductInfo("Dareu A950 Alcantara Tri-mode", "Dareu", "Chuột", "1090000", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500"));
        FALLBACK_DICT.put("Glorious Model O Wireless", new FallbackProductInfo("Glorious Model O Wireless", "Glorious", "Chuột", "2190000", "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=500"));
        FALLBACK_DICT.put("Glorious Model D Wireless", new FallbackProductInfo("Glorious Model D Wireless", "Glorious", "Chuột", "2190000", "https://images.unsplash.com/photo-1625600243103-1dc6824c6c8a?w=500"));
        FALLBACK_DICT.put("Logitech Pebble M350 Silent", new FallbackProductInfo("Logitech Pebble M350 Silent", "Logitech", "Chuột", "350000", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500"));
        FALLBACK_DICT.put("Razer DeathAdder Essential Wired", new FallbackProductInfo("Razer DeathAdder Essential Wired", "Razer", "Chuột", "390000", "https://images.unsplash.com/photo-1625600243103-1dc6824c6c8a?w=500"));
    }

    private boolean is404Page(String markdown) {
        if (markdown == null || markdown.isEmpty() || markdown.contains("FAILED_TO_CRAWL_CLOUDFLARE_OR_TIMEOUT")) {
            return false;
        }
        String lower = markdown.toLowerCase();
        return lower.contains("không tìm thấy trang")
            || lower.contains("trang không tồn tại")
            || lower.contains("trang bạn tìm kiếm đang không tồn tại")
            || lower.contains("nội dung không tồn tại")
            || lower.contains("đường link cần xem không có trên website")
            || lower.contains("đường dẫn này không tồn tại")
            || lower.contains("page not found")
            || lower.contains("error 404")
            || lower.contains("404 page")
            || lower.contains("không tìm thấy sản phẩm")
            || lower.contains("sản phẩm không tồn tại")
            || lower.contains("404 - không tìm thấy")
            || lower.contains("error: not found")
            || lower.contains("error\": \"not found")
            || lower.contains("statuscode\": 404");
    }

    @Transactional
    public void deleteExistingOffer(String merchantName, String targetProductName) {
        productRepository.findByName(targetProductName).ifPresent(product -> {
            merchantOfferRepository.findByMerchantNameAndProductId(merchantName, product.getId()).ifPresent(offer -> {
                merchantOfferRepository.delete(offer);
                System.out.println("🗑️ Deleted invalid offer for " + merchantName + " - " + targetProductName + " (404 detected)");
            });
        });
    }

    @Transactional
    public MerchantOffer ingestRawOffer(RawOfferIngestDTO rawDto) {
        // 0. Check if the markdown is a 404 page
        if (is404Page(rawDto.getRawMarkdown())) {
            System.out.println("🗑️ 404 page detected for " + rawDto.getMerchantName() + " - " + rawDto.getTargetProductName());
            deleteExistingOffer(rawDto.getMerchantName(), rawDto.getTargetProductName());
            throw new IllegalArgumentException("PRODUCT_NOT_FOUND_404");
        }

        boolean isFallback = false;
        GithubModelsService.ExtractedProductDetails extracted = null;
        
        // 1. Try AI Extraction
        try {
            extracted = githubModelsService.extractProductDetails(rawDto.getRawMarkdown());
            if (extracted != null && extracted.getError() == null) {
                System.out.println("✅ AI Extraction succeeded for " + rawDto.getTargetProductName());
            } else {
                if (extracted != null && "not_found".equals(extracted.getError())) {
                    System.out.println("🗑️ AI detected 404 / not_found for " + rawDto.getMerchantName() + " - " + rawDto.getTargetProductName());
                    deleteExistingOffer(rawDto.getMerchantName(), rawDto.getTargetProductName());
                    throw new IllegalArgumentException("PRODUCT_NOT_FOUND_404");
                }
                extracted = null;
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            System.out.println("⚠️ AI Extraction threw exception: " + e.getMessage());
        }

        // 2. Try Regex Extraction if AI failed
        if (extracted == null) {
            try {
                extracted = tryRegexExtraction(rawDto.getRawMarkdown(), rawDto);
                if (extracted != null) {
                    System.out.println("⚡ Regex Extraction succeeded for " + rawDto.getTargetProductName() + ": " + extracted.getCurrentPrice());
                }
            } catch (Exception e) {
                System.out.println("⚠️ Regex Extraction threw exception: " + e.getMessage());
            }
        }

        // 3. Use Fallback Dictionary if both failed
        if (extracted == null) {
            System.out.println("⚠️ Extraction failed. Using fallback details.");
            extracted = getFallbackDetails(rawDto);
            isFallback = true;
        }
        
        OfferIngestDTO ingestDto = new OfferIngestDTO();
        ingestDto.setMerchantName(rawDto.getMerchantName());
        ingestDto.setOriginalUrl(rawDto.getOriginalUrl());
        ingestDto.setMerchantProductName(extracted.getProductName());
        ingestDto.setCurrentPrice(extracted.getCurrentPrice());
        ingestDto.setOriginalPrice(extracted.getOriginalPrice());
        ingestDto.setImageUrl(extracted.getImageUrl());
        ingestDto.setInStock(extracted.isInStock());
        ingestDto.setBrand(rawDto.getBrand());
        ingestDto.setCategory(rawDto.getCategory());
        ingestDto.setFallback(isFallback);
        ingestDto.setTargetProductName(rawDto.getTargetProductName());

        return ingestOffer(ingestDto);
    }

    private GithubModelsService.ExtractedProductDetails tryRegexExtraction(String markdown, RawOfferIngestDTO rawDto) {
        if (markdown == null || markdown.isEmpty() || markdown.contains("FAILED_TO_CRAWL")) return null;

        // Check if it's a 404 page
        if (is404Page(markdown)) {
            return null;
        }

        BigDecimal price = null;
        String imageUrl = null;

        // Suffix matches: đ, Đ, ₫, d, D, vnd, VND, vnđ, VNĐ
        // Negative lookahead (?!\p{L}) ensures we do not match words starting with 'đ' (like 'độ', 'đối')
        String suffixPattern = "(?:\\u0111|\\u0110|\\u20ab|[dD]|vnd|VND|vn\\u0111|VN\\u0110)(?!\\p{L})";

        // 1. Try to find the price using keywords first (suffix is optional here because the keyword is strong)
        String[] priceKeywords = {"Giá bán", "Giá khuyến mãi", "Giá:", "Giá hiện tại", "đang bán", "Mua ngay"};
        for (String kw : priceKeywords) {
            java.util.regex.Pattern p = java.util.regex.Pattern.compile(
                kw + "\\s*[:\\-]?\\s*(\\d{1,3}(?:[\\.,]\\d{3})+)\\s*(?:" + suffixPattern + ")?",
                java.util.regex.Pattern.CASE_INSENSITIVE
            );
            java.util.regex.Matcher m = p.matcher(markdown);
            if (m.find()) {
                String cleanPriceStr = m.group(1).replaceAll("[\\.,]", "");
                BigDecimal matchedPrice = new BigDecimal(cleanPriceStr);
                // Filter out specs or fake prices below 50,000 VND
                if (matchedPrice.compareTo(new BigDecimal("50000")) >= 0) {
                    price = matchedPrice;
                    break;
                }
            }
        }

        // 2. If no keyword match, find the first price pattern in the document (suffix is required to avoid specs)
        if (price == null) {
            java.util.regex.Pattern firstPricePattern = java.util.regex.Pattern.compile(
                "(\\d{1,3}(?:[\\.,]\\d{3})+)\\s*" + suffixPattern,
                java.util.regex.Pattern.CASE_INSENSITIVE
            );
            java.util.regex.Matcher m = firstPricePattern.matcher(markdown);
            while (m.find()) {
                String cleanPriceStr = m.group(1).replaceAll("[\\.,]", "");
                BigDecimal matchedPrice = new BigDecimal(cleanPriceStr);
                if (matchedPrice.compareTo(new BigDecimal("50000")) >= 0) {
                    price = matchedPrice;
                    break;
                }
            }
        }

        // 3. Find first product image (skipping logos, placeholders, etc.)
        java.util.regex.Pattern imgPattern = java.util.regex.Pattern.compile(
            "(https://[^\\s\\)\\u0022\\u0027]+\\.(?:png|jpg|jpeg|webp))",
            java.util.regex.Pattern.CASE_INSENSITIVE
        );
        java.util.regex.Matcher imgMatcher = imgPattern.matcher(markdown);
        while (imgMatcher.find()) {
            String candidateUrl = imgMatcher.group(1);
            String lowerUrl = candidateUrl.toLowerCase();
            if (!lowerUrl.contains("placeholder") && !lowerUrl.contains("placehoder")
                && !lowerUrl.contains("logo") && !lowerUrl.contains("banner")
                && !lowerUrl.contains("badge") && !lowerUrl.contains("social")
                && !lowerUrl.contains("icon")) {
                imageUrl = candidateUrl;
                break;
            }
        }

        if (price != null) {
            GithubModelsService.ExtractedProductDetails details = new GithubModelsService.ExtractedProductDetails();
            details.setProductName(rawDto.getTargetProductName());
            details.setCurrentPrice(price);
            details.setOriginalPrice(price);
            details.setImageUrl(imageUrl);
            details.setInStock(true);
            return details;
        }

        return null;
    }

    private GithubModelsService.ExtractedProductDetails getFallbackDetails(RawOfferIngestDTO rawDto) {
        GithubModelsService.ExtractedProductDetails details = new GithubModelsService.ExtractedProductDetails();
        
        String targetName = rawDto.getTargetProductName();
        FallbackProductInfo info = FALLBACK_DICT.get(targetName);
        if (info == null && targetName != null) {
            info = FALLBACK_DICT.values().stream()
                .filter(p -> p.name.equalsIgnoreCase(targetName) || targetName.toLowerCase().contains(p.name.toLowerCase()))
                .findFirst()
                .orElse(null);
        }
        if (info == null) {
            info = FALLBACK_DICT.get("Logitech G102 Lightsync RGB");
        }

        details.setProductName(info.name);
        details.setImageUrl(info.imageUrl);
        
        String merchant = rawDto.getMerchantName();
        BigDecimal price = info.basePrice;
        BigDecimal originalPrice = price;

        if ("Thế Giới Di Động".equalsIgnoreCase(merchant)) {
            price = price.multiply(new BigDecimal("1.02"));
            originalPrice = price.multiply(new BigDecimal("1.05"));
        } else if ("CellphoneS".equalsIgnoreCase(merchant)) {
            price = price.multiply(new BigDecimal("0.98"));
            originalPrice = price.multiply(new BigDecimal("1.04"));
        } else if ("FPT Shop".equalsIgnoreCase(merchant)) {
            price = price.multiply(new BigDecimal("1.00"));
            originalPrice = price.multiply(new BigDecimal("1.06"));
        } else if ("Phong Vũ".equalsIgnoreCase(merchant)) {
            price = price.multiply(new BigDecimal("1.01"));
            originalPrice = price.multiply(new BigDecimal("1.03"));
        } else if ("GearVN".equalsIgnoreCase(merchant)) {
            price = price.multiply(new BigDecimal("0.97"));
            originalPrice = price.multiply(new BigDecimal("1.02"));
        } else if ("Tin Học Ngôi Sao".equalsIgnoreCase(merchant)) {
            price = price.multiply(new BigDecimal("0.96"));
            originalPrice = price.multiply(new BigDecimal("1.01"));
        }
        
        price = price.setScale(0, java.math.RoundingMode.HALF_UP);
        originalPrice = originalPrice.setScale(0, java.math.RoundingMode.HALF_UP);

        details.setCurrentPrice(price);
        details.setOriginalPrice(originalPrice);

        boolean inStock = (Math.abs(info.name.hashCode() + merchant.hashCode()) % 20) != 0;
        details.setInStock(inStock);
        
        return details;
    }

    private boolean isAccessoryMismatch(String targetProductName, String merchantProductName) {
        if (targetProductName == null || merchantProductName == null) {
            return false;
        }
        
        String targetLower = targetProductName.toLowerCase();
        String merchantLower = merchantProductName.toLowerCase();
        
        String[] accessoryKeywords = {
            "ốp", "op ", "ốp lưng", "bao da", "kính cường lực", "cường lực", "dán màn hình", "miếng dán", 
            "cáp", "sạc", "củ sạc", "adapter", "tai nghe", "dây đeo", "khung viền", "hộp đựng", 
            "túi chống sốc", "mousepad", "lót chuột", "tấm di", "feet chuột", "grip tape", "đế chuột",
            "case", "cover", "protector", "screen guard", "cable", "charger", "earphone", "strap", 
            "sleeve", "accessory", "phụ kiện"
        };
        
        for (String kw : accessoryKeywords) {
            if (merchantLower.contains(kw) && !targetLower.contains(kw)) {
                return true;
            }
        }
        
        return false;
    }

    private void validateOffer(OfferIngestDTO dto) {
        if (dto.getCurrentPrice() == null) {
            throw new IllegalArgumentException("Giá sản phẩm không được để trống");
        }
        
        // 1. Kiểm tra lệch phụ kiện (Accessory mismatch)
        if (isAccessoryMismatch(dto.getTargetProductName(), dto.getMerchantProductName())) {
            throw new IllegalArgumentException("Sản phẩm không khớp: Phát hiện phụ kiện/phụ tùng (" 
                + dto.getMerchantProductName() + ") thay vì sản phẩm chính (" + dto.getTargetProductName() + ")");
        }
        
        // 2. Kiểm tra khoảng giá hợp lý theo danh mục
        BigDecimal price = dto.getCurrentPrice();
        if ("Điện thoại".equalsIgnoreCase(dto.getCategory())) {
            if (price.compareTo(new BigDecimal("2000000")) < 0) {
                throw new IllegalArgumentException("Mức giá điện thoại không hợp lý (dưới 2.000.000đ): " 
                    + price + "đ. Có thể đây là phụ kiện hoặc tiền đặt cọc.");
            }
        } else if ("Chuột".equalsIgnoreCase(dto.getCategory())) {
            if (price.compareTo(new BigDecimal("100000")) < 0) {
                throw new IllegalArgumentException("Mức giá chuột không hợp lý (dưới 100.000đ): " 
                    + price + "đ. Có thể đây là feet chuột hoặc lót chuột.");
            }
            if (price.compareTo(new BigDecimal("6000000")) > 0) {
                throw new IllegalArgumentException("Mức giá chuột không hợp lý (trên 6.000.000đ): " + price + "đ.");
            }
        }
    }

    @Transactional
    public MerchantOffer ingestOffer(OfferIngestDTO dto) {
        // Run validation
        validateOffer(dto);
        
        Product product = null;
        if (dto.getTargetProductName() != null) {
            product = productRepository.findByName(dto.getTargetProductName()).orElse(null);
        }

        List<Product> candidates = productRepository.findByBrandAndCategory(dto.getBrand(), dto.getCategory());

        List<CandidateProduct> candidateDTOs = candidates.stream()
                .map(p -> new CandidateProduct(p.getId(), p.getName()))
                .collect(Collectors.toList());

        if (product == null && !candidateDTOs.isEmpty()) {
            MatchResult matchResult = githubModelsService.matchProduct(dto.getMerchantProductName(), candidateDTOs);
            if (matchResult.isMatched() && matchResult.getProductId() != null) {
                product = productRepository.findById(matchResult.getProductId()).orElse(null);
                System.out.println("🔗 Khớp sản phẩm thành công qua AI: " + dto.getMerchantProductName() + " -> " + product.getName() + " (ID: " + product.getId() + ")");
            }
        }

        if (product == null) {
            product = Product.builder()
                    .name(dto.getTargetProductName() != null ? dto.getTargetProductName() : dto.getMerchantProductName())
                    .brand(dto.getBrand())
                    .category(dto.getCategory())
                    .imageUrl(dto.getImageUrl())
                    .build();
            product = productRepository.save(product);
            System.out.println("✨ Tạo sản phẩm chuẩn mới: " + product.getName() + " (ID: " + product.getId() + ")");
        }

        Optional<MerchantOffer> existingOffer = merchantOfferRepository
                .findByMerchantNameAndProductId(dto.getMerchantName(), product.getId());

        MerchantOffer offer;
        if (existingOffer.isPresent()) {
            offer = existingOffer.get();
            offer.setCurrentPrice(dto.getCurrentPrice());
            offer.setOriginalPrice(dto.getOriginalPrice());
            offer.setInStock(dto.isInStock());
            offer.setOriginalUrl(dto.getOriginalUrl());
            offer.setMerchantProductName(dto.getMerchantProductName());
            offer.setFallback(dto.isFallback());
            offer = merchantOfferRepository.save(offer);
        } else {
            offer = MerchantOffer.builder()
                    .product(product)
                    .merchantName(dto.getMerchantName())
                    .merchantProductName(dto.getMerchantProductName())
                    .originalUrl(dto.getOriginalUrl())
                    .currentPrice(dto.getCurrentPrice())
                    .originalPrice(dto.getOriginalPrice())
                    .inStock(dto.isInStock())
                    .isFallback(dto.isFallback())
                    .build();
            offer = merchantOfferRepository.save(offer);
        }

        PriceHistory history = PriceHistory.builder()
                .merchantOffer(offer)
                .price(dto.getCurrentPrice())
                .originalPrice(dto.getOriginalPrice())
                .isFallback(dto.isFallback())
                .recordedAt(Instant.now())
                .build();
        priceHistoryRepository.save(history);

        return offer;
    }
}
