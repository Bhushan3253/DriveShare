package com.carrentalpvt.carpvt.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String phone;

    @Indexed
    private String role = "USER";

    private boolean carOwner;

    @Indexed
    private boolean enabled = true;

    @Indexed
    private boolean emailVerified = false;

    private double averageRating = 0.0;

    private int reviewCount = 0;
}