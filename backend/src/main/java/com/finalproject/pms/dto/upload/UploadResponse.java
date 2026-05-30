package com.finalproject.pms.dto.upload;

import java.util.List;

public record UploadResponse(
        List<String> imageUrls
) {
}
