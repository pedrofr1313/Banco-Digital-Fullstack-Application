package com.CDCBank.bancoDigital.infra;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    // @Autowired
    // private final SecurityFilter securityFilter;
     @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                // HABILITAR CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        // Swagger - sempre público
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                        
                        // Rotas de autenticação - públicas
                        .requestMatchers("/auth/login").permitAll()
                        .requestMatchers("/auth/verify").permitAll()
                        .requestMatchers("/usuarios/admin").permitAll()
                       
                        // TODAS AS OUTRAS ROTAS PRECISAM DE AUTENTICAÇÃO VIA COOKIE
                        // .anyRequest().authenticated()
                        .anyRequest().permitAll()
                )
                //.addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

      @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // URLs permitidas (seu frontend)
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",  // React dev server
            "http://localhost:5173",  // Vite dev server
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173"
        ));
        
        // Métodos HTTP permitidos
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));
        
        // Headers permitidos
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Type", 
            "Accept",
            "X-Requested-With",
            "Cache-Control"
        ));
        
        // CRÍTICO: Permitir cookies/credentials
        configuration.setAllowCredentials(true);
        
        // Headers expostos para o frontend
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Set-Cookie"
        ));
        
        // Cache preflight por 1 hora
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    } 

     @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        try {
            return authenticationConfiguration.getAuthenticationManager();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
