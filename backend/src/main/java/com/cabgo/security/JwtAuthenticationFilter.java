package com.cabgo.security;

import com.cabgo.service.AdminUserDetailsServiceImpl;
import com.cabgo.service.CustomerUserDetailsServiceImpl;
import com.cabgo.service.DriverUserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final AdminUserDetailsServiceImpl adminUserDetailsService;
    private final DriverUserDetailsServiceImpl driverUserDetailsService;
    private final CustomerUserDetailsServiceImpl customerUserDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");
        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
            } catch (Exception e) {
                log.warn("JWT extraction failed: {}", e.getMessage());
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                String userType = jwtUtil.extractUserType(jwt);
                UserDetails userDetails;
                
                userDetails = switch (userType) {
                    case "DRIVER" -> driverUserDetailsService.loadUserByUsername(username);
                    case "CUSTOMER" -> customerUserDetailsService.loadUserByUsername(username);
                    default -> adminUserDetailsService.loadUserByUsername(username);
                };

                if (jwtUtil.validateToken(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception e) {
                log.warn("JWT authentication failed: {}", e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
