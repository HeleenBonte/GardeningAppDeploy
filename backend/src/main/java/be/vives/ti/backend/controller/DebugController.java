package be.vives.ti.backend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/debug")
public class DebugController {
    private static final Logger log = LoggerFactory.getLogger(DebugController.class);

    @GetMapping("/me")
    public ResponseEntity<Object> me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            log.debug("/api/debug/me - no authentication");
            return ResponseEntity.status(401).body("unauthenticated");
        }
        String username = String.valueOf(auth.getName());
        List<String> authorities = auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());
        log.debug("/api/debug/me - user={} authorities={}", username, authorities);
        return ResponseEntity.ok(new java.util.HashMap<>() {{ put("username", username); put("authorities", authorities); }});
    }
}
