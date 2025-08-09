package com.CDCBank.bancoDigital.dto.error;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ErrorResponseDTO {
    private String codigo;
    private String mensagem;
}
