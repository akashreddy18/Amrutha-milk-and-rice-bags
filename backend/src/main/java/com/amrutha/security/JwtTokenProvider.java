package com.amrutha.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * Standard RFC 7519 JWT Token Provider utilizing HMAC-SHA256.
 * Zero external library dependencies, fully standard Java 21 crypto + Jackson.
 */
@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);
    private static final String HMAC_ALGO = "HmacSHA256";
    private static final Base64.Encoder B64_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder B64_DECODER = Base64.getUrlDecoder();

    private final ObjectMapper objectMapper;
    private final byte[] secretKeyBytes;
    private final long tokenValidityMillis;

    public JwtTokenProvider(
            ObjectMapper objectMapper,
            @Value("${jwt.secret:AmruthaSecureFarmFreshKey2026StrongJWTSecretKeyForProductionAndDev}") String secretKey,
            @Value("${jwt.expiration-hours:24}") long expirationHours) {
        this.objectMapper = objectMapper;
        this.secretKeyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        this.tokenValidityMillis = expirationHours * 3600 * 1000L;
    }

    /**
     * Generates a signed JWT token containing admin user claims.
     */
    public String generateToken(AdminUser user) {
        try {
            long now = System.currentTimeMillis();
            long exp = now + tokenValidityMillis;

            // 1. Header
            Map<String, Object> headerMap = new HashMap<>();
            headerMap.put("alg", "HS256");
            headerMap.put("typ", "JWT");
            String headerJson = objectMapper.writeValueAsString(headerMap);
            String encodedHeader = B64_ENCODER.encodeToString(headerJson.getBytes(StandardCharsets.UTF_8));

            // 2. Payload
            Map<String, Object> payloadMap = new HashMap<>();
            payloadMap.put("sub", user.getUsername());
            payloadMap.put("role", user.getRole().name());
            payloadMap.put("fullName", user.getFullName());
            payloadMap.put("iat", now / 1000L);
            payloadMap.put("exp", exp / 1000L);
            String payloadJson = objectMapper.writeValueAsString(payloadMap);
            String encodedPayload = B64_ENCODER.encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));

            // 3. Signature
            String signingInput = encodedHeader + "." + encodedPayload;
            String signature = sign(signingInput);

            return signingInput + "." + signature;
        } catch (Exception e) {
            log.error("Failed to generate JWT token for user: {}", user.getUsername());
            throw new IllegalStateException("Could not generate security token", e);
        }
    }

    /**
     * Validates signature and expiry date of the given JWT token.
     */
    public boolean validateToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return false;
        }

        try {
            String signingInput = parts[0] + "." + parts[1];
            String expectedSignature = sign(signingInput);

            // Constant-time signature verification prevents timing attacks
            if (!MessageDigest.isEqual(
                    expectedSignature.getBytes(StandardCharsets.UTF_8),
                    parts[2].getBytes(StandardCharsets.UTF_8))) {
                return false;
            }

            // Verify expiration
            JsonNode payloadNode = parsePayload(parts[1]);
            if (payloadNode.has("exp")) {
                long expSeconds = payloadNode.get("exp").asLong();
                long currentSeconds = System.currentTimeMillis() / 1000L;
                if (currentSeconds > expSeconds) {
                    return false; // Expired
                }
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Extracts username (sub) claim from token.
     */
    public String extractUsername(String token) {
        try {
            String[] parts = token.split("\\.");
            JsonNode payload = parsePayload(parts[1]);
            return payload.has("sub") ? payload.get("sub").asText() : null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Extracts role claim from token.
     */
    public String extractRole(String token) {
        try {
            String[] parts = token.split("\\.");
            JsonNode payload = parsePayload(parts[1]);
            return payload.has("role") ? payload.get("role").asText() : null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Extracts full name claim from token.
     */
    public String extractFullName(String token) {
        try {
            String[] parts = token.split("\\.");
            JsonNode payload = parsePayload(parts[1]);
            return payload.has("fullName") ? payload.get("fullName").asText() : null;
        } catch (Exception e) {
            return null;
        }
    }

    private String sign(String data) throws Exception {
        Mac mac = Mac.getInstance(HMAC_ALGO);
        SecretKeySpec keySpec = new SecretKeySpec(secretKeyBytes, HMAC_ALGO);
        mac.init(keySpec);
        byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return B64_ENCODER.encodeToString(hmacBytes);
    }

    private JsonNode parsePayload(String encodedPayload) throws Exception {
        byte[] decoded = B64_DECODER.decode(encodedPayload);
        return objectMapper.readTree(decoded);
    }
}
