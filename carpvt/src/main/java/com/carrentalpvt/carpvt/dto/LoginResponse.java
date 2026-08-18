package com.carrentalpvt.carpvt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {

    private String token;
    private String userId;
    private String name;
    private String role;
}