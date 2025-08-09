package com.CDCBank.bancoDigital.dto.response;
import lombok.Data;
import lombok.Builder;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@Builder
public class TransacaoResponseDTO {
    private Long id;
    private LocalDateTime dataTransacao;
    private BigDecimal valor;
    private String descricao;
    private UsuarioResponseDTO remetente;
    private UsuarioResponseDTO destinatario;
}
