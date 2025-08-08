package com.CDCBank.bancoDigital.dto.response;
import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
@Builder
public class UsuarioCreateResponseDTO {
    private Long id;
    private String nome;
    private String email;
    private String message;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
