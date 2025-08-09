package com.CDCBank.bancoDigital.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class LoginResponse {
    
    @Builder.Default
    private String tipoToken = "Bearer";
    private Long expiresIn; 
    private UsuarioLoginDTO usuario;
    private String message;
}
