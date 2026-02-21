package com.myapp.speech;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.http.ResponseEntity;
import java.util.Map;


@RestController
@RequestMapping("/speech")
@CrossOrigin(origins = "http://localhost:4200")
public class SpeechController {

    @PostMapping("/text")
    public ResponseEntity<Map<String, String>> receiveText(@RequestBody Map<String, String> payload) {
        String text = payload.get("text");
        String keyword = payload.get("keyword");
        
        System.out.println("\n=== Speech API Response ===");
        System.out.println("Received text: " + text);
        System.out.println("Keyword: " + keyword);
        System.out.println("=============================\n");
        
        // Return JSON response
        Map<String, String> response = new java.util.HashMap<>();
        response.put("text", text);
        response.put("keyword", keyword != null ? keyword : "");
        response.put("status", "success");
        
        return ResponseEntity.ok(response);
    }
}