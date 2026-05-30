package com.finalproject.pms.service;

import com.finalproject.pms.dto.razorpay.RazorpayOrderRequest;
import com.finalproject.pms.dto.razorpay.RazorpayOrderResponse;
import com.finalproject.pms.dto.razorpay.RazorpayPaymentVerificationRequest;

public interface RazorpayService {
    RazorpayOrderResponse createOrder(RazorpayOrderRequest request);
    boolean verifyPayment(RazorpayPaymentVerificationRequest request);
}
