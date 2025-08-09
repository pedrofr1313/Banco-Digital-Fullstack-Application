package com.CDCBank.bancoDigital.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.CDCBank.bancoDigital.service.UsuarioService;
import com.CDCBank.bancoDigital.dto.request.LoginRequest;
import com.CDCBank.bancoDigital.dto.response.LoginResponse;
import com.CDCBank.bancoDigital.dto.response.LogoutResponse;
import com.CDCBank.bancoDigital.dto.response.UsuarioLoginDTO;
import com.CDCBank.bancoDigital.dto.response.VerifyResponse;
import com.CDCBank.bancoDigital.infra.TokenService;
import com.CDCBank.bancoDigital.models.Usuario;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Autorização", description = "Gerenciamento de login e autorizações do sistema ")
public class AuthenticationController {

    private final UsuarioService usuarioService;
    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;
    

    @Operation(summary = "Realiza login de usuário", description = "Realiza login e retorna token JWT com informações do usuário")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login realizado com sucesso"),
            @ApiResponse(responseCode = "403", description = "Email ou senha inválidos"),
            @ApiResponse(responseCode = "500", description = "Erro interno de autenticação")
    })
  @PostMapping("/login")
public ResponseEntity<LoginResponse> login(
        @RequestBody @Valid LoginRequest loginRequest,
        HttpServletResponse response) { 
    
   
    log.info("Tentativa de login para o email: {}", loginRequest.email());
    
    try {
        
        var usernamePassword = new UsernamePasswordAuthenticationToken(
            loginRequest.email(), 
            loginRequest.senha()
        );
      
        var auth = this.authenticationManager.authenticate(usernamePassword);
       
        

        var usuario = (Usuario) auth.getPrincipal();
        
        
        
        var token = tokenService.generateToken(usuario);
      
        
       
        Cookie authCookie = new Cookie("authToken", token);
        authCookie.setHttpOnly(true);                   
        authCookie.setSecure(true);                      
        authCookie.setPath("/");                         
        authCookie.setMaxAge(7200);
        authCookie.setAttribute("SameSite", "Strict");
        response.addCookie(authCookie);
        
        
        var usuarioLoginDto = UsuarioLoginDTO.builder()
                .id(usuario.getId())
                .nome(usuario.getNome())
                .email(usuario.getEmail())
                .rendaMensal(usuario.getRendaMensal())
                .saldo(usuario.getSaldo())
                .dataNascimento(usuario.getDataNascimento())
                .idFiscal(usuario.getIdFiscal())
                .build();
      
        
      
        var loginResponse = LoginResponse.builder()
                .tipoToken("Bearer")                
                .expiresIn(7200000L)              
                .usuario(usuarioLoginDto)          
                .message("Login realizado com sucesso") 
                .build();
        
        return ResponseEntity.ok(loginResponse);
        
    } catch (Exception e) {
        log.error("=== ERRO NO LOGIN ===");
        log.error("Tipo da exceção: {}", e.getClass().getSimpleName());
        log.error("Mensagem: {}", e.getMessage());
        log.error("Stack trace completo:", e);
        throw e; // Re-lança para que o GlobalExceptionHandler capture
    }
}

    
    @GetMapping("/verify")
public ResponseEntity<VerifyResponse> verify(HttpServletRequest request) {
    log.info("Verificando autenticação via cookie");
    
    try {
        // Buscar cookie authToken
        Cookie[] cookies = request.getCookies();
        String token = null;
        
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("authToken".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }
        
        if (token == null) {
            log.warn("Token não encontrado nos cookies");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(VerifyResponse.builder()
                            .message("Token não encontrado")
                            .authenticated(false)
                            .build());
        }
        
       String email = tokenService.validateToken(token);

if (email.isEmpty()) {
    log.warn("Token inválido ou expirado");
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(VerifyResponse.builder()
                    .message("Token inválido ou expirado")
                    .authenticated(false)
                    .build());
}
       
       
        var usuario = (Usuario) usuarioService.findByUsername(email);
        
        
        var usuarioLoginDto = UsuarioLoginDTO.builder()
               .id(usuario.getId())
            .nome(usuario.getNome())
            .email(usuario.getEmail())
            .rendaMensal(usuario.getRendaMensal())
            .saldo(usuario.getSaldo())
            .dataNascimento(usuario.getDataNascimento())
            .idFiscal(usuario.getIdFiscal())
                .build();
        
      
        
        
        var verifyResponse = VerifyResponse.builder()
                .message("Token válido")
                .authenticated(true)
                .usuario(usuarioLoginDto)
                .build();
        
        log.info("Autenticação verificada com sucesso para: {}", usuario.getEmail());
        return ResponseEntity.ok(verifyResponse);
        
    } catch (Exception e) {
        log.error("Erro ao verificar autenticação: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(VerifyResponse.builder()
                        .message("Erro na verificação")
                        .authenticated(false)
                        .build());
    }
}

// 🚪 ROTA PARA LOGOUT
@PostMapping("/logout")
public ResponseEntity<LogoutResponse> logout(HttpServletResponse response) {
    log.info("Realizando logout - removendo cookie HttpOnly");
    
    // Criar cookie com mesmo nome para remover
    Cookie authCookie = new Cookie("authToken", null);
    authCookie.setHttpOnly(true);
    authCookie.setSecure(true);
    authCookie.setPath("/");
    authCookie.setMaxAge(0);                         // ✅ MaxAge = 0 remove o cookie
    authCookie.setAttribute("SameSite", "Strict");
    
    response.addCookie(authCookie);
    
    var logoutResponse = LogoutResponse.builder()
            .message("Logout realizado com sucesso")
            .success(true)
            .build();
    
    log.info("Logout realizado com sucesso - cookie removido");
    return ResponseEntity.ok(logoutResponse);
}



}