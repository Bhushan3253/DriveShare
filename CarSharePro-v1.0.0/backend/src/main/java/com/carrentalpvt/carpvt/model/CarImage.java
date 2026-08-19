package com.carrentalpvt.carpvt.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarImage {

    private String url;
    private String publicId;
    private boolean primary;
}
