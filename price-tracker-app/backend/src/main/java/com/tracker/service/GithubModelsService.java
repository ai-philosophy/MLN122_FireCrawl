package com.tracker.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GithubModelsService {

    @Value("${github.models.token}")
    private String githubToken;

    @Value("${github.models.model-name:gpt-4o}")
    private String modelName;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String API_URL = "https://models.inference.ai.azure.com/chat/completions";

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CandidateProduct {
        private Long id;
        private String name;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MatchResult {
        private boolean matched;
        private Long productId;
        private String reason;
    }

    public MatchResult matchProduct(String scrapedName, List<CandidateProduct> candidates) {
        if (candidates == null || candidates.isEmpty()) {
            MatchResult result = new MatchResult();
            result.setMatched(false);
            result.setProductId(null);
            result.setReason("Không có sản phẩm ứng viên nào để so khớp.");
            return result;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(githubToken);

            String systemPrompt = "You are a product matching assistant. Your job is to determine if a scraped product name matches any product in a list of canonical products in our database.\n" +
                    "Guidelines:\n" +
                    "1. Match only if the model name, memory/storage capacity, and specifications are identical. Ignore color differences.\n" +
                    "2. You must respond ONLY with a raw JSON object containing these exact fields:\n" +
                    "   - \"matched\": true or false\n" +
                    "   - \"productId\": the ID of the matched candidate (integer) or null if no match found\n" +
                    "   - \"reason\": brief explanation of the decision\n" +
                    "Do not include any markdown code block formatting (such as ```json) in your response, just the raw JSON object.";

            String candidatesJson = objectMapper.writeValueAsString(candidates);
            String userPrompt = String.format(
                    "Scraped Product Name: \"%s\"\n\nCandidates List:\n%s",
                    scrapedName,
                    candidatesJson
            );

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", modelName);
            requestBody.put("temperature", 0.0);
            
            List<Map<String, String>> messages = List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", userPrompt)
            );
            requestBody.put("messages", messages);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(API_URL, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseMap = objectMapper.readValue(response.getBody(), Map.class);
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseMap.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    String content = (String) message.get("content");
                    
                    if (content != null) {
                        content = content.trim();
                        if (content.startsWith("```json")) {
                            content = content.substring(7);
                        }
                        if (content.endsWith("```")) {
                            content = content.substring(0, content.length() - 3);
                        }
                        content = content.trim();
                        
                        return objectMapper.readValue(content, MatchResult.class);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Lỗi khi so khớp qua GitHub Models API: " + e.getMessage());
        }

        MatchResult errorResult = new MatchResult();
        errorResult.setMatched(false);
        errorResult.setProductId(null);
        errorResult.setReason("Lỗi hệ thống trong quá trình gọi LLM API.");
        return errorResult;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ExtractedProductDetails {
        private String productName;
        private java.math.BigDecimal currentPrice;
        private java.math.BigDecimal originalPrice;
        private String imageUrl;
        private boolean inStock;
        private String error;
    }

    public static String cleanMarkdown(String md) {
        if (md == null) return "";
        // Remove base64 data URLs
        md = md.replaceAll("data:[a-zA-Z0-9/+-]+;base64,[a-zA-Z0-9/+=]+", "");
        // Remove SVGs
        md = md.replaceAll("(?i)<svg[^>]*>[\\s\\S]*?</svg>", "");
        md = md.replaceAll("(?i)data:image/svg\\+xml;[^\\s]*", "");
        // Remove multiple empty lines
        md = md.replaceAll("(?m)^[ \t]*\r?\n", "");
        return md.trim();
    }

    public ExtractedProductDetails extractProductDetails(String rawMarkdown) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(githubToken);

            String systemPrompt = "You are an expert data extraction assistant. Your job is to extract structured product details from a raw webpage markdown.\n" +
                    "If the webpage markdown indicates a 404 error, \"trang không tồn tại\", \"đường dẫn hết hạn\", \"không tìm thấy trang\", or that the product does not exist, return a JSON with \"error\": \"not_found\".\n" +
                    "Otherwise, extract the following fields and return them as a raw JSON object:\n" +
                    "- \"productName\": The full, precise name of the product including specifications (e.g. \"iPhone 16 Pro Max 256GB\").\n" +
                    "- \"currentPrice\": The current selling price as a decimal number (no commas, dots, or currency symbols, e.g. 30990000).\n" +
                    "- \"originalPrice\": The list price or original price before discount. If not present or same as current price, make it equal to currentPrice.\n" +
                    "- \"imageUrl\": The main image URL of the product.\n" +
                    "- \"inStock\": boolean (true if in stock, false if out of stock/ngừng kinh doanh).\n" +
                    "Do not use markdown code block formatting in your response. Output only the raw JSON.";

            String cleanedMarkdown = cleanMarkdown(rawMarkdown);
            String truncatedMarkdown = cleanedMarkdown;
            if (truncatedMarkdown != null && truncatedMarkdown.length() > 25000) {
                truncatedMarkdown = truncatedMarkdown.substring(0, 25000);
            }

            String userPrompt = String.format("Webpage Markdown:\n%s", truncatedMarkdown);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", modelName);
            requestBody.put("temperature", 0.0);
            
            List<Map<String, String>> messages = List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", userPrompt)
            );
            requestBody.put("messages", messages);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(API_URL, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseMap = objectMapper.readValue(response.getBody(), Map.class);
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseMap.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    String content = (String) message.get("content");
                    
                    if (content != null) {
                        content = content.trim();
                        if (content.startsWith("```json")) {
                            content = content.substring(7);
                        }
                        if (content.endsWith("```")) {
                            content = content.substring(0, content.length() - 3);
                        }
                        content = content.trim();
                        
                        return objectMapper.readValue(content, ExtractedProductDetails.class);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Lỗi khi trích xuất qua GitHub Models API: " + e.getMessage());
        }

        ExtractedProductDetails errorResult = new ExtractedProductDetails();
        errorResult.setError("failed_to_extract");
        return errorResult;
    }
}
