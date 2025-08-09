package com.CDCBank.bancoDigital.dto.response;
import lombok.Data;
import lombok.Builder;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@Builder
public class HistoricoTransacaoDTO {
    private Long id;
    private LocalDateTime dataTransacao;
    private BigDecimal valor;
    private String descricao;
    private String tipoTransacao; // "ENVIADA" ou "RECEBIDA"
    private UsuarioResponseDTO outroUsuario; // O outro usuário da transação
}
