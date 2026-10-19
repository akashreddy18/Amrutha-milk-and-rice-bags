package com.amrutha.common;

/**
 * Exception thrown when a client request is invalid or violates business constraints.
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
