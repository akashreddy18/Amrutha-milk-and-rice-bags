package com.amrutha.security;

/**
 * Security status and implementation roadmap notes.
 *
 * Current Phase: Initial REST API & Data Model.
 * Notice: Authentication is intentionally not claimed to be secure or complete in this version.
 * Production security (JWT tokens, password hashing with BCrypt, role-based access control,
 * and session/token validation) should be added and thoroughly tested before public deployment.
 */
public final class SecurityStatus {

    public static final String STATUS = "IN_DEVELOPMENT";
    public static final String AUTH_MESSAGE = "Authentication is not yet implemented or tested. APIs are currently open for local development.";

    private SecurityStatus() {
        // utility class
    }
}
