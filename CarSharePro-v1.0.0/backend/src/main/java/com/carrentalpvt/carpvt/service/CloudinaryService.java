package com.carrentalpvt.carpvt.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public Map<String, String> uploadImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file cannot be empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Image file size cannot exceed 10 MB");
        }

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "car-rental/cars",
                            "resource_type", "image"
                    )
            );

            String secureUrl = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");

            return Map.of(
                    "url", secureUrl,
                    "publicId", publicId
            );
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image to Cloudinary", e);
        }
    }

    public Map<String, String> uploadDocument(MultipartFile file, String subfolder) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Document file cannot be empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Document file size cannot exceed 10 MB");
        }

        String folder = (subfolder != null && !subfolder.trim().isEmpty())
                ? "car-rental/" + subfolder.trim()
                : "car-rental/documents";

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "auto"
                    )
            );

            String secureUrl = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");

            return Map.of(
                    "url", secureUrl,
                    "publicId", publicId
            );
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload document to Cloudinary", e);
        }
    }

    public void deleteImage(String publicId) {
        if (publicId == null || publicId.trim().isEmpty()) {
            throw new IllegalArgumentException("Image publicId is required for deletion");
        }

        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete image from Cloudinary: " + publicId, e);
        }
    }
}
