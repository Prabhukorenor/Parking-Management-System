package com.finalproject.pms.service.impl;

import com.finalproject.pms.config.FileStorageProperties;
import com.finalproject.pms.exception.BadRequestException;
import com.finalproject.pms.service.FileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private static final Set<String> ALLOWED_TYPES = new HashSet<>(List.of(
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/webp"
    ));

    private final Path uploadRoot;

    public FileStorageServiceImpl(FileStorageProperties fileStorageProperties) {
        this.uploadRoot = Paths.get(fileStorageProperties.getUploadDir()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadRoot);
        } catch (IOException ex) {
            throw new IllegalStateException("Could not initialize upload directory.", ex);
        }
    }

    @Override
    public List<String> storeImages(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new BadRequestException("At least one image file is required.");
        }

        return files.stream()
                .map(this::storeSingleImage)
                .toList();
    }

    private String storeSingleImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded file cannot be empty.");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new BadRequestException("Only JPG, JPEG, PNG, and WEBP images are allowed.");
        }

        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "image" : file.getOriginalFilename());
        String extension = extractExtension(originalFileName);
        String generatedFileName = generateFilename(extension);
        Path target = uploadRoot.resolve(generatedFileName).normalize();

        if (!target.startsWith(uploadRoot)) {
            throw new BadRequestException("Invalid file path.");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to store image.", ex);
        }

        return "/uploads/" + generatedFileName;
    }

    private String extractExtension(String filename) {
        int index = filename.lastIndexOf('.');
        if (index < 0 || index == filename.length() - 1) {
            throw new BadRequestException("File extension is required.");
        }
        return filename.substring(index);
    }

    private String generateFilename(String extension) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return timestamp + "-" + UUID.randomUUID() + extension.toLowerCase();
    }
}
