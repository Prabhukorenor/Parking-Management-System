package com.finalproject.pms.controller;

import com.finalproject.pms.dto.review.ReviewRequest;
import com.finalproject.pms.dto.review.ReviewResponse;
import com.finalproject.pms.security.CustomUserDetails;
import com.finalproject.pms.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/reviews")
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse create(
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return reviewService.create(request, currentUser.getId());
    }

    @GetMapping("/parking/{id}/reviews")
    public List<ReviewResponse> getParkingReviews(@PathVariable Long id) {
        return reviewService.getParkingReviews(id);
    }
}
